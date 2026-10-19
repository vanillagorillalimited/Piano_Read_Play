#!/bin/sh
# Builds dist/read-music.html (artifact, VexFlow from CDN) and dist/test.html (local VexFlow for testing)
set -e
cd "$(dirname "$0")"
mkdir -p dist
FONTS='https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@600;700&family=Mulish:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap'
JS="src/samples.js src/audio.js src/midi.js src/mic.js src/notation.js dist/_prompt.js src/sheet-prompts.js src/sheet.js src/files.js src/keyboard.js src/data-library.js src/data-course.js src/data-playing.js src/premium.js src/analysis.js src/app.js"
head() {
  echo '<meta charset="utf-8">'
  echo '<title>Piano: Read &amp; Play</title>'
  echo '<meta name="claude:viewport-fit-sides" content="cover">'
  echo '<meta name="theme-color" content="#0F0E0D">'
  echo '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
  echo "<link rel=\"stylesheet\" href=\"$FONTS\">"
  echo '<style>'; cat src/style.css src/looks.css; echo '</style>'
  echo '<div id="app"></div>'
}
node -e "process.stdout.write('const SHEET_PROMPT = ' + JSON.stringify(require('fs').readFileSync('src/sheet-prompt.txt', 'utf8').trim()) + ';\\n')" > dist/_prompt.js
{ head; echo '<script src="https://cdn.jsdelivr.net/npm/vexflow@4.2.5/build/cjs/vexflow-bravura.js"></script>'; echo '<script>'; cat $JS; echo '</script>'; } > dist/read-music.html
{ echo '<!doctype html><html lang="en-GB"><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'; head; echo '<script src="../node_modules/vexflow/build/cjs/vexflow-bravura.js"></script>'; echo '<script>window.LOCAL_LIBS = { pdf: "../node_modules/pdfjs-dist/build/pdf.min.js", pdfWorker: "../node_modules/pdfjs-dist/build/pdf.worker.min.js", zip: "../node_modules/jszip/dist/jszip.min.js" };</script>'; echo '<script>'; cat $JS; echo '</script>'; } > dist/test.html
cat $JS > dist/_bundle.js && node --check dist/_bundle.js && echo "syntax ok"

# ---- App Store / Google Play build: everything local, nothing from the internet but the reading service ----
mkdir -p www/lib www/fonts
cp node_modules/vexflow/build/cjs/vexflow-bravura.js www/lib/
cp node_modules/pdfjs-dist/build/pdf.min.js node_modules/pdfjs-dist/build/pdf.worker.min.js node_modules/jszip/dist/jszip.min.js www/lib/
FONTCSS=""
for spec in "bodoni-moda:Bodoni Moda:600 700" "mulish:Mulish:400 600 700 800" "inter:Inter:400 500 600 700 800"; do
  pkg=${spec%%:*}; rest=${spec#*:}; fam=${rest%%:*}; weights=${rest#*:}
  for w in $weights; do
    f="$pkg-latin-$w-normal.woff2"; cp "node_modules/@fontsource/$pkg/files/$f" www/fonts/
    FONTCSS="$FONTCSS@font-face{font-family:'$fam';font-style:normal;font-weight:$w;font-display:swap;src:url(fonts/$f) format('woff2')}"
  done
done
{
  echo '<!doctype html><html lang="en-GB"><head><meta charset="utf-8">'
  echo '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">'
  echo '<title>Read &amp; Play</title><meta name="theme-color" content="#0F0E0D">'
  echo "<style>$FONTCSS</style>"
  echo '<style>'; cat src/style.css src/looks.css; echo '</style></head><body>'
  echo '<div id="app"></div>'
  echo '<script src="lib/vexflow-bravura.js"></script>'
  echo '<script>window.LOCAL_LIBS = { pdf: "lib/pdf.min.js", pdfWorker: "lib/pdf.worker.min.js", zip: "lib/jszip.min.js" };</script>'
  echo '<script>'; cat src/config.app.js; echo '</script>'
  echo '<script>'; cat $JS; echo '</script></body></html>'
} > www/index.html
echo "app build: www/ ($(du -sh www | cut -f1))"
wc -c dist/read-music.html
