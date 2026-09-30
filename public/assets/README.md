# v0.3 运行资源

- `scenes/*-clean.png`：不含人物的走廊、楼顶与温室背景，由 imagegen 图生图生成。
- `motion/hero-shoot.png`：主角射击后坐、头发摆动，9 帧单次动作。
- `motion/zombie-walk.png`：普通怪步行，9 帧循环。
- `motion/tyrant-walk.png`：暴君重步，12 帧循环。
- `motion/plant-idle.png`：植物张合，12 帧循环。

动画由 Grok CLI 真实视频抽帧而来。同名 JSON 提供源视频哈希、原帧索引、格子尺寸与播放帧率；人物和场景独立加载。

旧静态 PNG 保留作为生成参考与历史资产。原录像和源视频仅保留本地，不放入发布目录。来源、尺寸、哈希见 `art/catalog.json`，详细流程见 `docs/assets/2026-09-30-hud-motion.md`。
