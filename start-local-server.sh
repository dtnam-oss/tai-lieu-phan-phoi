#!/bin/bash
# Quick local server for testing index-local.html

echo "🚀 STARTING LOCAL TEST SERVER"
echo "======================================"
echo ""
echo "📁 Serving files from: $(pwd)"
echo "🌐 Local URL: http://localhost:8000/index-local.html"
echo ""
echo "📋 Quick links:"
echo "   - Main page:  http://localhost:8000/index-local.html"
echo "   - Direct:     http://localhost:8000/index-local.html?test=true"
echo ""
echo "⚡ Features:"
echo "   ✅ Loads static-data.js (no API calls)"
echo "   ✅ Debug logging enabled"
echo "   ✅ Fast reload with Cmd+R"
echo ""
echo "🛑 To stop: Press Ctrl+C"
echo ""
echo "======================================"
echo ""

# Start Python simple HTTP server
python3 -m http.server 8000
