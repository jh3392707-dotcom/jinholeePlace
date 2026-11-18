#!/usr/bin/env python3
"""assets/bgm/ 안의 음악 파일을 게임이 찾도록 manifest.js 를 만들어 줍니다.
사용: python3 tools/prepare_bgm.py
파일 이름(확장자 mp3/ogg/m4a/wav):
  main    모든 장면 공통 (다른 이름이 없을 때 사용)
  title   시작 화면      kid 7~12세    teen 13~18세   young 19~29세
  mid     30~49세        senior 50~64세  old 65세~     end 결과 화면
필요한 것만 넣으세요. 없는 장면은 main, 그것도 없으면 자동 합성 음악이 나옵니다."""
import json
from pathlib import Path
d=Path(__file__).resolve().parent.parent/"assets"/"bgm"
d.mkdir(parents=True,exist_ok=True)
files=sorted(p.name for p in d.iterdir() if p.suffix.lower() in {".mp3",".ogg",".m4a",".wav"})
(d/"manifest.js").write_text("window.BGM_MANIFEST="+json.dumps(files,ensure_ascii=False)+";\n",encoding="utf8")
tot=sum((d/f).stat().st_size for f in files)/1048576
print("BGM",len(files),"개:",", ".join(files) or "(없음 - 자동 합성 음악 사용)",f"/ {tot:.1f}MB")
big=[f for f in files if (d/f).stat().st_size>14*1048576]
if big: print("⚠ 15MB가 넘는 파일은 공유 링크에 올릴 수 없어요:", ", ".join(big))
if tot>100: print("⚠ 전체 100MB가 넘어요. 줄이는 게 좋아요.")
