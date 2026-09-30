# 项目约定

## 用户提供的美术要求

生图的时候先用图生图方式。如果没有参考图再使用文生图。
生图就用 imagegen 操作。需要做动态效果就用 grok cli 做视频然后抽帧做 Sprite sheet 图。

参考录像与关键帧见 `art/source/references/`。生成前先选择合适的参考图；生成资产、抽帧和接入游戏分别记录验证结果。角色Sprite已通过Grok视频→抽帧→透明表接入；程序受击数字和血条仍与Sprite动作分开记录。

## 实现约定

- 技术栈与 MyFalloutIdle 当前锁定版本一致，未经需求不要单独升级。
- `src/app/gameSession.ts` 持有唯一运行状态；domain 处理规则；content 放静态配置；Phaser 处理画面；Vue 处理界面；services 适配外部能力。
- 明确区分已观察、仅见入口和新增方案。不能把文档、配置或素材生成当成已实现玩法。
- 最新授权为组合成 5 小时以上的小品级可玩演示；范围以 docs/design/demo-v0.3.md 为准。
- 奖励广告只在有效完成并通过领取校验后发奖，按请求 ID 去重；不以点击按钮或关闭页面代替完成。
- 新项目存档使用 `zombie-clicker-idle:save:v1`，禁止读写 MyFalloutIdle 的键和数据。
- 演示允许小规模武器、伙伴、手册、研究和成就；不扩展基地、公会或实时多人。
- 运行 `npm run build`、`npm run assets:check`、`npm run check:demo`；界面与游戏交互变化需实际浏览器验证。检查的结论按证据等级记录。
