export const PANELS = ['combat', 'skills', 'market', 'inventory', 'pets', 'map', 'research'] as const
export type PanelId = typeof PANELS[number]
export type GunKind = 'pistol' | 'rifle' | 'shotgun'
export type EnemyKind = 'walker' | 'armored' | 'runner' | 'swarm'
export type ResearchId = 'power' | 'salvage' | 'offline'
export interface GameState {
  schemaVersion: 3
  mode: 'farm' | 'boss'
  selectedPanel: PanelId
  stage: number
  cleared: number
  coins: number
  scrap: number
  cans: number
  researchPoints: number
  training: number
  tactics: number
  weapon: string
  owned: string[]
  enhancements: Record<string, number>
  proficiency: Record<GunKind, number>
  kills: number
  stageKills: Record<string, number>
  enemyKind: EnemyKind
  hp: number
  maxHp: number
  respawn: number
  manualCooldown: number
  autoClock: number
  bossIntro: number
  bossTime: number
  burstUntil: number
  burstReady: number
  autoEnabled: boolean
  autoTrialUntil: number
  pet: number
  petLevels: number[]
  research: Record<ResearchId, number>
  fragments: number[]
  manuals: number[]
  refreshes: number
  marketRoll: number
  quests: string[]
  codex: Record<EnemyKind, number>
  claimedAchievements: string[]
  lastResult: string
  log: string[]
  shotSerial: number
  lastDamage: number
  lastCrit: boolean
  seed: number
  playedSeconds: number
  clockMs: number
  lastSaveMs: number
  offline: { id: string; coins: number; scrap: number; seconds: number; claimed: boolean; bonusClaimed: boolean } | null
  ads: { date: string; total: number; counts: Record<string, number>; cooldowns: Record<string, number>; receipts: string[] }
}
