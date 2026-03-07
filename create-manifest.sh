#!/bin/bash
cd /home/274788799_wy/.openclaw/workspace-master/agent-status-viz

cat > manifest.json << JSON
{
  "files": [
    {
      "path": "index.html",
      "content": "$(cat index.html.b64)"
    },
    {
      "path": "css/style.css",
      "content": "$(cat css/style.css.b64)"
    },
    {
      "path": "js/main.js",
      "content": "$(cat js/main.js.b64)"
    },
    {
      "path": "js/additional.js",
      "content": "$(cat js/additional.js.b64)"
    }
  ]
}
JSON

echo "Manifest created"
jq '.' manifest.json | head -20