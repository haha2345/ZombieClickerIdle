import assert from 'node:assert/strict'
import { writeFileSync, mkdirSync } from 'node:fs'
import { stageConfig, TOTAL_STAGES, WEAPONS, ACHIEVEMENTS } from '../../src/content/demo.ts'
import * as P from '../../src/domain/systems/progression.ts'
import { UNLOCKS } from '../../src/content/progression.ts'
import * as R from '../../src/domain/systems/demo.ts'

function run(name, clicks, ads) {
  const s = R.createInitialState(Date.UTC(2026,8,30,0)); const timeline=[],unlocks=[]
  let previous=0
  const opened=new Set()
  for(let t=0;t<24*3600;t++) {
    R.advance(s,1,clicks)
    for(const u of UNLOCKS)if(!opened.has(u.id)&&P.featureUnlocked(s,u.id)){opened.add(u.id);unlocks.push({id:u.id,name:u.name,seconds:t+1,minutes:+((t+1)/60).toFixed(1),kills:s.kills,cleared:s.cleared})}
    for(const a of ACHIEVEMENTS) R.claimAchievement(s,a.id)
    if(t%3===0) {
      for(let i=0;i<3;i++) for(let j=0;j<10;j++) { if(!R.upgradePet(s,i))break }
      if(s.mode==='farm')R.selectPet(s,0)
      while(R.upgradeResearch(s,'power')){}
      while(R.upgradeResearch(s,'salvage')){}
      for(let i=0;i<3;i++) while(R.learnManual(s,i)){}
      for(const w of WEAPONS) if((w.unlock<=s.cleared || (w.id==='revolver'&&s.kills>=25)) && s.coins>=w.price) R.buyWeapon(s,w.id)
      const potential = WEAPONS.filter(w=>s.owned.includes(w.id)&&s.proficiency[w.kind]>=w.required).sort((a,b)=>b.damage*(clicks+(R.autoUnlocked(s)?b.rate:0))-a.damage*(clicks+(R.autoUnlocked(s)?a.rate:0)))[0]
      if(potential)while(R.enhance(s,potential.id)){}
      const best = WEAPONS.filter(w=>s.owned.includes(w.id)&&s.proficiency[w.kind]>=w.required).sort((a,b)=>b.damage*(clicks+(R.autoUnlocked(s)?b.rate:0))*(1+(s.enhancements[b.id]??0)*.12)-a.damage*(clicks+(R.autoUnlocked(s)?a.rate:0))*(1+(s.enhancements[a.id]??0)*.12))[0]
      if(best) R.equip(s,best.id)
      while(R.enhance(s,s.weapon)){}
      const pending=WEAPONS.find(w=>w.unlock<=s.cleared&&!s.owned.includes(w.id)&&w.price>0)
      const reserve=pending && pending.price<s.coins+R.trainingCost(s)*2?pending.price:0
      for(let i=0;i<20;i++) {
        if(s.coins-reserve>=R.tacticsCost(s)&&R.tacticsCost(s)<R.trainingCost(s)*.12&&R.upgradeTactics(s))continue
        if(s.coins-reserve>=R.trainingCost(s)&&R.upgradeTraining(s))continue
        break
      }
      if(ads&&(ads==='early'||s.stage>=18)&&s.mode==='farm'&&R.adAvailable(s,'coins'))R.completeDemoAd(s,'coins',`sim-${t}`,true)
    }
    if(s.mode==='farm'&&R.bossReady(s)) {
      const cfg=stageConfig(s.stage);const prediction={...s,mode:'boss',enemyKind:s.stage>=9&&cfg.district.art!=='plant'?'armored':'walker'}
      const bestPet=[0,1,2].filter(i=>s.petLevels[i]>0).sort((a,b)=>R.expectedDps({...prediction,pet:b},clicks)-R.expectedDps({...prediction,pet:a},clicks))[0]??0
      prediction.pet=bestPet
      const dps=R.expectedDps(prediction,clicks)*(P.featureUnlocked(s,'burst')?1.25:1)
      if(s.clockMs>=s.burstReady && dps*cfg.bossSeconds*(.65+.35/1.35)>=cfg.bossHp*1.15) {R.selectPet(s,bestPet);R.challenge(s)}
    }
    if(s.mode==='boss'&&s.bossIntro<=0&&s.clockMs>=s.burstReady)R.burst(s)
    if(s.cleared!==previous){previous=s.cleared;timeline.push({stage:s.cleared,seconds:t+1,minutes:+((t+1)/60).toFixed(1),training:s.training,weapon:s.weapon,ordinaryBaseHits:Math.ceil(stageConfig(s.cleared).hp/R.baseDamage(s)),kills:s.kills,coins:Math.round(s.coins)})}
    if(s.cleared===TOTAL_STAGES)return {name,completed:true,hours:+((t+1)/3600).toFixed(2),timeline,unlocks,kills:s.kills,training:s.training,ads:s.ads.total}
  }
  return {name,completed:false,hours:24,stage:s.stage,cleared:s.cleared,training:s.training,weapon:s.weapon,coins:s.coins,timeline,unlocks}
}
const results=[run('active-3-clicks-no-ads',3,false),run('active-5-clicks-no-ads',5,false),run('active-5-clicks-3-late-supplies',5,true),run('active-5-clicks-3-early-supplies',5,'early')]
assert(results.every(r=>r.completed),'every policy must reach stage24')
assert(results.filter(r=>r.name.includes('5-clicks')).every(r=>r.hours>=5),'fast tested policies must meet5h target')
mkdirSync('artifacts',{recursive:true})
writeFileSync('artifacts/economy-simulation.json',JSON.stringify({method:'actual domain rules, 1s steps; automated sensible purchases, upgrades and boss challenges; not a human playthrough',results},null,2))
console.log(JSON.stringify(results.map(({timeline,unlocks,...r})=>r),null,2))
console.log('Unlocks:',results[1].unlocks)
console.log('Milestones:',results[1].timeline.filter(x=>x.stage%4===0))
