"""Technical crop only: preserve imagegen RGBA pixels and trim transparent padding."""
import json
from pathlib import Path
from PIL import Image
source=Path('art/source/ui/reference-v2/chrome-atlas.png')
im=Image.open(source).convert('RGBA')
w,h=im.size
names=['nav-idle','nav-selected','button-gold','button-disabled','list-idle','list-selected','title-paper','title-metal','paper-small','blueprint-pistol','stats-paper','market-card','resource-frame','power-frame','coin','portrait']
manifest=[]
for i,name in enumerate(names):
    col,row=i%4,i//4
    left,top,right,bottom=round(col*w/4),round(row*h/4),round((col+1)*w/4),round((row+1)*h/4)
    if row==1: top,bottom=round(h*.295),round(h*.42)
    if row==2: top,bottom=round(h*.445),round(h*.75)
    if row==3 and col<3: top=round(h*.78)
    cell=im.crop((left,top,right,bottom))
    bbox=cell.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox()
    if not bbox: raise RuntimeError(name)
    crop=cell.crop(bbox)
    path=Path('public/assets/ui/reference-v2')/(name+'.png')
    crop.save(path)
    manifest.append(dict(name=name,path=str(path),source=str(source),crop=[left+bbox[0],top+bbox[1],left+bbox[2],top+bbox[3]],size=list(crop.size)))
Path('art/source/ui/reference-v2/crops.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Preserved alpha and cropped',len(manifest),'UI sprites')
# Additional built-in imagegen masters; only deterministic cropping, no inpainting.
import numpy as np
root=Path('art/source/ui/reference-v2'); out=Path('public/assets/ui/reference-v2')
for name in ['paper','header']:
    im=Image.open(root/(name+'-master.png')).convert('RGBA')
    if name=='paper': box=im.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox()
    else:
        a=np.array(im); rows=np.where(a[:,:,:3].max(axis=(1,2))>45)[0]; box=(0,int(rows[0]),im.width,int(rows[-1]+1))
    path=out/(name+'.png'); im.crop(box).save(path)
    manifest.append(dict(name=name,path=str(path),source=str(root/(name+'-master.png')),crop=box,size=list(Image.open(path).size)))
im=Image.open(root/'nav-master.png').convert('RGBA')
for i,name in enumerate(['skills','map','market','inventory']):
    col,row=i%2,i//2; box=(col*im.width//2,row*im.height//2,(col+1)*im.width//2,(row+1)*im.height//2); cell=im.crop(box)
    trim=cell.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox(); path=out/('icon-'+name+'.png');cell.crop(trim).save(path)
    manifest.append(dict(name='icon-'+name,path=str(path),source=str(root/'nav-master.png'),crop=[box[0]+trim[0],box[1]+trim[1],box[0]+trim[2],box[1]+trim[3]],size=list(Image.open(path).size)))
im=Image.open(root/'combat-master.png').convert('RGBA')
for name,box in [('health-frame',(25,258,640,353)),('burst',(680,140,990,436)),('quest-frame',(22,710,610,920)),('boss-frame',(645,590,1005,976)),('notification',(215,1185,360,1340)),('retreat',(640,1110,957,1415))]:
    path=out/(name+'.png'); im.crop(box).save(path)
    manifest.append(dict(name=name,path=str(path),source=str(root/'combat-master.png'),crop=box,size=list(Image.open(path).size)))
(root/'crops.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('All',len(manifest),'production crops recorded')
im=Image.open(root/'blueprint-master.png').convert('RGBA')
box=im.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox();path=out/'blueprint-blank.png';im.crop(box).save(path)
manifest.append(dict(name='blueprint-blank',path=str(path),source=str(root/'blueprint-master.png'),crop=box,size=list(Image.open(path).size)))
(root/'crops.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for name in ['defeat','victory']:
    im=Image.open(root/('result-'+name+'-master.png')).convert('RGBA')
    box=im.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox();path=out/('result-'+name+'.png');im.crop(box).save(path)
    manifest.append(dict(name='result-'+name,path=str(path),source=str(root/('result-'+name+'-master.png')),crop=box,size=list(Image.open(path).size)))
(root/'crops.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Finished',len(manifest),'reproducible UI assets')
