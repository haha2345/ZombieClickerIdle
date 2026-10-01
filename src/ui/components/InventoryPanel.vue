<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { GameState } from '../../domain/models/GameState'
import type { GameSession } from '../../app/gameSession'
import { HANDBOOKS, WEAPONS, gunLabels, type Weapon } from '../../content/demo'
import * as R from '../../domain/systems/demo'
import * as P from '../../domain/systems/progression'
import ItemIcon from './ItemIcon.vue'
const props=defineProps<{session:GameSession;tab:string}>()
const emit=defineEmits<{learn:[];research:[]}>()
const s=props.session.state as GameState
interface Item {id:string;category:string;name:string;icon:string;rarity:number;count:number;description:string;weapon?:Weapon;manual?:number}
const rarity=ref(-1),selected=ref('gun-'+s.weapon)
const colors=['白','绿','蓝','紫','橙']
const items=computed<Item[]>(()=>[
 ...WEAPONS.filter(w=>s.owned.includes(w.id)).map(w=>({id:'gun-'+w.id,category:'equipment',name:w.name,icon:w.kind,rarity:w.unlock===0?0:w.unlock<7?1:w.unlock<12?2:w.unlock<18?3:4,count:s.enhancements[w.id]??0,description:w.flavor,weapon:w})),
 {id:'scrap',category:'materials',name:'回收零件',icon:'inventory',rarity:0,count:s.scrap,description:'用于强化枪械，提升攻击力。'},
 {id:'cans',category:'materials',name:'伙伴罐头',icon:'pets',rarity:1,count:s.cans,description:'用于培养伙伴。每次升级永久提升伙伴能力。'},
 ...s.fragments.map((n,i)=>({id:'fragment-'+i,category:'materials',name:['上册残页','中册残页','下册残页'][i]!,icon:'skills',rarity:1,count:n,description:'收集上、中、下册，用于学习永久增益手册。'})),
 ...P.featureUnlocked(s,'handbooks')?HANDBOOKS.map((b,i)=>({id:'manual-'+i,category:'manuals',name:b.name,icon:'skills',rarity:2,count:s.manuals[i]!,description:b.description,manual:i})):[],
 ...P.featureUnlocked(s,'research')?[{id:'research',category:'special',name:'研究点',icon:'research',rarity:3,count:s.researchPoints,description:'来自首领首次通关与成就，可在研究站使用。'}]:[],
])
const filtered=computed(()=>items.value.filter(i=>(props.tab==='all'||i.category===props.tab)&&(rarity.value<0||i.rarity===rarity.value)))
const item=computed(()=>filtered.value.find(i=>i.id===selected.value)??filtered.value[0])
const weapon=computed(()=>item.value?.weapon)
const fmt=(n:number)=>Math.floor(n).toLocaleString('en-US')
watch(()=>props.tab,()=>{rarity.value=-1})
const manualCost=computed(()=>item.value?.manual===undefined?0:P.manualCost(s,item.value.manual))
</script>
<template>
 <div class="rarity-filter" aria-label="物品品质筛选"><button aria-label="全部品质" :aria-pressed="rarity<0" @click="rarity=-1"><i>{{rarity<0?'✓':'●'}}</i>全</button><button v-for="(color,i) in colors" :key="color" :class="'rarity-'+i" :aria-label="color+'色品质'" :aria-pressed="rarity===i" @click="rarity=i"><i>{{rarity===i?'✓':'●'}}</i>{{color}}</button></div>
 <div class="inventory-split inventory-reference"><div class="inventory-list"><button v-for="entry in filtered" :key="entry.id" :class="['rarity-'+entry.rarity,{selected:item?.id===entry.id}]" @click="selected=entry.id"><ItemIcon :name="entry.icon"/><small>{{entry.weapon?gunLabels[entry.weapon.kind]:entry.category==='manuals'?'手册':entry.category==='special'?'特殊':'材料'}}</small><strong>{{entry.name}}</strong><span>{{entry.weapon?'+'+entry.count+(s.weapon===entry.weapon.id?' · 已穿戴':''):'×'+fmt(entry.count)}}</span></button><p v-if="!filtered.length" class="empty-inventory">暂无此类物品</p></div>
 <div class="inventory-detail" v-if="item">
  <template v-if="weapon"><div class="equipment-paper"><ItemIcon :name="weapon.kind"/><h3 :class="'rarity-'+item.rarity">{{weapon.name}}</h3><p>{{weapon.flavor}}</p></div><div class="paper-stats equipment-stats"><p>攻击力 <b>+{{fmt(weapon.damage*(1+(s.enhancements[weapon.id]??0)*.12))}}</b></p><p>穿戴要求 <b>{{gunLabels[weapon.kind]}}熟练 {{weapon.required}}</b></p><p>强化效果 <b>攻击力 +{{fmt(weapon.damage*(s.enhancements[weapon.id]??0)*.12)}}</b></p></div><div class="enhancement-circle" v-if="P.featureUnlocked(s,'enhance')"><small>成功率：100%</small><button :data-enhance="weapon.id" :disabled="(s.enhancements[weapon.id]??0)>=10||s.scrap<R.enhancementCost(s,weapon.id)" @click="session.enhance(weapon.id)">{{(s.enhancements[weapon.id]??0)>=10?'已满':'强化'}}</button><p>{{fmt(R.enhancementCost(s,weapon.id))}} 零件</p></div><p class="enhance-locked" v-else>累计60击杀开放强化</p><div class="equipment-actions"><button :data-equip="weapon.id" :disabled="s.weapon===weapon.id||s.proficiency[weapon.kind]<weapon.required" @click="session.equip(weapon.id)">{{s.weapon===weapon.id?'穿戴中':s.proficiency[weapon.kind]<weapon.required?'熟练不足':'穿戴'}}</button><small>自动射速 {{weapon.rate}} 次/秒 · 护甲穿透 {{Math.round(weapon.pierce*100)}}%</small></div></template>
  <template v-else><div class="manual-paper"><h3 :class="'rarity-'+item.rarity">{{item.name}}</h3><p>{{item.description}}</p></div><div class="blueprint" :class="{'blueprint-drawing':item.category==='manuals'}"><ItemIcon v-if="item.category!=='manuals'" :name="item.icon"/></div><div class="paper-stats"><p>{{item.category==='manuals'?'学习等级':'库存'}} <b>{{fmt(item.count)}}{{item.category==='manuals'?' / 5':''}}</b></p><p v-if="item.category==='manuals'">学习要求 <b>上、中、下册各 {{manualCost}}</b></p></div><button v-if="item.manual!==undefined" class="inventory-learn" :disabled="item.count>=5||s.fragments.some(n=>n<manualCost)" @click="session.learnManual(item.manual)">学习</button><button v-else-if="item.category==='special'" class="inventory-learn" @click="emit('research')">前往研究</button><button v-else-if="item.id.startsWith('fragment')" class="inventory-learn" @click="emit('learn')">前往学习</button></template>
 </div></div>
 <div class="inventory-capacity">物品：{{items.length}} 类 <small>武器 {{s.owned.length}} / {{WEAPONS.length}}</small></div>
</template>
