# ☁️ Cinnamoroll Tasks — Desktop Productivity App

> A soft-aesthetic, draggable desktop to-do list & productivity widget inspired by Sanrio's Cinnamoroll. Built with React, TypeScript, Tailwind CSS, Framer Motion, and packaged with Electron.js.

---

## ✨ Features

- ☁️ **Full Dashboard & Floating Widget Modes**: Toggle seamlessly between an expanded dashboard and a compact, draggable on-screen floating widget.
- 📌 **Always-on-Top / Draggable**: Pin the mini widget anywhere on your desktop while studying or working.
- 🔁 **Repeatable Daily Routines**: Create daily habits that refresh automatically.
- ⏰ **Smart Reminders & Time Tracking**: Set due times, reminders, and prioritize tasks.
- 💾 **Persistent Local Storage**: Tasks and window states are saved automatically.
- 🎨 **Cinnamoroll Aesthetic UI**: Soft pastel blues, rounded friendly cards, smooth animations, and sound toggles.
- 🚀 **Auto Launch on Startup**: Electron native boot launch configuration (`setLoginItemSettings`).

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & Motion**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion / Motion](https://motion.dev/), [Lucide React](https://lucide.dev/)
- **Desktop Runtime**: [Electron.js](https://www.electronjs.org/) & [electron-builder](https://www.electron.build/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/USERNAME/cinnamoroll-tasks.git
cd cinnamoroll-tasks
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development web server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Run as Desktop App (Electron)
```bash
npm run electron:start
```

### 5. Build Desktop Installer (.exe)
```bash
npm run pack:win
```
The output setup file will be generated in the `release/` folder.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
*(Cinnamoroll is a character owned by Sanrio. This project is a non-commercial fan-made productivity application).*
