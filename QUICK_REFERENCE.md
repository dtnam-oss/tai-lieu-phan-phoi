# 🚀 Quick Reference Guide

## 📂 File Overview

| File | Size | Purpose |
|------|------|---------|
| [index.html](index.html) | 139 KB | **Main HTML file** - Deploy this |
| [README.md](README.md) | 2.1 KB | Project overview |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 3.1 KB | Deployment guide |
| [FEATURES.md](FEATURES.md) | 5.3 KB | Feature details & backend integration |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | - | This file - Quick reference |

## ⚡ Quick Commands

### Test Locally
```bash
open index.html
# or
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

### Deploy to GitHub Pages
```bash
git add .
git commit -m "✨ Enhanced HTML with modern design"
git push origin main
```

### Update Content (via Google Sheets)
```bash
# Content is managed via Google Sheets backend
# 1. Click any highlighted term to see its ID
# 2. Update description/image in Google Sheet
# 3. Changes reflect immediately - no deployment needed
```

## 🎯 Key Features

### Navigation
- **TOC Sidebar**: Left side, auto-generated, 6 sections
- **Scroll Spy**: Active section highlights automatically
- **Mobile Menu**: Hamburger toggle on mobile

### Interactive Terms (305 total)
- **290** `<code>` tags: `term-code-001` to `term-code-290`
- **15** `<mark>` tags: Various colors
- **Click** any term → Tooltip with ID and placeholder

### Design
- **Colors**: Purple gradient (#667eea → #764ba2)
- **Layout**: 2-column (sidebar 280px + content)
- **Tables**: Gradient headers, hover effects
- **Responsive**: Desktop, tablet, mobile

## 🔌 Backend Integration

### Google Sheets Setup
1. Create sheet with columns: `term_id`, `description`, `image_url`
2. Enable Google Sheets API
3. Get API key
4. Update JavaScript (see [FEATURES.md](FEATURES.md))

### Example Row
```
term-code-001 | "QUÉT PHIẾU" | "Chức năng quét mã vạch..." | https://...
```

## 🧪 Testing Checklist

- [ ] Open [index.html](index.html) in browser
- [ ] Click TOC links → smooth scroll
- [ ] Scroll → TOC highlights active
- [ ] Click highlighted terms → tooltips
- [ ] Test mobile (DevTools)
- [ ] Check console for errors

## 📊 Statistics

- ✅ 305 interactive terms
- ✅ 6 navigation sections
- ✅ 11 color categories
- ✅ 100% responsive
- ✅ Zero dependencies

## 🌐 URLs

- **Repository**: https://github.com/dtnam-oss/tai-lieu-phan-phoi
- **Live Site**: https://dtnam-oss.github.io/tai-lieu-phan-phoi/

## 📞 Common Issues

**Tooltips not working?**
→ Check JavaScript console

**TOC not scrolling?**
→ Verify heading IDs exist

**Mobile menu stuck?**
→ Refresh + clear cache

**Need to update tooltips?**
→ Use Google Sheets backend (see FEATURES.md)

---

**Pro Tip**: All content updates via Google Sheets - no HTML regeneration needed!
