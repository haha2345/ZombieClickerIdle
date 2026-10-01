# 2026-10-01：录像界面元素复刻 v2

用户要求：先提交并 push，然后制作 UI 元素，1:1 复刻界面。先将现有节奏／动画版本提交为 `0468458`，已 push 到 origin/main，并核对本地与远端跟踪提交一致，再开始本轮 UI 制作。

## 参照与布局

观察依据为用户提供录像的实际关键帧：198 秒黑市、220 秒技能、541 秒资料仓库、264 秒首领情报、190 秒战斗、288 秒失败、330 秒胜利。录像顶部 88px 是小游戏容器工具栏，不计入游戏；游戏参照区是 680×1206。

| 区域 | 录像参照 | 本轮画面 |
| --- | --- | --- |
| 顶部头像／资源栏 | 约上方10.5% | 正面头像、红战力框、金币槽、货架背景 |
| 黑市纸张 | 顶部10.5%，底部约88.7% | 纸张纹理背景，三列五卡／两行、下方留白及操作区 |
| 技能／仓库纸张 | 顶部16.1%，底部约89.2% | 上方分类签、左列表、右说明／蓝图、底部操作 |
| 底部主菜单 | 技能／探险／黑市／仓库 | 四入口固定位置、金属框、激活高度与提醒点 |
| 战斗元素 | 长菱形血条、圆爆发、红首领、任务框 | 真实HP／冷却／任务数据叠到独立PNG |
| 结果页 | 巨型插画＋奖励或备战条＋继续 | 胜利与失败整页；继续前暂停，奖励仅由领域结算一次 |

游戏保持该参照比例，在390×844等更窄设备上居中留边，避免拉伸UI或让Phaser裁掉战场；内部画布480×852是参照比例的整数近似。其他既有伙伴／路线／研究从战场侧入口进入。

## 生成、裁切和接入分开记录

1. 内置 **imagegen 图生图**，没有文生图或外部图片API。全部以已查看的录像关键帧或上一张已查看生成稿为参照。
2. 原稿与完整提示词保存于 `art/source/ui/reference-v2/`。没有手绘替代所请求的纸张、金属与结果插画。
3. `scripts/assets/split-ui-atlas.py` 只进行RGBA原像素裁切、透明留白裁去与货架黑色信箱边裁去，没有脚本修补图像内容。坐标和大小见同目录 `crops.json`；用内置Python运行，不修改项目依赖。
4. 共31个PNG切片保存到 `public/assets/ui/reference-v2/`，30个接入画面；`paper-small.png` 是备用面板。本轮保留原生alpha，未使用去底模型或色键。
5. 第一轮图集裁切带入了邻格边缘，已改为逐行限定Y范围。胜利横幅首稿过宽，第二次图生图修正到约680:530，与失败稿及录像接近；宽稿只保留为迭代证据。

运行代码：`replica.css` 绘制布局；`InventoryPanel.vue` 只持有筛选／选中项等UI状态；`gameSession.ts` 仍是唯一运行状态，Phaser绘制真实血条，Vue显示实时数值。文字与可变数值没有烘焙进整页截图。

## 观察、原有实现与新增呈现

- 观察到原作五个技能分类、仓库五类／六种品质、黑市升级及增加刷新入口、出售及仓库扩容按钮。没有据此声称这些全部已实现。
- 本演示保留原有训练、战术、手册三类功能，按原分类签位置呈现。黑市保持既有武器与物资规则，五卡分页替代展示九卡；下方使用真实分页／购买动作，未假装已实现黑市升级。
- 仓库新增的是分类／品质筛选、紧凑列表和详情呈现；品质只是由武器解锁档位映射的展示属性，不改变掉率或战斗规则。资料页调用已有手册学习；未新增出售／扩容规则。
- 强化成功率仍为本演示真实的100%，与录像50%的概率规则不同。胜利显示真实金币与零件，不伪造本演示不存在的开火经验。
- 胜利原来的五秒提示变为继续按钮关闭的结果页；继续前画面／射击暂停，资源已在原领域动作中结算；测试恢复会同时清除UI结果状态。
- 本轮是参照比例、构图和素材类型复刻。原字体、生成插画局部、各武器的具体模型和演示功能条目仍有差异；不是原作资源包提取，未宣称逐像素相同或原作全部玩法实现。

## 验证

生成图、透明裁切与实机接入分别检查。验证报告保存于 `docs/validation/ui-elements-2026-10-01/`；实际页面截图在 `docs/media/ui-v2-*.png`。新专项覆盖比例、四个主入口、三档视口、物品图像解码、资料学习、分类／品质筛选、黑市分页购买、成功结果页暂停／继续与奖励不重复。具体通过数量以报告为准；自动测试不等同原作逐像素或真人试玩验收。

## 完整提示词

### art/source/ui/reference-v2/chrome-atlas.png

```text
Use case: ui-mockup. Asset type: production game UI sprite atlas, image-to-image from the attached original game screenshots. Recreate the EXACT rough inked Chinese zombie idle game UI art in these references, retaining its muted muddy brown parchment, black irregular ink outlines, tiny grey tape at corners, slate blue bevelled metal, gold ochre buttons. NOT a redesign. NO text, numbers, symbols pretending to be text, labels, watermark, grid lines or scenery. Real transparent alpha background. Create a precisely evenly spaced 4 columns by 4 rows atlas of 16 isolated assets on a square 2048x2048 image. Every item centered in its own 512x512 cell, generous transparent margin, never overlap. Row 1 left to right: 1 tall inactive slate metal navigation button empty interior, 2 same tall metal button selected brighter thick silver beveled frame, 3 wide gold parchment action button with heavy rough black edge, 4 same wide disabled grey-blue button. Row 2: 1 wide grey parchment inventory list row with black ragged edge and corner tape, 2 same selected orange-ochre inventory row, 3 wide brown torn parchment title ribbon, 4 wide slate metal dialog header strip. Row 3: 1 large upright blank muddy gray-brown parchment panel with rough black ink perimeter and folded taped corners, 2 square tan engineering blueprint parchment showing ONLY a sepia pencil drawing of the original Glock pistol in the inventory reference, 3 wide tan blank parchment stats box, 4 upright original marketplace card base: dark brown empty title ribbon above grey empty square icon socket above empty gold price socket, with rough ink and tape corners. Row 4: 1 wide empty dark blue-grey metal coin counter with original uneven angular outline, 2 wide empty original dark red battle power bar with grey angular outline, 3 isolated original chunky octagonal gold coin token, 4 original frontal female survivor portrait in round slate frame, pale face black tied up hair red scarf, exact avatar identity from upper left screenshots. Keep assets flat front-facing 2D, no cast shadows outside each asset. Original in-game screenshot fidelity, do not make polished smooth fantasy UI.
```

### art/source/ui/reference-v2/paper-master.png

```text
Use case: precise-object-edit. Asset type: blank parchment background for the actual playable UI, image-to-image. Input screenshot is the original marketplace. Extract and reconstruct ONLY the very large MAIN gray brown parchment rectangle (outer bounds approximately x=9..671 y=219..1158 in the 680x1294 screenshot), fill almost the entire output portrait image with this one isolated panel. Keep its EXACT original muddy gray-brown paper color, subtle stains, tiny folds and thin jagged black ink perimeter; retain original silhouette, minimal corner treatment and original aspect ratio 662:939. Remove EVERY inner card, icon, button, number, star, line and text, leaving uninterrupted quiet blank paper that dynamic real game components can sit over. Keep ONLY the panel, no header, no shelves, no nav, no browser bar, no scene. Actual transparent alpha outside the irregular black edge, very small transparent margins. Fidelity matters: this is 1:1 UI extraction from the supplied screenshot, NOT a new ornate panel design. Do not add new decorations or oversized tape corners. No watermark.
```

### art/source/ui/reference-v2/header-master.png

```text
Use case: precise-object-edit. Asset type: one horizontal background strip for original game's inventory/skills/market top header. Input: original shop screenshot. Extract/reconstruct ONLY the dark warm abandoned bookshop shelves behind the avatar and resource bars, original crop x=0..680 y=88..195. Remove avatar, portrait frame, ALL power/resource bars, coin, numbers and labels. Keep original shelves full of old books, background architecture, foreground charcoal black shelf bases, exact muted lighting and comic ink drawing. Create wide horizontal 1360x214 strip, same aspect 680:107. No white browser bar, no UI controls, no text, no gold hazard strip; opaque entire image. Match original screenshot faithfully, no new props or style changes.
```

### art/source/ui/reference-v2/nav-master.png

```text
Use case: background-extraction. Asset type: 4 icon sprite atlas for the original game's bottom navigation. Image-to-image from the bottom navigation icons in screenshot. Reconstruct ONLY the FOUR illustrated icons faithfully at high resolution. Square 1024x1024 with an exact 2x2 grid, one isolated object centered inside each equal cell, big transparent gaps; real transparent alpha. Top left: the original cream folded skill manual with a yellow pencil clipped across it. Top right: original red exploration map with ragged cream edges and a cream arrow/route symbol, loosely folded. Bottom left: original open wooden black market supply crate overflowing with yellow gold tokens, silver wrench, green medicine, exactly recognizable bottom tab icon. Bottom right: original orange/yellow metal warehouse toolbox with gray clasp and dark straps, tilted diagonally upward right. Use precisely the same hand-drawn inked 2D comic texture, colors and orientation as the original icons. Remove surrounding metal button frames, text labels, notification dots, all backgrounds and other UI. No lettering or numbers. No fantasy reinterpretation, no generic shopping bag. Just these four transparent icons.
```

### art/source/ui/reference-v2/combat-master.png

```text
Use case: background-extraction. Asset type: exact original combat UI chrome sprites for playable game. Image-to-image using original combat screenshot. Produce one transparent sprite atlas with exactly 2 columns and 3 rows, evenly spaced isolated assets, no overlap or labels. Row1 left: original very wide, very thin angular horizontal enemy health bar, grey slate metallic outer ink outline with pointed bevelled ends and EMPTY dark interior (no text, no fill, so runtime can fill it dynamically). Row1 right: original round black gold-glowing attack skill button with white sharp starburst impact symbol inside, original neon lemon rim, leave space outside rim transparent. Row2 left: original rectangular black quest banner frame, angular bevelled lower-right edge, empty interior, with tiny square dark-blue reward icon socket on left, no text or coin. Row2 right: original crimson red square boss challenge card frame, original dark red glowing interior, blank: NO boss image or words, original small ochre angular pentagon tag at upper-left no text. Row3 left: isolated red notification dot with thin white rim exactly from the bottom tabs. Row3 right: empty blue round retreat button with subtle slate ring, original 2D comic style. Keep ALL lines and colors matching screenshot, chunky uneven ink strokes, dark slate metal, subtle original textures. No browser bar, no scenery, no text, no characters. Real transparent alpha.
```

### art/source/ui/reference-v2/blueprint-master.png

```text
Use case: precise-object-edit. Asset type: reusable original weapon blueprint UI paper. Edit target: attached small blueprint-pistol.png. Change ONLY ONE thing: remove the large sepia pistol drawing completely, seamlessly restoring blank brown engineering paper underneath. Preserve ALL the faint white technical chalk lines, arcs, equations, stains, tan paper shading, rough black perimeter, gray corner tape, exact silhouette and real transparent alpha outside it unchanged. No gun or weapon anywhere. No new text or decoration. This is a clean UI background that receives a dynamic item icon at runtime. Return same square composition, just no pistol.
```

### art/source/ui/reference-v2/result-defeat-master.png

```text
Use case: precise-object-edit. Asset type: original full-screen defeat result illustration banner for game UI. Input image is the user's reference game's defeat screen. Reproduce/extract ONLY the large top illustrated banner with two enormous green zombie hands reaching forward, mottled purple-blue slanted comic panel, red dripping blood splash, and exact HUGE cream-black outlined Chinese text '重头再来!' across two lines ('重头' above '再来!'). Maintain the EXACT original hands placement, dark ink edges, comic drawing, letter forms, cream color, perspective and full-width horizontal composition. Remove all lower skill/market/warehouse recommendations, continue button, background screenshot, header, and white browser bar. Real transparent alpha outside the illustration and slanted panel. One banner only, broad landscape 680:540 approximately, text visually faithful and accurately readable. This is a 1:1 reconstruction from the reference, not a redesign. No additional words.
```

### art/source/ui/reference-v2/result-victory-wide-master.png

```text
Use case: precise-object-edit. Asset type: original full-screen victory UI illustration banner. Input image is the reference game's victory result screenshot. Faithfully extract/reconstruct ONLY its top banner: the black-haired ponytail woman in a gray tank top and black shorts on the RIGHT, aiming her black Glock directly toward the viewer, dynamic reaching arm, and the yellow-orange diagonal pop-art panel with black halftone and ochre speckles. Huge cream Chinese lettering with thick angular black outline exactly reads '活力来了!' on two lines ('活力' above '来了!'), with a visible bullet hole in the first line as in the reference. Preserve original woman's face, pose, body, exact lettering shapes, yellow palette and hand-inked Chinese comic art. Remove the lower rewards/buttons, all dark game screenshot background, header, and white browser bar. One broad landscape banner with transparent alpha outside the woman and diagonal comic panel. Match original placement and framing, not a redesign. NO new text or decoration.
```

### art/source/ui/reference-v2/result-victory-master.png

```text
Use case: precise-object-edit. Edit target: first image, the generated '活力来了!' victory illustration. Supporting exact composition reference: second image, original screenshot. Keep the woman's identity, colors, Chinese lettering and comic artwork unchanged, but fix the composition to match the original screenshot's banner 1:1. IMPORTANT the output must be MUCH TALLER: width:height approximately 680:530 (about 1.28:1), NOT a wide 2:1 banner. Woman on RIGHT fills the complete banner height, aiming arm toward upper-left; her tank top and shorts visible; the giant '活力' line at middle-left, '来了!' line below at lower-left. Yellow diagonal comic panel covers the lower two thirds as in original, original woman's head near top-right. Make text and portrait large and overlapping exactly as reference. Keep full Chinese phrase correct. No blank margins, no outer game screenshot, no buttons or resources. Transparent alpha outside the illustrated silhouette and slanted yellow panel. Reframe/reposition only; don't add anything.
```

