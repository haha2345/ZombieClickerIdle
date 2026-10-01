// Every frame is harvested from an actual Grok CLI video; see public/assets/motion/*.json.
export const MOTION=[
  {key:'hero-shoot',file:'hero-shoot.png',width:384,height:512,frames:9,fps:48,repeat:0},
  {key:'zombie-walk',file:'zombie-walk.png',width:384,height:512,frames:34,fps:24,repeat:-1},
  {key:'tyrant-walk',file:'tyrant-walk.png',width:384,height:512,frames:48,fps:24,repeat:-1},
  {key:'plant-idle',file:'plant-idle.png',width:576,height:384,frames:48,fps:24,repeat:-1},
] as const
