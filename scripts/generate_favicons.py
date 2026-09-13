import os
import subprocess
from PIL import Image

# 1. Create the SVG code for the Mastrive Favicon / App Icon
svg_icon = '''<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141824"/>
      <stop offset="100%" stop-color="#08090d"/>
    </linearGradient>
    <linearGradient id="slashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff2e4c"/>
      <stop offset="100%" stop-color="#b81428"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e01e37" stop-opacity="0.8"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0.18)"/>
      <stop offset="100%" stop-color="#e01e37" stop-opacity="0.3"/>
    </linearGradient>
    <filter id="crimsonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="#e01e37" flood-opacity="0.45"/>
    </filter>
    <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
  </defs>

  <!-- Deep Onyx Background with Squircle (Safe for both Square & Circle viewports) -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)"/>
  <rect x="4" y="4" width="504" height="504" rx="124" fill="none" stroke="url(#borderGrad)" stroke-width="8"/>

  <!-- Mastrive Signature Crimson Dynamic Slant -->
  <path d="M316 70 H412 L332 442 H236 Z" fill="url(#slashGrad)" filter="url(#crimsonGlow)"/>

  <!-- Mastrive Bold Monogram 'M' -->
  <!-- Scaled and centered with ample safe-area padding for circular search snippets -->
  <g filter="url(#subtleShadow)" transform="translate(256, 256) scale(3.7) translate(-45.312, -56.976)">
    <path d="M63.84 90V66.192C63.84 63.248 63.936 60.24 64.128 57.168C64.384 54.032 64.64 51.408 64.896 49.296C65.152 47.184 65.312 45.84 65.376 45.264H64.992L52.8 90H36.192L23.904 45.36H23.52C23.584 45.936 23.744 47.28 24 49.392C24.32 51.44 24.608 54.032 24.864 57.168C25.12 60.24 25.248 63.248 25.248 66.192V90H5.76V23.952H35.712L45.696 62.064H46.08L55.968 23.952H84.864V90H63.84Z" fill="#FFFFFF"/>
  </g>

  <!-- High-tech top accent dot -->
  <circle cx="430" cy="82" r="10" fill="#ff3855"/>
</svg>
'''

os.makedirs('public', exist_ok=True)
os.makedirs('app', exist_ok=True)

svg_path = os.path.abspath('public/icon.svg')
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(svg_icon)

# Also save directly in app/ directory for Next.js App Router metadata conventions
with open('app/icon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_icon)

print(f"Generated {svg_path} and app/icon.svg")

# 2. Render SVG to 512x512 PNG using Headless Edge
edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html_wrapper_path = os.path.abspath('public/_render_icon.html')
raw_png_path = os.path.abspath('public/_raw_512.png')

html_content = f'''<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ width: 512px; height: 512px; overflow: hidden; background: transparent; }}
  img {{ width: 512px; height: 512px; display: block; }}
</style>
</head>
<body>
  <img src="file:///{svg_path.replace(os.sep, '/')}" />
</body>
</html>'''

with open(html_wrapper_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

cmd = [
    edge_exe,
    "--headless",
    "--disable-gpu",
    "--window-size=512,512",
    "--default-background-color=00000000",
    f"--screenshot={raw_png_path}",
    f"file:///{html_wrapper_path.replace(os.sep, '/')}"
]

print("Rendering high-res raster via Headless Edge...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Edge finished with code:", res.returncode)

if not os.path.exists(raw_png_path):
    print("Error: screenshot not created!")
    exit(1)

# 3. Use Pillow to resize and generate all standard icon formats
img = Image.open(raw_png_path).convert('RGBA')

# Crop/resize exactly to 512x512
img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
img_512.save('public/icon-512x512.png', 'PNG')
print("Saved public/icon-512x512.png")

# 192x192 (PWA & Google 48px multiple)
img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
img_192.save('public/icon-192x192.png', 'PNG')
print("Saved public/icon-192x192.png")

# 180x180 (Apple Touch Icon)
img_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
img_180.save('public/apple-icon.png', 'PNG')
img_180.save('app/apple-icon.png', 'PNG')
print("Saved public/apple-icon.png and app/apple-icon.png")

# 48x48 (Google Search canonical size)
img_48 = img.resize((48, 48), Image.Resampling.LANCZOS)
img_48.save('public/icon-48x48.png', 'PNG')
print("Saved public/icon-48x48.png")

# 32x32 (Browser tab light & dark)
img_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
img_32.save('public/icon-light-32x32.png', 'PNG')
img_32.save('public/icon-dark-32x32.png', 'PNG')
print("Saved 32x32 icons")

# Multi-resolution favicon.ico (containing 16x16, 32x32, 48x48)
img.save(
    'public/favicon.ico',
    format='ICO',
    sizes=[(16, 16), (32, 32), (48, 48)]
)
img.save(
    'app/favicon.ico',
    format='ICO',
    sizes=[(16, 16), (32, 32), (48, 48)]
)
print("Saved public/favicon.ico and app/favicon.ico")

# Cleanup temp files
if os.path.exists(html_wrapper_path):
    os.remove(html_wrapper_path)
if os.path.exists(raw_png_path):
    os.remove(raw_png_path)

print("All favicon and logo assets generated successfully!")

