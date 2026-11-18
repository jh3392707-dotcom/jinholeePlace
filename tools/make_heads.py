#!/usr/bin/env python3
"""재민이 사진(assets/*.jpg)에서 머리 부분만 오려내 assets/heads/<이름>.png (투명 배경)로 저장합니다.
필요: pip install opencv-python-headless numpy pillow
GrabCut으로 배경을 지우는 방식이라 사진마다 머리 위치(RECT)를 지정합니다. 결과가 어색하면 RECT를 고쳐서 다시 실행하세요."""
import cv2, numpy as np
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
A=ROOT/"assets"; OUT=A/"heads"; OUT.mkdir(exist_ok=True)
# (x0,y0,x1,y1) 256px 기준 머리 영역
RECT={"face":(46,0,182,152),"main":(66,0,196,150),"joy":(86,42,178,152),"cool":(92,60,152,132),"hike":(92,46,168,134),"tired":(10,42,146,196),"mess":(60,28,222,146)}
for k,(x0,y0,x1,y1) in RECT.items():
    img=cv2.imread(str(A/f"{k}.jpg"));h,w=img.shape[:2]
    S=3;big=cv2.resize(img,(w*S,h*S),interpolation=cv2.INTER_CUBIC)
    m=np.zeros(big.shape[:2],np.uint8);r=(x0*S,y0*S,(x1-x0)*S,(y1-y0)*S)
    bg=np.zeros((1,65),np.float64);fg=np.zeros((1,65),np.float64)
    cv2.grabCut(big,m,r,bg,fg,6,cv2.GC_INIT_WITH_RECT)
    mask=np.where((m==cv2.GC_FGD)|(m==cv2.GC_PR_FGD),255,0).astype(np.uint8)
    # 가장 큰 덩어리만 남기고 구멍 메우기
    n,lab,st,_=cv2.connectedComponentsWithStats(mask)
    if n>1:
        i=1+np.argmax(st[1:,cv2.CC_STAT_AREA]);mask=np.where(lab==i,255,0).astype(np.uint8)
    mask=cv2.morphologyEx(mask,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
    mask=cv2.GaussianBlur(mask,(0,0),2);mask=(mask>127).astype(np.uint8)*255
    # 목 아래(어깨) 잘라내기: 머리 영역 아래 22%
    ys,xs=np.where(mask>0);top,bot=ys.min(),ys.max()
    pass
    rgba=cv2.cvtColor(big,cv2.COLOR_BGR2BGRA);rgba[:,:,3]=mask
    ys,xs=np.where(mask>0);rgba=rgba[ys.min():ys.max()+1,xs.min():xs.max()+1]
    hh,ww=rgba.shape[:2];sc=176/max(hh,ww)
    rgba=cv2.resize(rgba,(max(1,int(ww*sc)),max(1,int(hh*sc))),interpolation=cv2.INTER_AREA)
    canvas=np.zeros((192,192,4),np.uint8);oy=192-rgba.shape[0]-8;ox=(192-rgba.shape[1])//2
    canvas[oy:oy+rgba.shape[0],ox:ox+rgba.shape[1]]=rgba
    cv2.imwrite(str(OUT/f"{k}.png"),canvas);print(k,rgba.shape)
