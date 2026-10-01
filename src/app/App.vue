<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { createGameSession } from './gameSession'
import { PANELS, type GameState, type PanelId, type ResearchId } from '../domain/models/GameState'
import { ACHIEVEMENTS, DISTRICTS, HANDBOOKS, PETS, RESEARCH, WEAPONS, gunLabels, stageConfig, TOTAL_STAGES } from '../content/demo'
import * as R from '../domain/systems/demo'
import * as P from '../domain/systems/progression'
import { MISSIONS } from '../content/progression'
import GameViewport from '../ui/components/GameViewport.vue'
import ItemIcon from '../ui/components/ItemIcon.vue'
import InventoryPanel from '../ui/components/InventoryPanel.vue'
const session=createGameSession()
// UI 只通过会话动作修改；此断言仅供纯规则查询函数接收 Vue 的只读代理。
const s=session.state as GameState
const assetBase=import.meta.env.BASE_URL+'assets/'
const skillTab=ref('training')
const inventoryTab=ref('all')
const marketPage=ref(0)
const marketPages=Math.ceil((WEAPONS.length-1)/5)
const marketWeapons=computed(()=>WEAPONS.slice(1+marketPage.value*5,6+marketPage.value*5))
const primaryPanels:PanelId[]=['skills','combat','market','inventory']
const bossPreview=ref(false)
const defeat=ref(false)
watch(()=>s.lastResult,result=>{if(result.startsWith('首领冲到了面前'))defeat.value=true})
const visiblePanels=computed(()=>PANELS.filter(id=>P.panelUnlocked(s,id)))
const mission=computed(()=>P.nextMission(s))
const unlock=computed(()=>P.nextUnlock(s))
const missionPercent=computed(()=>mission.value?P.missionProgress(s,mission.value)*100:100)
const recentMissions=computed(()=>MISSIONS.filter(m=>s.quests.includes('mission-'+m.id)).slice(-3).reverse())
const cfg=computed(()=>stageConfig(s.stage))
const gun=computed(()=>R.weaponOf(s))
const kills=computed(()=>s.stageKills[String(s.stage)]??0)
const ready=computed(()=>R.bossReady(s))
const bossRewards=computed(()=>{const future={...s,cleared:s.stage};const tasks=MISSIONS.filter(m=>!s.quests.includes('mission-'+m.id)&&P.missionReady(future,m));return {coins:Math.round(cfg.value.coin*35*R.lootMultiplier(s))+tasks.reduce((n,m)=>n+cfg.value.coin*m.coins,0),scrap:cfg.value.scrap*12+tasks.reduce((n,m)=>n+m.scrap,0)}})
const victory=ref<{name:string;coins:number;scrap:number}|null>(null)
watch(()=>[s.cleared,s.coins,s.scrap] as const,([cleared,coins,scrap],[oldClear,oldCoins,oldScrap])=>{if(cleared===0){victory.value=null;return}if(cleared>oldClear&&s.mode==='farm'&&s.hp===0&&s.respawn>0){victory.value={name:stageConfig(cleared).district.boss,coins:coins-oldCoins,scrap:scrap-oldScrap}}})
const bossEstimate=computed(()=>Math.ceil(cfg.value.bossHp/Math.max(1,R.expectedDps({...s,mode:'boss',enemyKind:s.stage>=9&&cfg.value.district.art!=='plant'?'armored':'walker'},3))))
const labels:Record<PanelId,string>={combat:'探险',skills:'技能',market:'黑市',inventory:'仓库',pets:'伙伴',map:'路线',research:'研究'}
const descriptions:Record<PanelId,string>={combat:'刷金币准备火力，在首领抵达前击败它。',skills:'每一次准备，都让下一次点射更有力量。',market:'把回收的金币换成真正有用的装备。',inventory:'穿戴、强化，找出适合当前敌人的枪。',pets:'只携带一位伙伴；不同伙伴适合不同目标。',map:'六片街区，通向同一个黎明。',research:'把首次通关的发现，变成永久的优势。'}
const fieldNotes=ref(false)
const overlay=ref<'supply'|'settings'|'help'|null>(null)
const backup=ref(''),settingsMessage=ref(''),confirmReset=ref(false)
const fmt=(n:number)=>n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':Math.floor(n).toLocaleString('en-US')
const duration=(seconds:number)=>seconds>=3600?(seconds/3600).toFixed(1)+' 小时':Math.floor(seconds/60)+' 分钟'
const burstRemaining=computed(()=>Math.max(0,Math.ceil((s.burstReady-s.clockMs)/1000)))
const burstActive=computed(()=>s.burstUntil>s.clockMs)
const progress=computed(()=>Math.min(100,kills.value/cfg.value.target*100))
function select(id:PanelId){session.selectPanel(id);fieldNotes.value=id!=='combat';if(id==='inventory')inventoryTab.value='all';if(id==='market')marketPage.value=0;if(id==='skills')skillTab.value='training'}
function closePanel(){fieldNotes.value=false;session.selectPanel('combat')}
function available(w:typeof WEAPONS[number]){return s.cleared>=w.unlock||(w.id==='revolver'&&s.kills>=25)}
function nextStage(){session.chooseStage(Math.min(TOTAL_STAGES,s.cleared+1))}
function exportBackup(){backup.value=session.exportSave();settingsMessage.value='备份已生成。可复制，也可下载 JSON 文件。'}
function download(){exportBackup();const url=URL.createObjectURL(new Blob([backup.value],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='beacon-save-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url)}
function importBackup(){settingsMessage.value=session.importSave(backup.value)?'存档已导入。':'导入失败：内容无效，当前进度保留。'}
function reset(){if(!confirmReset.value){confirmReset.value=true;return}session.fresh();defeat.value=false;confirmReset.value=false;settingsMessage.value='新旅程开始了。'}
function adDescription(id:string){return ({coins:'约 10 分钟自动回收金币，随已通关区域与装备成长',refresh:'增加 10 次黑市物资刷新，库存最多 30 次',cans:'5 个伙伴升级罐头',offline:'已领取的这批离线金币与零件再加一份',auto:'提前体验 10 分钟自动开火；300击杀与第3关首通永久解锁'})[id]}
function adStatus(id:string){const a=R.DEMO_ADS.find(x=>x.id===id)!;if(!P.featureUnlocked(s,'supply'))return '完成撤离路线任务后开放';if(s.cleared<a.unlock)return `通过第 ${a.unlock} 关解锁`;if(id==='auto'&&P.featureUnlocked(s,'auto'))return '永久自动已解锁';if(id==='offline'&&!s.offline?.claimed)return '先领取基础离线收益';if(id==='offline'&&s.offline?.bonusClaimed)return '本批追加已领取';const cooldown=Math.ceil(((s.ads.cooldowns[id]??0)-s.clockMs)/1000);if(cooldown>0)return `冷却 ${cooldown} 秒`;if(id==='refresh'&&s.refreshes>=30)return '刷新库存已满';return R.adAvailable(s,id)?'领取补给':'今日额度已用完'}
watch(()=>fieldNotes.value||bossPreview.value||defeat.value||!!victory.value||!!overlay.value||!!session.pendingAd.value||!!(s.offline&&!s.offline.claimed),blocked=>{session.uiBlocked.value=blocked},{immediate:true})
onMounted(()=>session.start())
onBeforeUnmount(()=>session.stop())
window.render_game_to_text=()=>JSON.stringify({coordinates:'canvas 480×852; origin top-left; x right, y down; tap enemy or hold battle area',mode:s.mode,stage:s.stage,cleared:s.cleared,stageName:cfg.value.name,hp:s.hp,maxHp:s.maxHp,bossTime:s.bossTime,bossIntro:s.bossIntro,bossApproach:s.mode==='boss'?1-s.bossTime/cfg.value.bossSeconds:0,mission:mission.value?.id,visiblePanels:visiblePanels.value,features:unlock.value?.id,bossReady:ready.value,uiInsideGame:true,motion:window.gameMotionState,panelOpen:fieldNotes.value,kills:s.kills,target:cfg.value.target,stageKills:kills.value,coins:s.coins,scrap:s.scrap,cans:s.cans,weapon:s.weapon,training:s.training,auto:R.autoUnlocked(s)&&s.autoEnabled,panel:s.selectedPanel,pet:s.pet,offline:s.offline,ad:session.pendingAd.value,saveError:session.saveError.value,defeat:defeat.value,bossPreview:bossPreview.value,victory:victory.value})
window.advanceTime=(ms:number)=>session.advanceTime(ms)
if(import.meta.env.DEV&&new URLSearchParams(location.search).has('test')){
  Object.assign(window,{__demo:{snapshot:()=>JSON.parse(session.exportSave()),restore:(value:GameState)=>{fieldNotes.value=false;bossPreview.value=false;defeat.value=false;victory.value=null;return session.restoreForTest(value)},fresh:()=>{closePanel();bossPreview.value=false;defeat.value=false;victory.value=null;session.fresh()},save:session.save}})
}
onBeforeUnmount(()=>{delete window.render_game_to_text;delete window.advanceTime})
</script>

<template>
  <main class="workspace" :class="{'boss-mode':s.mode==='boss','growth-open':fieldNotes&&s.selectedPanel!=='combat'}" :style="{'--zone':cfg.district.color}">
    <GameViewport :session="session"/>
    <div class="game-hud">
    <header class="page-header">
      <div class="brand"><div class="portrait"><img :src="assetBase+'ui/reference-v2/portrait.png'" alt="幸存者"/></div><div><strong class="power-readout">{{fmt(R.baseDamage(s))}}</strong><h1>凡人之躯</h1></div></div>
      <div class="header-actions"><button @click="overlay='help'">怎么玩</button><button v-if="P.featureUnlocked(s,'supply')" class="supply-button" @click="overlay='supply'">无线电补给</button><button @click="overlay='settings'" aria-label="设置与存档">存档</button></div>
    </header>
    <div class="resource-bar" aria-label="资源">
      <div><img class="coin-dot" :src="assetBase+'ui/reference-v2/coin.png'" alt=""/><small>金币</small><strong data-resource="coins">{{fmt(s.coins)}}</strong></div><div v-if="P.featureUnlocked(s,'enhance')"><span class="scrap-dot"></span><small>零件</small><strong>{{fmt(s.scrap)}}</strong></div><div v-if="P.featureUnlocked(s,'pets')"><span class="can-dot"></span><small>罐头</small><strong>{{fmt(s.cans)}}</strong></div><div v-if="P.featureUnlocked(s,'research')"><small>研究点</small><strong>{{fmt(s.researchPoints)}}</strong></div><div class="chapter-progress"><small>撤离路线</small><strong>{{s.cleared}} / 24</strong><div class="track"><i :style="{width:s.cleared/24*100+'%'}"></i></div></div>
    </div>
    <div v-if="session.saveError.value" class="save-warning" role="alert">{{session.saveError.value}} <button @click="overlay='settings'">备份与恢复</button></div>
      <section class="battle-card" aria-label="战斗区域">
        <div class="battle-heading"><div><p class="eyebrow">SECTOR {{String(s.stage).padStart(2,'0')}}</p><h2>{{cfg.name}}</h2></div><span class="mode-tag" :class="{danger:s.mode==='boss'}">{{s.mode==='boss'?'首领挑战':s.cleared>=s.stage?'资源回收':'街区清理'}}</span></div>
        <div class="battle-hint">{{s.mode==='boss'?s.bossIntro>0?'首领来袭 · 即将开始':'距离 '+Math.max(0,32*s.bossTime/cfg.bossSeconds).toFixed(1)+' m · 到达即失败':'点击或按住战场开火'}}</div><div v-if="burstActive" class="burst-tag">集中火力 · 伤害 ×1.8</div>
        <div class="hud-mission" v-if="mission"><small><img :src="assetBase+'ui/reference-v2/coin.png'" alt=""/><em>金币</em></small><strong>{{mission.name}}</strong><span>{{mission.kills?'击杀 '+Math.min(s.kills,mission.kills)+' / '+mission.kills:''}}{{mission.cleared?' · 首通 '+Math.min(s.cleared,mission.cleared)+' / '+mission.cleared:''}}</span><div class="track"><i :style="{width:missionPercent+'%'}"></i></div></div>
        <button class="hud-info" @click="fieldNotes=true" aria-label="战斗详情与任务">任务详情</button>

        <div class="side-shortcuts"><button v-if="P.featureUnlocked(s,'training')" @click="select('skills')"><ItemIcon name="skills"/><small>技能</small></button><button v-if="P.featureUnlocked(s,'map')" data-panel="map" @click="select('map')"><ItemIcon name="map"/><small>路线</small></button></div>
        <div class="side-shortcuts right"><button v-if="P.featureUnlocked(s,'supply')" @click="overlay='supply'" aria-label="无线电补给"><ItemIcon name="inventory"/><small>补给</small></button><button v-if="P.featureUnlocked(s,'pets')" data-panel="pets" @click="select('pets')"><ItemIcon name="pets"/><small>伙伴</small></button><button v-if="P.featureUnlocked(s,'research')" data-panel="research" @click="select('research')"><ItemIcon name="research"/><small>研究</small></button></div>
        <div class="shot-readout"><span>⌖</span><div><b>{{gun.name}}</b><small>{{fmt(R.baseDamage(s))}} 伤害 · 暴击 {{(R.critChance(s)*100).toFixed(1)}}%</small><small>{{R.autoUnlocked(s)&&s.autoEnabled?gun.rate+' 次/秒 · 自动':'手动点射 · 按住连射'}}</small></div></div>
        <div class="boss-countdown" v-if="s.mode==='boss'"><small>{{s.bossIntro>0?'首领入场':'倒计时'}}</small><strong>{{s.bossIntro>0?s.bossIntro.toFixed(1):s.bossTime.toFixed(1)}}</strong><span>秒</span></div>
        <div class="battle-controls">
          <div class="boss-ready-notice" v-if="ready&&s.mode==='farm'"><strong>首领挑战已开放</strong><p>{{cfg.district.boss}}等待你的挑战。首通预计获得 <b>{{fmt(bossRewards.coins)}} 金币</b>、{{bossRewards.scrap}} 零件。</p><small>继续刷怪准备，或立即挑战。</small></div>
          <div class="objective"><span>{{s.cleared>=s.stage?'此处首领已击败':'清理目标'}}</span><strong>{{Math.min(kills,cfg.target)}} / {{cfg.target}}</strong><div class="track"><i :style="{width:progress+'%'}"></i></div></div>
          <div class="combat-buttons"><button class="primary" :class="{'boss-ready':ready}" data-action="challenge" v-if="s.mode==='farm'&&s.cleared<s.stage" :disabled="!ready" @click="bossPreview=true"><img :src="assetBase+'enemies/'+(cfg.district.art==='plant'?'mutant-plant.png':'cone-tyrant.png')" alt=""/><span>{{ready?cfg.district.boss:'首领未开放'}}</span><small>{{ready?'挑战':Math.min(kills,cfg.target)+'/'+cfg.target}}</small></button><button class="primary" v-else-if="s.mode==='farm'&&s.cleared<24" @click="nextStage">前往最新路线</button><button class="primary" v-else-if="s.mode==='boss'" aria-label="撤退并保留资源" @click="session.retreat()">撤退</button><span v-else class="ending">✦ 信标已点亮</span><button v-if="P.featureUnlocked(s,'burst')" class="burst-button" data-action="burst" :disabled="burstRemaining>0||s.bossIntro>0" @click="session.burst()"><b>ϟ</b>{{burstActive?'火力全开':burstRemaining>0?'爆发 '+burstRemaining+'s':'集中火力'}}</button></div>
          <div class="auto-row" v-if="R.autoUnlocked(s)"><span>{{R.autoUnlocked(s)?'自动开火':'300击杀与3关首通解锁自动'}}</span><button data-action="auto" :disabled="!R.autoUnlocked(s)" :aria-pressed="s.autoEnabled&&R.autoUnlocked(s)" @click="session.toggleAuto()">{{R.autoUnlocked(s)?s.autoEnabled?'开启中':'已暂停':'未解锁'}}</button><small>{{gun.name}} · +{{s.enhancements[s.weapon]??0}}</small></div>
        </div>
      </section>
      <section class="management" id="management" aria-label="成长与物资">
        <nav class="tabs" aria-label="游戏菜单"><button v-for="id in primaryPanels" :key="id" :data-panel="P.panelUnlocked(s,id)?id:undefined" :disabled="!P.panelUnlocked(s,id)" :aria-pressed="s.selectedPanel===id" @click="select(id)"><ItemIcon class="nav-icon" :name="id==='combat'?'map':id"/><span>{{labels[id]}}</span><i v-if="id==='skills'&&s.coins>=R.trainingCost(s)&&P.featureUnlocked(s,'training')"></i></button></nav>
        <div class="category-tabs" v-if="fieldNotes&&s.selectedPanel==='skills'" aria-label="技能分类"><button :aria-pressed="skillTab==='training'" @click="skillTab='training'">射击</button><button v-if="P.featureUnlocked(s,'burst')" :aria-pressed="skillTab==='tactics'" @click="skillTab='tactics'">战术</button><button v-if="P.featureUnlocked(s,'handbooks')" :aria-pressed="skillTab==='manuals'" @click="skillTab='manuals'">手册</button></div>
        <div class="category-tabs" v-if="fieldNotes&&s.selectedPanel==='inventory'" aria-label="仓库分类"><button v-for="tab in [{id:'all',label:'全部'},{id:'equipment',label:'装备'},{id:'materials',label:'材料'},{id:'manuals',label:'资料'},{id:'special',label:'特殊'}]" :key="tab.id" :aria-pressed="inventoryTab===tab.id" @click="inventoryTab=tab.id">{{tab.label}}</button></div>
        <div class="panel-content" :class="'panel-'+s.selectedPanel" v-if="fieldNotes"><button class="panel-close" @click="closePanel" aria-label="返回战斗">× 返回战斗</button><div class="panel-heading"><p class="eyebrow">SURVIVOR'S FIELD NOTES</p><h2>{{labels[s.selectedPanel]}}</h2><p class="muted">{{descriptions[s.selectedPanel]}}</p></div>
          <div class="mission-card" v-if="mission&&s.selectedPanel==='combat'"><div class="mission-label"><span>当前任务</span><b>{{s.mode==='boss'&&s.bossIntro>0?'警报响起':'自动领取奖励'}}</b></div><h3>{{mission.name}}</h3><p>{{mission.kills?'击杀 '+Math.min(s.kills,mission.kills)+' / '+mission.kills+' 个感染者':''}}{{mission.cleared?' · 首通 '+Math.min(s.cleared,mission.cleared)+' / '+mission.cleared+' 关':''}}</p><div class="track"><i :style="{width:missionPercent+'%'}"></i></div><small>奖励：{{fmt(stageConfig(Math.max(1,s.cleared)).coin*mission.coins)}} 金币{{mission.scrap?' / '+mission.scrap+' 零件':''}}{{mission.cans?' / '+mission.cans+' 罐头':''}}{{mission.points?' / '+mission.points+' 研究点':''}}{{mission.fragments?' / 一套残页':''}}</small><strong v-if="mission.opens">{{mission.opens}}</strong></div>
          <template v-if="s.selectedPanel==='combat'">
            <div class="stat-grid"><div><small>点射伤害</small><strong>{{fmt(R.baseDamage(s))}}</strong></div><div><small>暴击率</small><strong>{{(R.critChance(s)*100).toFixed(1)}}%</strong></div><div><small>{{R.autoUnlocked(s)?'自动射速':'当前枪械'}}</small><strong>{{R.autoUnlocked(s)?gun.rate:gun.name}} <em v-if="R.autoUnlocked(s)">/ 秒</em></strong></div><div><small>累计击杀</small><strong>{{fmt(s.kills)}}</strong></div></div>
            <div class="item-card feature-card" v-if="P.featureUnlocked(s,'training')"><div><small>下一次成长</small><h3>射击训练 Lv{{s.training}}</h3><p>每级伤害 ×1.13，所有枪械受益。</p></div><button data-action="train" class="primary" :disabled="s.coins<R.trainingCost(s)||s.training>=120" @click="session.upgradeTraining()">升级 · {{fmt(R.trainingCost(s))}}</button></div>
            <div class="tip"><strong>{{s.cleared===24?'你守住了最后一盏灯。':'当前目标'}}</strong><p>{{s.cleared===24?'收齐枪械，培养伙伴，完成剩余成就。':ready?'挑战资格已经达成。战场底部按钮已点亮，先用金币训练、换枪；未强化时可以先尝试再准备。':s.cleared===0?'击败 5 个感染者后，下方首领按钮会点亮。由你决定什么时候进入挑战。5次击杀开放训练，25次击杀开放黑市，先备战再挑战。':'完成当前任务会自动获得奖励；提升已经开放的能力，再向首领推进。'}}</p></div>
            <div class="boss-intel" v-if="s.cleared<24"><small>首领情报</small><strong>{{cfg.district.boss}} · {{fmt(cfg.bossHp)}} 生命</strong><p>当前输出预计 {{bossEstimate}} 秒。抵达前限时 {{cfg.bossSeconds}} 秒。狂暴会加速逼近。</p><small>按每秒 3 次点射与当前自动射速估算</small></div>
            <div class="next-unlock" v-if="unlock"><small>下一项开放</small><strong>{{unlock.name}}</strong><p>累计 {{unlock.kills}} 击杀，首通 {{unlock.cleared}} 关后自动开放。</p></div>
            <div class="field-log"><small>无线电记录</small><p v-for="(line,i) in s.log.slice(0,4)" :key="i">{{line}}</p></div>
          </template>
          <template v-else-if="s.selectedPanel==='skills'">
            <div class="training-layout" v-if="skillTab!=='manuals'"><div class="training-list"><button class="selected">{{skillTab==='training'?'射击入门':'首领战术'}} <small>使用中</small></button></div><div class="training-detail"><div class="blueprint blueprint-drawing"></div><div class="rating-paper"><p v-for="name in ['难度','成长','基础']" :key="name">{{name}} <span>★<i>★★★★</i></span></p></div><div class="training-stat-paper"><h3><b>Lv.{{skillTab==='training'?s.training:s.tactics}}</b> {{skillTab==='training'?'射击入门':'首领战术'}}</h3><strong>{{skillTab==='training'?'攻击力 '+fmt(R.baseDamage(s)):'首领伤害 +'+(s.tactics*2.5).toFixed(1)+'%'}}</strong><p>{{skillTab==='training'?'每级所有伤害 ×1.13':'每级暴击率 +0.2%'}}</p><p>{{gunLabels[gun.kind]}}熟练 {{s.proficiency[gun.kind]}}</p></div><button class="training-upgrade" data-action="skill-upgrade" :disabled="skillTab==='training'?s.coins<R.trainingCost(s)||s.training>=120:s.coins<R.tacticsCost(s)||s.tactics>=30" @click="skillTab==='training'?session.upgradeTraining():session.upgradeTactics()">升级</button><p class="upgrade-price"><img :src="assetBase+'ui/reference-v2/coin.png'" alt="金币"/>{{fmt(skillTab==='training'?R.trainingCost(s):R.tacticsCost(s))}}</p></div></div>
            <template v-else><div class="fragment-row"><span v-for="(n,i) in s.fragments" :key="i">{{['上册','中册','下册'][i]}} <b>{{n}}</b></span></div><div class="item-card" v-for="(book,i) in HANDBOOKS" :key="book.name"><div><h3>{{book.name}} <small>{{s.manuals[i]}} / 5</small></h3><p>{{book.description}}</p></div><button :disabled="s.fragments.some(n=>n<P.manualCost(s,i))||s.manuals[i]!>=5" @click="session.learnManual(i)">学习 · {{P.manualCost(s,i)}} 套</button></div></template>
            <div class="skill-description"><small>Tips: 到仓库中更换穿戴的武器</small><p>{{skillTab==='training'?'操作枪械的入门级手册，必备知识。':skillTab==='tactics'?'在首领抵达前集中火力，提升首领伤害。':'收集上、中、下册，学习永久增益。'}}</p></div>
          </template>
          <template v-else-if="s.selectedPanel==='market'">
            <div class="market-grid"><div class="item-card weapon-card" v-for="w in marketWeapons" :key="w.id" :class="{locked:!available(w)}"><h3>{{w.name}}</h3><ItemIcon class="weapon-glyph" :name="w.kind"/><small class="item-category">{{available(w)?gunLabels[w.kind]:'第 '+w.unlock+' 关解锁'}}</small><button :data-buy="w.id" :disabled="!available(w)||s.owned.includes(w.id)||s.coins<w.price" @click="session.buyWeapon(w.id)"><img :src="assetBase+'ui/reference-v2/coin.png'" alt=""/>{{s.owned.includes(w.id)?'已拥有':fmt(w.price)}}</button></div></div>
            <div class="market-footer"><p>使用刷新可以更换物资货架商品</p><div class="market-rating">武器货架：{{marketPage+1}} / {{marketPages}}</div><button class="market-page" data-action="market-page" @click="marketPage=(marketPage+1)%marketPages">下一页</button><button class="market-refresh" :disabled="s.refreshes<1" @click="session.refreshMarket()"><b>{{s.refreshes}}</b><span>⟳</span>刷新</button><div class="material-grid"><button :disabled="!P.featureUnlocked(s,'auto')||s.quests.includes('market-'+s.marketRoll+'-cans')||s.coins<stageConfig(Math.max(1,s.cleared)).coin*30" @click="session.buyMaterial('cans')">罐头 ×5 <small>{{fmt(stageConfig(Math.max(1,s.cleared)).coin*30)}} 金币</small></button><button :disabled="!P.featureUnlocked(s,'auto')||s.quests.includes('market-'+s.marketRoll+'-fragments')||s.coins<stageConfig(Math.max(1,s.cleared)).coin*20" @click="session.buyMaterial('fragments')">{{['上','中','下'][s.marketRoll%3]}}册 ×3 <small>{{fmt(stageConfig(Math.max(1,s.cleared)).coin*20)}} 金币</small></button></div></div>
          </template>
          <template v-else-if="s.selectedPanel==='inventory'"><InventoryPanel :session="session" :tab="inventoryTab" @learn="select('skills');skillTab='manuals'" @research="select('research')"/></template>
          <template v-else-if="s.selectedPanel==='pets'">
            <div class="pet-card" v-for="(pet,i) in PETS" :key="pet.name" :class="{locked:!R.petUnlocked(s,i)}"><div class="pet-symbol">{{pet.icon}}</div><div><small>{{R.petUnlocked(s,i)?'伙伴已到达':'累计 '+P.companionKills(i)+' 击杀 · 首通 '+pet.unlock+' 关'}}</small><h3>{{pet.name}} <small>Lv{{s.petLevels[i]}} / 10</small></h3><p>{{pet.description}}</p><div class="item-actions"><button :disabled="!R.petUnlocked(s,i)||s.petLevels[i]!<1||s.pet===i" @click="session.selectPet(i)">{{s.pet===i&&s.petLevels[i]!>0?'陪伴中':'携带'}}</button><button :disabled="!R.petUnlocked(s,i)||s.petLevels[i]!>=10||s.cans<5*(s.petLevels[i]!+1)" @click="session.upgradePet(i)">{{s.petLevels[i]!>=10?'已满级':5*(s.petLevels[i]!+1)+' 罐头 · 升级'}}</button></div></div></div>
          </template>
          <template v-else-if="s.selectedPanel==='map'">
            <div class="route-group" v-for="(d,i) in DISTRICTS" :key="d.name"><h3><small>0{{i+1}}</small> {{d.name}}</h3><div class="stage-grid"><button v-for="n in 4" :key="n" :disabled="i*4+n>s.cleared+1" :class="{complete:i*4+n<=s.cleared,current:i*4+n===s.stage}" @click="session.chooseStage(i*4+n)"><b>{{String(i*4+n).padStart(2,'0')}}</b><span>{{stageConfig(i*4+n).name}}</span><small>{{i*4+n<=s.cleared?'已首通':i*4+n===s.cleared+1?'前线':'未解锁'}}</small></button></div></div>
<h3 class="section-title">最近任务奖励</h3><div class="item-card" v-for="m in recentMissions" :key="m.id"><div><h3>{{m.name}}</h3><p>{{m.opens??'成长物资已到账'}}</p></div><small>已领取</small></div>
            <h3 class="section-title">感染者图鉴</h3><div class="codex"><span v-for="(n,id) in s.codex" :key="id">{{({walker:'白领',armored:'护甲',runner:'疾行',swarm:'群体'})[id]}}<b>{{n>0?fmt(n):'???'}}</b></span></div>
            <h3 class="section-title">幸存者成就</h3><div class="item-card" v-for="a in ACHIEVEMENTS" :key="a.id"><div><h3>{{a.name}}</h3><p>{{a.type==='kills'?'击杀':a.type==='guns'?'拥有枪械':'通关'}} {{fmt(a.target)}} · {{a.cans}} 罐头{{a.points?' / '+a.points+' 研究点':''}}</p></div><button :disabled="!R.achievementReady(s,a.id)" @click="session.claimAchievement(a.id)">{{s.claimedAchievements.includes(a.id)?'已领取':R.achievementReady(s,a.id)?'领取':'进行中'}}</button></div>
          </template>
          <template v-else-if="s.selectedPanel==='research'">
            <div class="tip"><strong>{{P.featureUnlocked(s,'research')?'研究站已接通':'2800击杀与8关首通开放研究'}}</strong><p>研究点来自首领首次通关与成就。三条线路永久生效。</p></div>
            <div class="item-card" v-for="(r,id) in RESEARCH" :key="id"><div><h3>{{r.name}} <small>{{s.research[id]}} / {{r.max}}</small></h3><p>{{r.description}}</p></div><button :disabled="!P.featureUnlocked(s,'research')||s.research[id]>=r.max||s.researchPoints<3+s.research[id]*2" @click="session.upgradeResearch(id as ResearchId)">{{3+s.research[id]*2}} 研究点</button></div><div class="tip"><strong>当前离线回收上限</strong><p>{{2+s.research.offline*.5}} 小时 · 基础收益直接领取，追加补给自愿选择。</p></div>
          </template>
        </div>
      </section>
    </div>

    <section class="result-screen defeat-result" v-if="defeat" role="dialog" aria-modal="true" aria-label="挑战失败"><img class="result-illustration" :src="assetBase+'ui/reference-v2/result-defeat.png'" alt="重头再来！"/><p class="result-advice">人类的延续就靠你了！<br/>你需要变得更强！！</p><div class="result-recommendations"><button @click="defeat=false;select('skills')"><ItemIcon name="skills"/><span>升级技能，提升战力！</span></button><button :disabled="!P.panelUnlocked(s,'market')" @click="defeat=false;select('market')"><ItemIcon name="market"/><span>{{P.panelUnlocked(s,'market')?'购买强力装备、武器！':'25次击杀开放黑市'}}</span></button><button :disabled="!P.panelUnlocked(s,'inventory')" @click="defeat=false;select('inventory')"><ItemIcon name="inventory"/><span>{{P.panelUnlocked(s,'inventory')?'强化装备，提升战力！':'25次击杀开放仓库'}}</span></button></div><button class="result-continue" data-action="retry-farm" @click="defeat=false">继续</button><small class="result-retained">金币、装备与挑战资格全部保留</small></section>
    <section class="result-screen victory-result" v-if="victory" role="dialog" aria-modal="true" aria-label="首领击败"><img class="result-illustration" :src="assetBase+'ui/reference-v2/result-victory.png'" alt="活力来了！"/><div class="result-rewards"><p><img :src="assetBase+'ui/reference-v2/coin.png'" alt=""/><span>金币 {{fmt(victory.coins)}}</span></p><p><ItemIcon name="inventory"/><span>零件 {{fmt(victory.scrap)}}</span></p></div><button class="result-continue" data-action="victory-continue" @click="victory=null">继续</button><small class="result-retained">{{victory.name}}已击败 · 奖励已到账</small></section>
    <div class="modal-backdrop" v-if="bossPreview" @click.self="bossPreview=false"><section class="modal boss-sheet"><button class="close" aria-label="关闭首领情报" @click="bossPreview=false">×</button><h2>首领</h2><div class="boss-profile"><img :src="assetBase+'enemies/'+(cfg.district.art==='plant'?'mutant-plant.png':'cone-tyrant.png')" alt="首领"/><div><h3>{{cfg.district.boss}}</h3><p>生命 <b>{{fmt(cfg.bossHp)}}</b></p><p>抵达时限 <b>{{cfg.bossSeconds}} 秒</b></p><p>狂暴 <b>低血量加速</b></p></div></div><p class="boss-advice">{{bossEstimate>cfg.bossSeconds*(.65+.35/1.35)?'当前火力偏低，继续刷金币，训练或强化后再来。':'火力已接近要求，持续射击并及时使用技能。'}}</p><div class="boss-prizes"><span>●<b>{{fmt(bossRewards.coins)}}</b><small>金币</small></span><span>⚒<b>{{bossRewards.scrap}}</b><small>零件</small></span></div><button class="primary" data-action="enter-boss" @click="bossPreview=false;session.challenge()">挑战</button><small>失败保留资源，返回刷怪准备</small></section></div>
    <div class="modal-backdrop" v-if="overlay" @click.self="overlay=null"><section class="modal" role="dialog" aria-modal="true" :aria-label="overlay==='supply'?'无线电补给':overlay==='settings'?'存档':'怎么玩'"><button class="close" @click="overlay=null" aria-label="关闭">×</button>
      <template v-if="overlay==='supply'"><p class="eyebrow">SUPPLY RADIO</p><h2>无线电补给</h2><p class="muted">可选激励广告入口。演示使用 3 秒本地模拟，暂未接入真实广告平台；中途取消不会发奖。</p><div class="item-card" v-for="a in R.DEMO_ADS" :key="a.id"><div><h3>{{a.label}}</h3><p>{{adDescription(a.id)}}</p><small>每日 {{a.limit}} 次 · 已用 {{s.ads.date===R.dateKey(s.clockMs)?s.ads.counts[a.id]??0:0}}</small></div><button :data-ad="a.id" :disabled="!R.adAvailable(s,a.id)" @click="session.startAd(a.id)">{{adStatus(a.id)}}</button></div><p class="muted small">每个入口独立冷却，全部入口每日最多 12 次。首领通关、装备与研究均可不看广告获得。</p></template>
      <template v-else-if="overlay==='settings'"><p class="eyebrow">KEEP YOUR SIGNAL</p><h2>存档与备份</h2><p class="muted">本机每 5 秒自动保存。导入会替换当前进度；先导出备份再操作。</p><div class="settings-actions"><button @click="exportBackup">生成备份</button><button @click="download">下载备份</button><button @click="importBackup" :disabled="!backup">导入文本</button></div><textarea v-model="backup" aria-label="存档 JSON 文本" placeholder="在这里查看或粘贴备份文本"></textarea><p role="status">{{settingsMessage}}</p><button class="danger-button" @click="reset">{{confirmReset?'确认清空并开始新游戏':'开始新游戏'}}</button><p class="muted small">存档只在当前浏览器和地址下保存。正式版需另外接入云存档与真实广告验证。</p></template>
      <template v-else><p class="eyebrow">SURVIVE THE NIGHT</p><h2>把信标带到黎明</h2><ol class="help-list"><li>点击或按住战场射击，击杀感染者得到金币、零件与残页。</li><li>升级训练、购买并穿戴新枪。强化必定成功；高阶枪需要同枪系熟练度。</li><li>开局点杀5只会提示并点亮首领按钮，由你主动进入挑战；以后完成清理目标同样获得挑战资格。首领靠近即失败，低血量狂暴加速。集中火力还会击退首领2秒。</li><li>累计300次击杀且首通第3关获得永久自动攻击。离开页面后，回收已通关区域的离线金币与零件。</li><li>培养伙伴、学习手册、研究装备，再推进六片街区的 24 关。超时只会退回资源回收，不丢装备。</li></ol><div class="tip"><strong>主动准备 + 放置积累</strong><p>前期手动射击，中后期可以让自动回收继续工作。需要大量积累时，回到路线中较容易的关卡。</p></div><button class="primary" @click="overlay=null">开始清理</button></template>
    </section></div>
    <div class="modal-backdrop" v-if="s.offline&&!s.offline.claimed&&!overlay"><section class="modal compact" role="dialog" aria-modal="true" aria-label="离线收益"><p class="eyebrow">WELCOME BACK</p><h2>回收小队回来了</h2><p class="muted">已回收 {{duration(s.offline.seconds)}} 的物资</p><div class="offline-loot"><strong>{{fmt(s.offline.coins)}} <small>金币</small></strong><strong>{{fmt(s.offline.scrap)}} <small>零件</small></strong></div><button class="primary" data-action="offline" @click="session.claimOffline()">领取基础收益</button><p class="muted small">领取后可在无线电补给中自愿追加一份。</p></section></div>
    <div class="modal-backdrop ad-overlay" v-if="session.pendingAd.value"><section class="modal compact" role="dialog" aria-modal="true" aria-label="演示广告"><p class="eyebrow">LOCAL REWARD SIMULATOR</p><h2>补给信号连接中</h2><p class="muted">本地模拟，无真实广告。连接完成后手动领取。</p><div class="ad-countdown">{{session.pendingAd.value.remaining>0?Math.ceil(session.pendingAd.value.remaining):'✓'}}</div><button class="primary" data-action="ad-complete" :disabled="session.pendingAd.value.remaining>0" @click="session.finishAd()">{{session.pendingAd.value.remaining>0?'等待信号':'领取奖励'}}</button><button class="text-button" data-action="ad-cancel" @click="session.cancelAd()">取消，不领取</button></section></div>
  </main>
</template>
