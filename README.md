# 末日信标 · ZombieClickerIdle

竖屏点击射击与放置成长的浏览器游戏演示。清理感染者、积累资源、准备装备，再主动挑战不断逼近的首领。任务、成长入口和提示都显示在游戏画面内，随着进度逐步开放。

当前版本：**v0.3 演示**。六个区域、24 关、10 把枪、3 位伙伴、3 份手册、3 条研究、8 项成就与 26 项任务。

## 实机截图

| 普通怪清理与挑战提示 | 楼顶首领逼近 | 温室植物首领 |
| :---: | :---: | :---: |
| <img src="docs/media/boss-ready.png" width="240" alt="完成五次击杀后，画面内首领挑战按钮点亮"> | <img src="docs/media/boss-rooftop.png" width="240" alt="楼顶场景，暴君逐渐逼近玩家"> | <img src="docs/media/boss-greenhouse.png" width="240" alt="温室场景，植物首领与倒计时"> |

以上均为实际浏览器截图；后两张使用开发验收存档展示首领战。

## 射击动图

<img src="docs/media/shooting.gif" width="360" alt="实际游戏画面内的主角射击后坐、头发摆动、普通怪步行和伤害变化">

动图录制自实际游戏，包含完整 HUD。角色动画由 Grok CLI 图生视频抽帧为透明 Sprite sheet，使用 Phaser 播放。当前主角有抬枪后坐、上身跟随和马尾摆动，胸臀跟随幅度仍较轻；后续可继续精修。

## 核心玩法

- **主动开局**：点击、按住战场或空格射击。普通怪达到目标后，底部挑战按钮点亮，玩家自行决定何时打 Boss。
- **有压力的首领战**：切换独立场景和首领，警报后开始逼近；低血量狂暴加速。集中火力可提升伤害并击退首领，失败撤回保留资源。
- **任务带动成长**：击杀和首通任务自动发奖。新档首次击败首领合计获得 **880 金币、24 零件、3 罐头、3 研究点**，并开放训练。
- **装备与构筑**：买枪、熟练度、强化、伙伴、手册与研究逐步加入，连接手动射击、自动火力与资源回收。
- **放置与存档**：永久自动攻击、免费离线资源回收、本地自动保存、导入与导出。离线不会自动完成首领战。
- **自愿补给**：五个激励广告入口，当前为明确标示的 **3 秒本地模拟**。取消无奖，完成后领取，带去重、冷却和每日额度。

## 功能开放顺序

击杀数与首通数同时满足才会开放功能。时间为共享规则模拟中的累计成长时间，实际操作、阅读、失败与暂停会影响进度；不是强制等待。

| 触发条件 | 开放功能 | 模拟时间参考 |
| --- | --- | --- |
| 普通怪 5 杀 | 128 金币任务奖、首领挑战提示 | 开局数秒至十几秒 |
| 5 杀＋首通 1 关 | 射击训练、高额首通奖 | 约 13–19 秒 |
| 25 杀＋首通 1 关 | 黑市、枪柜 | 约 0.6–0.9 分钟 |
| 60 杀＋首通 2 关 | 零件强化、集中火力 | 约 1.6–2.2 分钟 |
| 120 杀＋首通 3 关 | 路线、图鉴、成就、补给 | 约 2.5–3.3 分钟 |
| 300 杀＋首通 3 关 | 永久自动、离线回收 | 约 5.3–7 分钟 |
| 650 杀＋首通 4 关 | 手册 | 约 9.8–11.7 分钟 |
| 1000 杀＋首通 5 关 | 首位伙伴 | 约 14.6–16.6 分钟 |
| 2800 杀＋首通 8 关 | 研究 | 约 34.6–38.9 分钟 |
| 3500／9000 杀＋首通 9／12 关 | 侦察／机械伙伴 | 随构筑推进 |

完整任务、首领与开放安排见 [当前演示设计](docs/design/demo-v0.3.md)。

## 本地运行

建议使用 **Node.js 22.18+**，以便同时执行直接读取 TypeScript 的规则检查。

```sh
git clone https://github.com/haha2345/ZombieClickerIdle.git
cd ZombieClickerIdle
npm ci
npm run dev
```

打开 <http://127.0.0.1:5174/>。桌面居中竖屏，手机适配竖屏画面。项目使用独立端口和存档键 `zombie-clicker-idle:save:v1`。

| 操作 | 控制 |
| --- | --- |
| 射击 | 点击／按住战场，或空格 |
| 集中火力 | B，功能解锁后可用 |
| 全屏 | F；Esc 退出 |
| 挑战首领 | 目标完成后点击底部金色按钮 |
| 成长、补给、存档 | 游戏画面内的菜单和弹窗 |

生产构建及本地预览：

```sh
npm run build
npm run preview
```

## 验证与五小时成长目标

```sh
npm run assets:check
npm run check:demo
npm run build
```

规则检查覆盖任务、首通、装备、离线、广告领奖和存档等 15 组断言。经济模拟调用实际游戏规则，验证四种操作／补给策略自然首通 24 关：

| 模拟策略 | 完成时长 |
| --- | ---: |
| 每秒 3 次输入，无广告 | 10.40 小时 |
| 每秒 5 次输入，无广告 | 5.22 小时 |
| 每秒 5 次输入，3 次后期金币补给 | 5.03 小时 |
| 每秒 5 次输入，3 次前期金币补给 | 5.23 小时 |

这包含重复刷资源、准备装备与放置成长，**不代表五小时独立剧情、五小时人工试玩或所有最优策略均需要五小时**。模拟脚本会重新生成 `artifacts/economy-simulation.json`；发布时的报告见 [经济模拟](docs/validation/economy-simulation.json)。

实际浏览器已完成 [12 组交互检查](docs/validation/browser-checks.json) 和 [6 组动画检查](docs/validation/motion-checks.json)，覆盖画面内界面、挑战、广告、离线、存档、全屏、手机布局和真实精灵帧变化。

浏览器脚本使用外部 Playwright，不改变游戏依赖：

```sh
# 替换为本机已有 Playwright 模块与 Chromium/Chrome 可执行文件
TASK_PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs \
TASK_BROWSER_EXECUTABLE=/path/to/chrome \
TASK_HEADED=1 npm run check:browser

TASK_PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs \
TASK_BROWSER_EXECUTABLE=/path/to/chrome \
node scripts/checks/motion-browser.mjs
```

检查脚本访问 `?test`，使用独立测试存档。

## 技术栈与项目结构

沿用 MyFalloutIdle 的锁定技术栈，保留依赖锁文件。

| 依赖 | 版本 |
| --- | --- |
| Vue | 3.5.43 |
| Phaser | 4.2.1 |
| Vite | 8.3.1 |
| TypeScript | 6.0.3 |
| vue-tsc | 3.3.11 |
| @vitejs/plugin-vue | 6.0.9 |
| @vue/tsconfig | 0.9.1 |
| @types/node | 26.6.3 |

```text
src/app/          唯一游戏状态与 Vue 入口
src/domain/       纯规则、成长与结算
src/content/      关卡、任务、装备、动画配置
src/game/         Phaser 场景与输入
src/ui/           画面内组件与样式
src/services/     本地存档、广告契约
public/assets/    运行图片、透明精灵表及源帧元数据
scripts/          素材打包、规则模拟、浏览器验收
docs/             设计、研究、截图动图与验证报告
art/              素材来源与哈希目录
```

## 演示边界与文档

当前为单机浏览器演示，存档保存在本机浏览器。广告尚未接入真实 SDK 或服务端验证。动画仍有少量轮廓漂移和边缘残色，没有独立软组织骨骼物理。原始录屏、Grok 视频、临时日志、个人配置和构建输出不随仓库提交；运行资源已包含，可以直接构建。

- [当前玩法与开放节点](docs/design/demo-v0.3.md)
- [同类游戏研究与借鉴](docs/research/similar-games-2026-09-30.md)
- [参考录像分析](docs/research/video-analysis.md)
- [架构与存档／广告契约](docs/architecture.md)
- [项目目录说明](docs/project-structure.md)
- [美术流程](docs/assets/README.md)与[动画来源](docs/assets/2026-09-30-hud-motion.md)
- [开发与验收记录](progress.md)
