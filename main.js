const { app, BrowserWindow, Notification, Tray, shell } = require('electron')

function createWindow () {
  // Создаем окно браузера.
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  win.loadFile('index.html');

  // Отображаем средства разработчика.
  win.webContents.openDevTools();

    // setInterval(() => {
    //     win.setProgressBar(Math.random())
    // } , 1000);
    
    const tray = new Tray('./src/assets/tray/icon.png');
    tray.setTitle('hello world');
  
    // shell.openExternal('https://www.google.com');

  // setInterval(() => {
  //   console.log(Math.random());
  // }, 1000);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Некоторые API могут использоваться только после возникновения этого события.
app.whenReady().then(() => {
    createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // Для приложений и строки меню в macOS является обычным делом оставаться
  // активными до тех пор, пока пользователь не выйдет окончательно используя Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
   // На MacOS обычно пересоздают окно в приложении,
   // после того, как на иконку в доке нажали и других открытых окон нету.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. Можно также поместить их в отдельные файлы и применить к ним require.