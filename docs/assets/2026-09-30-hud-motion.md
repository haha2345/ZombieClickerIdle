# 2026-09-30 美术与动画来源

## imagegen：内置工具，图生图

新图保留原画风、镜头与主体身份。没有使用文生图或让模型一次生成多格动画。生成原件保留在本地生成目录，项目资产已复制落盘，SHA256见 `art/catalog.json`。

| 图 | 参考 | 原件 | 项目文件 |
|---|---|---|---|
| 主角底图 | corridor.png | exec-21e15758-3a91-4733-aaed-9ee181a64673.png | art/source/animation/hero-base.png |
| 清空走廊 | corridor.png | exec-756baef3-4fb3-4eef-8533-c68d80e585c2.png | public/assets/scenes/corridor-clean.png |
| 清空楼顶 | boss-rooftop.png | exec-846da194-eae7-48c7-84f3-8d626676965c.png | public/assets/scenes/boss-rooftop-clean.png |
| 清空温室 | boss-greenhouse.png | exec-ed8b4b72-9f76-4460-9fd3-901e5bd939a2.png | public/assets/scenes/boss-greenhouse-clean.png |
| 楼顶首领场景 | corridor.png | exec-7baeee1e-2f98-4146-b5f0-fc705e74c2bb.png | public/assets/scenes/boss-rooftop.png |
| 温室首领场景 | corridor.png | exec-75b56128-379c-4b7e-87e2-8de1348616f7.png | public/assets/scenes/boss-greenhouse.png |
| 锥帽暴君 | office-zombie.png | exec-9ec42a13-0d0f-4d85-907d-0068e3c12052.png | public/assets/enemies/cone-tyrant.png |

主角底图的完整提示词：

> Edit the reference image into one isolated ADULT female game protagonist in the exact same over-the-shoulder rear three-quarter aiming pose, same black ponytail, grey tank top, black shorts, two-handed pistol and comic illustration style. Show her head, torso, hips and upper thighs with generous margin all around, centered on a perfectly flat solid magenta #FF00FF background. Remove all architecture, floor, shadows, text and other figures. Keep clothing fully on, preserve identity and body proportions, the gun points to the upper right. This is a neutral base frame for a game shooting recoil animation, not a sprite sheet.

三张清空背景分别输入对应的原图，完整共用提示词：

> Edit only to remove the woman and her pistol from the lower left of this game scene, filling the area naturally with the existing floor and environment. Preserve the exact camera, perspective, architecture, lighting, colors, details, illustration style and open central combat lane. The result is the same portrait game background with absolutely no people or enemies or UI or text. Do not add objects.

## Grok：真实视频，再抽帧

使用本机已有Grok CLI 1.0.44。四段有效视频：`art/source/animation/hero-shoot.mp4`、`zombie-walk.mp4`、`tyrant-walk.mp4`、`plant-idle.mp4`。输入依次为主角底图、白领感染者、锥帽暴君、食人植物。主角与普通怪4秒720p，暴君与植物2秒480p。

生成提示、视频和原始工具日志保留在本地，不随仓库提交。运行表及源视频哈希、抽帧参数已包含在 `public/assets/motion/` 的同名 JSON。主角加强版网络响应读取失败，没有有效输出，没有混入运行资产。

可复现命令结构，见官方 [CLI Reference](https://docs.x.ai/build/cli/reference)、[Headless and Scripting](https://docs.x.ai/build/cli/headless-scripting)：

```sh
HTTPS_PROXY=http://127.0.0.1:10808 HTTP_PROXY=http://127.0.0.1:10808 \
ALL_PROXY=http://127.0.0.1:10808 NO_PROXY=localhost,127.0.0.1,::1 \
grok --no-plan --no-subagents --max-turns 20 \
  --permission-mode bypassPermissions --output-format plain \
  --prompt-file /path/to/video-prompt.txt --cwd art/source/animation
```

10808是本次本机系统代理的端口，仅作示例；无需代理时去掉这些环境变量，换机器使用实际配置的地址。本次直连 `https://cli-chat-proxy.grok.com/v1/responses` 反复连接超时，读取本机系统代理后仅给这些子进程设置代理即可调用工具。没有重装、换账号、改全局Grok配置或另写视频API。

调用 `reference_to_video`，不是 `grok video` 子命令。真实循环用同一张首尾帧；透明敌人参考直接做`images`输入，以生成纯品红底。视频工具说明来自本机 bundled imagine，与官方 [Reference-to-Video](https://docs.x.ai/developers/model-capabilities/video/reference-to-video) 同一流程。

## 抽帧与打包

`python3 scripts/assets/pack-video.py --help` 查看参数。抽帧环境需要 ffmpeg、Pillow 和 NumPy；游戏运行和构建无需这些工具。源视频只保留在本地，重新打包前需自行准备对应视频。

ffmpeg真实抽帧，无插值、无逐帧合成姿势。色键只去品红，保留主体黑色和服装；全部帧使用相同缩放和格子，不逐帧拉伸对齐。每张表同名JSON记录源视频哈希、原帧序号、格子大小、帧数及播放FPS。

| 表 | 原帧索引 | 格子 | 播放 |
|---|---|---|---|
| hero-shoot.png | 24fps的0,3,6,9,12,16,20,24,28 | 384×512，9帧 | 每次有效射击48fps单次，回到瞄准 |
| zombie-walk.png | 12fps的4,6,8,10,12,14,16,18,20 | 384×512，9帧 | 7fps循环 |
| tyrant-walk.png | 12fps的0,2,4,…22 | 384×512，12帧 | 6fps循环，狂暴加速 |
| plant-idle.png | 12fps的0,2,4,…22 | 576×384，12帧 | 6fps循环 |

最终表在 `public/assets/motion/`，原帧、接触表及GIF在 `work/*-raw/`。四张接触表已目视查看，实际浏览器检查人物动画帧变化、停火恢复、菜单暂停恢复、两种首领动画与逼近位置。原件与精灵表的生成/接入/运行证据分别保留。

当前限制：普通怪部分帧锥帽尖接近画幅上沿；视频主体会有小幅比例漂移和少量紫色边缘。主角胸臀跟随幅度还轻，增强视频未返回。没有声称完成独立骨骼物理或正式精修资源。
