const {
    app,
    Tray,
    Menu,
    dialog,
    shell,
    BrowserWindow,
    Notification,
    nativeImage,
} = require("electron");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");

app.setAppUserModelId("Oculus Dummy");
app.disableHardwareAcceleration();
Menu.setApplicationMenu(null);

let tray = null,
    body = "",
    response = "",
    updateAvailable = false,
    getLatest = "",
    version = require("./package.json").version,
    getIconNotif = (name) => {
        if (name == "alert") {
            return path.join(__dirname, "./alert.ico");
        } else if (!name) {
            return path.join(__dirname, "./icon.ico");
        }
    };

const lockInstance = !app.requestSingleInstanceLock(),
    createWindow = () => {
        const win = new BrowserWindow({
            title: "Just a sec..",
            width: 300,
            height: 200,
            frame: false,
            transparent: true,
            resizable: false,
        });
        win.on("close", (e) => {
            e.preventDefault();
            win.hide();
        });
        win.close();
    },
    exitDialog = {
        type: "warning",
        buttons: ["Yes", "No"],
        title: "Oculus Dummy",
        message:
            "Are you sure you want to close Oculus Dummy?\n\nOnly close it when you're not in VR, attempting to do so will close SteamVR and any active SteamVR or Oculus games. This might lead to losing your progress and you may be required to restart the OVRService if you run into issues with Oculus Link.\nTo be safe and avoid these issues, it's recommended you only do so when not in VR."
    };

https
    .get("https://kckarnige.github.io/OculusDummy/latestVersion.json", (res) => {
        res.on("data", (chunk) => {
            body += chunk;
        });
        res.on("end", (body) => {
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

    function getIcon (num) {
        icon = nativeImage.createFromPath(path.join(__dirname, "icon.ico"))
        if (num) {
            return icon.resize({height: num})
        } else {
            return icon
        }
    }

app.whenReady().then(() => {
    if (lockInstance) {
        app.quit();
        process.exit();
    }
    shell.openItem(
        process.env.OculusBase+"Support\\oculus-runtime\\OVRServer_x64.exe"
    );
    setTimeout(() => {
        // Better update notif
        if (updateAvailable == true) {
            let notif = new Notification({
                icon: getIconNotif("alert"),
                title: "Time to get you up-to-date",
                body: `You're using v${version}, but v${getLatest} is available!`
            });
            notif.on("click", () => {
                shell.openExternal(
                    "https://github.com/kckarnige/OculusDummy/releases"
                );
            });
            notif.show();
        }
    }, 1000);

    createWindow(); // Fuck you garbage collection

    let startupNotif = new Notification({
        icon: getIconNotif(),
        title: `Oculus Dummy ${version}`,
        body: 'You can close it by right-clicking the icon in your system tray then clicking "Exit".'
    });
    let restartNotif = new Notification({
        icon: getIconNotif(),
        title: `Attempting to restart OVRService...`,
        body: 'Please be patient..'
    });
    let restartSuccessNotif = new Notification({
        icon: getIconNotif(),
        title: `OVRService will restart shortly...`,
        body: 'Please be patient..'
    });
    let restartFailedNotif = new Notification({
        icon: getIconNotif(),
        title: `Unable to restart OVRService`,
        body: `Make sure to choose "Yes" on the UAC dialog, let PowerShell do it's thing!`
    });
    startupNotif.show();
    setTimeout(() => {
        startupNotif.close();
    }, 4000);

    tray = new Tray(getIcon());
    tray.setToolTip(`Oculus Dummy ${version}`);
    tray.setIgnoreDoubleClickEvents(true);
    contextMenu = (xtr) => {return(
    Menu.buildFromTemplate([
        {
            label: `Oculus Dummy ${version}`,
            icon: getIcon(16),
            click() {
                shell.openExternal(
                    "https://github.com/kckarnige/OculusDummy"
                );
            },
        },
        { type: "separator" },
        xtr,
        {
            label: "Restart OVRService",
            click() {
                restartNotif.show();
                restartService = exec(
                    `powershell Start-Process powershell -WindowStyle hidden -ArgumentList 'Restart-Service','"OVRService"' -Verb RunAs`,
                    (err, stdout, stderr) => {
                        if (err) {
                            console.log(stderr);
                            restartNotif.close();
                            restartFailedNotif.show();
                            setTimeout(() => {
                                restartFailedNotif.close();
                            }, 8000);
                        } else {
                            console.log(stdout);
                            restartNotif.close();
                            restartSuccessNotif.show();
                            setTimeout(() => {
                                restartSuccessNotif.close();
                            }, 8000);
                        }
                    }
                );
            },
        },
        {
            label: "Open Debug Tool",
            click() {
                shell.openItem(
                    process.env.OculusBase+"Support\\oculus-diagnostics\\OculusDebugTool.exe"
                );
            },
        },
        { type: "separator" },
        {
            label: "Exit",
            click() {
                dialog.showMessageBox(null, exitDialog, (r) => {
                    if (r == 0) {
                        app.quit();
                        process.exit();
                    }
                });
            },
        },
    ]))}
    tray.setContextMenu(contextMenu({ visible: false, enabled: false }));
    let xrsetruntimePath = path.join(__dirname, "../", "xrsetruntime.exe") + "";
    fs.stat(xrsetruntimePath, (err) => {
        if (err) {
            console.log("Damn that sucks")
            console.log(xrsetruntimePath)
        } else {
            console.log("Exists!")
            tray.setContextMenu(contextMenu(
                {
                    label: "Oculus OpenXR Runtime",
                    click() {
                        console.log("RAN")
                        exec(
                            `powershell Start-Process '${xrsetruntimePath}' -ArgumentList '-Oculus' -Verb RunAs`
                        )
                    }
            }));
        }
      });
});
