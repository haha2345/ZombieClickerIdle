<script setup lang="ts">
import { onBeforeUnmount,onMounted,ref } from 'vue'
import type Phaser from 'phaser'
import { createGame } from '../../game/createGame'
import type { GameSession } from '../../app/gameSession'
const props=defineProps<{session:GameSession}>()
const host=ref<HTMLDivElement>();let game:Phaser.Game|undefined
onMounted(()=>{if(host.value)game=createGame(host.value,props.session)})
onBeforeUnmount(()=>{game?.destroy(true);game=undefined})
</script>
<template><div ref="host" class="game-viewport" role="img" aria-label="战斗画面：点击或按住敌人开火，也可按住空格。B 爆发，F 全屏。" /></template>
