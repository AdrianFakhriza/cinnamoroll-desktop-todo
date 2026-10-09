# Cinnamoroll To-Do List - Electron Guide

Panduan ini berisi struktur folder dan kode setup Electron (`main.js`) untuk membuat aplikasi desktop frameless dengan fitur auto-start dan minimize to floating icon.

## 1. Struktur Folder Project

Untuk menggabungkan React (Vite) dan Electron, struktur foldernya disarankan seperti ini:

```text
my-cinnamoroll-todo/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── assets/
│   ├── Header.jpeg       <-- Gambar header untuk UI React
│   └── Icon.jpeg         <-- Gambar floating icon untuk UI React
├── electron/
│   ├── main.js           <-- Entry point untuk Electron
│   └── preload.js        <-- (Opsional) Untuk komunikasi IPC ke React
├── public/
│   ├── icon.ico          <-- Ikon sistem OS (Taskbar/Tray di Windows)
│   └── icon.png          <-- Ikon sistem OS (Taskbar/Tray di Mac/Linux)
└── src/
    ├── App.tsx           <-- Komponen utama UI
    ├── main.tsx          <-- Entry point React
    ├── index.css         <-- Styling Tailwind CSS
    ├── types.ts          <-- Definisi tipe TypeScript
    └── useTasks.ts       <-- Logic state dan localStorage
```

## 2. Kode Setup Electron (`electron/main.js`)

Buat file `electron/main.js`. Kode ini akan mengatur frameless window, tray icon (untuk mode background), dan auto-start (Launch at login).

```javascript
const { app, BrowserWindow, ipcMain, Tray, Menu, screen } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;
let floatingWindow = null;

// Mengatur Auto-Start saat Windows/Mac dinyalakan
app.setLoginItemSettings({
  openAtLogin: true,
  path: app.getPath('exe')
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 600,
    frame: false,           // Menghilangkan border OS bawaan
    transparent: true,      // Membuat background tembus pandang untuk rounded corners
    resizable: false,
    webPreferences: {
      nodeIntegration: false,  // SECURE: Matikan integrasi Node langsung
      contextIsolation: true,  // SECURE: Pisahkan context
      preload: path.join(__dirname, 'preload.js') // Jembatan komunikasi aman
    },
    icon: path.join(__dirname, '../public/icon.png')
  });

  // Load React App (Saat dev menggunakan localhost Vite, saat build menggunakan file index.html)
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Menyembunyikan aplikasi alih-alih menutup jika user memencet minimize/close
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createFloatingIcon() {
  // Membuat window kecil yang mengambang di sudut layar
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  floatingWindow = new BrowserWindow({
    width: 80,
    height: 80,
    x: width - 100,
    y: height - 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true, // Tidak muncul di taskbar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Floating window bisa meload UI khusus atau URL react dengan route/query param tertentu
  const isDev = !app.isPackaged;
  if (isDev) {
    floatingWindow.loadURL('http://localhost:3000?mode=widget');
  } else {
    floatingWindow.loadFile(path.join(__dirname, '../dist/index.html'), { query: { mode: 'widget' }});
  }

  floatingWindow.hide();
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../public/icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => {
      app.isQuiting = true;
      app.quit();
    }}
  ]);
  tray.setToolTip('Cinnamoroll To-Do');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createFloatingIcon();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// IPC Handler untuk minimize to widget
ipcMain.on('minimize-to-widget', () => {
  mainWindow.hide();
  floatingWindow.show();
});

// IPC Handler untuk restore dari widget
ipcMain.on('restore-from-widget', () => {
  floatingWindow.hide();
  mainWindow.show();
});
```

## 3. Setup Preload Script (`electron/preload.js`)

Untuk keamanan (karena akan di-publish ke publik/GitHub), kita menggunakan `preload.js` untuk menjembatani komunikasi ke React secara aman.

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    let validChannels = ['minimize-to-widget', 'restore-from-widget'];
    if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
    }
  }
});
```

## 4. Integrasi React dengan Electron IPC

Dalam file `App.tsx` yang telah dibuat, fungsi minimize (saat icon `Minus` di klik) sudah disiapkan dengan jembatan `window.electron` yang kita buat di preload.js:

```javascript
// Saat tombol minimize (Minus) ditekan:
const handleMinimize = () => {
  if (window.electron) {
    window.electron.send('minimize-to-widget');
  }
};

// Saat widget/floating icon ditekan:
const handleRestore = () => {
  if (window.electron) {
    window.electron.send('restore-from-widget');
  }
};
```

## 4. Perintah Scripts (`package.json`)

Tambahkan script ini di `package.json` Anda untuk menjalankan Vite dan Electron bersamaan:

```json
{
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "electron:start": "electron ."
  }
}
```

Gunakan module `concurrently` atau terminal terpisah untuk menjalankan `npm run dev` dan `npm run electron:start` secara bersamaan.

## 5. Catatan Tentang Fitur Notifikasi (Reminder)

Aplikasi ini menggunakan HTML5 `Notification` API di dalam React untuk memunculkan notifikasi pengingat (*reminder*). 
Kelebihan menggunakan Electron adalah **HTML5 Notification secara otomatis akan dipetakan menjadi Native OS Notification** (notifikasi bawaan Windows/Mac).
Anda tidak perlu menambahkan kode IPC khusus untuk memunculkan notifikasi; cukup pastikan OS Anda mengizinkan notifikasi untuk aplikasi tersebut.

