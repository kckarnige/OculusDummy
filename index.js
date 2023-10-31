const { app, Menu, Tray, dialog } = require("electron");
const path = require("node:path");

let tray;

const options = {
  type: "question",
  buttons: ["OK"],
  title: "Oculus Dummy",
  message:
    "You can close this program from your system tray.\nTo avoid issues, please only do this when you're not in VR.",
};

app.whenReady().then(() => {
  dialog.showMessageBox(null, options, (response, checkboxChecked) => {
    console.log(response);
    console.log(checkboxChecked);
  });
  tray = new Tray("build/icon.ico");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit",
      click() {
        app.quit();
      },
    },
  ]);
  tray.setToolTip("Oculus Dummy");
  tray.setContextMenu(contextMenu);
});
