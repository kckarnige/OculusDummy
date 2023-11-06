const { app, Tray, Menu, dialog, shell } = require("electron");
const path = require("path");
const https = require("https");

let tray = null,
  startUpDialogClose = false,
  body = "",
  response = "",
  updateAvailable = false;

const options0 = {
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
      "Are you sure you want to close Oculus Dummy?\nOnly close it when you're not in VR, doing so usually usually just restarts Oculus Dummy, but to be safe and avoid issues, it's recommended you only do it when not in VR.",
  },
  updateOptions = {
    type: "question",
    buttons: ["Yes", "No"],
    title: "Oculus Dummy",
    message: "Looks like there's an update, wanna check it out?",
  };

app.commandLine.appendSwitch('js-flags', '--expose_gc --noconcurrent_sweeping');
app.disableHardwareAcceleration();
Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  https
    .get(
      "https://kckarnige.is-a.dev/OculusDummy/latestVersion.json",
      function (res) {
        res.on("data", function (chunk) {
          body += chunk;
        });

        res.on("end", function () {
          response = JSON.parse(body);
          if (response.latestVer !== require("./package.json").version) {
            updateAvailable = true;
          }
        });
      }
    )
    .on("error", function (e) {
      console.log(e);
    });

  dialog.showMessageBox(null, options0, (r) => {
    if (r == 0) {
      startUpDialogClose = true;
      if (updateAvailable == true) {
        dialog.showMessageBox(null, updateOptions, (r) => {
          if (r == 0) {
            shell.openExternal(
              "https://github.com/kckarnige/OculusDummy/releases"
            );
          }
        });
      }
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
