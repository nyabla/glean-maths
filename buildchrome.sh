#!/bin/bash
cp manifest.json manifest.json.bak
sed -i "s|\"manifest_version\": 2|\"manifest_version\": 3|g" manifest.json
sed -i "s|\"js\": \[|\"js\": \[\n\"src/scripts/chrome-font-override.ts\",|g" manifest.json
npx parcel build manifest.json --target chrome
cd dist/chrome
sed -i "s|url[(]KaTeX|url(chrome-extension://__MSG_@@extension_id__/KaTeX|g" maths.????????.css
npx web-ext build --overwrite-dest
cd ../..
mv manifest.json.bak manifest.json
