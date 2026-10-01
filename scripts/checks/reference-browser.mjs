import assert from 'node:assert/strict'
import {mkdirSync,writeFileSync} from 'node:fs'
import {createInitialState} from '../../src/domain/systems/demo.ts'
import {stageConfig} from '../../src/content/demo.ts'
const {chromium}=await import(process.env.TASK_PLAYWRIGHT_MODULE||'playwright')
const browser=await chromium.launch({headless:true,executablePath:process.env.TASK_BROWSER_EXECUTABLE||undefined})
const page=await browser.newPage({viewport:{width:480,height:800}}),errors=[],checks=[]
page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(['error','warning'].includes(e.type()))errors.push(e.text())})
const root='artifacts/reference-browser';mkdirSync(root,{recursive:true})
const state=()=>page.evaluate(()=>JSON.parse(window.render_game_to_text()))
const step=ms=>page.evaluate(ms=>window.advanceTime(ms),ms)
const shot=()=>page.locator('canvas').click({position:{x:280,y:245}})
const capture=async name=>{await page.waitForTimeout(180);await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});await page.screenshot({path:root+'/'+name+'.png'})}
try{
 await page.goto('http://127.0.0.1:5174/?test');await page.waitForFunction(()=>window.__demo&&window.gameMotionState);await page.evaluate(()=>window.__demo.fresh());
 const before=await state();await shot();await step(210);await page.waitForTimeout(60);const after=await state();assert(after.hp<before.hp&&after.hp>0);assert(after.motion.impactCount>before.motion.impactCount);assert.equal(after.kills,0);checks.push('ordinary hit loses health, shows impact, and does not kill immediately');await capture('ordinary-hit');
 const frames=new Set();let blended=false;for(let i=0;i<34;i++){const motion=(await state()).motion;frames.add(motion.enemyFrame);blended ||= motion.loopBlend>0;await page.waitForTimeout(60)}assert(frames.size>=20);assert(blended);checks.push('dense video playback changes at least 20 frames and blends the loop seam');
 const s=createInitialState();s.kills=5;s.stageKills['1']=5;await page.evaluate(s=>window.__demo.restore(s),s);await page.locator('[data-action="challenge"]').click();assert((await state()).bossPreview);assert.equal((await state()).mode,'farm');await capture('boss-profile');await page.locator('[data-action="enter-boss"]').click();await step(1900);await page.waitForTimeout(80);const distant=(await state()).motion.enemyHeight;
 await page.getByRole('button',{name:'战斗详情与任务'}).click();const timer=(await state()).bossTime;await step(5000);assert.equal((await state()).bossTime,timer);await page.getByRole('button',{name:'返回战斗',exact:true}).click();await step(15000);await page.waitForTimeout(80);assert((await state()).motion.enemyHeight>distant*2);await capture('boss-near');await step(6000);assert((await state()).defeat);assert.equal((await state()).mode,'farm');assert.equal((await state()).coins,120);await capture('boss-failed');await page.locator('[data-action="retry-farm"]').click();assert(!(await state()).defeat);checks.push('boss preview, timed approach, menu pause, loss sheet and resource-preserving return');
 const grown=createInitialState();grown.kills=12000;grown.cleared=12;grown.stage=13;grown.coins=1e8;grown.scrap=10000;grown.cans=30;grown.owned=['glock','revolver','carbine'];grown.proficiency.pistol=30;
 await page.evaluate(s=>window.__demo.restore(s),grown);
 for(const width of [480,390,320]){await page.setViewportSize({width,height:width===320?568:844});for(const panel of ['market','inventory','skills']){await page.locator(`[data-panel="${panel}"]`).click();await capture(`${panel}-${width}`);assert(await page.locator('.panel-content').isVisible());assert.equal(await page.locator('.item-icon img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)),true);await page.getByRole('button',{name:'返回战斗',exact:true}).click()}
 const box=await page.locator('.workspace').boundingBox();for(const button of await page.locator('button:visible').all()){const b=await button.boundingBox();assert(b.x>=box.x-1&&b.y>=box.y-1&&b.x+b.width<=box.x+box.width+1&&b.y+b.height<=box.y+box.height+1)}assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 checks.push('imagegen icons load; parchment menus and controls fit 480, 390 and 320px widths');assert.deepEqual(errors,[]);
 writeFileSync(root+'/checks.json',JSON.stringify({checks,errors,distinctEnemyFrames:frames.size},null,2));console.log(JSON.stringify({passed:checks.length,checks,errors}));
}finally{await browser.close()}
