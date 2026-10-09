const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = ['minimize-to-widget', 'restore-from-widget', 'close-app'];
      if (validChannels.includes(channel)) {
          ipcRenderer.send(channel, data);
      }
    }
  }
);
