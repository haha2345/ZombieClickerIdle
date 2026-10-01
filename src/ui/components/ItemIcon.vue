<script setup lang="ts">
import {computed} from 'vue'
const props=defineProps<{name:string}>()
const filenames:Record<string,string>={combat:'pistol',research:'skills',pistol:'pistol',rifle:'rifle',shotgun:'shotgun',skills:'skills',map:'map',market:'market',inventory:'inventory',pets:'pets'}
const source=computed(()=>{const file=filenames[props.name]??'skills';return import.meta.env.BASE_URL+'assets/ui/'+(['skills','map','market','inventory'].includes(file)?'reference-v2/icon-'+file:file)+'.png'})
</script>
<template><span class="item-icon"><img :src="source" alt="" draggable="false"/></span></template>
