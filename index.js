const { app, Tray, Menu, dialog, shell, BrowserWindow, Notification } = require("electron");
const path = require("path");
const https = require("https");

app.setAppUserModelId("Oculus Dummy");
app.disableHardwareAcceleration();
Menu.setApplicationMenu(null);

let
  tray = null,
  startUpDialogClose = false,
  body = "",
  response = "",
  updateAvailable = false,
  getLatest = "",
  version = require("./package.json").version;

const
  createWindow = () => {
    const win = new BrowserWindow({
      title: "Just a sec..",
      width: 300,
      height: 200,
      frame: false,
      transparent: true,
      resizable: false
    })
    win.loadFile('index.html');
    win.on('close', function (evt) {
      evt.preventDefault();
      win.hide();
    });
    win.close()
  },
  options0 = {
    type: "question",
    buttons: ["OK"],
    title: "Oculus Dummy",
    message:
      "You can close this program by right-clicking the icon in your system tray.\nTo avoid issues, please only do so when not in VR.",
  },
  options1 = {
    type: "warning",
    buttons: ["OK", "Cancel"],
    title: "Oculus Dummy",
    message:
      "Are you sure you want to close Oculus Dummy?\nOnly close it when you're not in VR, attempting to do so usually just restarts Oculus Dummy, but to be safe and avoid issues, it's recommended you only do so when not in VR.",
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

  setTimeout(() => { // Better update notif
    if (updateAvailable == true) {
      let notif = new Notification({ icon: path.join(__dirname, "./icon.ico"), title: "Looks like there's an update!", body: `You're using v${version}, but v${getLatest} is available!` });
      notif.on('click', () => {
        shell.openExternal("https://github.com/kckarnige/OculusDummy/releases");
      });
      notif.show()
    }
  }, 2000)

  createWindow(); // Fuck you garbage collection
  dialog.showMessageBox(null, options0, (r) => {
    if (r == 0) {
      startUpDialogClose = true;
    }
  });  
  
  tray = new Tray(path.join(__dirname, "./icon.ico"));
  tray.setToolTip("Oculus Dummy");
  tray.setIgnoreDoubleClickEvents(true);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: `Oculus Dummy ${version}`, enabled: false},
      { type: "separator"},
      { label: "Open Debug Tool", click(){ shell.openItem("C:\\Program Files\\Oculus\\Support\\oculus-diagnostics\\OculusDebugTool.exe")} },
      { label: "Change Refresh Rate", type: "submenu", submenu: [
        { label: "Coming soon..hopefully", enabled: false}
      ]},
      { label: 'Exit', click(){
        if (startUpDialogClose == true) {
          dialog.showMessageBox(null, options1, (r) => {
            if (r == 0) {
              app.quit();
              process.exit();
            }
          });
        }
      }}
  ]))
});