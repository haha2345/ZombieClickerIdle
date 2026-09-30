import type { EnemyKind, GunKind, ResearchId } from '../domain/models/GameState'

export const DISTRICTS = [
  { name: '封锁走廊', subtitle: '先活过今晚', story: '广播停了。楼里的同事已经不是同事。找到撤离线路，别让手里的枪停下来。', boss: '锥帽暴君', art: 'zombie', color: '#6d9088' },
  { name: '蔓生街区', subtitle: '城市正在长出牙齿', story: '街口被根须封死。回收零件，试试新枪，切断食人花的主茎。', boss: '绿疫食人花', art: 'plant', color: '#7ca25d' },
  { name: '废弃车站', subtitle: '最后一班车没有来', story: '护甲感染者占据站台。黑市里有人留下了穿透弹与一只侦察宠物。', boss: '铁皮监管', art: 'zombie', color: '#91a0aa' },
  { name: '锈色工厂', subtitle: '机器比人更执着', story: '生产线仍在转动。把研究成果用到枪上，别被暴走保安赶出厂区。', boss: '暴走保安', art: 'zombie', color: '#ba7f5a' },
  { name: '隔离温室', subtitle: '每一片叶子都在呼吸', story: '温室里藏着感染源。持续射击未必有效，带上适合群体敌人的装备。', boss: '菌核母体', art: 'plant', color: '#ad79a5' },
  { name: '撤离信标', subtitle: '为幸存者留一盏灯', story: '信标只剩最后一段线路。稳定后方补给，然后面对把整座城连成一体的播种者。', boss: '末日播种者', art: 'plant', color: '#ceaa61' },
] as const

export interface Weapon { id: string; name: string; kind: GunKind; damage: number; rate: number; price: number; unlock: number; required: number; pierce: number; flavor: string }
export const WEAPONS: readonly Weapon[] = [
  { id: 'glock', name: '格洛克', kind: 'pistol', damage: 14, rate: 1.3, price: 0, unlock: 0, required: 0, pierce: 0, flavor: '可靠的第一声枪响' },
  { id: 'revolver', name: '旧式左轮', kind: 'pistol', damage: 26, rate: 1.1, price: 350, unlock: 1, required: 8, pierce: .1, flavor: '单次重击，主动点射' },
  { id: 'carbine', name: '短管卡宾', kind: 'rifle', damage: 35, rate: 2.1, price: 2600, unlock: 3, required: 0, pierce: .25, flavor: '第一把步枪，稳定连射' },
  { id: 'sawed', name: '截短霰弹', kind: 'shotgun', damage: 60, rate: .9, price: 9500, unlock: 5, required: 0, pierce: 0, flavor: '对群体造成额外伤害' },
  { id: 'famas', name: '法玛斯', kind: 'rifle', damage: 78, rate: 2.6, price: 35000, unlock: 7, required: 12, pierce: .3, flavor: '短促连发，穿透护甲' },
  { id: 'magnum', name: '荒原马格南', kind: 'pistol', damage: 165, rate: 1.1, price: 160000, unlock: 9, required: 50, pierce: .2, flavor: '高额暴击，适合 Boss' },
  { id: 'auto-rifle', name: '先锋自动步枪', kind: 'rifle', damage: 240, rate: 3, price: 850000, unlock: 12, required: 50, pierce: .35, flavor: '自动成长的可靠伙伴' },
  { id: 'pump', name: '清剿者', kind: 'shotgun', damage: 420, rate: 1.2, price: 3500000, unlock: 15, required: 30, pierce: .1, flavor: '把整群感染者一并击退' },
  { id: 'marksman', name: '信标精确步枪', kind: 'rifle', damage: 650, rate: 2.8, price: 20000000, unlock: 18, required: 90, pierce: .5, flavor: '远处也有明确的答案' },
  { id: 'rail', name: '曙光原型', kind: 'rifle', damage: 1200, rate: 3.2, price: 80000000, unlock: 21, required: 150, pierce: .65, flavor: '给这座城市最后的枪声' },
]
export const gunLabels: Record<GunKind, string> = { pistol: '手枪', rifle: '步枪', shotgun: '霰弹枪' }
export const enemyLabels: Record<EnemyKind, string> = { walker: '白领感染者', armored: '护甲感染者', runner: '疾行感染者', swarm: '群体感染者' }
export const PETS = [
  { name: '欧比', icon: '犬', unlock: 3, description: '资源收入每级 +4%，离线时继续生效' },
  { name: '克劳德', icon: '鸦', unlock: 9, description: '暴击率每级 +1.5%，主动与自动均生效' },
  { name: '斯帕克', icon: '械', unlock: 12, description: '自动攻击每级 +6% 伤害' },
] as const
export const RESEARCH: Record<ResearchId, { name: string; description: string; max: number }> = {
  power: { name: '穿甲校准', description: '每级全部伤害 +5%', max: 10 },
  salvage: { name: '回收线路', description: '每级金币与零件 +6%', max: 10 },
  offline: { name: '远程哨戒', description: '每级离线上限 +30 分钟', max: 8 },
}
export const stageNames = ['断电大厅', '档案走廊', '安全通道', '楼顶广播', '旧邮局', '封锁街口', '倒塌天桥', '蔓生广场', '售票大厅', '空荡站台', '维修隧道', '最后候车室', '生锈闸门', '流水车间', '冷却塔', '主控室', '隔离入口', '种植舱', '根须管道', '母体中枢', '无人加油站', '信标坡道', '感染源', '黎明之前'] as const
export const TOTAL_STAGES = stageNames.length
export function stageConfig(stage: number) {
  const n = Math.max(1, Math.min(TOTAL_STAGES, stage))
  const district = DISTRICTS[Math.floor((n - 1) / 4)]!
  return { stage: n, district, name: stageNames[n - 1]!, hp: Math.round(42 * 1.72 ** (n - 1)), bossHp: n === 1 ? 440 : Math.round(520 * 1.98 ** (n - 1) * (n <= 4 ? 1 : n <= 8 ? 12 : n <= 12 ? 24 : n <= 16 ? 16 : n === 17 ? 8.1 : n <= 20 ? 6 : n === 21 ? 3.1 : n === 22 ? 1.65 : n === 23 ? .88 : .8)), coin: Math.round(16 * 1.55 ** (n - 1)), target: n === 1 ? 5 : n < 4 ? 12 + n * 4 : 35 + n * 9, bossSeconds: n === 1 ? 12 : 25, scrap: 1 + Math.floor(n / 4) }
}
export const HANDBOOKS = [
  { name: '点射手册', description: '每套永久伤害 +8%' },
  { name: '回收手册', description: '每套资源收入 +8%' },
  { name: '战术手册', description: '每套 Boss 伤害 +10%' },
] as const
export const ACHIEVEMENTS = [
  { id: 'kills-100', name: '别停下来', type: 'kills', target: 100, cans: 8, points: 0 },
  { id: 'kills-1000', name: '街区清扫', type: 'kills', target: 1000, cans: 25, points: 12 },
  { id: 'kills-5000', name: '幸存者的工作', type: 'kills', target: 5000, cans: 60, points: 25 },
  { id: 'guns-3', name: '枪柜初成', type: 'guns', target: 3, cans: 12, points: 0 },
  { id: 'guns-7', name: '枪械收藏家', type: 'guns', target: 7, cans: 30, points: 20 },
  { id: 'stage-4', name: '离开办公室', type: 'stage', target: 4, cans: 10, points: 8 },
  { id: 'stage-12', name: '城市另一端', type: 'stage', target: 12, cans: 35, points: 20 },
  { id: 'stage-24', name: '曙光', type: 'stage', target: 24, cans: 80, points: 40 },
] as const

export const DEMO_ADS = [
  { id: 'coins', label: '无线电金币补给', limit: 3, cooldown: 300, unlock: 1 },
  { id: 'refresh', label: '黑市刷新 ×10', limit: 2, cooldown: 600, unlock: 1 },
  { id: 'cans', label: '宠物罐头 ×5', limit: 3, cooldown: 300, unlock: 3 },
  { id: 'offline', label: '离线追加一份', limit: 2, cooldown: 0, unlock: 3 },
  { id: 'auto', label: '自动开火体验 10 分钟', limit: 1, cooldown: 0, unlock: 1 },
] as const
export type DemoAdId = typeof DEMO_ADS[number]['id']
