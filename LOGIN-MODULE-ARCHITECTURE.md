# 🏗️ Login Module - Complete Architecture

## 📁 File Structure

**Important:** Dự án này sử dụng **Single-Page Architecture** - tất cả code nằm trong một file duy nhất:

```
index.html
├── <style> CSS (Lines 5-4182)
│   ├── CSS Variables (GHTK colors)
│   ├── Overlay & Modal styles
│   ├── Form & Input styles
│   ├── Success state animations
│   └── Mobile responsive
│
└── <script> JavaScript (Lines 4327-4650)
    ├── Authentication logic
    ├── Success Sequence flow
    └── Helper functions
```

**Không có file riêng:** `style.css` hoặc `script.js`

---

## 1️⃣ HTML Structure (Lines 4170-4221)

### Current Implementation

```html
<!-- Full-screen overlay -->
<div id="auth-overlay">
    <!-- Compact card centered -->
    <div id="login-modal">
        <!-- Logo -->
        <div class="login-logo">
            <img src="GHTK-Logo.webp" alt="GHTK Logo">
        </div>

        <!-- Form Container -->
        <div id="form-container">
            <h2>Xác thực người dùng</h2>
            <p>Vui lòng nhập email để truy cập hệ thống tài liệu phân phối GHTK</p>

            <!-- Login Form -->
            <form id="login-form">
                <!-- Email Input with Icon -->
                <div class="input-wrapper">
                    <svg class="input-icon">...</svg>
                    <input type="email" id="user-email-input"
                           placeholder="Email của bạn (vd: user@ghtk.vn)">
                </div>

                <!-- Submit Button -->
                <button type="submit" id="login-submit-btn">
                    Truy cập
                </button>
            </form>

            <!-- Error Message -->
            <div id="auth-error-message"></div>
        </div>

        <!-- Success Container (Hidden by default) -->
        <div id="success-container">
            <!-- Animated Checkmark SVG -->
            <svg class="success-checkmark">
                <circle class="checkmark-circle" />
                <path class="checkmark-check" />
            </svg>

            <!-- Success Messages -->
            <h3 class="success-title">Đăng nhập thành công!</h3>
            <p class="success-subtitle">Xin chào, <span id="success-user-name">User</span></p>
            <p class="success-redirect">Đang chuyển đến tài liệu...</p>
        </div>
    </div>
</div>
```

### Key Elements

| Element | ID/Class | Purpose |
|---------|----------|---------|
| Overlay | `#auth-overlay` | Full-screen backdrop with blur |
| Modal Card | `#login-modal` | Compact white card (auto height) |
| Logo | `.login-logo` | GHTK logo with float animation |
| Form Container | `#form-container` | Wrapper for form elements |
| Input Wrapper | `.input-wrapper` | Contains icon + input field |
| Email Input | `#user-email-input` | Email input with validation |
| Submit Button | `#login-submit-btn` | "Truy cập" button |
| Error Message | `#auth-error-message` | Red error box (hidden by default) |
| Success Container | `#success-container` | Success state UI (hidden by default) |
| User Name Span | `#success-user-name` | Dynamic user name display |

---

## 2️⃣ CSS Architecture (Lines 3737-4181)

### CSS Variables (GHTK Branding)

```css
:root {
    /* GHTK Brand Colors */
    --ghtk-primary: #069255;
    --ghtk-primary-dark: #028a3d;
    --ghtk-primary-light: #00b14f;
    --ghtk-success: #10b981;
    --ghtk-gradient: linear-gradient(135deg,
                        var(--ghtk-primary-light) 0%,
                        var(--ghtk-primary-dark) 100%);

    /* Neutral Colors */
    --text-dark: #1e293b;
    --text-medium: #475569;
    --text-light: #94a3b8;
    --border-color: #e2e8f0;

    /* Shadows */
    --shadow-lg: 0 24px 48px rgba(0, 0, 0, 0.12),
                 0 8px 16px rgba(0, 0, 0, 0.08);
    --shadow-xl: 0 32px 64px rgba(0, 0, 0, 0.16),
                 0 12px 24px rgba(0, 0, 0, 0.12);
}
```

### Overlay (Full-screen backdrop)

```css
#auth-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(6, 146, 85, 0.95); /* GHTK green */
    backdrop-filter: blur(8px); /* Glassmorphism */
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center; /* Center modal */
    opacity: 1;
    transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hide when authenticated */
#auth-overlay.auth-success {
    opacity: 0;
    pointer-events: none;
    backdrop-filter: blur(0px);
}
```

### Modal Card (Compact Design)

```css
#login-modal {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15),
                0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 40px;
    max-width: 450px;
    width: 90%;
    height: auto; /* ← KEY: Auto height, not stretched */
    text-align: center;
    position: relative;

    /* Flexbox Gap System for even spacing */
    display: flex;
    flex-direction: column;
    gap: 24px; /* ← KEY: Consistent spacing */

    animation: modalSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Top accent bar */
#login-modal::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--ghtk-gradient);
    border-radius: 20px 20px 0 0;
}
```

### Logo (Floating Animation)

```css
.login-logo {
    margin: 0; /* Gap handles spacing */
    animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
}

.login-logo img {
    width: 140px;
    height: auto;
    filter: drop-shadow(0 4px 12px rgba(6, 146, 85, 0.2));
}
```

### Form Container & Elements

```css
#form-container {
    display: flex;
    flex-direction: column;
    gap: 24px; /* Even spacing */
}

h2 {
    margin: 0; /* Gap handles spacing */
    font-size: 26px;
    font-weight: 700;
    color: var(--text-dark);
}

p {
    margin: 0;
    font-size: 15px;
    color: var(--text-medium);
}

#login-form {
    display: flex;
    flex-direction: column;
    gap: 16px; /* Tighter gap */
}
```

### Email Input (with Icon)

```css
.input-wrapper {
    position: relative;
    width: 100%;
}

.input-icon {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: var(--text-light);
    transition: color 0.3s ease;
}

.input-wrapper:focus-within .input-icon {
    color: var(--ghtk-primary); /* Green on focus */
}

#user-email-input {
    width: 100%;
    padding: 16px 18px 16px 52px; /* Space for icon */
    font-size: 15px;
    font-weight: 500;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    outline: none;
    background: #f8fafc;
    color: var(--text-dark);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

#user-email-input:hover {
    border-color: #cbd5e1;
    background: #ffffff;
}

#user-email-input:focus {
    border-color: var(--ghtk-primary);
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(6, 146, 85, 0.1); /* Green ring */
    transform: translateY(-2px); /* Lift effect */
}
```

### Submit Button (GHTK Green)

```css
#login-submit-btn {
    width: 100%;
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    background: var(--ghtk-gradient);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(6, 146, 85, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

/* White overlay on hover */
#login-submit-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg,
                rgba(255,255,255,0.2) 0%,
                rgba(255,255,255,0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

#login-submit-btn:hover::before {
    opacity: 1;
}

#login-submit-btn:hover {
    transform: translateY(-3px); /* Lift effect */
    box-shadow: 0 8px 24px rgba(6, 146, 85, 0.4);
}

#login-submit-btn:active {
    transform: translateY(-1px);
}

#login-submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}
```

### Success Container (Animated Checkmark)

```css
#success-container {
    display: none;
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.4s ease,
                transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

#success-container.show {
    display: block;
    opacity: 1;
    transform: scale(1);
}

/* Animated Checkmark Circle */
.checkmark-circle {
    stroke-dasharray: 251; /* Circumference */
    stroke-dashoffset: 251; /* Start hidden */
    stroke: var(--ghtk-success);
    stroke-width: 3;
    fill: none;
    animation: checkmarkCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

@keyframes checkmarkCircle {
    to { stroke-dashoffset: 0; } /* Draw circle */
}

/* Checkmark Check */
.checkmark-check {
    stroke-dasharray: 48;
    stroke-dashoffset: 48;
    stroke: var(--ghtk-success);
    stroke-width: 3;
    fill: none;
    stroke-linecap: round;
    animation: checkmarkCheck 0.3s 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
    /*                        ↑ 0.6s delay */
}

@keyframes checkmarkCheck {
    to { stroke-dashoffset: 0; } /* Draw check */
}

/* Success Text (Staggered fade-in) */
.success-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-dark);
    animation: fadeInUp 0.5s 0.8s ease both;
}

.success-subtitle {
    font-size: 16px;
    color: var(--text-medium);
    animation: fadeInUp 0.5s 0.9s ease both; /* 100ms delay */
}

.success-redirect {
    font-size: 14px;
    color: var(--text-light);
    animation: fadeInUp 0.5s 1s ease both; /* 200ms delay */
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### Error Message (Shake Animation)

```css
#auth-error-message {
    margin-top: 20px;
    padding: 14px 18px;
    background: #fef2f2;
    border-left: 4px solid #ef4444;
    border-radius: 8px;
    color: #dc2626;
    font-size: 14px;
    display: none;
    text-align: left;
    line-height: 1.6;
    animation: shake 0.4s ease;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
}

#auth-error-message.show {
    display: block;
}
```

### Mobile Responsive

```css
@media (max-width: 768px) {
    #login-modal {
        padding: 32px 24px; /* More compact */
        gap: 20px; /* Tighter spacing */
    }

    .login-logo img {
        width: 120px; /* Smaller logo */
    }

    h2 {
        font-size: 22px;
    }

    #form-container {
        gap: 20px;
    }

    #login-form {
        gap: 14px; /* Very tight */
    }

    #user-email-input {
        padding: 14px 16px 14px 48px;
        font-size: 14px;
    }

    .input-icon {
        left: 16px;
        width: 18px;
        height: 18px;
    }

    .success-checkmark {
        width: 64px;
        height: 64px;
    }

    .success-title {
        font-size: 20px;
    }
}
```

---

## 3️⃣ JavaScript Logic (Lines 4327-4650)

### Configuration

```javascript
// API endpoint
const API_URL = 'https://script.google.com/macros/s/.../exec';

// LocalStorage keys
const AUTH_KEY = 'ghtk_auth_user';
const AUTH_TIMESTAMP_KEY = 'ghtk_auth_timestamp';
const AUTH_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// DOM elements
let authOverlay, loginForm, formContainer, emailInput, submitBtn;
let errorMessage, successContainer, successUserName;
```

### Initialization

```javascript
document.addEventListener('DOMContentLoaded', function() {
    initAuthElements();
    checkLoginStatus();
});

function initAuthElements() {
    authOverlay = document.getElementById('auth-overlay');
    loginForm = document.getElementById('login-form');
    formContainer = document.getElementById('form-container');
    emailInput = document.getElementById('user-email-input');
    submitBtn = document.getElementById('login-submit-btn');
    errorMessage = document.getElementById('auth-error-message');
    successContainer = document.getElementById('success-container');
    successUserName = document.getElementById('success-user-name');

    // Attach form submit handler
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}
```

### Login Flow

```javascript
async function handleLoginSubmit(e) {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Email không hợp lệ. Vui lòng kiểm tra lại.');
        return;
    }

    // Show loading state
    setLoadingState(true);
    hideError();

    try {
        // Call API to verify user
        const url = `${API_URL}?action=verify_user&email=${encodeURIComponent(email)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        const result = await response.json();

        if (result.authorized === true) {
            // Success - Save to localStorage
            const userData = {
                userName: result.userName || 'User',
                userEmail: result.userEmail || email
            };

            localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
            localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());

            // THE SUCCESS SEQUENCE
            showSuccessSequence(userData);

        } else {
            // Failed
            const errorMsg = result.message ||
                'Email không có quyền truy cập. Vui lòng liên hệ quản trị viên.';
            showError(errorMsg);
            setLoadingState(false);
        }

    } catch (error) {
        console.error('❌ Error during login:', error);
        showError('Lỗi kết nối đến server. Vui lòng thử lại sau.');
        setLoadingState(false);
    }
}
```

### Success Sequence (4-Stage Animation)

```javascript
function showSuccessSequence(userData) {
    console.log('🎬 Starting Success Sequence...');

    // STAGE 1: Hide Form Container (100ms delay)
    setTimeout(() => {
        if (formContainer) {
            formContainer.style.opacity = '0';
            formContainer.style.transform = 'scale(0.95)';
            console.log('  → Stage 1: Form hidden');
        }
    }, 100);

    // STAGE 2: Show Success Container (400ms delay)
    setTimeout(() => {
        // Hide form completely
        if (formContainer) {
            formContainer.style.display = 'none';
        }

        // Show success container with user name
        if (successUserName) {
            successUserName.textContent = userData.userName;
        }

        if (successContainer) {
            successContainer.classList.add('show');
            console.log('  → Stage 2: Success animation playing');
        }
    }, 400);

    // STAGE 3: Hold Success State (1200ms)
    // Checkmark animation plays here (900ms)
    setTimeout(() => {
        console.log('  → Stage 3: Holding success state...');
    }, 1200);

    // STAGE 4: Fade Out Overlay and Grant Access (2000ms)
    setTimeout(() => {
        console.log('  → Stage 4: Granting access...');
        grantAccess(userData);
    }, 2000);
}
```

### Grant Access

```javascript
function grantAccess(userData) {
    console.log('✅ Granting access to:', userData.userName);

    // Hide auth overlay with animation
    if (authOverlay) {
        authOverlay.classList.add('auth-success');

        // Remove from DOM after animation
        setTimeout(() => {
            authOverlay.style.display = 'none';
        }, 600);
    }

    console.log(`👋 Chào mừng ${userData.userName}!`);
}
```

### Helper Functions

```javascript
// Loading state
function setLoadingState(isLoading) {
    if (!submitBtn) return;

    submitBtn.disabled = isLoading;

    if (isLoading) {
        submitBtn.innerHTML = '<span class="loading-spinner"></span>Đang kiểm tra...';
    } else {
        submitBtn.innerHTML = 'Truy cập';
    }
}

// Error handling
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
    }
}

function hideError() {
    if (errorMessage) {
        errorMessage.classList.remove('show');
    }
}

// Clear auth data
function clearAuthData() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_TIMESTAMP_KEY);
}
```

### Auto-Login (Return Visit)

```javascript
function checkLoginStatus() {
    console.log('🔐 Checking authentication status...');

    const authData = localStorage.getItem(AUTH_KEY);
    const authTimestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY);

    if (authData && authTimestamp) {
        const timestamp = parseInt(authTimestamp, 10);
        const now = Date.now();
        const elapsed = now - timestamp;

        // Check if still valid (7 days)
        if (elapsed < AUTH_DURATION) {
            const user = JSON.parse(authData);
            console.log('✅ User already authenticated:', user.userName);
            grantAccess(user);
            return;
        } else {
            console.log('⏰ Authentication expired. Please login again.');
            clearAuthData();
        }
    }

    // Not authenticated - show login modal
    console.log('🔒 User not authenticated. Showing login modal.');
    showLoginModal();
}

function showLoginModal() {
    if (authOverlay) {
        authOverlay.style.display = 'flex';
        authOverlay.classList.remove('auth-success');

        setTimeout(() => {
            if (emailInput) emailInput.focus();
        }, 400);
    }
}
```

### Periodic Check & Logout

```javascript
// Periodic auth check (every 5 minutes)
setInterval(function() {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) {
        console.log('⚠️ Authentication lost. Showing login modal.');
        showLoginModal();
    }
}, 5 * 60 * 1000); // 5 minutes

// Global logout function
window.GHTK_Logout = function() {
    clearAuthData();
    location.reload();
};
```

---

## 🎬 Success Sequence Timeline

```
Time (ms)  | Event
-----------|--------------------------------------------------
0          | User clicks "Truy cập"
           | Button: "Đang kiểm tra..." + spinner
           |
~500       | API response received
           | { authorized: true, userName: "..." }
           |
100        | 🎬 STAGE 1
           | formContainer opacity: 1 → 0
           | formContainer scale: 1 → 0.95
           |
400        | 🎬 STAGE 2
           | formContainer display: none
           | successContainer classList.add('show')
           | successUserName.textContent = userName
           |
400-1000   | Checkmark circle draws (600ms)
           |
1000-1300  | Checkmark check draws (300ms)
           |
1200       | 🎬 STAGE 3
           | Text animations:
           | - "Đăng nhập thành công!" (800ms delay)
           | - "Xin chào, [User]" (900ms delay)
           | - "Đang chuyển đến tài liệu..." (1000ms delay)
           |
2000       | 🎬 STAGE 4
           | authOverlay.classList.add('auth-success')
           | Overlay opacity: 1 → 0 (600ms)
           | Backdrop blur: 8px → 0px
           |
2600       | ✅ Complete
           | Overlay display: none
           | Main content visible
```

---

## 📊 Data Flow

```
User Input → Validation → API Call → Response Handler → UI Update
    ↓           ↓           ↓              ↓               ↓
  Email     Format     verify_user    authorized?    Success/Error
  Input     Check      endpoint       true/false     Sequence
```

### API Request

```javascript
GET /exec?action=verify_user&email=user@example.com
```

### API Response (Success)

```json
{
  "success": true,
  "authorized": true,
  "userName": "John Doe",
  "userEmail": "user@example.com",
  "message": "Đăng nhập thành công",
  "timestamp": "2025-12-29T10:30:00.000Z"
}
```

### API Response (Error)

```json
{
  "success": false,
  "authorized": false,
  "message": "Email không có quyền truy cập...",
  "timestamp": "2025-12-29T10:30:00.000Z"
}
```

---

## 🎨 Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| **Primary Green** | `#069255` | Brand color |
| **Success Green** | `#10b981` | Checkmark, success states |
| **Text Dark** | `#1e293b` | Headings |
| **Text Medium** | `#475569` | Body text |
| **Text Light** | `#94a3b8` | Placeholder, subtle text |
| **Border** | `#e2e8f0` | Input borders |
| **Padding** | `40px` | Modal padding (desktop) |
| **Gap** | `24px` | Spacing between sections |
| **Border Radius** | `20px` | Modal corners |
| **Input Radius** | `12px` | Input/button corners |

---

## 🔧 How to Modify

### Change Colors

```css
:root {
    --ghtk-primary: #YOUR_COLOR; /* Change brand color */
}
```

### Change Spacing

```css
#login-modal {
    gap: 32px; /* Change from 24px */
}
```

### Change Success Sequence Timing

```javascript
// In showSuccessSequence()
setTimeout(() => { ... }, 100);  // Stage 1: Change delay
setTimeout(() => { ... }, 400);  // Stage 2: Change delay
setTimeout(() => { ... }, 2000); // Stage 4: Change total duration
```

### Change Logo Size

```css
.login-logo img {
    width: 160px; /* Change from 140px */
}
```

---

## ✅ Current State

**Version:** 3.0.1 (Layout Fixed)
**Status:** ✅ Production Ready
**Last Updated:** 2025-12-29

### Features
- ✅ Compact card design (auto height)
- ✅ Flexbox gap-based spacing
- ✅ GHTK branded colors
- ✅ Email validation
- ✅ Loading states
- ✅ Success Sequence (4-stage animation)
- ✅ Error handling with shake
- ✅ Auto-login (7 days)
- ✅ Mobile responsive
- ✅ Backdrop blur effect
- ✅ Animated checkmark
- ✅ Staggered text animations

### Files
- **index.html** - All code (HTML + CSS + JS)
- **LOGIN-SUCCESS-SEQUENCE-GUIDE.md** - Success flow documentation
- **LOGIN-LAYOUT-FIX.md** - Layout fix documentation
- **USER-AUTHENTICATION-DEPLOYMENT-GUIDE.md** - Full deployment guide

---

**Architecture:** Single-page monolith (all code in index.html)
**No separate files:** style.css or script.js don't exist
**Maintainability:** High (gap-based spacing, CSS variables)
**Performance:** Excellent (GPU-accelerated animations)
