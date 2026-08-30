# 🖥️ CloudDesk — Personal Computer in the Cloud

> **"Your Computer. In The Cloud."**
> A fully-featured, authentic late-90s/early-2000s personal virtual desktop environment built with modern cloud architecture.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Storage-green?logo=supabase)](https://supabase.com/)

---

## 🌟 Highlights & Features

### 🪟 Authentic Retro Desktop Experience
- **Pixelated Bliss Wallpaper**: Iconic rolling hills with customizable retro wallpapers (Classic Teal, Pixel Hills, Retro Matrix, Starry Slate, Purple Dusk, or custom uploaded image).
- **Classic 36px Taskbar**: High-visibility taskbar with 4-color Windows waving flag Start button, Quick Launch toolbar (6 shortcuts), window buttons with active states, and live System Tray.
- **Live System Tray**: Features Drive Sync indicator, virtual Ethernet activity monitor, volume mute/unmute control, and clickable digital Clock with interactive calendar popup.
- **Window Management**: Window drag & drop, resize, maximize/restore, minimize, taskbar right-click with **Cascade Windows**, **Tile Horizontally**, **Tile Vertically**, and **Minimize All**.
- **Keyboard Shortcuts**: `Ctrl+Esc` / `Win` to toggle Start Menu, `Alt+F4` to close active window, `Ctrl+S` to save files in Notepad, `Ctrl+A` / `Del` / `F2` in File Explorer.

### 📁 Real Cloud Filesystem (Google Drive Style)
- **Folder Navigation & Hierarchies**: Documents, Downloads, Pictures, Music, with path breadcrumb bar and sidebar tree navigation.
- **Drag-and-Drop & Multi-File Upload**: Drag files directly from your physical operating system onto the Desktop canvas or into File Explorer.
- **File Management**: Create folders, rename (`F2`), cut/copy/paste (`Ctrl+X`, `Ctrl+C`, `Ctrl+V`), move via drag-and-drop, delete to Recycle Bin.
- **Recycle Bin**: Soft-delete items to Recycle Bin with full restore capability or permanent empty bin.
- **Sort & Organize**: Right-click Desktop or File Explorer column headers to arrange icons by Name, Type, Size, or Date.

### 🧰 Full Suite of Built-in Retro Applications
1. **MS-DOS Command Prompt (`cmd.exe`)**: CRT-style terminal with authentic commands (`DIR`, `CD`, `MKDIR`, `TYPE`, `DEL`, `REN`, `IPCONFIG`, `PING`, `SYSTEMINFO`, `CALC`, `COLOR`, `CLS`, `HELP`).
2. **Notepad**: Text editor with file save/save-as to cloud, dirty-state indicators, character/word counters, and hotkeys.
3. **Paint**: Bitmap graphics editor with pencil, brush, eraser, line, shapes, color palette, and canvas export.
4. **Media Player**: Vintage media player with audio visualizer, playlist, and audio playback.
5. **Calculator**: Classic standard pocket calculator with memory registers and keyboard input support.
6. **World Wide Web Browser**: Internet Explorer style browser with address navigation, bookmarks, and simulated retro browsing.
7. **CloudDesk Mail**: Retro email client with Inbox, Sent, Drafts, and email composition.
8. **PDF Viewer**: Document viewer for reading uploaded PDF files.
9. **Image & Photo Viewer**: Full-screen photo viewer for JPG, PNG, GIF, BMP, and SVG files.
10. **Storage Info**: Drive (C:) properties monitor with segmented gauge displaying cloud storage quota and disk usage.
11. **Control Panel / Settings**: Display settings for wallpaper presets, custom wallpaper upload, icon sizes, and system sounds.
12. **Find Files / Search**: Fast keyword search across all cloud files.
13. **Help & Support**: Windows Help viewer with guides, documentation, and troubleshooting topics.

---

## 🔒 Cloud Storage Architecture & Privacy

| Component | Technology | Description |
|---|---|---|
| **File Metadata** | PostgreSQL (Supabase) | Tracks file tree (`parent_id`), names, mime types, sizes, and timestamps |
| **File Bytes** | Supabase Storage (S3-compatible) | Secure encrypted cloud storage in private bucket `user-files` |
| **Authentication** | Supabase SSR Auth | Email & Password authentication with session cookies |
| **Data Privacy** | Row-Level Security (RLS) | Database-enforced isolation ensuring users only access their own files |
| **Guest Mode** | In-Memory Virtual FS | Instant sandbox for visitors without requiring immediate sign up |

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/clouddesk.git
cd clouddesk
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Setup Database & Storage
1. Open your **Supabase Dashboard → SQL Editor**.
2. Run the SQL script from [`supabase-schema.sql`](supabase-schema.sql).
3. Open **Storage → Create Bucket**:
   - Bucket name: `user-files`
   - Public: **Disabled** (Private)
   - Max file size: `100MB`

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment

### Deploy to Vercel (Recommended)
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `clouddesk` repository.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**!

---

## 📜 License
MIT License. Created with passion for retro computing and modern cloud web applications.
