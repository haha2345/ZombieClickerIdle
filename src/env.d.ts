interface Window {
  gameMotionState?: {heroFrame:number;heroPlaying:boolean;enemyFrame:number;enemyAnimation:string;enemyX:number;enemyY:number;enemyHeight:number}
  render_game_to_text?: () => string
  advanceTime?: (ms: number) => void | Promise<void>
}
