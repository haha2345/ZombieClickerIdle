// M0 历史规划；当前运行内容与广告额度以 content/demo.ts 为准。
import type { PanelId } from '../domain/models/GameState'

export type Evidence = 'observed' | 'entry-only' | 'proposed'
export type Milestone = 'M1' | 'M2' | 'M3'

export interface PlannedFeature {
  id: string
  title: string
  evidence: Evidence
  milestone: Milestone
  description: string
}

// 全部是规划条目；不是运行时解锁配置，也不表示已实现。
export const features: readonly PlannedFeature[] = [
  { id: 'shooting', title: '点击射击', evidence: 'observed', milestone: 'M1', description: '伤害、受击、金币和周期赏金。' },
  { id: 'chapters', title: '章节与 Boss', evidence: 'proposed', milestone: 'M1', description: '补齐首通、解锁下一关与失败重试。' },
  { id: 'skills', title: '技能与熟练度', evidence: 'observed', milestone: 'M1', description: '学习、升级与装备要求分别处理。' },
  { id: 'equipment', title: '装备与强化', evidence: 'observed', milestone: 'M1', description: '强化不自动穿戴，未装备武器不增加伤害。' },
  { id: 'market', title: '黑市与主线', evidence: 'observed', milestone: 'M1', description: '商品、任务、刷新次数和新商品池。' },
  { id: 'automation', title: '自动开火', evidence: 'entry-only', milestone: 'M1', description: '按关卡永久解锁；广告可提前体验。' },
  { id: 'offline', title: '离线收益', evidence: 'entry-only', milestone: 'M1', description: '基础免费领取，广告可追加奖励。' },
  { id: 'manuals', title: '秘籍合成', evidence: 'observed', milestone: 'M2', description: '上中下册收集、合成与学习。' },
  { id: 'pets', title: '宠物养成', evidence: 'observed', milestone: 'M2', description: '罐头升级与明确的功能加成。' },
  { id: 'daily', title: '签到与日常', evidence: 'proposed', milestone: 'M2', description: '普通玩法也能获得日常资源。' },
  { id: 'builds', title: '三种枪系流派', evidence: 'proposed', milestone: 'M2', description: '输出方式、抗性和群体敌人形成选择。' },
  { id: 'world-boss', title: '世界 Boss', evidence: 'entry-only', milestone: 'M2', description: '先规划个人每日伤害里程碑。' },
  { id: 'codex', title: '图鉴与成就', evidence: 'proposed', milestone: 'M2', description: '记录击杀、收集与首通。' },
  { id: 'research', title: '研究室', evidence: 'entry-only', milestone: 'M3', description: '离线、黑市和自动攻击的研究路线。' },
  { id: 'arena', title: '竞技场', evidence: 'entry-only', milestone: 'M3', description: '验证构筑后再加入异步挑战。' },
  { id: 'elite', title: '精英与挑战变体', evidence: 'proposed', milestone: 'M3', description: '在固定射击框架中组合敌人特点。' },
]

export const panelLabels: Record<PanelId, string> = {
  combat: '战斗', skills: '技能', market: '黑市', inventory: '仓库', pets: '宠物',
  map: '路线', research: '研究',
}

export const panelDescriptions: Record<PanelId, string> = {
  combat: '战斗场景已就绪。下一步接入点击伤害、敌人生命与击杀结算。',
  skills: '技能界面预留。计划加入秘籍学习、等级成长和枪系熟练度。',
  market: '黑市界面预留。计划加入商品、有限刷新和广告补充次数。',
  inventory: '仓库界面预留。计划加入分类、强化、穿戴条件与出售。',
  pets: '宠物界面预留。计划加入罐头升级和出战加成。',
  map: '章节路线与收集成就。',
  research: '研究路线。',
}
