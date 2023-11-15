const { app, Tray, Menu, dialog, shell, BrowserWindow, Notification } = require("electron");
const path = require("path");
const https = require("https");

app.setAppUserModelId("Oculus Dummy");
app.disableHardwareAcceleration();
Menu.setApplicationMenu(null);

let
  tray = null,
  body = "",
  response = "",
  updateAvailable = false,
  getLatest = "",
  version = require("./package.json").version,
  getIcon = (name) => {
    if (name == "alert") {
      return path.join(__dirname, "./alert.ico")
    } else if (!name) {
      return path.join(__dirname, "./icon.ico")
    }
  };

const
  lockInstance = !app.requestSingleInstanceLock(),
  createWindow = () => {
    const win = new BrowserWindow({
      title: "Just a sec..",
      icon: getIcon(),
      width: 300,
      height: 200,
      frame: false,
      transparent: true,
      resizable: false
    })
    win.loadFile('index.html');
    win.on('close', (e) => {
      e.preventDefault();
      win.hide();
    });
    win.close()
  },
  exitDialog = {
    type: "warning",
    buttons: ["OK", "Cancel"],
    title: "Oculus Dummy",
    message:
      "Are you sure you want to close Oculus Dummy?\nOnly close it when you're not in VR, attempting to do so usually just restarts Oculus Dummy, but to be safe and avoid issues, it's recommended you only do so when not in VR."
  };

  https.get("https://kckarnige.is-a.dev/OculusDummy/latestVersion.json", (res) => {
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      response = JSON.parse(body);
      getLatest = response.version + "";
      if (response.version > version) {
        updateAvailable = true;
      }
    });
  })
  .on("error", (e) => {
    console.log(e);
  });

app.whenReady().then(() => {
  if (lockInstance) {
    let alreadyOpenNotif = new Notification(
      {
        icon: getIcon(),
        title: `Oculus Dummy is already running!`,
        body: 'You can close it by right-clicking the icon in your system tray then clicking "Exit".'
      });
      alreadyOpenNotif.show()
      app.quit()
      process.exit();
  }

  setTimeout(() => { // Better update notif
    if (updateAvailable == true) {
      let notif = new Notification({
        icon:  getIcon("alert"),
        title: "Time to get you up-to-date",
        body: `You're using v${version}, but v${getLatest} is available!`
      });
      notif.on('click', () => {
        shell.openExternal("https://github.com/kckarnige/OculusDummy/releases");
      });
      notif.show()
    }
  }, 1000)

  createWindow(); // Fuck you garbage collection

  let startupNotif = new Notification(
    {
      icon: getIcon(),
      title: `Oculus Dummy ${version} is running!`,
      body: 'You can close it by right-clicking the icon in your system tray then clicking "Exit".'
    });
    startupNotif.show()
  
  tray = new Tray(getIcon());
  tray.setToolTip(`Oculus Dummy ${version}`);
  tray.setIgnoreDoubleClickEvents(true);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: `Oculus Dummy ${version}`, enabled: false},
      { label: "View on GitHub", click(){
        shell.openExternal("https://github.com/kckarnige/OculusDummy");
      }},
      { type: "separator"},
      { label: "Open Debug Tool", click(){
        shell.openItem("C:\\Program Files\\Oculus\\Support\\oculus-diagnostics\\OculusDebugTool.exe")
      }},
      { type: "separator"},
      { label: 'Exit', click(){
        dialog.showMessageBox(null, exitDialog, (r) => {
          if (r == 0) {
            app.quit();
            process.exit();
          }
        });
      }}
  ]))
});