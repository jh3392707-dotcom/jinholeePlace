# -*- coding: utf-8 -*-
"""이벤트 장면 일러스트(SVG) 생성기: 중요 이벤트 20개의 장면 이미지를 직접 그려 data URI로 index.html의 SCN에 넣는다.
사용: python3 tools/make_scenes.py > /tmp/scenes.js  (이후 index.html의 SCENES_BEGIN~SCENES_END 사이에 삽입)"""
import urllib.parse
W,H=720,300
def svg(inner,top='#8ec5ff',bot='#d8f0ff',ground=None,gy=235):
    g=''
    if ground:
        g=f'<rect x="0" y="{gy}" width="{W}" height="{H-gy}" fill="{ground}"/><rect x="0" y="{gy}" width="{W}" height="6" fill="#00000018"/>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            f'<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{top}"/><stop offset="1" stop-color="{bot}"/></linearGradient></defs>'
            f'<rect width="{W}" height="{H}" fill="url(#bg)"/>{g}{inner}</svg>')
def em(ch,x,y,s=56,op=1,rot=0):
    return f'<text x="{x}" y="{y}" font-size="{s}" text-anchor="middle" opacity="{op}" transform="rotate({rot} {x} {y})" style="font-family:\'Apple Color Emoji\',\'Noto Color Emoji\',\'Segoe UI Emoji\',sans-serif">{ch}</text>'
def person(x,y,sc=1,shirt='#4a6fd6',pants='#2a3a6a',skin='#ffd9b8',hair='#2a1a10',mood='smile',flip=1,arm='down'):
    s=sc
    f=[]
    # legs
    f.append(f'<rect x="{x-14*s}" y="{y-6*s}" width="{11*s}" height="{36*s}" rx="{4*s}" fill="{pants}"/><rect x="{x+3*s}" y="{y-6*s}" width="{11*s}" height="{36*s}" rx="{4*s}" fill="{pants}"/>')
    f.append(f'<ellipse cx="{x-9*s}" cy="{y+31*s}" rx="{10*s}" ry="{5*s}" fill="#222"/><ellipse cx="{x+9*s}" cy="{y+31*s}" rx="{10*s}" ry="{5*s}" fill="#222"/>')
    # body
    f.append(f'<rect x="{x-20*s}" y="{y-52*s}" width="{40*s}" height="{52*s}" rx="{12*s}" fill="{shirt}"/>')
    # arms
    if arm=='up':
        f.append(f'<rect x="{x-32*s}" y="{y-70*s}" width="{11*s}" height="{40*s}" rx="{5*s}" fill="{shirt}" transform="rotate(-20 {x-27*s} {y-35*s})"/><rect x="{x+21*s}" y="{y-70*s}" width="{11*s}" height="{40*s}" rx="{5*s}" fill="{shirt}" transform="rotate(20 {x+27*s} {y-35*s})"/>')
        f.append(f'<circle cx="{x-34*s}" cy="{y-74*s}" r="{6*s}" fill="{skin}"/><circle cx="{x+34*s}" cy="{y-74*s}" r="{6*s}" fill="{skin}"/>')
    elif arm=='fwd':
        f.append(f'<rect x="{x+16*s*flip}" y="{y-46*s}" width="{34*s}" height="{10*s}" rx="{5*s}" fill="{shirt}"/><circle cx="{x+52*s*flip}" cy="{y-41*s}" r="{6*s}" fill="{skin}"/>')
        f.append(f'<rect x="{x-27*s}" y="{y-46*s}" width="{10*s}" height="{40*s}" rx="{5*s}" fill="{shirt}"/><circle cx="{x-22*s}" cy="{y-4*s}" r="{6*s}" fill="{skin}"/>')
    else:
        f.append(f'<rect x="{x-30*s}" y="{y-46*s}" width="{10*s}" height="{40*s}" rx="{5*s}" fill="{shirt}"/><rect x="{x+20*s}" y="{y-46*s}" width="{10*s}" height="{40*s}" rx="{5*s}" fill="{shirt}"/>')
        f.append(f'<circle cx="{x-25*s}" cy="{y-4*s}" r="{6*s}" fill="{skin}"/><circle cx="{x+25*s}" cy="{y-4*s}" r="{6*s}" fill="{skin}"/>')
    # head
    hy=y-78*s
    f.append(f'<circle cx="{x}" cy="{hy}" r="{27*s}" fill="{skin}"/>')
    f.append(f'<path d="M{x-28*s} {hy-4*s} Q{x-26*s} {hy-32*s} {x} {hy-31*s} Q{x+26*s} {hy-32*s} {x+28*s} {hy-4*s} Q{x+16*s} {hy-18*s} {x} {hy-17*s} Q{x-16*s} {hy-18*s} {x-28*s} {hy-4*s}Z" fill="{hair}"/>')
    ey=hy+2*s
    if mood=='shock':
        f.append(f'<circle cx="{x-10*s}" cy="{ey}" r="{4.5*s}" fill="#fff" stroke="#222" stroke-width="{1.5*s}"/><circle cx="{x+10*s}" cy="{ey}" r="{4.5*s}" fill="#fff" stroke="#222" stroke-width="{1.5*s}"/><circle cx="{x-10*s}" cy="{ey}" r="{1.8*s}" fill="#222"/><circle cx="{x+10*s}" cy="{ey}" r="{1.8*s}" fill="#222"/>')
        f.append(f'<ellipse cx="{x}" cy="{hy+16*s}" rx="{5*s}" ry="{6.5*s}" fill="#7a2a2a"/>')
    elif mood=='cry':
        f.append(f'<path d="M{x-14*s} {ey} q{4*s} {-5*s} {8*s} 0" stroke="#222" stroke-width="{2*s}" fill="none"/><path d="M{x+6*s} {ey} q{4*s} {-5*s} {8*s} 0" stroke="#222" stroke-width="{2*s}" fill="none"/>')
        f.append(f'<path d="M{x-8*s} {hy+17*s} q{8*s} {-8*s} {16*s} 0" stroke="#7a2a2a" stroke-width="{2.4*s}" fill="none"/><path d="M{x-11*s} {ey+4*s} v{12*s}" stroke="#5aa8ff" stroke-width="{2.5*s}"/>')
    elif mood=='evil':
        f.append(f'<path d="M{x-15*s} {ey-3*s} l{10*s} {4*s}" stroke="#222" stroke-width="{2.4*s}"/><path d="M{x+15*s} {ey-3*s} l{-10*s} {4*s}" stroke="#222" stroke-width="{2.4*s}"/><circle cx="{x-9*s}" cy="{ey+2*s}" r="{2.2*s}" fill="#222"/><circle cx="{x+9*s}" cy="{ey+2*s}" r="{2.2*s}" fill="#222"/>')
        f.append(f'<path d="M{x-10*s} {hy+14*s} q{10*s} {10*s} {20*s} 0" stroke="#7a2a2a" stroke-width="{2.4*s}" fill="#fff"/>')
    else:
        f.append(f'<circle cx="{x-10*s}" cy="{ey}" r="{2.8*s}" fill="#222"/><circle cx="{x+10*s}" cy="{ey}" r="{2.8*s}" fill="#222"/>')
        f.append(f'<path d="M{x-9*s} {hy+12*s} q{9*s} {9*s} {18*s} 0" stroke="#7a2a2a" stroke-width="{2.4*s}" fill="none" stroke-linecap="round"/><circle cx="{x-17*s}" cy="{ey+8*s}" r="{4.5*s}" fill="#ff9a9a" opacity=".5"/><circle cx="{x+17*s}" cy="{ey+8*s}" r="{4.5*s}" fill="#ff9a9a" opacity=".5"/>')
    return ''.join(f)
def rect(x,y,w,h,c,r=0,op=1):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{c}" opacity="{op}"/>'
def circ(x,y,r,c,op=1):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" opacity="{op}"/>'
def line(x1,y1,x2,y2,c,w=3):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{w}" stroke-linecap="round"/>'
def txt(s,x,y,size=26,c='#fff',stroke='#0006'):
    return f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="middle" fill="{c}" stroke="{stroke}" stroke-width="3" paint-order="stroke" style="font-family:\'Jua\',\'Noto Sans KR\',sans-serif;font-weight:900">{s}</text>'
JM=dict(shirt='#7a8cd6',pants='#2a3a6a',hair='#1a120c')   # 재민
CH=dict(shirt='#e8b04a',pants='#3a3a4a',hair='#1a120c')   # 찬호
JN=dict(shirt='#5aa86a',pants='#2a4a3a',hair='#1a120c')   # 진호
S={}
# 1 반지 훔치기: 찬호네 거실
S['ring_heist']=svg(rect(0,0,W,235,'#f3e2c0')+rect(60,40,150,95,'#2a4a30',6)+em('⚽',135,105,44)+rect(300,120,140,70,'#7a4a1c',8)+em('💍',370,120,50)+em('📱',330,170,30)+em('🥤',415,170,30)
 +person(560,225,1.25,**CH,mood='evil')+person(160,236,1.05,**JM,mood='shock',arm='fwd')+txt('찬호는 TV에 집중 중...',360,40,26),top='#f3e2c0',bot='#f3e2c0',ground='#b98a55')
# 2 일본 지하철
S['japan_lost']=svg(rect(0,60,W,130,'#cfd6e4')+rect(420,70,300,150,'#e8eef8',8)+rect(450,100,70,90,'#33415c',6)+rect(560,100,70,90,'#33415c',6)+rect(420,190,300,14,'#2a6fd6')
 +txt('🚇  行き先: 東京',520,58,22,'#fff')+person(250,236,1.15,**JM,mood='shock',arm='fwd')+em('📱',330,185,34)+em('💨',380,200,30)+person(620,226,0.95,**JN,mood='smile',arm='up'),top='#9bb0d4',bot='#dfe7f5',ground='#aeb4c2',gy=215)
# 3 서든어택 클랜전
S['clan_war']=svg(rect(0,0,W,300,'#222a3a')+''.join(rect(40+i*140,50,100,160,'#323c52',6) for i in range(5))+rect(0,220,W,80,'#3a3f4c')
 +rect(80,170,110,60,'#8a6a3a',6)+rect(300,150,110,80,'#8a6a3a',6)+rect(520,175,110,55,'#8a6a3a',6)+em('🪖',135,155,50)+em('🪖',555,160,50)+em('🔫',360,135,56,1,-10)
 +txt('[야째클] vs 옆 학교 클랜',360,36,24,'#ffd24a')+em('💥',250,120,36),top='#222a3a',bot='#222a3a')
# 4 피파 승부차기
S['fifa_pc']=svg(rect(0,0,W,300,'#1f7a35')+''.join(rect(i*120,0,60,300,'#ffffff10') for i in range(7))+rect(200,70,320,150,'none')+
 '<rect x="200" y="70" width="320" height="130" fill="none" stroke="#fff" stroke-width="6"/>'+''.join(line(200+i*40,70,200+i*40,200,'#ffffff55',2) for i in range(1,8))+''.join(line(200,70+i*26,520,70+i*26,'#ffffff55',2) for i in range(1,5))
 +person(360,214,0.8,**CH,mood='evil',arm='up')+em('🧤',320,146,34)+em('🧤',400,146,34)+em('⚽',500,262,38)+person(110,276,1.0,shirt='#c0392b',pants='#fff',hair='#1a120c',mood='smile',arm='fwd')+txt('결승전 승부차기!',360,40,26,'#ffd24a'),top='#1f7a35',bot='#1f7a35')
# 5 인생은 아름다워 가게
S['ch_shop']=svg(rect(0,0,W,300,'#f1d7a8')+rect(60,24,600,52,'#2a6fd6',8)+txt('🏪 인생은 아름다워',360,62,30,'#fff')+rect(40,120,640,110,'#a9743c',10)+em('🍳',160,150,46)+em('🔪',260,160,36)+em('🍜',480,160,40)+em('🍶',560,160,38)
 +person(360,236,1.15,shirt='#fff',pants='#3a3a4a',hair='#1a120c',mood='evil')+'<rect x="318" y="156" width="84" height="18" rx="6" fill="#fff"/>'+em('👨‍🍳',360,142,50)+person(110,258,0.95,**JM,mood='smile',arm='fwd')+txt('계산은 10만 원!',560,215,24,'#c0392b'),top='#f1d7a8',bot='#f1d7a8',ground='#7a4a20',gy=252)
# 6 페레로로쉐 고백
S['ch_heeyeon']=svg(rect(0,0,W,300,'#ffd6e6')+''.join(em('💖',60+i*130,60+(i%2)*40,30,0.55) for i in range(6))+em('🍫',360,170,60)+''.join(em('🍫',330+((i*37)%70),210-i*32,36) for i in range(3))
 +person(160,248,1.15,**CH,mood='smile',arm='fwd')+person(560,248,1.1,shirt='#ff8aa8',pants='#6a3a5a',hair='#3a2418',skin='#ffe0c8',mood='smile')+txt('페레로로쉐 탑 고백 작전!',360,40,26,'#c2185b'),top='#ffd6e6',bot='#ffe9f1',ground='#e8a6bf',gy=262)
# 7 석식 대참사
S['seoksik']=svg(rect(0,0,W,300,'#f5ecd5')+rect(0,190,W,110,'#c9a46a')+rect(120,150,480,60,'#7a8896',10)+em('🍚',210,185,40)+em('🥘',300,185,40)+em('🥗',390,185,40)+em('🍲',480,185,40)
 +person(130,260,1.0,**JN,mood='evil',arm='up')+em('🍽️',60,150,40,1,-25)+person(620,260,0.9,shirt='#6ab0e0',pants='#3a3a5a',hair='#1a120c',mood='shock')+em('🥄',560,165,34)+txt('식판 투척!!',210,60,28,'#c0392b')+txt('찬호: 야, 밥 좀 더 줘라',470,60,22,'#4a2c0a'),top='#f5ecd5',bot='#f5ecd5')
# 8 자퇴
S['univ_dropout']=svg(rect(0,0,W,300,'#c9d6ea')+rect(60,40,230,150,'#e8eef8',8)+em('🎓',175,120,56)+rect(60,190,230,10,'#7a8cb0')+rect(380,60,200,180,'#fff',8)+rect(400,90,160,12,'#ddd')+rect(400,115,160,12,'#ddd')+rect(400,140,110,12,'#ddd')+txt('자퇴서',480,82,24,'#c0392b')
 +person(330,262,1.1,**JM,mood='cry',arm='fwd')+em('📝',420,205,36)+em('🏫',150,226,40),top='#c9d6ea',bot='#e6eef8',ground='#a9b4c8',gy=265)
# 9 물건 던지기
S['dodge_game']=svg(rect(0,0,W,300,'#dff0d4')+person(580,248,1.15,**CH,mood='evil',arm='up')+em('🥒',420,110,46,1,40)+em('🏐',330,160,52,1,10)+em('🌭',250,210,44,1,-30)+person(120,248,1.15,**JM,mood='shock',arm='up')+txt('찬호의 물건 던지기!',360,40,28,'#c0392b'),top='#dff0d4',bot='#dff0d4',ground='#8bc05a',gy=262)
# 10 꿀떡
S['ggul_game']=svg(rect(0,0,W,300,'#ffeed0')+rect(180,170,360,90,'#8a8f98',10)+em('🍲',360,200,70)+em('🍡',250,70,40,1,25)+em('🍡',340,40,40,1,-15)+em('🍡',430,76,40,1,30)+person(620,258,1.0,**CH,mood='evil',arm='up')+person(90,258,0.95,**JM,mood='smile',arm='fwd')+txt('미역국에 꿀떡 풍덩!',360,285,26,'#8a4a00'),top='#ffeed0',bot='#fff6e4')
# 11 달걀
S['egg_game']=svg(rect(0,0,W,300,'#fff0d8')+rect(0,60,W,170,'#f6e4c4')+person(590,250,1.1,**CH,mood='evil',arm='up')+em('🥚',430,90,40)+em('🥚',350,140,44,1,20)+em('🥚',270,190,40)+em('🍳',120,170,56)+person(160,252,1.1,**JM,mood='smile',arm='fwd')+txt('날달걀 세례!',360,38,28,'#c0392b'),top='#fff0d8',bot='#fff0d8',ground='#c9a46a',gy=262)
# 12 방구 수업
S['fart_class']=svg(rect(0,0,W,300,'#e3efe0')+rect(60,30,600,110,'#2d5a3d',6)+txt('수 업 중',360,95,36,'#fff')+rect(160,170,140,60,'#c9a46a',4)+rect(400,170,140,60,'#c9a46a',4)+person(230,226,0.9,shirt='#7a9ad6',pants='#3a3a5a',hair='#1a120c',mood='smile')+em('💨',300,200,44)+person(470,226,0.9,**JM,mood='shock')+em('🧑‍🏫',640,120,50),top='#e3efe0',bot='#e3efe0',ground='#d6b98a',gy=236)
# 13 야자 정적
S['gy_yaja']=svg(rect(0,0,W,300,'#2a3350')+rect(60,30,600,90,'#1c2540',6)+txt('야간 자율학습',360,86,32,'#9fb4e8')+rect(120,160,160,60,'#6a7aa0',4)+rect(440,160,160,60,'#6a7aa0',4)+person(200,214,0.85,shirt='#6a8ac0',pants='#2a3a5a',hair='#1a120c',mood='smile')+em('😴',200,110,34)+em('💨',260,176,34)+person(520,214,0.85,**JM,mood='shock')+em('🕯️',340,200,24),top='#2a3350',bot='#2a3350',ground='#4a557a',gy=236)
# 14 사물함 눈
S['ch_locker']=svg(rect(0,0,W,300,'#dfe9f6')+''.join(rect(40+i*110,30,100,170,'#9fb4d6',6)+rect(48+i*110,46,84,2,'#7a90b8') for i in range(6))+''.join(em('❄️',60+i*70,60+(i*37)%120,26,0.9) for i in range(10))+rect(0,210,W,90,'#f4f8ff')
 +person(300,258,1.05,**JM,mood='shock',arm='up')+person(600,258,1.0,**CH,mood='evil')+txt('복도에 눈이 내렸다',360,238,22,'#2a4a7a'),top='#dfe9f6',bot='#dfe9f6')
# 15 진호 병실
S['jinho_hospital']=svg(rect(0,0,W,300,'#e8f3f0')+rect(280,110,260,90,'#fff',8)+rect(280,170,260,24,'#9fd0c0')+em('🍨',160,190,60)+person(160,262,0.95,**JM,mood='smile',arm='fwd')+rect(330,90,150,40,'#fff',20)+person(410,160,0.8,shirt='#e6f0ff',pants='#e6f0ff',hair='#1a120c',mood='smile')+em('🩹',470,140,32)+em('🏥',620,90,56)+txt('진호, 빨리 나아라',360,40,26,'#2a7a6a'),top='#e8f3f0',bot='#e8f3f0',ground='#c9dfd8',gy=250)
# 16 야구 담장
S['bs_baseball']=svg(rect(0,0,W,300,'#9ed0f5')+rect(0,170,W,130,'#4a9a3a')+rect(0,120,W,50,'#2d6a2d')+em('⚾',560,60,46,1,20)+em('🏟️',640,125,50)+person(180,262,1.1,**CH,mood='evil',arm='fwd')+person(380,262,0.9,**JM,mood='smile',arm='up')+txt('범수: ...라면?',560,236,24,'#fff')+em('🍜',640,262,36),top='#9ed0f5',bot='#cfe9fb')
# 17 운전
S['drive_mishap']=svg(rect(0,0,W,300,'#1a2040')+rect(0,190,W,110,'#3a3d48')+''.join(rect(40+i*120,238,60,8,'#ffd24a') for i in range(6))+em('🚗',360,225,110)+em('🚨',500,150,36)+em('🔦',230,200,30)+txt('헤드라이트? 사이드브레이크?',360,50,28,'#ffd24a')+em('🌙',90,80,48)+em('🅿️',640,90,40),top='#1a2040',bot='#2a3260')
# 18 노래방 알바
S['pt_jayu_karaoke']=svg(rect(0,0,W,300,'#3a1a5a')+rect(0,0,W,300,'#ff4aa022')+em('🎤',150,130,70)+em('🎶',330,70,50)+em('🎶',520,120,42)+em('🪩',360,36,50)+rect(220,180,280,60,'#2a0f44',10)+em('🧃',300,215,32)+em('🍿',420,215,32)
 +person(640,258,1.05,**JM,mood='smile',arm='fwd')+txt('자이노래방',360,282,26,'#ffd24a'),top='#3a1a5a',bot='#5a2a8a')
# 19 선재도 알람
S['sj_alarm']=svg(rect(0,0,W,300,'#9ad6f0')+rect(0,190,W,110,'#e6d6a8')+rect(0,170,W,26,'#4aa8d8')+em('⏰',360,130,100)+em('📢',200,90,40)+em('📢',520,90,40)+txt('재민! 재민! 재민!',360,40,30,'#c0392b')+person(160,258,1.05,**JM,mood='cry',arm='up')+person(580,258,1.0,**JN,mood='shock'),top='#9ad6f0',bot='#d6f0fa')
# 20 거제 보일러
S['geoje_boiler']=svg(rect(0,0,W,300,'#f6e8d0')+rect(60,40,180,210,'#c9d2d8',10)+rect(80,70,140,70,'#eef2f4',6)+txt('0 ─ 10',150,118,28,'#333')+em('🔥',150,200,56)+rect(380,130,260,100,'#e8b4a0',10)+em('🛏️',510,190,70)+em('💨',470,110,40)+em('🔥',560,150,40)
 +person(330,262,1.05,**JM,mood='shock',arm='up')+txt('10분이 아니라 10단계!?',380,40,26,'#c0392b'),top='#f6e8d0',bot='#f6e8d0',ground='#b8905c',gy=252)
def data(s): return 'data:image/svg+xml;charset=utf-8,'+urllib.parse.quote(s,safe="/:;=,")
if __name__=='__main__':
    out=['/* SCENES_BEGIN: 직접 그린 이벤트 장면 일러스트(SVG) — tools/make_scenes.py */','Object.assign(SCN,{']
    for k,v in S.items():
        out.append(f'"ev_{k}":"{data(v).replace(chr(34),"%22")}",')
    out.append('});/* SCENES_END */')
    print('\n'.join(out))
