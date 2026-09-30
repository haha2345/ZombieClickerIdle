// M0 历史规划；当前运行内容与广告额度以 content/demo.ts 为准。
import type { Evidence, Milestone } from './features'

export interface AdPlacement {
  id: string
  label: string
  evidence: Evidence
  milestone: Milestone
  dailyLimit: number
  cooldownSeconds: number
  rewardDescription: string
  condition: string
}

// 规划配置，不包含观看、次数扣减或发奖实现。
export const adPolicy = { globalDailyLimit: 12, version: 'draft-v0.1' } as const
export const adPlacements = [
  { id: 'coin-supply', label: '金币补给', evidence: 'entry-only', milestone: 'M1', dailyLimit: 3, cooldownSeconds: 300, rewardDescription: '稳定可刷关卡 10 分钟基础金币', condition: '普通收益可独立获取，不重复乘广告增益' },
  { id: 'offline-bonus', label: '离线追加奖励', evidence: 'entry-only', milestone: 'M1', dailyLimit: 2, cooldownSeconds: 0, rewardDescription: '加发等量金币和可加倍材料', condition: '基础免费；每个结算批次只追加一次' },
  { id: 'market-refresh', label: '黑市刷新', evidence: 'entry-only', milestone: 'M1', dailyLimit: 2, cooldownSeconds: 600, rewardDescription: '刷新次数 +20', condition: '次数库存上限 40，不直接重抽商品' },
  { id: 'auto-trial', label: '自动开火体验', evidence: 'entry-only', milestone: 'M1', dailyLimit: 1, cooldownSeconds: 0, rewardDescription: '自动开火 10 分钟', condition: '仅永久自动开火解锁前提供' },
  { id: 'pet-cans', label: '宠物罐头', evidence: 'entry-only', milestone: 'M2', dailyLimit: 3, cooldownSeconds: 300, rewardDescription: '罐头 ×5', condition: '宠物系统已解锁' },
  { id: 'auto-burst', label: '自动开火爆发', evidence: 'proposed', milestone: 'M2', dailyLimit: 2, cooldownSeconds: 900, rewardDescription: '攻速 +50%，持续 5 分钟', condition: '自动开火已解锁，不叠加倍率' },
  { id: 'boss-retry', label: 'Boss 战术增援', evidence: 'proposed', milestone: 'M2', dailyLimit: 1, cooldownSeconds: 0, rewardDescription: '重开该 Boss，一次战斗伤害 +10%', condition: '仅失败后出现，不直接发放胜利' },
  { id: 'daily-bonus', label: '日常追加奖励', evidence: 'proposed', milestone: 'M2', dailyLimit: 1, cooldownSeconds: 0, rewardDescription: '日常金币和普通材料额外 +50%', condition: '基础已领取，每份奖励只追加一次' },
  { id: 'research-supply', label: '研究加速', evidence: 'proposed', milestone: 'M3', dailyLimit: 2, cooldownSeconds: 1800, rewardDescription: '15 分钟等价研究点', condition: '研究室和目标路线已解锁' },
  { id: 'world-boss-ticket', label: '世界 Boss 次数', evidence: 'proposed', milestone: 'M3', dailyLimit: 1, cooldownSeconds: 0, rewardDescription: '个人挑战次数 +1', condition: '世界 Boss 已解锁' },
] as const satisfies readonly AdPlacement[]

export type AdPlacementId = typeof adPlacements[number]['id']
