# Portfolio Indra Sugara — Project Breakdown

> **Referensi desain**: [aashishjaini.me](https://www.aashishjaini.me/)
> **Fitur AI dari**: [aaabadcode.com](https://www.aaabadcode.com/) + [fastfol.io](https://fastfol.io)
> **Stack**: Vanilla HTML + CSS + JavaScript (static site, no framework)
> **AI Chatbot**: DeepSeek API / OpenRouter (free tier) via serverless proxy

---

## Table of Contents

1. [Referensi Visual & Screenshots](#1-referensi-visual--screenshots)
2. [Arsitektur & File Structure](#2-arsitektur--file-structure)
3. [Design System](#3-design-system)
4. [Sections & Komponen UI](#4-sections--komponen-ui)
5. [AI Chatbot — "Ask Me Anything"](#5-ai-chatbot--ask-me-anything)
6. [Data Layer (data.json)](#6-data-layer-datajson)
7. [Animasi & Interaksi](#7-animasi--interaksi)
8. [Deployment Strategy](#8-deployment-strategy)
9. [Milestone & Task Breakdown](#9-milestone--task-breakdown)

---

## 1. Referensi Visual & Screenshots

### Desain yang Akan Direplikasi: [aashishjaini.me](https://www.aashishjaini.me/)

| Section | Deskripsi |
|---------|-----------|
| **Hero** | 2-column layout: Kiri = greeting + typing animation + CTAs + social links. Kanan = foto profil dengan border & blue glow. Bouncing scroll arrow di bawah. |
| **About** | "My Professional Side" — Grid: kolom kiri = bio card (email, lokasi, education, core areas tags), kolom kanan = Education timeline cards |
| **Skills** | Tab interface (Programming Languages / Frontend / Backend / Cloud) → Grid cards dengan ikon + nama skill. Plus section "AI & Developer Tooling" tags |
| **Projects** | "Stuff I Built" — Full-width immersive project cards. Setiap project: gradient background, screenshot mockup, side panel (title, description, bullet points, tech stack badges) |
| **Experience** | "Work Experience" — Timeline cards dengan role, company, description, tahun. "Experience Certificate" modal |
| **Achievements** | Certifications & hackathon wins dengan cards |
| **Contact** | "Say Hi, Don't Be Shy" — 2 kolom: kiri = info kontak + social links, kanan = contact form |
| **Footer** | Copyright + social links |
| **AI Chatbot** | Floating Action Button (FAB) di kanan bawah → Drawer chat panel |
| **Navigation** | Fixed top navbar (pill-shaped, glassmorphic) + Floating scroll progress bar (kiri) |

### Key Design Characteristics

```
Theme:        DARK (gray-950 → gray-900 gradient)
Accent:       Blue (#2563eb / blue-600)
Highlight:    Blue-400 (#60a5fa) untuk text accent
Background:   Canvas particle animation + gradient overlay
Cards:        bg-gray-800/50, border-gray-700, hover:border-blue-500/50
Tags/Badges:  bg-blue-500/10, text-blue-400, border-blue-500/30 (pill-shaped)
Typography:   Inter + Fira Code (mono), sans-serif
Navigation:   Pill-shaped glassmorphic navbar (bg-gray-900/40 backdrop-blur-md)
Scroll:       Smooth (Lenis library), progress indicator di atas
```

---

## 2. Arsitektur & File Structure

```
Portfolio_Indra_Sugara/
├── index.html                  # Halaman utama (single page, multi-section)
├── style.css                   # Design system + semua styling
├── app.js                      # Logic utama (navigation, tabs, scroll, animations)
├── particles.js                # Canvas particle animation background
├── chat.js                     # AI chatbot logic (LLM integration)
├── data.json                   # Data portfolio (editable tanpa coding)
├── system-prompt.md            # System prompt untuk LLM (persona Indra)
├── claude.md                   # Dokumen breakdown ini
│
├── api/                        # Serverless proxy untuk LLM API
│   └── chat.js                 # Vercel/Netlify serverless function
│
├── assets/
│   ├── profile.jpg             # Foto profil
│   ├── favicon.svg             # Favicon
│   ├── resume.pdf              # Resume/CV download
│   ├── icons/                  # Ikon teknologi (svg/png/webp)
│   │   ├── react-icon.png
│   │   ├── nodejs-icon.png
│   │   ├── flutter-icon.png
│   │   ├── dart-icon.png
│   │   └── ...
│   ├── projects/               # Screenshot project
│   │   ├── project-1.jpg
│   │   ├── project-2.jpg
│   │   └── ...
│   └── certs/                  # Certificate images
│       └── ...
│
└── .env.example                # Template environment variables
```

### Alur Kerja Keseluruhan

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER                                │
│                                                               │
│  ┌─ index.html ─────────────────────────────────────────┐    │
│  │                                                       │    │
│  │  <canvas>  ←── particles.js (animated background)     │    │
│  │                                                       │    │
│  │  [Fixed Navbar]  ←── app.js (scroll spy, smooth nav)  │    │
│  │  [Scroll Progress Bar]                                │    │
│  │                                                       │    │
│  │  Section: Hero                                        │    │
│  │  Section: About        ←── data.json (populate DOM)   │    │
│  │  Section: Skills                                      │    │
│  │  Section: Projects                                    │    │
│  │  Section: Experience                                  │    │
│  │  Section: Achievements                                │    │
│  │  Section: Contact                                     │    │
│  │  Footer                                               │    │
│  │                                                       │    │
│  │  [FAB: AI Chat]  ←── chat.js                          │    │
│  └───────────────────────────────────────────────────────┘    │
│                            │                                  │
│                            │ User sends message               │
│                            ▼                                  │
│  ┌─ /api/chat ──────────────────────────────────────────┐    │
│  │  Serverless Proxy                                     │    │
│  │  - Adds API key                                       │    │
│  │  - Injects system prompt + data.json context          │    │
│  │  - Forwards to DeepSeek / OpenRouter                  │    │
│  │  - Streams response back                              │    │
│  └───────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Design System

### 3.1 Color Palette

```css
:root {
  /* ─── Backgrounds ─── */
  --bg-body: #030712;              /* gray-950 — canvas/body bg */
  --bg-main: linear-gradient(to bottom, #030712, #111827); /* gray-950 → gray-900 */
  --bg-section-alt: #030712;       /* Alternating section bg */
  --bg-card: rgba(31, 41, 55, 0.5);  /* gray-800/50 */
  --bg-card-solid: #1f2937;       /* gray-800 */
  --bg-card-inner: rgba(31, 41, 55, 0.3); /* gray-800/30 */
  --bg-navbar: rgba(17, 24, 39, 0.4);  /* gray-900/40 */
  --bg-badge: rgba(59, 130, 246, 0.1); /* blue-500/10 */
  --bg-skill-icon: rgba(59, 130, 246, 0.1);
  --bg-project-black: #000000;

  /* ─── Text ─── */
  --text-white: #ffffff;
  --text-gray-300: #d1d5db;
  --text-gray-400: #9ca3af;
  --text-gray-500: #6b7280;
  --text-blue-400: #60a5fa;        /* Accent text */
  --text-blue-500: #3b82f6;        /* Greeting text */
  --text-green-400: #4ade80;       /* Scroll indicator */

  /* ─── Accent / CTA ─── */
  --blue-600: #2563eb;             /* Primary CTA bg */
  --blue-700: #1d4ed8;             /* CTA hover */
  --blue-500: #3b82f6;
  --blue-400: #60a5fa;

  /* ─── Borders ─── */
  --border-card: #374151;          /* gray-700 */
  --border-card-hover: rgba(59, 130, 246, 0.5); /* blue-500/50 */
  --border-nav: rgba(255, 255, 255, 0.1);
  --border-badge: rgba(59, 130, 246, 0.3);
  --border-project: rgba(255, 255, 255, 0.3);

  /* ─── Shadows ─── */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-glow: 0 0 60px rgba(59, 130, 246, 0.2); /* Blue glow behind profile */

  /* ─── Spacing ─── */
  --section-py: 5rem;  /* py-20 */
  --container-px: 1rem;
  --gap-grid: 3rem;    /* gap-12 */

  /* ─── Radius ─── */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
}
```

### 3.2 Typography

```css
/* Google Fonts: Inter (body) + Fira Code (mono elements) */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--text-white);
  -webkit-font-smoothing: antialiased;
}

code, .font-mono {
  font-family: 'Fira Code', monospace;
}

/* Typography Scale */
.text-hero     { font-size: clamp(2rem, 5vw, 3.75rem); font-weight: 700; line-height: 1.1; }
.text-subtitle { font-size: clamp(1.25rem, 2.5vw, 1.5rem); font-weight: 600; }
.text-section  { font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 700; }
.text-card-title { font-size: 1.125rem; font-weight: 700; }
.text-body     { font-size: 1rem; font-weight: 400; color: var(--text-gray-300); }
.text-small    { font-size: 0.875rem; font-weight: 500; }
.text-xs       { font-size: 0.75rem; font-weight: 600; }

/* Gradient text (used for section titles & subtitles) */
.text-gradient {
  background: linear-gradient(135deg, var(--blue-400), var(--blue-600));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 3.3 Component Primitives

```css
/* ─── Card ─── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-lg);
  transition: border-color 0.3s, transform 0.3s;
}
.card:hover {
  border-color: var(--border-card-hover);
}

/* ─── Badge / Tag ─── */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--bg-badge);
  color: var(--text-blue-400);
  border: 1px solid var(--border-badge);
  transition: background 0.2s;
}
.badge:hover {
  background: rgba(59, 130, 246, 0.2);
}

/* ─── Button Primary ─── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--blue-600);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover { background: var(--blue-700); }

/* ─── Button Outline ─── */
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: transparent;
  color: var(--text-blue-400);
  border: 1px solid var(--blue-600);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-outline:hover { background: rgba(37, 99, 235, 0.1); }

/* ─── Glassmorphic Navbar ─── */
.navbar-glass {
  background: var(--bg-navbar);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-nav);
  border-radius: var(--radius-full);
  padding: 0.25rem;
}
```

---

## 4. Sections & Komponen UI

### 4.0 Global Elements

#### Fixed Navbar (Top)

```
┌────────────────────────────────────────────────────────────────────┐
│  [Indra Sugara]                    [Home|About|Skills|Projects|   │
│   (logo/name)                       Experience|Contact]           │
│                                     (glassmorphic pill tabs)      │
│                                                        [☰] mobile│
└────────────────────────────────────────────────────────────────────┘
```

- **Fixed position** di atas, z-50
- Scroll spy: highlight tab aktif berdasarkan section yang terlihat
- Mobile: hamburger menu → slide-in nav
- Background: transparan saat di top, glassmorphic saat scroll

#### Scroll Progress Bar

```
┌──────────────────────────────────────────────────────┐
│  ➜ 25%  [████████░░░░░░░░░░░░░░] {about me_}  75%  │
└──────────────────────────────────────────────────────┘
```

- Fixed di atas (di bawah navbar)
- Mono font (Fira Code)
- Shows: progress %, current section name, remaining %
- Blue gradient fill bar
- Muncul setelah scroll melewati hero

#### Canvas Particle Background

- Fixed canvas behind all content
- Subtle animated particles (dots, lines connecting nearby dots)
- Warna: putih/abu-abu tipis (opacity ~0.1–0.3)
- Responds to mouse: particles drift toward cursor
- Mobile: fewer particles for performance

#### Floating AI Chat Button (FAB)

```
┌──────────────────────┐
│ 😊 Know more about me│  ← Bottom-right corner, fixed
└──────────────────────┘
```

---

### 4.1 Section: Hero (Intro)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Hey, I'm Indra                    ┌──────────────────┐   │
│                                    │                  │   │
│  Full Stack Developer|             │   [Profile Pic]  │   │
│  (typing animation)               │                  │   │
│                                    │   (rounded-2xl   │   │
│  Engineer across Web,              │    border glow)  │   │
│  Mobile, and Cloud Systems         └──────────────────┘   │
│                                                            │
│  I enjoy building practical,                               │
│  high-impact solutions...                                  │
│                                                            │
│  [Get in Touch →] [⬇ Download Resume]                      │
│                                                            │
│  [GitHub] [LinkedIn] [Instagram] [Email]                   │
│                                                            │
│                    ↓ (bouncing arrow)                       │
└────────────────────────────────────────────────────────────┘
```

**Details:**
- Grid 2-kolom (lg): teks kiri, foto kanan
- Mobile: foto atas, teks bawah
- Typing animation: rotate antara "Full Stack Developer", "Mobile Developer", "Cloud Engineer", "Problem Solver"
- Profile pic: rounded-2xl, bg-gray-800/50, border-gray-700, blue glow behind (blur-3xl)
- Social links: icon-only, rounded-full, hover:bg-white/10
- Scroll indicator: bouncing arrow button di bottom center

---

### 4.2 Section: About ("My Professional Side")

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│              ✦ My Professional Side                        │
│                                                            │
│  ┌─────────────────────────┐  ┌────────────────────────┐  │
│  │ Bio paragraph...        │  │ Education              │  │
│  │                         │  │                        │  │
│  │ 📧 Email: xxx           │  │ ┌────────────────────┐ │  │
│  │ 📍 Location: Indonesia  │  │ │ S1 Informatika     │ │  │
│  │ 🎓 Education: S1 IF     │  │ │ Universitas XXX    │ │  │
│  │                         │  │ │ 2020 - 2024        │ │  │
│  │ Core Areas:             │  │ │ GPA: 3.XX          │ │  │
│  │ [Web Dev] [Mobile Dev]  │  │ └────────────────────┘ │  │
│  │ [Cloud] [Backend APIs]  │  │                        │  │
│  │ [Flutter] [React]       │  │ ┌────────────────────┐ │  │
│  └─────────────────────────┘  │ │ SMA ...            │ │  │
│                                │ └────────────────────┘ │  │
│                                └────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**Details:**
- Section title: gradient text
- Grid 2-kolom: kiri = info card (bg-gray-800, border-gray-700, rounded-lg), kanan = education cards
- Info items: icon (blue-400) + label + value
- Core Areas: blue badge/tags (pill-shaped)
- Education cards: bg-gray-800/50, border-gray-700, hover:border-blue-500/50

---

### 4.3 Section: Skills

```
┌────────────────────────────────────────────────────────────┐
│                    ✦ Skills                                │
│                                                            │
│  ┌──────────┬──────────┬──────────┬──────────┐            │
│  │Languages │ Frontend │ Backend  │ Cloud    │ ← Tabs     │
│  │ (active) │          │          │          │            │
│  └──────────┴──────────┴──────────┴──────────┘            │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Programming Languages                              │  │
│  │                                                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │ [icon]   │ │ [icon]   │ │ [icon]   │ │ [icon] │ │  │
│  │  │ Dart     │ │ JS       │ │ Python   │ │ Java   │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │          AI & Developer Tooling                     │  │
│  │  [Git] [GitHub] [Postman] [Firebase] [Docker]       │  │ ← rounded pill tags
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**Details:**
- Tab bar: grid 2x2 (mobile) / 4-kolom (desktop), bg-gray-800/50, active = bg-blue-600
- Tab content: card dengan skill cards di dalamnya (grid 2x2 / 4-kolom)
- Skill card: bg-gray-800/50, border-gray-700, rounded icon (bg-blue-500/10), hover border blue
- AI & Developer Tooling: pill tags di bawah

---

### 4.4 Section: Projects ("Stuff I Built")

```
┌────────────────────────────────────────────────────────────┐
│                  Stuff I Built                             │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  ╔═══════════════════════════╗  │ ▎Project Name    │  │
│  │  ║                           ║  │ [Check out →]    │  │
│  │  ║   [Project Screenshot]    ║  │                  │  │
│  │  ║   (gradient bg)           ║  │ Description...   │  │
│  │  ║   (slightly rotated)      ║  │                  │  │
│  │  ╚═══════════════════════════╝  │ ✦ Feature 1      │  │
│  │                                 │ ✦ Feature 2      │  │
│  │                                 │ ✦ Feature 3      │  │
│  │                                 │                  │  │
│  │                                 │ [React] [Node]   │  │
│  │                                 │ [MongoDB] [AWS]  │  │ ← tech badges with icons
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  (repeat for each project, alternating layout)             │
└────────────────────────────────────────────────────────────┘
```

**Details:**
- Setiap project: full-width container, 2-kolom (screenshot kiri | info kanan)
- Screenshot side: gradient background (radial-gradient), gambar sedikit rotated (rotate-2)
- Info side: title + "Check out" button, description, feature bullet points (✦ icon), tech stack badges
- Tech badges: bg-gray-950, border-white/20, icon + text
- Custom cursor: "VIEW DETAILS • VIEW DETAILS •" spinning circle cursor saat hover project image
- Alternating: project genap = layout terbalik

---

### 4.5 Section: Experience ("Work Experience")

```
┌────────────────────────────────────────────────────────────┐
│               ✦ Work Experience                            │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ React Developer Intern                              │  │
│  │ Company Name                              2024      │  │
│  │                                                     │  │
│  │ Description of responsibilities and                 │  │
│  │ achievements during the internship...               │  │
│  │                                                     │  │
│  │ [📄 Experience Certificate]  ← opens modal          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  (repeat for each experience)                              │
└────────────────────────────────────────────────────────────┘
```

**Details:**
- Cards: bg-gray-800/50, border-gray-700
- Role = bold white, Company = blue-400, Year = gray-400
- "Experience Certificate" button: opens modal with certificate image + download

---

### 4.6 Section: Achievements & Certifications

```
┌────────────────────────────────────────────────────────────┐
│           ✦ Achievements & Certifications                  │
│                                                            │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │ 🏆 Hackathon  │  │ 📜 Cert Name  │  │ 📜 Cert Name  │  │
│  │ Winner        │  │ Issuer        │  │ Issuer        │  │
│  │ Event Name    │  │ Year          │  │ Year          │  │
│  │ Year          │  │ [View →]      │  │ [View →]      │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

### 4.7 Section: Contact ("Say Hi, Don't Be Shy")

```
┌────────────────────────────────────────────────────────────┐
│              ✦ Say Hi, Don't Be Shy                        │
│                                                            │
│  ┌────────────────────┐  ┌──────────────────────────────┐ │
│  │ Contact Info        │  │ Contact Form                 │ │
│  │                     │  │                              │ │
│  │ 📧 email@mail.com   │  │ [Your Name          ]       │ │
│  │ 📱 +62 xxx          │  │ [Your Email         ]       │ │
│  │ 📍 Indonesia →Maps  │  │ [Subject            ]       │ │
│  │                     │  │ [Message...         ]       │ │
│  │ Connect With Me:    │  │                              │ │
│  │ [GH] [LI] [IG]     │  │ [Send Message →]             │ │
│  └────────────────────┘  └──────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

**Details:**
- Grid 2-kolom (desktop), stack (mobile)
- Contact info: icon-based items
- Form: dark inputs (bg-gray-800/50, border-gray-700, focus:border-blue-500)
- "Send Message" button: btn-primary
- Form submission: bisa ke Formspree / EmailJS (gratis)

---

### 4.8 Footer

```
┌────────────────────────────────────────────────────────────┐
│  © 2025 Indra Sugara. All rights reserved.                 │
│  Built with ❤️                                             │
│  [GitHub] [LinkedIn] [Instagram]                           │
└────────────────────────────────────────────────────────────┘
```

---

## 5. AI Chatbot — "Ask Me Anything"

### 5.1 UI: Floating Chat Drawer

```
                                    ┌──────────────────────┐
                                    │ 😊 Know more about me│ ← FAB (fixed, bottom-right)
                                    └──────────────────────┘

  Saat diklik, buka drawer dari kanan:

  ┌─────────────────────────────────────────────┐
  │  💬 Chat with Indra's AI              [×]   │ ← Header
  ├─────────────────────────────────────────────┤
  │                                             │
  │  ┌─────────────────────────────┐            │
  │  │ 👋 Halo! Saya AI assistant │ ← Bot msg  │
  │  │ dari Indra. Tanya apapun!  │            │
  │  └─────────────────────────────┘            │
  │                                             │
  │  Suggested:                                 │
  │  [Ceritakan tentang diri kamu]              │
  │  [Apa project terbaru kamu?]                │
  │  [Tech stack apa yang kamu kuasai?]         │
  │                                             │
  │                ┌───────────────┐             │
  │                │ User message  │ ← User msg │
  │                └───────────────┘             │
  │                                             │
  │  ┌─────────────────────────────┐            │
  │  │ Bot streaming response...  │ ← Bot msg  │
  │  │ ████████░░░░░░ (typing)    │            │
  │  └─────────────────────────────┘            │
  │                                             │
  ├─────────────────────────────────────────────┤
  │  [Type a message...               ] [Send]  │ ← Input bar
  └─────────────────────────────────────────────┘
```

### 5.2 LLM Provider Strategy

| # | Provider      | Model                  | Harga                              | Kelebihan                                    |
|---|---------------|------------------------|------------------------------------|----------------------------------------------|
| 1 | **DeepSeek**  | `deepseek-v4-flash`    | $0.14/1M input, $0.28/1M output    | Sangat murah, kualitas bagus, Bahasa Indonesia OK |
| 2 | **OpenRouter** | `openrouter/free`      | Gratis (rate limited)              | Banyak model, fallback otomatis              |
| 3 | **Groq**      | `llama-3.3-70b`        | Gratis (rate limited)              | Ultra cepat (300+ tok/s)                     |

**Primary**: DeepSeek v4-flash (~$1 untuk 10,000+ percakapan)
**Fallback**: OpenRouter free models

### 5.3 System Prompt Design

```markdown
Kamu adalah AI digital twin dari Indra Sugara — seorang Full Stack Developer.
Kamu menjawab pertanyaan pengunjung portfolio tentang Indra dengan ramah,
profesional, dan informatif.

## Aturan:
1. Jawab HANYA berdasarkan data yang diberikan di bawah. Jangan mengarang.
2. Jika ditanya sesuatu yang tidak ada di data, bilang: "Maaf, saya tidak
   punya informasi tentang itu. Silakan hubungi Indra langsung."
3. Jawab dalam bahasa yang sama dengan pertanyaan (Indonesia/English).
4. Jaga jawaban singkat dan to the point (maks 3 paragraf).
5. Gunakan emoji secukupnya untuk kesan friendly.
6. Jangan pernah mengaku sebagai manusia — kamu adalah AI assistant.

## Data Portfolio Indra:
{DATA_JSON_CONTENT_INJECTED_HERE}
```

### 5.4 Architecture

```
Browser (chat.js)
    │
    │ POST /api/chat { messages: [...] }
    ▼
Serverless Proxy (api/chat.js)
    │
    │ 1. Load data.json
    │ 2. Build system prompt + inject data
    │ 3. Add Authorization header
    │ 4. Forward to DeepSeek API (stream: true)
    ▼
DeepSeek API → SSE stream → Proxy → Browser
    │
    │ Fallback: if DeepSeek fails → try OpenRouter
    │ Fallback: if all fail → show offline message
    ▼
Chat UI renders streaming response character by character
```

### 5.5 Serverless Proxy Pseudocode (`api/chat.js`)

```javascript
export default async function handler(req, res) {
  const { messages } = req.body;

  const portfolioData = await fetch(SELF_URL + '/data.json').then(r => r.json());
  const systemPrompt = buildSystemPrompt(portfolioData);

  // Rate limit: max 10 req/min per IP
  if (isRateLimited(req)) return res.status(429).json({ error: 'Too many requests' });

  try {
    // Try DeepSeek first
    const response = await callLLM('deepseek', systemPrompt, messages);
    streamToClient(response, res);
  } catch {
    try {
      // Fallback to OpenRouter
      const response = await callLLM('openrouter', systemPrompt, messages);
      streamToClient(response, res);
    } catch {
      res.status(503).json({ error: 'AI is currently unavailable' });
    }
  }
}
```

---

## 6. Data Layer (data.json)

### Skema Lengkap

```jsonc
{
  // ─── PROFIL ───────────────────────────────────
  "name": "Indra Sugara",
  "greeting": "Hey, I'm Indra",
  "title": "Full Stack Developer",
  "subtitle": "Engineer across Web, Mobile, and Cloud Systems",
  "typing_roles": ["Full Stack Developer", "Mobile Developer", "Cloud Engineer", "Problem Solver"],
  "bio": "I enjoy building practical, high-impact solutions across product layers...",
  "avatar": "assets/profile.jpg",
  "resume_url": "assets/resume.pdf",
  "location": "Indonesia",
  "email": "indra@example.com",
  "phone": "+62 xxx xxxx xxxx",

  // ─── SOCIAL LINKS ────────────────────────────
  "social": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "instagram": "https://instagram.com/username",
    "email": "mailto:indra@example.com"
  },

  // ─── CORE AREAS (tags di About section) ───────
  "core_areas": [
    "Full-Stack Web Development",
    "Mobile Development (Flutter)",
    "Backend APIs",
    "Cloud Deployment",
    "React + Next.js",
    "Node.js + Express",
    "TypeScript",
    "PostgreSQL"
  ],

  // ─── EDUCATION ────────────────────────────────
  "education": [
    {
      "degree": "S1 Teknik Informatika",
      "institution": "Universitas XXX",
      "period": "2020 - 2024",
      "score": "IPK: 3.XX/4.00"
    }
  ],

  // ─── SKILLS ───────────────────────────────────
  "skills": {
    "programming": [
      { "name": "Dart", "icon": "assets/icons/dart-icon.png" },
      { "name": "JavaScript", "icon": "assets/icons/javascript-icon.webp" },
      { "name": "TypeScript", "icon": "assets/icons/typescript-icon.svg" },
      { "name": "Python", "icon": "assets/icons/python-icon.png" }
    ],
    "frontend": [
      { "name": "Flutter", "icon": "assets/icons/flutter-icon.png" },
      { "name": "React", "icon": "assets/icons/react-icon.png" },
      { "name": "Next.js", "icon": "assets/icons/nextjs-icon.svg" },
      { "name": "Tailwind CSS", "icon": "assets/icons/tailwind-icon.svg" },
      { "name": "HTML", "icon": "assets/icons/html-icon.webp" },
      { "name": "CSS", "icon": "assets/icons/css-icon.webp" }
    ],
    "backend": [
      { "name": "Node.js", "icon": "assets/icons/nodejs-icon.png" },
      { "name": "Express.js", "icon": "assets/icons/express-icon.png" },
      { "name": "PostgreSQL", "icon": "assets/icons/postgresql-icon.png" },
      { "name": "MongoDB", "icon": "assets/icons/mongodb-icon.webp" },
      { "name": "Redis", "icon": "assets/icons/redis-icon.png" }
    ],
    "cloud": [
      { "name": "AWS", "icon": "assets/icons/aws-icon.webp" },
      { "name": "Docker", "icon": "assets/icons/docker-icon.png" },
      { "name": "Vercel", "icon": "assets/icons/vercel-icon.svg" },
      { "name": "Firebase", "icon": "assets/icons/firebase-icon.png" }
    ],
    "tools": ["Git", "GitHub", "Postman", "VS Code", "Figma", "Firebase", "Docker"]
  },

  // ─── PROJECTS ─────────────────────────────────
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description of the project.",
      "features": [
        "Feature/detail point 1",
        "Feature/detail point 2",
        "Feature/detail point 3"
      ],
      "image": "assets/projects/project-1.jpg",
      "gradient": "radial-gradient(circle, #6a5acd, #6a5acd, #14235c)",
      "tech_stack": [
        { "name": "React", "icon": "assets/icons/react-icon.png" },
        { "name": "Node.js", "icon": "assets/icons/nodejs-icon.png" }
      ],
      "live_url": "https://project.com",
      "github_url": "https://github.com/user/project"
    }
  ],

  // ─── EXPERIENCE ───────────────────────────────
  "experience": [
    {
      "role": "Full Stack Developer Intern",
      "company": "Company Name",
      "period": "Jan 2024 - Jun 2024",
      "description": "What I did at this company...",
      "certificate_image": "assets/certs/cert-1.jpg"
    }
  ],

  // ─── ACHIEVEMENTS ─────────────────────────────
  "achievements": [
    {
      "title": "Hackathon Winner",
      "event": "Hackathon Name 2025",
      "type": "achievement",
      "icon": "trophy"
    },
    {
      "title": "AWS Certified Developer",
      "event": "Amazon Web Services",
      "type": "certification",
      "icon": "certificate",
      "url": "https://..."
    }
  ],

  // ─── AI CHAT CONFIG ───────────────────────────
  "chat": {
    "welcome_message": "Halo! 👋 Saya AI assistant dari Indra. Tanya apapun tentang skill, project, atau pengalaman saya!",
    "suggested_questions": [
      "Ceritakan tentang diri kamu",
      "Apa project terbaru kamu?",
      "Tech stack apa yang kamu kuasai?",
      "Bagaimana cara menghubungi kamu?",
      "Apa pengalaman kerja kamu?"
    ]
  }
}
```

### Cara Edit Data

Cukup edit `data.json` — TIDAK perlu sentuh HTML/CSS/JS:

```bash
code data.json   # atau editor apapun
```

---

## 7. Animasi & Interaksi

### 7.1 Canvas Particle Background (`particles.js`)

- Animated dots + connecting lines (saat jarak < threshold)
- Warna: white, opacity ~0.1–0.3
- Mouse interaction: particles attracted to cursor
- Performance: auto-pause saat tab inactive, reduce count di mobile
- Fallback: static gradient jika canvas not supported

### 7.2 Scroll Animations (IntersectionObserver)

| Element             | Animation                                    | Trigger           |
|---------------------|----------------------------------------------|--------------------|
| Section titles      | Fade in + slide up (translateY 20px → 0)      | Enter viewport     |
| Cards               | Fade in + slide up, staggered (delay +100ms)  | Enter viewport     |
| Skill cards         | Fade in + slide up, staggered per card        | Tab switch / enter |
| Project blocks      | Fade in from side (left/right alternating)    | Enter viewport     |
| Hero elements       | Sequenced: greeting → title → description     | Page load          |
| Profile pic         | Scale in + fade                               | Page load          |
| Badges/tags         | Fade in + scale, staggered                    | Enter viewport     |

### 7.3 Typing Animation (Hero)

```javascript
// Rotates through: "Full Stack Developer" → "Mobile Developer" → "Cloud Engineer" → ...
// Type character by character, pause, delete, repeat
const roles = data.typing_roles;
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
// Type speed: 80ms, Delete speed: 40ms, Pause between: 2000ms
```

### 7.4 Smooth Scroll (Lenis-like)

```javascript
// Custom smooth scroll implementation
// - Navbar links → smooth scroll to section
// - Scroll spy → highlight active nav tab
// - Progress bar → update fill width + section name
```

### 7.5 Tab Switching (Skills)

```javascript
// Active tab: bg-blue-600, text-white
// Inactive: bg-transparent, text-gray-300
// Content: fade-in animation on switch
// Grid content updates based on active tab
```

### 7.6 Micro-interactions

| Element              | Trigger | Effect                                       |
|----------------------|---------|----------------------------------------------|
| Card                 | Hover   | border-color → blue-500/50                   |
| Button primary       | Hover   | bg: blue-600 → blue-700                      |
| Social icon          | Hover   | bg-white/10, color: gray-400 → white         |
| Badge/tag            | Hover   | bg-blue-500/10 → blue-500/20                 |
| Nav tab              | Active  | Sliding highlight indicator                   |
| Project "Check out"  | Hover   | Arrow icon: slide-out + slide-in animation   |
| Project image        | Hover   | scale(1.02), custom cursor                   |
| Chat FAB             | Hover   | Scale up, shadow increase                    |
| Form input           | Focus   | border: gray-700 → blue-500                  |
| Scroll arrow (hero)  | Idle    | Infinite bounce animation                    |

---

## 8. Deployment Strategy

### Hosting: Vercel (Recommended)

| Feature              | Vercel Free Tier |
|----------------------|------------------|
| Static hosting       | ✅ Unlimited     |
| Serverless functions | ✅ (api/ folder)  |
| Custom domain        | ✅                |
| HTTPS                | ✅ Auto           |
| CI/CD                | ✅ GitHub push    |
| Bandwidth            | 100 GB/month     |

### Environment Variables

```bash
# .env.example
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxxxxxxxxxxxxx
```

Set via Vercel Dashboard → Settings → Environment Variables.

### Deploy Steps

```
1. git init + push ke GitHub
2. Import repo di vercel.com
3. Set env vars di dashboard
4. Deploy (auto)
5. (Optional) Custom domain: indrasugara.com
```

---

## 9. Milestone & Task Breakdown

### Phase 1: Foundation ⏱️ ~2-3 jam

- [ ] Setup file structure lengkap
- [ ] `style.css` — Design system (variables, typography, components)
- [ ] `index.html` — Semua section structure (Hero → Footer)
- [ ] `data.json` — Template data placeholder
- [ ] Google Fonts import (Inter + Fira Code)
- [ ] Favicon + SEO meta tags
- [ ] Canvas particle background (`particles.js`)

### Phase 2: Sections & Content ⏱️ ~3-4 jam

- [ ] Hero section (2-column, typing animation, CTAs, social links)
- [ ] About section (info card + education cards)
- [ ] Skills section (tab interface + skill grid cards)
- [ ] Projects section (immersive project cards + tech badges)
- [ ] Experience section (timeline cards)
- [ ] Achievements section (cert/award cards)
- [ ] Contact section (info + contact form)
- [ ] Footer

### Phase 3: Navigation & Animations ⏱️ ~2-3 jam

- [ ] Fixed glassmorphic navbar (desktop + mobile hamburger)
- [ ] Scroll progress bar (mono font)
- [ ] Scroll spy (active tab highlighting)
- [ ] Smooth scroll behavior
- [ ] IntersectionObserver animations (fade-in, slide-up)
- [ ] Typing animation (hero roles)
- [ ] `app.js` — Data loader (fetch data.json → populate DOM)

### Phase 4: AI Chatbot ⏱️ ~2-3 jam

- [ ] Chat drawer UI (FAB + slide-in panel)
- [ ] `chat.js` — Frontend chat logic + streaming
- [ ] `system-prompt.md` — Persona Indra
- [ ] `api/chat.js` — Serverless proxy (DeepSeek + OpenRouter fallback)
- [ ] Suggested questions
- [ ] Error handling + offline message
- [ ] Rate limiting
- [ ] Loading indicator / typing animation

### Phase 5: Polish & Deploy ⏱️ ~1-2 jam

- [ ] Generate/place profile photo
- [ ] Generate/place project screenshots
- [ ] Download tech stack icons
- [ ] Mobile responsive testing
- [ ] Cross-browser testing
- [ ] Performance audit (Lighthouse)
- [ ] `.env.example` + README
- [ ] Deploy ke Vercel
- [ ] Custom domain (opsional)

---

## Catatan Teknis

### Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Browser Support

Chrome 90+, Firefox 90+, Safari 15+, Edge 90+, Mobile browsers ✅

### Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Total Bundle Size | < 150KB (excl. images) |

### Security

1. API key NEVER di client-side
2. Rate limiting di proxy (10 req/min/IP)
3. Input sanitization (XSS prevention)
4. CSP headers
5. CORS: only allow own origin
