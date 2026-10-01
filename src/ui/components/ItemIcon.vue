<script setup lang="ts">
import {computed} from 'vue'
const props=defineProps<{name:string}>()
const filenames:Record<string,string>={combat:'pistol',research:'skills',pistol:'pistol',rifle:'rifle',shotgun:'shotgun',skills:'skills',map:'map',market:'market',inventory:'inventory',pets:'pets'}
const source=computed(()=>import.meta.env.BASE_URL+'assets/ui/'+(filenames[props.name]??'skills')+'.png')
</script>
<template><span class="item-icon"><img :src="source" alt="" draggable="false"/></span></template>
