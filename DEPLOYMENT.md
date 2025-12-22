# Deployment Guide

## 🚀 Deploying to GitHub Pages

### Current Setup
- **Repository**: https://github.com/dtnam-oss/tai-lieu-phan-phoi
- **Live URL**: https://dtnam-oss.github.io/tai-lieu-phan-phoi/
- **Branch**: main

### Deploy Updates

```bash
cd /Users/mac/Desktop/tai-lieu-phan-phoi

# Stage changes
git add index.html

# Commit with message
git commit -m "🎨 Enhanced HTML with modern design and interactive features"

# Push to GitHub
git push origin main
```

### Verify Deployment

After pushing, wait 2-3 minutes then visit:
https://dtnam-oss.github.io/tai-lieu-phan-phoi/

### Troubleshooting

**If page doesn't update:**
1. Check GitHub Actions tab in repository
2. Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Check GitHub Pages settings in repository settings

**If 404 error:**
1. Verify GitHub Pages is enabled in repository settings
2. Check that `index.html` exists in main branch
3. Verify repository is public

## 🔄 Future Updates

### Updating Content

**All content is managed via Google Sheets backend** - no need to regenerate HTML!

1. Identify term ID by clicking on the highlighted term
2. Update description/image in Google Sheet
3. Changes appear immediately (no deployment needed)

### Backend Integration (Future)

To connect tooltips to Google Sheets:

1. **Create Google Sheet** with columns:
   - `term_id` (e.g., "term-blue-001")
   - `description` (explanation text)
   - `image_url` (optional image)

2. **Enable Google Sheets API**:
   - Go to Google Cloud Console
   - Create new project
   - Enable Google Sheets API
   - Create API key

3. **Update JavaScript** in `index.html`:
   ```javascript
   // Add at top of script section
   const SHEET_ID = 'your-google-sheet-id';
   const API_KEY = 'your-api-key';

   // Replace createTooltip function with API call
   async function fetchTooltipData(termId) {
       const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;
       const response = await fetch(url);
       const data = await response.json();
       // Parse and return matching term data
   }
   ```

4. **Test and deploy**

## 📝 File Structure

```
tai-lieu-phan-phoi/
├── index.html              # Main HTML file (deploy this)
├── README.md              # Documentation
├── DEPLOYMENT.md          # This file
├── FEATURES.md            # Feature details
└── QUICK_REFERENCE.md     # Quick reference guide
```

## ✅ Pre-Deployment Checklist

Before deploying, verify:
- [ ] All interactive terms have unique IDs
- [ ] TOC navigation works
- [ ] Scroll spy highlights correctly
- [ ] Tooltips appear on click
- [ ] Responsive design works on mobile
- [ ] Back-to-top button appears after scroll
- [ ] All tables display correctly
- [ ] No JavaScript errors in console

## 🎯 Performance Tips

1. **Optimize images**: Compress before adding to document
2. **Minimize file size**: Remove unnecessary whitespace (optional)
3. **Enable caching**: GitHub Pages does this automatically
4. **CDN**: GitHub Pages uses CDN by default

---

**Need Help?** Open an issue in the GitHub repository.
