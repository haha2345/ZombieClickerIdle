import { MISSIONS, PANEL_FEATURE, UNLOCKS, type FeatureId, type Mission } from '../../content/progression.ts'
import { stageConfig } from '../../content/demo.ts'
import type { GameState, PanelId } from '../models/GameState.ts'
export function featureUnlocked(s:GameState,id:FeatureId){
  const rule=UNLOCKS.find(x=>x.id===id)!
  if(s.quests.includes('legacy-progression')){
    if(id==='auto'&&s.cleared>=3)return true
    if(id==='pets'&&s.cleared>=3)return true
    if(id==='research'&&s.cleared>=8)return true
    if(id==='market'&&s.owned.length>1)return true
    if(id==='enhance'&&Object.values(s.enhancements).some(x=>x>0))return true
    if(id==='handbooks'&&s.manuals.some(x=>x>0))return true
  }
  return s.kills>=rule.kills&&s.cleared>=rule.cleared
}
export function panelUnlocked(s:GameState,panel:PanelId){const id=PANEL_FEATURE[panel];return !id||featureUnlocked(s,id)}
export function nextUnlock(s:GameState){return UNLOCKS.find(x=>!featureUnlocked(s,x.id))}
export function missionReady(s:GameState,m:Mission){return s.kills>=m.kills&&s.cleared>=m.cleared}
export function nextMission(s:GameState){return MISSIONS.find(m=>!s.quests.includes('mission-'+m.id))}
export function missionProgress(s:GameState,m:Mission){return Math.min(1,Math.min(m.kills?s.kills/m.kills:1,m.cleared?s.cleared/m.cleared:1))}
export function resolveMissions(s:GameState){
 for(const m of MISSIONS){
  if(s.quests.includes('mission-'+m.id)||!missionReady(s,m))continue
  s.quests.push('mission-'+m.id)
  const coins=stageConfig(Math.max(1,s.cleared)).coin*m.coins
  s.coins+=coins;s.scrap+=m.scrap;s.cans+=m.cans;s.researchPoints+=m.points
  if(m.fragments)s.fragments=s.fragments.map(n=>n+m.fragments!)
  const text=`任务「${m.name}」完成：+${coins.toLocaleString('en-US')} 金币${m.scrap?' / '+m.scrap+' 零件':''}${m.opens?'。'+m.opens+'。':''}`
  s.lastResult=text;s.log.unshift(text);s.log=s.log.slice(0,7)
 }
}
export function manualCost(s:GameState,index:number){return 2**s.manuals[index]!}
export function companionKills(index:number){return [1000,3500,9000][index]??Infinity}
