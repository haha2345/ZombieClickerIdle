import { createInitialState } from '../../domain/systems/demo'
import { PANELS, type GameState } from '../../domain/models/GameState'
import { TOTAL_STAGES, WEAPONS, RESEARCH, stageConfig } from '../../content/demo'
import { MISSIONS } from '../../content/progression'
import { SAVE_KEY } from './namespace'

const finite = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x) && x >= 0
const textArray = (x: unknown): x is string[] => Array.isArray(x) && x.every(v => typeof v === 'string')
const plainNumbers = (x: unknown) => !!x && typeof x === 'object' && !Array.isArray(x) && Object.values(x).every(finite)
export function validateState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') return false
  const s = value as GameState
  const keys = ['stage', 'cleared', 'coins', 'scrap', 'cans', 'researchPoints', 'training', 'tactics', 'kills', 'hp', 'maxHp', 'respawn', 'manualCooldown', 'autoClock', 'bossIntro', 'bossTime', 'burstUntil', 'burstReady', 'autoTrialUntil', 'refreshes', 'marketRoll', 'shotSerial', 'lastDamage', 'seed', 'playedSeconds', 'clockMs', 'lastSaveMs'] as const
  if (s.schemaVersion !== 3 || keys.some(k => !finite(s[k])) || s.stage < 1 || s.stage > Math.min(TOTAL_STAGES,s.cleared+1) || s.cleared > TOTAL_STAGES || !Number.isInteger(s.stage) || !Number.isInteger(s.cleared) || s.training < 1 || s.training > 120 || !Number.isInteger(s.training) || s.tactics > 30 || !Number.isInteger(s.tactics) || s.hp > s.maxHp || s.bossIntro>1.8 || (s.mode==='farm'&&s.bossIntro!==0) || s.refreshes > 30 || !Number.isInteger(s.seed) || s.seed > 4294967295) return false
  if (!PANELS.includes(s.selectedPanel) || !['farm','boss'].includes(s.mode) || !['walker','armored','runner','swarm'].includes(s.enemyKind) || typeof s.autoEnabled !== 'boolean' || typeof s.lastCrit !== 'boolean' || typeof s.lastResult !== 'string') return false
  if (!textArray(s.owned) || !s.owned.includes(s.weapon) || s.owned.some(id => !WEAPONS.some(w => w.id === id)) || !textArray(s.quests) || !textArray(s.log) || !textArray(s.claimedAchievements)) return false
  for (const x of [s.enhancements,s.stageKills,s.proficiency,s.research,s.codex]) if (!plainNumbers(x)) return false
  if (['pistol','rifle','shotgun'].some(k=>!finite(s.proficiency[k as keyof typeof s.proficiency])) || ['power','salvage','offline'].some(k=>!finite(s.research[k as keyof typeof s.research])) || ['walker','armored','runner','swarm'].some(k=>!finite(s.codex[k as keyof typeof s.codex]))) return false
  if ([s.petLevels,s.fragments,s.manuals].some(a=>!Array.isArray(a)||a.length!==3||!a.every(finite)) || !Number.isInteger(s.pet) || s.pet < 0 || s.pet > 2) return false
  if (s.petLevels.some(n=>!Number.isInteger(n)||n>10)||s.manuals.some(n=>!Number.isInteger(n)||n>5)||Object.entries(s.research).some(([id,n])=>!(id in RESEARCH)||!Number.isInteger(n)||n>RESEARCH[id as keyof typeof RESEARCH].max)||Object.entries(s.enhancements).some(([id,n])=>!s.owned.includes(id)||!Number.isInteger(n)||n>10)) return false
  if (!s.ads || typeof s.ads.date !== 'string' || !finite(s.ads.total) || !plainNumbers(s.ads.counts) || !plainNumbers(s.ads.cooldowns) || !textArray(s.ads.receipts)) return false
  if (s.offline === undefined || (s.offline !== null && typeof s.offline !== 'object')) return false
  if (s.offline && (typeof s.offline.id !== 'string' || !finite(s.offline.coins) || !finite(s.offline.scrap) || !finite(s.offline.seconds) || typeof s.offline.claimed !== 'boolean' || typeof s.offline.bonusClaimed !== 'boolean')) return false
  return true
}
export function normalizeSave(value:unknown):unknown {
 if(!value||typeof value!=='object')return value
 const old=value as GameState & {schemaVersion:number}
 if(Number(old.schemaVersion)!==2||!Array.isArray(old.quests))return value
 const quests=[...old.quests,'legacy-progression']
 if(old.kills>=5||old.cleared>0)quests.push('opening-boss-triggered')
 for(const m of MISSIONS)if(old.kills>=m.kills&&old.cleared>=m.cleared)quests.push('mission-'+m.id)
 return {...old,schemaVersion:3,bossIntro:0,bossTime:typeof old.bossTime==='number'&&typeof old.stage==='number'?Math.min(old.bossTime,stageConfig(old.stage).bossSeconds):old.bossTime,quests}
}
export function storageKey(test = false) { return SAVE_KEY + (test ? ':test' : '') }
export function loadState(test = false): { state: GameState; error: string | null } {
  try {
    const raw = localStorage.getItem(storageKey(test))
    if (!raw) return { state: createInitialState(), error: null }
    const parsed: unknown = normalizeSave(JSON.parse(raw))
    if (!validateState(parsed)) throw new Error('存档内容校验失败')
    return { state: parsed, error: null }
  } catch (e) { return { state: createInitialState(), error: `${e instanceof Error ? e.message : '存档无法读取'}。原存档保留，自动覆盖已暂停。` } }
}
export function saveState(state: GameState, test = false) {
  try { localStorage.setItem(storageKey(test), JSON.stringify(state)); return null } catch { return '存档写入失败，请导出备份。' }
}
