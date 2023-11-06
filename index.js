const { app, Tray, Menu, dialog, shell, BrowserWindow } = require("electron");
const path = require("path");
const https = require("https");

let
  tray = null,
  startUpDialogClose = false,
  body = "",
  response = "",
  updateAvailable = false,
  version = require("./package.json").version;

const
  createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600
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
      "You can close this program by right-clicking the icon in your system tray.\nTo avoid issues, please only do this when you're not in VR.",
  },
  options1 = {
    type: "warning",
    buttons: ["OK", "Cancel"],
    title: "Oculus Dummy",
    message:
      "Are you sure you want to close Oculus Dummy?\nOnly close it when you're not in VR, doing so usually just restarts Oculus Dummy, but to be safe and avoid issues, it's recommended you only do it when not in VR.",
  },
  updateOptions = {
    type: "question",
    buttons: ["Yes", "No"],
    title: "Oculus Dummy",
    message: "Looks like there's an update, wanna check it out?",
  };

app.disableHardwareAcceleration();
Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  https.get("https://kckarnige.is-a.dev/OculusDummy/latestVersion.json", (res) => {
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      response = JSON.parse(body);
      if (response.version > version) {
        updateAvailable = true;
      }
    });
  })
  .on("error", (e) => {
    console.log(e);
  });

  createWindow(); // Fuck you garbage collection

  dialog.showMessageBox(null, options0, (r) => {
    if (r == 0) {
      startUpDialogClose = true;
      if (updateAvailable == true) {
        dialog.showMessageBox(null, updateOptions, (r) => {
          if (r == 0) {
            shell.openExternal("https://github.com/kckarnige/OculusDummy/releases");
          }
        });
      }
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
        { label: "Coming soon.." }
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