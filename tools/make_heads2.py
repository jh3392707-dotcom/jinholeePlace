#!/usr/bin/env python3
"""고해상도 원본에서 머리만 오려 assets/heads/<이름>.png(192x192 투명)로 저장. 사용: make_heads2.py 이미지 이름 x0 y0 x1 y1  (머리 영역 사각형)"""
import sys, cv2, numpy as np
from pathlib import Path
src,name,x0,y0,x1,y1=sys.argv[1],sys.argv[2],*map(int,sys.argv[3:7])
OUT=Path(__file__).resolve().parent.parent/"assets"/"heads";OUT.mkdir(exist_ok=True)
im=cv2.imread(src);crop=im[max(0,y0-80):y1+80,max(0,x0-80):x1+80]
S=520/max(crop.shape[:2]);big=cv2.resize(crop,None,fx=S,fy=S,interpolation=cv2.INTER_AREA)
ox=min(80,x0)*S;oy=min(80,y0)*S
r=(int(ox),int(oy),int((x1-x0)*S),int((y1-y0)*S))
m=np.zeros(big.shape[:2],np.uint8);bg=np.zeros((1,65));fg=np.zeros((1,65))
cv2.grabCut(big,m,r,bg,fg,8,cv2.GC_INIT_WITH_RECT)
mask=np.where((m==1)|(m==3),255,0).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(mask)
if n>1:i=1+np.argmax(st[1:,cv2.CC_STAT_AREA]);mask=np.where(lab==i,255,0).astype(np.uint8)
mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((15,15),np.uint8));mask=cv2.GaussianBlur(mask,(0,0),2.5);mask=(mask>127).astype(np.uint8)*255
rgba=cv2.cvtColor(big,cv2.COLOR_BGR2BGRA);rgba[:,:,3]=mask
ys,xs=np.where(mask>0);rgba=rgba[ys.min():ys.max()+1,xs.min():xs.max()+1]
h,w=rgba.shape[:2];sc=176/max(h,w);rgba=cv2.resize(rgba,(int(w*sc),int(h*sc)),interpolation=cv2.INTER_AREA)
cv=np.zeros((192,192,4),np.uint8);oy2=192-rgba.shape[0]-8;ox2=(192-rgba.shape[1])//2;cv[oy2:oy2+rgba.shape[0],ox2:ox2+rgba.shape[1]]=rgba
cv2.imwrite(str(OUT/f"{name}.png"),cv);print(name,rgba.shape)
