import { companionKills, featureUnlocked, manualCost, panelUnlocked, resolveMissions } from './progression.ts'
import { ACHIEVEMENTS, DEMO_ADS, HANDBOOKS, PETS, RESEARCH, TOTAL_STAGES, WEAPONS, stageConfig } from '../../content/demo.ts'
import type { EnemyKind, GameState, PanelId, ResearchId } from '../models/GameState.ts'

export function dateKey(ms: number) { return new Date(ms).toISOString().slice(0, 10) }
export function createInitialState(now = Date.now()): GameState {
  const cfg = stageConfig(1)
  return { schemaVersion: 3, mode: 'farm', selectedPanel: 'combat', stage: 1, cleared: 0, coins: 120, scrap: 0, cans: 0, researchPoints: 0, training: 1, tactics: 0, weapon: 'glock', owned: ['glock'], enhancements: {}, proficiency: { pistol: 0, rifle: 0, shotgun: 0 }, kills: 0, stageKills: {}, enemyKind: 'walker', hp: cfg.hp, maxHp: cfg.hp, respawn: 0, manualCooldown: 0, autoClock: 0, bossIntro: 0, bossTime: 0, burstUntil: 0, burstReady: 0, autoEnabled: true, autoTrialUntil: 0, pet: 0, petLevels: [0, 0, 0], research: { power: 0, salvage: 0, offline: 0 }, fragments: [0, 0, 0], manuals: [0, 0, 0], refreshes: 5, marketRoll: 0, quests: [], codex: { walker: 0, armored: 0, runner: 0, swarm: 0 }, claimedAchievements: [], lastResult: '', log: ['点杀 5 个感染者。楼顶有什么东西正在苏醒。'], shotSerial: 0, lastDamage: 0, lastCrit: false, seed: 72591, playedSeconds: 0, clockMs: now, lastSaveMs: now, offline: null, ads: { date: dateKey(now), total: 0, counts: {}, cooldowns: {}, receipts: [] } }
}
function random(s: GameState) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296 }
export function note(s: GameState, text: string) { s.lastResult = text; s.log.unshift(text); s.log = s.log.slice(0, 7) }
export function weaponOf(s: GameState) { return WEAPONS.find(w => w.id === s.weapon) ?? WEAPONS[0]! }
export function autoUnlocked(s: GameState) { return featureUnlocked(s,'auto') || s.autoTrialUntil > s.clockMs }
export function lootMultiplier(s: GameState) { return (1 + s.research.salvage * .06) * (1 + s.manuals[1]! * .08) * (s.pet === 0 ? 1 + s.petLevels[0]! * .04 : 1) }
export function critChance(s: GameState) { return Math.min(.35, .04 + s.tactics * .002 + (s.pet === 1 ? s.petLevels[1]! * .015 : 0)) }
export function baseDamage(s: GameState, automatic = false) {
  const w = weaponOf(s)
  return w.damage * 1.13 ** (s.training - 1) * (1 + (s.enhancements[w.id] ?? 0) * .12) * (1 + Math.min(.2, s.proficiency[w.kind] * .0003)) * (1 + s.research.power * .05) * (1 + s.manuals[0]! * .08) * (automatic && s.pet === 2 ? 1 + s.petLevels[2]! * .06 : 1)
}
export function adjustedDamage(s: GameState, automatic = false) {
  let damage = baseDamage(s, automatic)
  const w = weaponOf(s)
  if (s.enemyKind === 'armored') damage *= 1 - Math.max(0, .35 - w.pierce)
  if (s.enemyKind === 'swarm' && w.kind === 'shotgun') damage *= 1.6
  if (s.mode === 'boss') {
    damage *= 1 + s.tactics * .025 + s.manuals[2]! * .1
    if (stageConfig(s.stage).district.art === 'plant' && w.kind === 'shotgun') damage *= 1.25
  }
  return damage
}
export function trainingCost(s: GameState) { return Math.round(420 * 1.315 ** (s.training - 1)) }
export function tacticsCost(s: GameState) { return Math.round(200 * 1.35 ** s.tactics) }
export function enhancementCost(s: GameState, id: string) { return Math.ceil(15 * 1.9 ** (s.enhancements[id] ?? 0)) }
export function bossReady(s: GameState) { return s.cleared < TOTAL_STAGES && s.stage === s.cleared + 1 && (s.stageKills[String(s.stage)] ?? 0) >= stageConfig(s.stage).target }
export function expectedDps(s: GameState, clicks = 3) { const w = weaponOf(s); return (adjustedDamage(s)*clicks+(autoUnlocked(s)&&s.autoEnabled?adjustedDamage(s,true)*w.rate:0))*(1+critChance(s)*(w.kind==='pistol'?1.2:.8)) }
export function farmRate(s: GameState) { const cfg = stageConfig(Math.max(1, s.cleared)); const dmg = baseDamage(s, true); return cfg.coin * lootMultiplier(s) / (.55 + Math.ceil(cfg.hp / Math.max(1, dmg)) / weaponOf(s).rate) * 1.25 }
function spawn(s: GameState) {
  const cfg = stageConfig(s.stage)
  const cycle: EnemyKind[] = s.stage >= 9 ? ['walker', 'armored', 'runner', 'swarm'] : s.stage >= 5 ? ['walker', 'runner', 'swarm'] : ['walker']
  s.enemyKind = cycle[s.kills % cycle.length]!
  s.maxHp = Math.round(cfg.hp * (s.enemyKind === 'armored' ? 1.2 : s.enemyKind === 'swarm' ? 1.3 : s.enemyKind === 'runner' ? .8 : 1))
  s.hp = s.maxHp; s.respawn = 0
}
function kill(s: GameState) {
  if (s.mode === 'boss') {
    const cfg = stageConfig(s.stage)
    s.cleared = s.stage; s.coins += Math.round(cfg.coin * 35 * lootMultiplier(s)); s.scrap += cfg.scrap * 12; s.cans += 3; s.researchPoints += 3 + Math.floor(s.stage / 4)
    note(s, `${cfg.district.boss}已击败！解锁${s.cleared === 1 ? '射击训练' : s.cleared === 4 ? '下一片街区' : '新路线'}。`)
    s.mode = 'farm'; s.stage = Math.min(TOTAL_STAGES, s.cleared + 1); s.bossTime = 0; s.bossIntro=0; s.respawn = .7
    resolveMissions(s)
    if (s.cleared === TOTAL_STAGES) note(s, '信标亮了。24 关演示通关！还可以完成枪柜与图鉴收集。')
    return
  }
  const cfg = stageConfig(s.stage)
  s.kills++; s.stageKills[String(s.stage)] = (s.stageKills[String(s.stage)] ?? 0) + 1
  s.proficiency[weaponOf(s).kind]++; s.codex[s.enemyKind]++
  s.coins += Math.round(cfg.coin * lootMultiplier(s)); s.scrap += Math.max(1, Math.round(cfg.scrap * lootMultiplier(s)))
  if (s.kills % 20 === 0) { s.coins += Math.round(cfg.coin * 5 * lootMultiplier(s)); s.cans++; }
  if (featureUnlocked(s,'handbooks') && s.kills % 9 === 0) s.fragments[Math.floor(s.kills / 9) % 3]!++
  s.hp = 0; s.respawn = .55
  resolveMissions(s)
  if(s.stage===s.cleared+1&&(s.stageKills[String(s.stage)]??0)===cfg.target)note(s,`首领挑战已开放：${cfg.district.boss}。点击战场下方的亮色按钮主动挑战；也可以继续清理准备。`)
}
export function shoot(s: GameState, automatic = false) {
  if (s.hp <= 0 || s.respawn > 0 || s.bossIntro > 0 || (!automatic && s.manualCooldown > 0)) return false
  if (!automatic) s.manualCooldown = .19
  let dmg = adjustedDamage(s, automatic)
  const crit = random(s) < critChance(s)
  if (crit) dmg *= weaponOf(s).kind === 'pistol' ? 2.2 : 1.8
  if (s.burstUntil > s.clockMs) dmg *= 1.8
  s.lastDamage = Math.max(1, Math.round(dmg)); s.lastCrit = crit; s.shotSerial++
  s.hp = Math.max(0, s.hp - s.lastDamage)
  if (s.hp === 0) kill(s)
  return true
}
export function advance(s: GameState, seconds: number, manualRate = 0) {
  if (!Number.isFinite(seconds) || seconds <= 0) return
  let remaining = seconds
  let clickClock = 0
  while (remaining > .000001) {
    const dt = Math.min(.05, remaining); remaining -= dt; s.clockMs += dt * 1000; s.playedSeconds += dt
    s.manualCooldown = Math.max(0, s.manualCooldown - dt)
    if (s.respawn > 0) { s.respawn -= dt; if (s.respawn <= 0) spawn(s) }
    if(s.mode==='boss'&&s.bossIntro>0){s.bossIntro=Math.max(0,s.bossIntro-dt);continue}
    if (s.mode === 'boss') {
      s.bossTime -= dt * (s.hp/s.maxHp<.35?1.35:1)
      if (s.bossTime <= 0) { retreat(s, true); continue }
    }
    if (autoUnlocked(s) && s.autoEnabled) { s.autoClock += dt; const interval = 1 / weaponOf(s).rate; while (s.autoClock >= interval) { s.autoClock -= interval; shoot(s, true) } }
    else s.autoClock = 0
    if (manualRate > 0) { clickClock += dt; while (clickClock + 1e-9 >= 1 / manualRate) { clickClock -= 1 / manualRate; shoot(s) } }
  }
}
export function upgradeTraining(s: GameState) { const cost = trainingCost(s); if (!featureUnlocked(s,'training') || s.training >= 120 || s.coins < cost) return false; s.coins -= cost; s.training++; return true }
export function upgradeTactics(s: GameState) { const cost = tacticsCost(s); if (!featureUnlocked(s,'burst') || s.tactics >= 30 || s.coins < cost) return false; s.coins -= cost; s.tactics++; return true }
export function buyWeapon(s: GameState, id: string) { const w = WEAPONS.find(x => x.id === id); if (!featureUnlocked(s,'market') || !w || s.owned.includes(id) || s.cleared < w.unlock || s.coins < w.price) return false; s.coins -= w.price; s.owned.push(id); note(s, `获得${w.name}。到仓库检查熟练度并穿戴。`); return true }
export function equip(s: GameState, id: string) { const w = WEAPONS.find(x => x.id === id); if (!w || !s.owned.includes(id)) return false; if (s.proficiency[w.kind] < w.required) { note(s, `${w.name}需要${w.required}点熟练度。基础枪可用于练习。`); return false }; s.weapon = id; s.autoClock = 0; return true }
export function enhance(s: GameState, id: string) { const lv = s.enhancements[id] ?? 0; const cost = enhancementCost(s, id); if (!featureUnlocked(s,'enhance') || !s.owned.includes(id) || lv >= 10 || s.scrap < cost) return false; s.scrap -= cost; s.enhancements[id] = lv + 1; return true }
export function refreshMarket(s: GameState) { if (!featureUnlocked(s,'market') || s.refreshes < 1) return false; s.refreshes--; s.marketRoll++; return true }
export function buyMaterial(s: GameState, kind: 'cans' | 'fragments') {
  if (!featureUnlocked(s,'auto')) return false
  const cfg = stageConfig(Math.max(1, s.cleared)); const cost = cfg.coin * (kind === 'cans' ? 30 : 20)
  const id = `market-${s.marketRoll}-${kind}`
  if (s.coins < cost || s.quests.includes(id)) return false
  s.coins -= cost; s.quests.push(id)
  if (kind === 'cans') s.cans += 5; else s.fragments[s.marketRoll % 3]! += 3
  return true
}
export function learnManual(s: GameState, index: number) { const cost=manualCost(s,index); if (!featureUnlocked(s,'handbooks') || index < 0 || index > 2 || s.manuals[index]! >= 5 || s.fragments.some(x => x < cost)) return false; s.fragments = s.fragments.map(x => x - cost); s.manuals[index]!++; note(s, `学习${HANDBOOKS[index]!.name}，永久能力提高。`); return true }
export function petUnlocked(s: GameState, index: number) { return !!PETS[index] && featureUnlocked(s,'pets') && (s.cleared >= PETS[index]!.unlock || (s.quests.includes('legacy-progression')&&s.petLevels[index]!>0)) && (s.kills>=companionKills(index)||s.quests.includes('legacy-progression')) }
export function upgradePet(s: GameState, index: number) { const lv = s.petLevels[index] ?? 0; const cost = 5 * (lv + 1); if (!petUnlocked(s, index) || lv >= 10 || s.cans < cost) return false; s.cans -= cost; s.petLevels[index] = lv + 1; return true }
export function selectPet(s: GameState, index: number) { if (!petUnlocked(s, index) || s.petLevels[index]! < 1) return false; s.pet = index; return true }
export function upgradeResearch(s: GameState, id: ResearchId) { const lv = s.research[id]; const cost = 3 + lv * 2; if (!featureUnlocked(s,'research') || lv >= RESEARCH[id].max || s.researchPoints < cost) return false; s.researchPoints -= cost; s.research[id]++; return true }
export function challenge(s: GameState) { if (s.mode === 'boss' || !bossReady(s)) return false; const cfg = stageConfig(s.stage); s.mode = 'boss'; s.respawn = 0; s.enemyKind = s.stage >= 9 && cfg.district.art !== 'plant' ? 'armored' : 'walker'; s.maxHp = cfg.bossHp; s.hp = s.maxHp; s.bossTime = cfg.bossSeconds; s.bossIntro=1.8; s.autoClock = 0; note(s, `${cfg.district.boss}正在逼近！在它抵达前击败它。`); return true }
export function retreat(s: GameState, timedOut = false) { if (s.mode !== 'boss') return false; note(s, timedOut ? '首领冲到了面前！紧急撤退，资源和装备保留。' : '撤退成功。没有损失资源，可以继续准备。'); s.mode = 'farm'; s.bossTime = 0; s.bossIntro=0; s.respawn = .4; s.hp = 0; return true }
export function chooseStage(s: GameState, stage: number) { if (!Number.isInteger(stage) || stage < 1 || stage > Math.min(TOTAL_STAGES, s.cleared + 1)) return false; if (s.mode === 'boss') retreat(s); s.stage = stage; spawn(s); return true }
export function burst(s: GameState) { if (!featureUnlocked(s,'burst') || s.clockMs < s.burstReady || s.bossIntro>0) return false; if(s.mode==='boss')s.bossTime=Math.min(stageConfig(s.stage).bossSeconds,s.bossTime+2); s.burstUntil = s.clockMs + 8000; s.burstReady = s.clockMs + 45000; return true }
export function achievementReady(s: GameState, id: string) { const a = ACHIEVEMENTS.find(x => x.id === id); if (!a || s.claimedAchievements.includes(id)) return false; return (a.type === 'kills' ? s.kills : a.type === 'guns' ? s.owned.length : s.cleared) >= a.target }
export function claimAchievement(s: GameState, id: string) { const a = ACHIEVEMENTS.find(x => x.id === id); if (!a || !achievementReady(s, id)) return false; s.claimedAchievements.push(id); s.cans += a.cans; s.researchPoints += a.points; note(s, `领取成就「${a.name}」。`); return true }
export function settleOffline(s: GameState, now: number) {
  const seconds = Math.min((7200 + s.research.offline * 1800), Math.max(0, (now - s.lastSaveMs) / 1000))
  s.clockMs = Math.max(s.clockMs, now); s.lastSaveMs = now
  if (s.mode === 'boss') retreat(s)
  if (seconds < 30 || !autoUnlocked(s) || !s.autoEnabled) return
  // 未领取的收益保留，不覆盖；总离线库存由离线上限约束。
  const effective = Math.min(seconds, 7200 + s.research.offline * 1800 - (s.offline && !s.offline.claimed ? s.offline.seconds : 0))
  const cfg = stageConfig(Math.max(1, s.cleared)); const rate = farmRate(s) * .8
  const coins = Math.floor(rate * Math.max(0, effective)); const scrap = Math.floor(coins / cfg.coin * cfg.scrap / 1.25)
  if (s.offline && !s.offline.claimed) { s.offline.coins += coins; s.offline.scrap += scrap; s.offline.seconds += Math.max(0, effective) }
  else s.offline = { id: `offline-${Math.floor(now)}`, coins, scrap, seconds, claimed: false, bonusClaimed: false }
}
export function claimOffline(s: GameState) { if (!s.offline || s.offline.claimed) return false; s.coins += s.offline.coins; s.scrap += s.offline.scrap; s.offline.claimed = true; note(s, '基础离线收益已领取。'); return true }

export { DEMO_ADS } from '../../content/demo.ts'
export function adAvailable(s: GameState, id: string) {
  const a = DEMO_ADS.find(x => x.id === id)
  if (!featureUnlocked(s,'supply') || !a || s.cleared < a.unlock || (s.ads.date === dateKey(s.clockMs) && (s.ads.total >= 12 || (s.ads.counts[id] ?? 0) >= a.limit)) || (s.ads.cooldowns[id] ?? 0) > s.clockMs) return false
  if (id === 'auto' && featureUnlocked(s,'auto')) return false
  if (id === 'offline' && (!s.offline?.claimed || s.offline.bonusClaimed)) return false
  if (id === 'refresh' && s.refreshes >= 30) return false
  return true
}
// 本地演示模拟器的结果；正式广告凭证必须经过平台服务端验证后才能调用同等发奖事务。
export function completeDemoAd(s: GameState, id: string, requestId: string, completed: boolean) {
  if (!completed || s.ads.receipts.includes(requestId) || !adAvailable(s, id)) return false
  if (s.ads.date !== dateKey(s.clockMs)) s.ads = { date: dateKey(s.clockMs), total: 0, counts: {}, cooldowns: s.ads.cooldowns, receipts: s.ads.receipts.slice(-40) }
  const a = DEMO_ADS.find(x => x.id === id)!
  if (id === 'coins') s.coins += Math.max(stageConfig(s.cleared || 1).coin * 20, Math.round(farmRate(s) * 600))
  if (id === 'refresh') s.refreshes = Math.min(30, s.refreshes + 10)
  if (id === 'cans') s.cans += 5
  if (id === 'auto') s.autoTrialUntil = s.clockMs + 600000
  if (id === 'offline' && s.offline) { s.coins += s.offline.coins; s.scrap += s.offline.scrap; s.offline.bonusClaimed = true }
  s.ads.total++; s.ads.counts[id] = (s.ads.counts[id] ?? 0) + 1; s.ads.cooldowns[id] = s.clockMs + a.cooldown * 1000; s.ads.receipts.push(requestId); s.ads.receipts = s.ads.receipts.slice(-80); note(s, '演示补给已到账。'); return true
}
export function selectPanel(s: GameState, panel: PanelId) { if(panelUnlocked(s,panel))s.selectedPanel = panel }
