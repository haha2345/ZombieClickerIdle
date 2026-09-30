# 末日信标演示美术来源

工具：imagegen。三张均使用录像关键帧作为图生图参考，未使用文生图或第三方生成接口。源图与结果像素保留；接入时只通过 Phaser 设置显示尺寸。

## 场景

参考：`art/source/references/0001-combat.jpg`。
请求要点：保留录像中废弃办公室走廊、近景左下角持枪女性的构图与漫画质感；移除 UI、文字、敌人和血条，让场景中部空出来用于游戏角色；没有标志和水印，竖屏战斗背景。
imagegen 结果：`本地生成目录/exec-24535dc7-ee9e-4725-9339-8b860c31212d.png`。
运行文件：`public/assets/scenes/corridor.png`。1086×1448，静态。

## 办公室感染者

参考：`art/source/references/0001-combat.jpg`。
请求要点：从参考风格重建完整锥帽办公室丧尸，西装、红色领带、破损衣物，朝向玩家；只包含角色，无 UI/武器/环境，透明背景，完整身体不裁切，保持角色辨识度。
imagegen 结果：`本地生成目录/exec-6316dda5-05dc-4a32-839d-fd7f263692b1.png`。
运行文件：`public/assets/enemies/office-zombie.png`。1024×1536，RGBA 透明角色，静态。普通、护甲、疾行和群体变体共享角色图与颜色提示；变体的伤害规则和血量分别实现。

## 食人花首领

参考：`art/source/references/1826-boss-combat.jpg`。
请求要点：参考录像重建巨大绿色食人花首领，大口、牙齿、红色舌头和盘曲根须，黑色漫画轮廓；只包含完整角色，无 UI、文字、背景，透明背景。
imagegen 结果：`本地生成目录/exec-6f13ac28-72e4-406b-9691-c965cc5b37f0.png`。
运行文件：`public/assets/enemies/mutant-plant.png`。1382×1138，RGBA 透明首领，静态。

## 动画状态

按用户要求尝试本机 `grok`，使用现有办公室感染者 PNG，请求 4 秒固定镜头角色 idle 视频并限定仅在实际支持生成视频时输出，不允许编造视频。CLI 是 Grok Build 编程代理入口，任务长时间未返回输出或视频文件，已终止本次任务。`art/source/grok/` 没有 MP4，也没有抽帧 Sprite sheet。

当前演示没有角色逐帧动画。受击数字、血条、开火提示是程序界面反馈，与角色视频/Sprite 资产区分。后续只在真实 Grok 视频生成成功后抽帧接入，不伪装动画管线完成。

哈希、尺寸、参考路径见 `art/catalog.json`；`npm run assets:check` 检查 15 张参考帧与 3 张运行 PNG。
