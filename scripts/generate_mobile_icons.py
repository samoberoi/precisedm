from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/assets/logo-icon.png"
ASSETS_DIR = ROOT / "assets"


def build_assets() -> None:
    ASSETS_DIR.mkdir(exist_ok=True)

    src = Image.open(SOURCE).convert("RGBA")

    # `icon-only` for legacy/fallback launchers.
    icon_only = Image.new("RGBA", (1024, 1024), (255, 255, 255, 255))
    icon_only_src = src.resize((860, 860), Image.Resampling.LANCZOS)
    icon_only.paste(icon_only_src, ((1024 - 860) // 2, (1024 - 860) // 2), icon_only_src)
    icon_only.save(ASSETS_DIR / "icon-only.png")

    # Adaptive icon foreground with transparent padding for safe mask clipping.
    foreground = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    fg_src = src.resize((700, 700), Image.Resampling.LANCZOS)
    foreground.paste(fg_src, ((1024 - 700) // 2, (1024 - 700) // 2), fg_src)
    foreground.save(ASSETS_DIR / "icon-foreground.png")

    # Adaptive icon solid background.
    background = Image.new("RGBA", (1024, 1024), (244, 248, 252, 255))
    background.save(ASSETS_DIR / "icon-background.png")


if __name__ == "__main__":
    build_assets()
