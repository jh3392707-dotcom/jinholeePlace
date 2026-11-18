#!/usr/bin/env python3
"""
재민이 AI 이미지 준비 도구

사용법 (저장소 맨 위 폴더에서):
    python3 tools/prepare_scenes.py            # 변환 + 목록 갱신 + 진행 현황
    python3 tools/prepare_scenes.py --status   # 진행 현황만 보기
    python3 tools/prepare_scenes.py --force    # 이미 변환한 이미지도 다시 변환

하는 일:
  1) assets/scenes_raw/ 에 넣은 원본 이미지(png/jpg/webp)를 게임용(JPG)으로 변환해 assets/scenes/ 에 저장
       - lobby_ / age_ / job_ / end_ 로 시작하는 이미지: 가운데를 기준으로 정사각형(512x512)
       - ev_ 로 시작하는 이미지(이벤트 배너): 가로 최대 800px, 비율 유지
  2) assets/scenes/manifest.js 를 만들어 게임이 이미지를 자동으로 찾게 함
  3) tools/scene_keys.json 의 목록과 비교해 만든 것 / 남은 것을 보여 줌

파일 이름 규칙은 docs/AI_SCENE_GUIDE.md 를 보세요. (예: lobby_beachball.png, job_doctor.png, ev_pension.png)
필요: Pillow  (pip install pillow)
"""
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow가 필요해요:  pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets" / "scenes_raw"
OUT = ROOT / "assets" / "scenes"
KEYS = json.load(open(ROOT / "tools" / "scene_keys.json", encoding="utf8"))
KEYSET = {k["key"]: k for k in KEYS}
EXT = {".png", ".jpg", ".jpeg", ".webp"}
SQUARE_PREFIX = ("lobby_", "age_", "job_", "end_")
BUDGET_MB = 8


def convert(src: Path, key: str) -> Path:
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    if key.startswith(SQUARE_PREFIX):
        im = ImageOps.fit(im, (512, 512), Image.LANCZOS, centering=(0.5, 0.4))
    else:
        w, h = im.size
        if w > 800:
            im = im.resize((800, round(h * 800 / w)), Image.LANCZOS)
    dst = OUT / f"{key}.jpg"
    im.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
    return dst


def write_manifest():
    files = sorted(p.name for p in OUT.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
    (OUT / "manifest.js").write_text("window.SCENE_MANIFEST=" + json.dumps(files, ensure_ascii=False) + ";\n", encoding="utf8")
    return files


def status(files):
    have = {Path(f).stem for f in files}
    groups = [(1, "필수 (로비·나이·직업·엔딩)"), (2, "추천 이벤트 장면"), (3, "나머지 이벤트 장면")]
    print("\n===== 진행 현황 =====")
    for pr, name in groups:
        items = [k for k in KEYS if k["priority"] == pr]
        done = [k for k in items if k["key"] in have]
        print(f"[우선순위 {pr}] {name}: {len(done)}/{len(items)}")
        if pr in (1, 2):
            for k in items:
                if k["key"] not in have:
                    print(f"   - {k['key']}  ({k['title']})")
    skipped = [k for k in KEYS if k["priority"] == 9]
    print(f"[제작 비권장] {len(skipped)}개 (민감한 장면은 이모지 배너 유지)")
    extra = sorted(have - set(KEYSET))
    if extra:
        print("\n⚠ 목록에 없는 이름의 이미지 (게임이 쓰지 않아요):", ", ".join(extra))
    total_mb = sum((OUT / f).stat().st_size for f in files) / 1024 / 1024
    print(f"\n이미지 {len(files)}개, 합계 {total_mb:.1f}MB" + (f"  ⚠ {BUDGET_MB}MB가 넘어요. 줄이는 게 좋아요." if total_mb > BUDGET_MB else ""))


def main():
    force = "--force" in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    if "--status" not in sys.argv:
        n = 0
        for src in sorted(RAW.iterdir()):
            if src.suffix.lower() not in EXT:
                continue
            key = src.stem
            if key not in KEYSET:
                print(f"⚠ 이름 확인 필요(건너뜀): {src.name}  → tools/scene_keys.json 의 key와 같은 이름이어야 해요")
                continue
            dst = OUT / f"{key}.jpg"
            if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime and not force:
                continue
            convert(src, key)
            n += 1
            print(f"변환: {src.name} → assets/scenes/{key}.jpg")
        print(f"\n새로 변환한 이미지: {n}개")
    files = write_manifest()
    status(files)


if __name__ == "__main__":
    main()
