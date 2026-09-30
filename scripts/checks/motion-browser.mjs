import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync} from 'node:fs'
import {createInitialState} from '../../src/domain/systems/demo.ts'
import {stageConfig} from '../../src/content/demo.ts'
const {chromium}=await import(process.env.TASK_PLAYWRIGHT_MODULE||'playwright')
const browser=await chromium.launch({headless:false,executablePath:process.env.TASK_BROWSER_EXECUTABLE||undefined})
const page=await browser.newPage({viewport:{width:480,height:800}}),errors=[],checks=[]
page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(['warning','error'].includes(e.type()))errors.push(e.text())})
const root='artifacts/motion-browser';mkdirSync(root+'/frames',{recursive:true})
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()))
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms)
try{
 await page.goto('http://127.0.0.1:5174/?test');await page.waitForFunction(()=>window.__demo&&window.gameMotionState);await page.evaluate(()=>window.__demo.fresh());await page.waitForTimeout(200)
 const enemyFrames=new Set();for(let i=0;i<5;i++){enemyFrames.add((await state()).motion.enemyFrame);await page.waitForTimeout(190)}assert(enemyFrames.size>=3);checks.push('ordinary enemy plays distinct video frames')
 await page.locator('canvas').click({position:{x:270,y:300}});const heroFrames=new Set();for(let i=0;i<9;i++){heroFrames.add((await state()).motion.heroFrame);await page.waitForTimeout(20)}assert(heroFrames.size>=3);assert((await state()).hp<42);await page.waitForTimeout(250);assert.equal((await state()).motion.heroPlaying,false);assert.equal((await state()).motion.heroFrame,0);checks.push('shot changes damage and hero sprite frames, then recovers')
 await page.getByRole('button',{name:'战斗详情与任务'}).click();await page.waitForTimeout(100);const paused=(await state()).motion.enemyFrame;await page.waitForTimeout(350);assert.equal((await state()).motion.enemyFrame,paused);await page.getByRole('button',{name:'返回战斗',exact:true}).click();const resumed=new Set();for(let i=0;i<3;i++){resumed.add((await state()).motion.enemyFrame);await page.waitForTimeout(200)}assert(resumed.size>1);checks.push('menu pauses sprite motion and returns to animated combat')
 await page.evaluate(()=>window.__demo.fresh());await page.keyboard.down('Space');const capture=[];for(let i=0;i<24;i++){await step(60);await page.waitForTimeout(50);capture.push((await state()).motion);await page.locator('.workspace').screenshot({path:root+'/frames/'+String(i).padStart(3,'0')+'.png'})}await page.keyboard.up('Space');checks.push('recorded actual game with HUD and shooting animation')
 for(const [stage,key] of [[1,'tyrant-walk'],[8,'plant-idle']]){const s=createInitialState(Date.now());s.stage=stage;s.cleared=stage-1;s.kills=stage===1?5:1000;s.stageKills[String(stage)]=stageConfig(stage).target;await page.evaluate(s=>window.__demo.restore(s),s);await page.locator('[data-action="challenge"]').click();await step(1900);await page.waitForTimeout(60);const far=(await state()).motion.enemyHeight;const frames=new Set();for(let i=0;i<3;i++){const t=await state();assert.equal(t.motion.enemyAnimation,key);frames.add(t.motion.enemyFrame);await page.waitForTimeout(230)}assert(frames.size>1);await step(stage===1?8000:17000);await page.waitForTimeout(60);assert((await state()).motion.enemyHeight>far);await page.locator('.workspace').screenshot({path:root+'/'+key+'.png'});checks.push(key+' animates while approaching')}
 assert.deepEqual(errors,[]);writeFileSync(root+'/checks.json',JSON.stringify({checks,errors,heroFrames:[...heroFrames],enemyFrames:[...enemyFrames],capture},null,2));console.log(JSON.stringify({passed:checks.length,checks,errors}))
}finally{await browser.close()}
