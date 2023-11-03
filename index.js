const { app, Menu, Tray, dialog } = require("electron");
const path = require("path");

let tray;

const options0 = {
  type: "question",
  buttons: ["OK"],
  title: "Oculus Dummy",
  message:
    "You can close this program by right-clicking the icon in your system tray.\nTo avoid issues, please only do this when you're not in VR.",
};

const options1 = {
  type: "question",
  buttons: ["OK", "Cancel"],
  title: "Oculus Dummy",
  message:
    "Are you sure you want to close Oculus Dummy?\nOnly close it when you're not in VR, doing so usually usually just restarts Oculus Dummy, but to be safe and avoid issues, it's recommended you only do it when not in VR.",
};
let startUpDialogClose = false;
app.disableHardwareAcceleration();
Menu.setApplicationMenu(null);
app.whenReady().then(() => {
  dialog.showMessageBox(null, options0, (r) => {
    console.log(r);
    if (r == 0) {
      startUpDialogClose = true;
    }
  });
  tray = new Tray(path.join(__dirname, "./icon.ico"));
  tray.setToolTip("Oculus Dummy");
  tray.setIgnoreDoubleClickEvents(true);
  tray.on("right-click", () => {
    if (startUpDialogClose == true) {
      dialog.showMessageBox(null, options1, (r) => {
        if (r == 0) {
          app.quit();
        }
      });
    }
  });
});
