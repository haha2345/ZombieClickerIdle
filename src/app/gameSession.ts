import { reactive, readonly, ref } from 'vue'
import type { GameState, PanelId, ResearchId } from '../domain/models/GameState'
import { panelUnlocked } from '../domain/systems/progression'
import * as R from '../domain/systems/demo'
import { loadState, saveState, storageKey, validateState, normalizeSave } from '../services/save/storage'

export function createGameSession() {
  const test = new URLSearchParams(location.search).has('test')
  const loaded = loadState(test)
  const state = reactive(loaded.state)
  if(!panelUnlocked(state,state.selectedPanel))state.selectedPanel='combat'
  const saveError = ref(loaded.error)
  const uiBlocked = ref(false)
  const pendingAd = ref<{ id: string; request: string; remaining: number } | null>(null)
  if (!loaded.error) R.settleOffline(state,Date.now())
  let tickTimer: ReturnType<typeof setInterval> | undefined
  let saveTimer: ReturnType<typeof setInterval> | undefined
  let last = performance.now()
  function save() {
    if (saveError.value) return false
    if(!test&&!pendingAd.value&&Date.now()-state.clockMs>15000)R.settleOffline(state,Date.now())
    state.lastSaveMs = Date.now()
    const error = saveState(state,test)
    if (error) saveError.value=error
    return !error
  }
  function action(fn: ()=>boolean, message: string) { if (pendingAd.value) return false; const ok=fn(); if(!ok&&message) R.note(state,message); return ok }
  function visibility() {
    if (document.hidden) { pendingAd.value=null; save() }
    else { if(!saveError.value)R.settleOffline(state,Date.now());last=performance.now() }
  }
  function start() {
    last=performance.now()
    tickTimer=setInterval(()=>{
      const now=performance.now(),dt=Math.min(1,(now-last)/1000);last=now
      if(document.hidden)return
      if(pendingAd.value){pendingAd.value.remaining=Math.max(0,pendingAd.value.remaining-dt);if(!test)state.clockMs=Date.now()}
      else if(!test&&uiBlocked.value){state.clockMs=Date.now()}
      else if(!test){if(Date.now()-state.clockMs>15000)R.settleOffline(state,Date.now());R.advance(state,dt)}
    },50)
    saveTimer=setInterval(save,5000)
    document.addEventListener('visibilitychange',visibility)
    window.addEventListener('pagehide',save)
  }
  function stop() { clearInterval(tickTimer);clearInterval(saveTimer);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',save);save() }
  return {
    state: readonly(state),saveError,uiBlocked,pendingAd,start,stop,save,
    selectPanel(panel:PanelId){R.selectPanel(state,panel)},
    shoot(){if(pendingAd.value||uiBlocked.value)return false;return R.shoot(state)},
    burst(){if(uiBlocked.value)return false;return action(()=>R.burst(state),'爆发正在冷却。')},
    challenge(){return action(()=>R.challenge(state),'先完成当前关卡击杀目标，再挑战首领。')},
    retreat(){return action(()=>R.retreat(state),'')},
    chooseStage(n:number){return action(()=>R.chooseStage(state,n),'路线尚未解锁。')},
    upgradeTraining(){return action(()=>R.upgradeTraining(state),'金币不足，先在当前区域积累。')},
    upgradeTactics(){return action(()=>R.upgradeTactics(state),'金币不足或战术已满级。')},
    buyWeapon(id:string){return action(()=>R.buyWeapon(state,id),'商品未解锁、已经拥有或金币不足。')},
    equip(id:string){return action(()=>R.equip(state,id),'装备条件不足，请查看枪系熟练度。')},
    enhance(id:string){return action(()=>R.enhance(state,id),'零件不足或强化已满级。')},
    refreshMarket(){return action(()=>R.refreshMarket(state),'刷新次数不足。')},
    buyMaterial(kind:'cans'|'fragments'){return action(()=>R.buyMaterial(state,kind),'物资已售罄、尚未解锁或金币不足。')},
    learnManual(i:number){return action(()=>R.learnManual(state,i),'需要上、中、下册各一份，或手册已满级。')},
    upgradePet(i:number){return action(()=>R.upgradePet(state,i),'宠物未解锁、罐头不足或已满级。')},
    selectPet(i:number){return action(()=>R.selectPet(state,i),'先把宠物提升到 Lv1。')},
    upgradeResearch(id:ResearchId){return action(()=>R.upgradeResearch(state,id),'完成研究站任务后解锁，或研究点不足。')},
    claimAchievement(id:string){return action(()=>R.claimAchievement(state,id),'成就未完成或已领取。')},
    claimOffline(){const ok=action(()=>R.claimOffline(state),'');if(ok)save();return ok},
    toggleAuto(){state.autoEnabled=!state.autoEnabled},
    startAd(id:string){if(pendingAd.value||!R.adAvailable(state,id))return false;pendingAd.value={id,request:crypto.randomUUID(),remaining:3};return true},
    cancelAd(){pendingAd.value=null},
    finishAd(){const ad=pendingAd.value;if(!ad||ad.remaining>0)return false;const ok=R.completeDemoAd(state,ad.id,ad.request,true);pendingAd.value=null;save();return ok},
    advanceTime(ms:number){if(!pendingAd.value&&!uiBlocked.value)R.advance(state,Math.max(0,ms)/1000)},
    fresh(){if(saveError.value){try{const raw=localStorage.getItem(storageKey(test));if(raw)localStorage.setItem(storageKey(test)+':recovery:'+Date.now(),raw)}catch{return false}}Object.assign(state,R.createInitialState());saveError.value=null;pendingAd.value=null;save();return true},
    exportSave(){return JSON.stringify(state,null,2)},
    importSave(raw:string){try{const parsed:unknown=normalizeSave(JSON.parse(raw));if(!validateState(parsed))return false;Object.assign(state,parsed);if(!panelUnlocked(state,state.selectedPanel))state.selectedPanel='combat';saveError.value=null;R.settleOffline(state,Date.now());save();return true}catch{return false}},
    restoreForTest(snapshot:GameState){if(!test||!validateState(snapshot))return false;Object.assign(state,snapshot);return true},
  }
}
export type GameSession=ReturnType<typeof createGameSession>
