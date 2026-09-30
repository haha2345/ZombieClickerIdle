# 当前目录

| 路径 | 用途 |
|---|---|
| src/app/App.vue | 七个菜单、战斗HUD、资源、存档、补给弹窗 |
| src/app/gameSession.ts | 唯一会话、实时时间、动作、自动保存、显式本地广告模拟 |
| src/domain/models/GameState.ts | schema2状态 |
| src/domain/systems/demo.ts | 共享纯规则与事务 |
| src/content/demo.ts | 24关、10枪、伙伴、研究、手册、成就、补给配置 |
| src/game/scenes/BattleScene.ts | 静态角色、HP、输入、程序受击反馈、全屏 |
| src/game/createGame.ts | Phaser 480×640 FIT适配 |
| src/ui/components/GameViewport.vue | Phaser生命周期 |
| src/ui/styles/main.css | 桌面三栏与手机底部导航 |
| src/services/save/ | 本地独立键、校验与坏档保护 |
| src/services/ads/ | 真实平台接入契约，尚未连接SDK |
| public/assets/ | 实际加载的一张场景与两张透明敌人 |
| art/catalog.json | 15张参考、3张运行图的来源与哈希 |
| art/source/references/ | 用户录像与关键帧，不打入发布包 |
| art/source/imagegen/ | 图生图来源说明 |
| docs/design/demo-v0.2.md | 当前实现设计与5小时目标证据 |
| scripts/checks/ | 规则、经济模拟、实际浏览器检查 |
| artifacts/ | 本地验收JSON与截图，忽略提交 |
| progress.md | 工作、错误修复与验证等级 |

依赖、分层沿用 MyFalloutIdle；玩法、目录、端口、键和素材均独立。M0的features/adPlacements只保留历史规划，当前实际内容以demo.ts为准。


v0.3新增：content/progression.ts放26项任务和功能门槛；domain/systems/progression.ts处理领取与系统资格；content/motion.ts放精灵表切帧与播放参数；scripts/assets/pack-video.py从Grok实际视频生成固定格子的透明表；scripts/checks/motion-browser.mjs检查动画帧/暂停/恢复/逼近。App.vue作为同一竖屏游戏表面的HUD与浮层，GameViewport覆盖容器，全屏目标为workspace。
