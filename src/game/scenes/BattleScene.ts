import Phaser from 'phaser'
import type { GameSession } from '../../app/gameSession'
import { MOTION } from '../../content/motion'
import { stageConfig } from '../../content/demo'

export class BattleScene extends Phaser.Scene {
  private session:GameSession
  private background!:Phaser.GameObjects.Image
  private hero!:Phaser.GameObjects.Sprite
  private enemyBlend!:Phaser.GameObjects.Sprite
  private impacts=0
  private recoilUntil=0
  private enemy!:Phaser.GameObjects.Sprite
  private ring!:Phaser.GameObjects.Graphics
  private threat!:Phaser.GameObjects.Graphics
  private hpText!:Phaser.GameObjects.Text
  private speciesText!:Phaser.GameObjects.Text
  private warning!:Phaser.GameObjects.Text
  private hitFlashUntil=0
  private lastShot=0
  private lastMode=''
  private lastShake=0
  private fireKey?:Phaser.Input.Keyboard.Key
  constructor(session:GameSession){super('battle');this.session=session}
  preload(){const base=import.meta.env.BASE_URL;for(const [key,path] of [['corridor','scenes/corridor-clean.png'],['rooftop','scenes/boss-rooftop-clean.png'],['greenhouse','scenes/boss-greenhouse-clean.png'],['hero','characters/hero-still.png'],['zombie','enemies/office-zombie.png'],['tyrant','enemies/cone-tyrant.png'],['plant','enemies/mutant-plant.png'],['health-frame','ui/reference-v2/health-frame.png']])this.load.image(key!,base+'assets/'+path);for(const clip of MOTION)this.load.spritesheet(clip.key,base+'assets/motion/'+clip.file,{frameWidth:clip.width,frameHeight:clip.height})}
  create(){
    this.background=this.add.image(240,426,'corridor').setDisplaySize(480,852)
    for(const clip of MOTION)this.anims.create({key:clip.key,frames:this.anims.generateFrameNumbers(clip.key,{start:0,end:clip.frames-1}),frameRate:clip.fps,repeat:clip.repeat})
    this.hero=this.add.sprite(106,862,'hero-shoot',0).setOrigin(.5,1).setDisplaySize(310,480).setDepth(3)
    this.hero.on('animationcomplete',()=>this.hero.setFrame(0))
    this.enemy=this.add.sprite(302,510,'zombie-walk',0).setOrigin(.5,1).setDisplaySize(163,272)
    this.enemyBlend=this.add.sprite(302,510,'zombie-walk',0).setOrigin(.5,1).setVisible(false)
    this.threat=this.add.graphics().setDepth(4)
    this.add.image(240,200,'health-frame').setDisplaySize(218,28).setDepth(5)
    this.ring=this.add.graphics().setDepth(6)
    this.speciesText=this.add.text(240,176,'',{fontFamily:'sans-serif',fontSize:'12px',fontStyle:'bold',color:'#ffffff',stroke:'#111820',strokeThickness:3}).setOrigin(.5).setDepth(7)
    this.hpText=this.add.text(240,200,'',{fontFamily:'sans-serif',fontSize:'11px',color:'#dce8d8'}).setOrigin(.5).setDepth(7)
    this.warning=this.add.text(240,196,'',{fontFamily:'sans-serif',fontSize:'20px',fontStyle:'bold',color:'#ffe0a1',stroke:'#251514',strokeThickness:5,align:'center'}).setOrigin(.5).setDepth(8)
    this.input.on('pointerdown',()=>this.session.shoot())
    this.fireKey=this.input.keyboard?.addKey('SPACE')
    this.input.keyboard?.on('keydown-B',()=>this.session.burst())
    this.input.keyboard?.on('keydown-F',()=>{if(this.session.uiBlocked.value)return;if(this.scale.isFullscreen)this.scale.stopFullscreen();else this.scale.startFullscreen()})
  }
  update(){
    const s=this.session.state,cfg=stageConfig(s.stage),boss=s.mode==='boss',isPlant=boss&&cfg.district.art==='plant'
    if(this.input.activePointer.isDown||this.fireKey?.isDown)this.session.shoot()
    const texture=boss?isPlant?'plant-idle':'tyrant-walk':'zombie-walk',scene=boss?isPlant?'greenhouse':'rooftop':'corridor'
    if(this.background.texture.key!==scene)this.background.setTexture(scene)
    if(this.enemy.texture.key!==texture){this.enemy.anims.stop();this.enemy.setTexture(texture)}
    if(this.anims.exists(texture)&&!this.session.uiBlocked.value){if(this.enemy.anims.isPaused)this.enemy.anims.resume();this.enemy.play(texture,true)}else this.enemy.anims.pause()
    if(this.session.uiBlocked.value)this.hero.anims.pause();else if(this.hero.anims.isPaused)this.hero.anims.resume()
    const approach=boss?Phaser.Math.Clamp(1-s.bossTime/cfg.bossSeconds,0,1):0
    // 真实剩余距离映射到场景位置；Sprite 的肢体动作独立于推进规则。
    if(boss){const t=approach**.85;this.enemy.setDisplaySize(isPlant?170+300*t:112+235*t,isPlant?140+245*t:168+352*t).setPosition(315+14*t,355+267*t)}
    else this.enemy.setDisplaySize(163,272).setPosition(302,510)
    this.enemy.setVisible(s.hp>0&&s.respawn<=0)
    const clip=MOTION.find(c=>c.key===texture)!
    const frame=Number(this.enemy.frame.name)
    const blend=Phaser.Math.Clamp((frame-(clip.frames-5))/4,0,1)
    this.enemy.setAlpha(1-blend)
    this.enemyBlend.setTexture(texture,0).setPosition(this.enemy.x,this.enemy.y).setDisplaySize(this.enemy.displayWidth,this.enemy.displayHeight).setAlpha(blend).setVisible(this.enemy.visible&&blend>0)
    this.enemy.clearTint().setTint(boss?0xffffff:s.enemyKind==='armored'?0xa8bdca:s.enemyKind==='runner'?0xe3a97e:s.enemyKind==='swarm'?0xbbd69c:0xffffff)
    this.enemy.anims.timeScale=boss&&s.hp/s.maxHp<.35?1.35:!boss&&s.enemyKind==='runner'?1.25:1
    this.enemyBlend.clearTint().setTint(this.enemy.tintTopLeft)
    if(this.time.now<this.hitFlashUntil){this.enemy.setTint(0xffe3cd).setTintMode(Phaser.TintModes.FILL);this.enemyBlend.setTint(0xffe3cd).setTintMode(Phaser.TintModes.FILL)}
    // Short recoil is layered over the video clip, never resets its walk cycle.
    const recoil=Math.max(0,(this.recoilUntil-this.time.now)/110)
    this.enemy.x+=recoil*4;this.enemyBlend.x=this.enemy.x
    this.threat.clear()
    if(boss){this.threat.lineStyle(2,0xdb554b,.55).lineBetween(190,640,465,640);this.threat.fillStyle(0xbd251a,Math.max(0,(approach-.5)*.3)).fillRect(0,0,480,852)}
    this.warning.setText(boss?s.bossIntro>0?'警报 · 首领来袭\n准备射击':s.hp/s.maxHp<.35?'狂暴推进':approach>.75?'它快冲到面前了！':'':'')
    this.warning.setFontSize(s.bossIntro>0?'22px':'16px')
    if(boss&&approach>.75&&s.clockMs-this.lastShake>1200&&!matchMedia('(prefers-reduced-motion: reduce)').matches){this.lastShake=s.clockMs;this.cameras.main.shake(140,.004)}
    if(s.mode!==this.lastMode){this.lastMode=s.mode;if(boss)this.cameras.main.flash(120,115,26,15)}
    this.speciesText.setText(boss?'首领 · E级威胁':'丧尸 · F级威胁')
    const layers=boss?3:1,remainingLayers=Math.ceil(s.hp/s.maxHp*layers),barFraction=s.hp<=0?0:s.hp/s.maxHp*layers-(remainingLayers-1)
    this.hpText.setText((boss?cfg.district.boss:({walker:'白领感染者',armored:'护甲感染者',runner:'疾行感染者',swarm:'群体感染者'})[s.enemyKind])+'  '+Math.ceil(barFraction*100)+'%'+(boss?'  ×'+Math.max(0,remainingLayers-1):''))
    this.ring.clear().fillStyle(boss&&remainingLayers>1?0xefcc59:0xd95061).fillRect(147,195,Math.max(1,186*barFraction),10)
    if(s.shotSerial<this.lastShot){this.lastShot=0;this.hero.stop().setFrame(0)}
    if(s.shotSerial>0&&s.shotSerial!==this.lastShot){
      this.lastShot=s.shotSerial
      if(!this.session.uiBlocked.value)this.hero.play('hero-shoot')
      this.hitFlashUntil=this.time.now+45;this.recoilUntil=this.time.now+110
      const impactX=this.enemy.x+Phaser.Math.Between(-12,12),impactY=this.enemy.y-this.enemy.displayHeight*.48
      this.impact(impactX,impactY,s.lastCrit)
      const text=this.add.text(this.enemy.x+Phaser.Math.Between(-18,18),Math.max(165,this.enemy.y-this.enemy.displayHeight*.64),s.lastCrit?'暴击 '+format(s.lastDamage):'-'+format(s.lastDamage),{fontFamily:'sans-serif',fontSize:s.lastCrit?'27px':'23px',fontStyle:'bold',color:s.lastCrit?'#ffe39a':'#ffffff',stroke:'#152126',strokeThickness:4}).setOrigin(.5).setDepth(9)
      this.tweens.add({targets:text,y:text.y-58,alpha:0,duration:550,onComplete:()=>text.destroy()})
      const flash=this.add.circle(184,435,8,s.lastCrit?0xffce69:0xffefb2,.9).setDepth(9);this.tweens.add({targets:flash,alpha:0,scale:1.8,duration:90,onComplete:()=>flash.destroy()})
    }
    window.gameMotionState={heroFrame:Number(this.hero.frame.name),heroPlaying:this.hero.anims.isPlaying,enemyFrame:Number(this.enemy.frame.name),enemyAnimation:this.enemy.anims.currentAnim?.key??'static',enemyX:this.enemy.x,enemyY:this.enemy.y,enemyHeight:this.enemy.displayHeight,impactCount:this.impacts,loopBlend:blend}
  }
  private impact(x:number,y:number,crit:boolean){
    this.impacts++
    const tracer=this.add.graphics().setDepth(4).lineStyle(2,0xffde78,.8).lineBetween(184,435,x,y)
    this.tweens.add({targets:tracer,alpha:0,duration:65,onComplete:()=>tracer.destroy()})
    const spark=this.add.star(x,y,6,3,crit?18:12,0xffdd63).setDepth(4).setRotation(Math.random())
    this.tweens.add({targets:spark,scaleX:1.5,scaleY:.55,alpha:0,duration:130,onComplete:()=>spark.destroy()})
    for(let i=0;i<7;i++){
      const angle=Math.random()*Math.PI*2,distance=12+Math.random()*24
      const fleck=this.add.circle(x,y,i<3?2.2:1.2,i<3?0xffae3f:0x687844,.9).setDepth(4)
      this.tweens.add({targets:fleck,x:x+Math.cos(angle)*distance,y:y+Math.sin(angle)*distance+8,alpha:0,scale:.3,duration:160+Math.random()*100,onComplete:()=>fleck.destroy()})
    }
    const smoke=this.add.circle(x,y,8,0x5a6750,.35).setDepth(2)
    this.tweens.add({targets:smoke,y:y-15,alpha:0,scale:2,duration:230,onComplete:()=>smoke.destroy()})
  }
}
function format(n:number){return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1000?(n/1000).toFixed(1)+'K':String(n)}
