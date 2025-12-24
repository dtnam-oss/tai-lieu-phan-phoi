# Tài Liệu Phân Phối - Enterprise Version

## 📋 Overview

Enterprise-grade distribution documentation system with Google Sheets integration, dynamic video management, and high-performance caching strategies.

**Live Demo:** https://dtnam-oss.github.io/tai-lieu-phan-phoi/

**Repository:** https://github.com/dtnam-oss/tai-lieu-phan-phoi

## 🤖 NEW: GHTK AI Assistant (Context-Aware Chatbot)

**Intelligent chatbot that understands your documentation!**

- ✅ **Context-Aware**: Reads and understands entire page content
- ✅ **AI-Powered**: Google Gemini 1.5 Flash integration
- ✅ **Beautiful UI**: Glassmorphism design with GHTK green theme
- ✅ **Chat History**: localStorage persistence (survives page refresh)
- ✅ **Quick Actions**: Pre-defined question chips for common queries
- ✅ **Mobile-Friendly**: Responsive design for all devices

### 🚀 AI Assistant Documentation

| File | Purpose |
|------|---------|
| [QUICK-START.md](QUICK-START.md) | ⚡ 2-step setup guide (5 mins) |
| [HUONG-DAN-UPDATE-GOOGLE-APPS-SCRIPT.md](HUONG-DAN-UPDATE-GOOGLE-APPS-SCRIPT.md) | 📖 Detailed update guide |
| [google-apps-script-MERGED.gs](google-apps-script-MERGED.gs) | 🔧 Backend code (merged with Video DB) |
| [GHTK-AI-ASSISTANT-SETUP-GUIDE.md](GHTK-AI-ASSISTANT-SETUP-GUIDE.md) | 📚 Complete setup guide |

---

## 🎥 Video Dynamic System

**Revolutionary video management powered by Google Sheets!**

- ✅ **Centralized Management**: Update videos from Google Sheets (no code changes)
- ✅ **High Performance**: localStorage cache + stale-while-revalidate strategy
- ✅ **Click-to-Load**: Lazy loading with Facade Pattern (instant page load)
- ✅ **Scalable**: Add 100+ videos easily
- ✅ **Production-Ready**: Complete with 4 documentation files

### 📚 Video System Documentation

| File | Purpose | Audience |
|------|---------|----------|
| [VIDEO_QUICKSTART.md](VIDEO_QUICKSTART.md) | 5-minute setup guide | Everyone |
| [VIDEO_GOOGLE_SHEETS_SETUP.md](VIDEO_GOOGLE_SHEETS_SETUP.md) | Complete setup & troubleshooting | Admins & Developers |
| [google-apps-script.js](google-apps-script.js) | Ready-to-deploy API code | Developers |
| [VIDEO_SYSTEM_SUMMARY.md](VIDEO_SYSTEM_SUMMARY.md) | Architecture & performance analysis | Technical Team |

### ⚡ Performance Metrics

- **First Load:** ~1.6s (with skeleton loading)
- **Cache Hit:** ~100ms (instant!)
- **Video Load:** ~1s (only on click)
- **Scalability:** No performance degradation up to 100+ videos

## ✨ Enhanced Features

### 1. 🎨 Modern Visual Design
- **Gradient Header**: Beautiful purple-blue gradient (#667eea → #764ba2)
- **2-Column Layout**: Fixed sidebar TOC on the left, main content on the right
- **Card-Based Sections**: Clean, modern sections with subtle shadows
- **Enhanced Tables**:
  - Gradient headers
  - Hover effects with scaling
  - Alternating row colors
  - Rounded corners with smooth borders
- **Smooth Animations**: All interactive elements have smooth transitions
- **Modern Typography**: Clean, readable fonts with proper hierarchy

### 2. 🖱️ Interactive Features

#### A. Table of Contents (TOC)
- **Fixed Sidebar**: Always visible on the left (280px width)
- **Auto-Generated**: Dynamically created from all h3 headings
- **Smooth Scroll**: Click any item to smoothly scroll to that section
- **Scroll Spy**: Automatically highlights the active section as you scroll
- **Responsive**: Collapsible hamburger menu on mobile (<768px)

#### B. Interactive Highlighted Terms (305 terms)
Every highlighted element is now interactive with unique IDs:
- 15 mark tags
- 290 code tags
- Click any highlighted term to see a tooltip popup
- Tooltips ready for database integration

## 🚀 Quick Start

1. Open `index.html` in any modern web browser
2. Navigate using the left sidebar
3. Click any highlighted term to see tooltip
4. Use back-to-top button when scrolling

## 🔄 Content Updates

All content updates are managed via backend (Google Sheets):

- Each interactive term has a unique ID (`term-code-001`, `term-blue-002`, etc.)
- Edit descriptions and images directly in Google Sheet
- No need to regenerate HTML - changes reflect immediately
- See [FEATURES.md](FEATURES.md) for backend integration guide

## 📊 Statistics

- Total Interactive Terms: 305
- TOC Sections: 6
- Lines of Enhanced Code: ~1,500

## 🔐 Security Notes

**⚠️ IMPORTANT: Protect your API keys!**

The Google Apps Script files (`google-apps-script-backend.gs` and `google-apps-script-MERGED.gs`) contain placeholder for API keys:

```javascript
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';  // ← Replace with real key
```

**DO NOT commit real API keys to public repositories!**

If you've already added your real API key:
1. Remove it before committing
2. Use environment variables or Google Apps Script Properties instead
3. Add the file to `.gitignore` if needed

---

**Version**: 2.0.0 | **Updated**: 2025-12-24 | **New Feature**: AI Chatbot Assistant
