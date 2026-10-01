# 2026-10-01：UI图标与密集帧接入

## 图生图

工具：内置imagegen，参考 `art/source/references/2026-10-01/541-inventory-materials.jpg`，一张4×2物品图标表。没有使用文生图、外部图片API或模型降级。生成原图保存在 `art/source/ui/item-atlas-v1.png`；使用已安装imagegen技能的remove_chroma_key.py去品红，再按固定格裁切、保留比例放入256×256透明画布。运行资产位于 `public/assets/ui/`：pistol、rifle、shotgun、skills、map、market、inventory、pets八张PNG。

原图已目视检查，八格身份和顺序正确；透明角点、边缘与主体覆盖已检查。运行图标通过实际浏览器解码检查，接入底部导航、两侧按钮、黑市和枪柜蓝图。原图、透明处理、UI接入是三个分别记录的步骤；没有把图标生成当作玩法实现。

完整提示词：

> Use case: stylized-concept. Asset type: ONE game UI item icon atlas. Input image is a STYLE REFERENCE: the supplied game screenshot's hand-drawn post-apocalyptic parchment and heavy black comic outlines. Generate a single atlas on solid flat magenta #FF00FF, exactly 4 columns and 2 rows of evenly spaced square cells, no grid lines, every object centered with generous empty magenta padding, no text, no numbers, no characters, no UI screenshot. Eight objects in strict reading order: (row1 col1) dark steel semi-automatic pistol side view pointing left; (row1 col2) dark steel carbine rifle side view pointing left; (row1 col3) wood-and-steel pump shotgun side view pointing left; (row1 col4) small stack of three worn parchment skill books with a yellow bookmark. (row2 col1) a worn red paper exploration map with a compass; (row2 col2) bundle of cartridges and a small metal wrench; (row2 col3) small blue-grey metal supply crate with orange straps; (row2 col4) a cheerful adult beagle companion head portrait. Match the screenshot's rugged inked illustrated item art, desaturated steel, warm aged paper, tiny restrained color accents, bold readable silhouettes at 32 pixels. All eight cells same visual scale, centered, completely separated, absolutely flat unvarying magenta background, no shadows on background, no magenta inside any object, no lettering or logos. Landscape canvas, grid aspect ratio 2:1.

## 重新抽帧

使用已有并验证过的真实Grok CLI reference_to_video结果，不重新生成姿态或声称本次生成了新视频。来源为 `art/source/animation/zombie-walk.mp4`、`tyrant-walk.mp4`、`plant-idle.mp4`，源哈希与逐帧索引保存在运行目录同名JSON。

| 动画 | 旧帧数／播放率 | 新帧数／播放率 | 新采样 |
| --- | --- | --- | --- |
| zombie-walk | 9／7fps | 34／24fps | 原24fps的8–41连续帧 |
| tyrant-walk | 12／6fps | 48／24fps | 原24fps的0–47连续帧 |
| plant-idle | 12／6fps | 48／24fps | 原24fps的0–47连续帧 |

打包使用6列，普通怪与暴君格子384×512，植物576×384；最大纹理边长4096px。实际源帧、接触表和GIF在本地忽略的work目录；运行表在 `public/assets/motion/`。打包器支持起止范围（末端不含），避免尾随逗号解析失败，并清理自己的旧编号中间帧以免混入过期帧。

```sh
python3 scripts/assets/pack-video.py --name zombie-walk --indices 8:42 --source-fps 24 --fps 24
python3 scripts/assets/pack-video.py --name tyrant-walk --indices 0:48 --source-fps 24 --fps 24
python3 scripts/assets/pack-video.py --name plant-idle --indices 0:48 --source-fps 24 --fps 24 --width 576 --height 384
```

三张接触表已目视检查。Phaser播放24fps，最后四帧与真实首帧短暂混合以减轻循环接缝。持续受击位移叠在位置上，不重启动画。专项浏览器观察到26种不同普通怪帧与接缝混合；既有动画检查分别覆盖普通怪、暴君、植物、主角射击和菜单暂停。

主角仍用原9帧射击；视频自身的比例漂移与少量边缘色未宣称完全消除。更多帧增加了资源和纹理体积，当前仅有桌面浏览器及手机视口验证，未完成真实手机性能验收。

## 程序反馈

子弹线、命中星芒、7个短粒子、烟尘、受击偏移、数字、血条与危险遮罩是Phaser程序效果，全部绑定有效shotSerial变化，不是Grok视频抽帧资产。首领分层血条与UI数字来自唯一会话状态，不另建一份战斗HP。

来源和运行文件哈希见 `art/catalog.json`，验证报告见 `docs/validation/reference-2026-10-01/`。
