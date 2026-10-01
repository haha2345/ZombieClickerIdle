"""Harvest actual Grok video frames, chroma key and pack fixed cells. No pose synthesis."""
from pathlib import Path
import argparse, subprocess, json, hashlib, math
from PIL import Image, ImageDraw
import numpy as np
p=argparse.ArgumentParser();p.add_argument('--name',required=True);p.add_argument('--indices',required=True);p.add_argument('--columns',type=int,default=6);p.add_argument('--source-fps',type=int,default=12);p.add_argument('--fps',type=int,default=12);p.add_argument('--width',type=int,default=384);p.add_argument('--height',type=int,default=512);args=p.parse_args()
root=Path(__file__).resolve().parents[2];video=root/'art/source/animation'/f'{args.name}.mp4';raw=root/'work'/f'{args.name}-raw';raw.mkdir(parents=True,exist_ok=True)
if args.columns<1:raise ValueError('columns must be positive')
for stale in raw.glob('[0-9][0-9][0-9].png'):stale.unlink()
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(video),'-vf',f'fps={args.source_fps}','-y',str(raw/'%03d.png')],check=True)
files=sorted(raw.glob('*.png'));indices=list(range(*map(int,args.indices.split(':')))) if ':' in args.indices else [int(x) for x in args.indices.split(',') if x.strip()];frames=[]
if not indices or min(indices)<0 or max(indices)>=len(files):raise ValueError('frame indices outside extracted source')
for idx in indices:
 im=Image.open(files[idx]).convert('RGBA');a=np.array(im).astype(float);r,g,b=a[:,:,0],a[:,:,1],a[:,:,2];strength=np.minimum(r,b)-g
 if not (np.median(a[:8,:8,0])>70 and np.median(a[:8,:8,2])>50 and np.median(a[:8,:8,1])<80):raise ValueError(f'Frame {idx} is not a magenta frame; do not key black or white clothing')
 mask=(r>70)&(b>50)&(strength>25);alpha=np.clip((50-strength)/25,0,1)*255;a[:,:,3]=np.where(mask,alpha,255)
 edge=mask&(a[:,:,3]>0);a[:,:,0]=np.where(edge,np.minimum(r,g+30),r);a[:,:,2]=np.where(edge,np.minimum(b,g+30),b)
 frames.append(Image.fromarray(a.astype('uint8')).resize((args.width,args.height),Image.Resampling.LANCZOS))
rows=math.ceil(len(frames)/args.columns);sheet=Image.new('RGBA',(args.width*args.columns,args.height*rows));contact=Image.new('RGB',(args.width*args.columns,(args.height+25)*rows),'#344139');d=ImageDraw.Draw(contact);preview=[]
for i,f in enumerate(frames):
 sheet.alpha_composite(f,((i%args.columns)*args.width,(i//args.columns)*args.height));thumb=Image.new('RGBA',f.size,'#344139');thumb.alpha_composite(f);preview.append(thumb.convert('RGB'));contact.paste(thumb.convert('RGB'),((i%args.columns)*args.width,(i//args.columns)*(args.height+25)));d.text(((i%args.columns)*args.width+8,(i//args.columns)*(args.height+25)+args.height+5),f'frame {i}, source {indices[i]}',fill='white')
out=root/'public/assets/motion';out.mkdir(parents=True,exist_ok=True);sheet.save(out/f'{args.name}.png');contact.save(raw/'contact.png');preview[0].save(raw/'preview.gif',save_all=True,append_images=preview[1:],loop=0,duration=round(1000/args.fps),disposal=2)
metadata={'source':str(video.relative_to(root)),'sourceSha256':hashlib.sha256(video.read_bytes()).hexdigest(),'sourceFrameIndices':indices,'sourceFps':args.source_fps,'frameWidth':args.width,'frameHeight':args.height,'frames':len(indices),'fps':args.fps,'method':'Grok CLI reference_to_video -> ffmpeg -> chroma key -> fixed cell pack'}
(out/f'{args.name}.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2));print(json.dumps(metadata))
