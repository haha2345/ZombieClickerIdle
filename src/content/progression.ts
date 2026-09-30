import type { PanelId } from '../domain/models/GameState'
export type FeatureId = 'training'|'market'|'enhance'|'burst'|'map'|'supply'|'auto'|'handbooks'|'pets'|'research'
export const UNLOCKS: readonly {id:FeatureId;name:string;kills:number;cleared:number;time:string}[] = [
  {id:'training',name:'射击训练',kills:5,cleared:1,time:'模拟约 0.2–0.3 分钟'},
  {id:'market',name:'黑市与枪柜',kills:25,cleared:1,time:'模拟约 0.6–0.9 分钟'},
  {id:'enhance',name:'武器强化',kills:60,cleared:2,time:'模拟约 1.6–2.2 分钟'},
  {id:'burst',name:'集中火力与首领战术',kills:60,cleared:2,time:'模拟约 1.6–2.2 分钟'},
  {id:'map',name:'路线与图鉴',kills:120,cleared:3,time:'模拟约 2.5–3.3 分钟'},
  {id:'supply',name:'无线电补给',kills:120,cleared:3,time:'模拟约 2.5–3.3 分钟'},
  {id:'auto',name:'永久自动与离线回收',kills:300,cleared:3,time:'模拟约 5.3–7 分钟'},
  {id:'handbooks',name:'残页与永久手册',kills:650,cleared:4,time:'模拟约 9.8–11.7 分钟'},
  {id:'pets',name:'第一位伙伴：欧比',kills:1000,cleared:5,time:'模拟约 14.6–16.6 分钟'},
  {id:'research',name:'永久研究',kills:2800,cleared:8,time:'模拟约 34.6–38.9 分钟'},
]
export const PANEL_FEATURE: Partial<Record<PanelId,FeatureId>>={skills:'training',market:'market',inventory:'market',pets:'pets',map:'map',research:'research'}
export interface Mission {id:string;name:string;kills:number;cleared:number;coins:number;scrap:number;cans:number;points:number;fragments?:number;opens?:string}
export const MISSIONS: readonly Mission[] = [
  {id:'entry-5',name:'先把门口清干净',kills:5,cleared:0,coins:8,scrap:0,cans:0,points:0,opens:'击杀5只后提示并点亮首领挑战按钮，由玩家主动进入'},
  {id:'first-boss',name:'守住第一次接近',kills:5,cleared:1,coins:20,scrap:12,cans:0,points:0,opens:'射击训练'},
  {id:'kills-25',name:'搜到黑市的频率',kills:25,cleared:1,coins:25,scrap:10,cans:0,points:0,opens:'黑市、枪柜与第二把枪'},
  {id:'kills-60',name:'枪还能更稳一点',kills:60,cleared:2,coins:25,scrap:45,cans:0,points:0,opens:'强化、集中火力与首领战术'},
  {id:'kills-120',name:'接上撤离路线',kills:120,cleared:3,coins:25,scrap:25,cans:0,points:0,opens:'路线、图鉴与可选无线电补给'},
  {id:'kills-200',name:'建立回收节奏',kills:200,cleared:3,coins:30,scrap:30,cans:0,points:0},
  {id:'kills-300',name:'让枪替你值班',kills:300,cleared:3,coins:30,scrap:40,cans:0,points:0,opens:'永久自动开火与免费离线回收'},
  {id:'kills-450',name:'办公室最后一轮巡查',kills:450,cleared:4,coins:35,scrap:50,cans:0,points:0},
  {id:'kills-650',name:'把残页拼成经验',kills:650,cleared:4,coins:35,scrap:40,cans:0,points:0,fragments:1,opens:'手册学习；每次学习所需套册逐级增加'},
  {id:'kills-1000',name:'有人愿意跟着你',kills:1000,cleared:5,coins:40,scrap:60,cans:15,points:0,opens:'伙伴欧比，收益或战斗开始有选择'},
  {id:'kills-1500',name:'清扫整条街',kills:1500,cleared:6,coins:40,scrap:80,cans:10,points:0},
  {id:'kills-2200',name:'为下一次首领备弹',kills:2200,cleared:7,coins:45,scrap:100,cans:10,points:0},
  {id:'kills-2800',name:'搭起小型研究站',kills:2800,cleared:8,coins:45,scrap:120,cans:10,points:8,opens:'伤害、回收与离线三条研究'},
  {id:'kills-3500',name:'侦察员回来了',kills:3500,cleared:9,coins:50,scrap:140,cans:20,points:5,opens:'伙伴克劳德，可选择暴击构筑'},
  {id:'kills-4500',name:'护甲也挡不住你',kills:4500,cleared:10,coins:50,scrap:160,cans:15,points:8},
  {id:'kills-6000',name:'贯通维修隧道',kills:6000,cleared:11,coins:55,scrap:180,cans:20,points:8},
  {id:'kills-8000',name:'车站终于安静了',kills:8000,cleared:12,coins:55,scrap:220,cans:20,points:10},
  {id:'kills-9000',name:'让机械接过巡逻',kills:9000,cleared:12,coins:60,scrap:250,cans:25,points:10,opens:'伙伴斯帕克与自动火力构筑'},
  {id:'kills-11000',name:'清理工厂入口',kills:11000,cleared:13,coins:60,scrap:300,cans:25,points:10},
  {id:'kills-14000',name:'拆掉生产线上的威胁',kills:14000,cleared:14,coins:65,scrap:350,cans:25,points:10},
  {id:'kills-17000',name:'为温室准备装备',kills:17000,cleared:16,coins:65,scrap:400,cans:30,points:10},
  {id:'kills-20000',name:'回收感染的种植舱',kills:20000,cleared:17,coins:70,scrap:450,cans:30,points:12},
  {id:'kills-23000',name:'切断根须管道',kills:23000,cleared:18,coins:70,scrap:500,cans:30,points:12},
  {id:'kills-27000',name:'让信标重新呼吸',kills:27000,cleared:20,coins:75,scrap:600,cans:35,points:15},
  {id:'kills-31000',name:'清空最后一段线路',kills:31000,cleared:22,coins:80,scrap:700,cans:40,points:15},
  {id:'last-signal',name:'把灯留给后来的人',kills:0,cleared:24,coins:80,scrap:800,cans:40,points:20,opens:'24关结束与剩余收藏目标'},
]
