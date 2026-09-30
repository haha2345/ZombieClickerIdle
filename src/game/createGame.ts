import Phaser from 'phaser'
import type { GameSession } from '../app/gameSession'
import { BattleScene } from './scenes/BattleScene'

export function createGame(parent:HTMLElement, session:GameSession):Phaser.Game {
  return new Phaser.Game({type:Phaser.AUTO,parent,width:480,height:800,backgroundColor:'#213338',antialias:true,pixelArt:false,preserveDrawingBuffer:import.meta.env.DEV&&new URLSearchParams(location.search).has('test'),scale:{mode:Phaser.Scale.ENVELOP,fullscreenTarget:parent.closest('.workspace') as HTMLElement,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[new BattleScene(session)]})
}
