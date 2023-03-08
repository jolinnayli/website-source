#!/bin/sh

chmod +x md2json.js
chmod +x json2site.js
rm out/style.css
rm out/script.js

ln style.css out/style.css
ln script.js out/script.js