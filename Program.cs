namespace OculusKillSwitch;

using System;
using System.IO;
using System.Security.Cryptography;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Net;
using IniParser;
using IniParser.Model;
using Ookii.Dialogs.Wpf;
using IWshRuntimeLibrary;
using Mayerch1.GithubUpdateCheck;
using ThankYouReza;




static class Program
{
    // #### Get Current Version ####
    public static string getVersion()
    {
        var version = Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion;
        version = version.Split("+").First();
        return version;
    }

    // #### Credit to @ndepoel ####
    static DirectoryInfo GetOculusBaseDirectory()
    {
        string OculusBaseVarName = @"OculusBase";
        string OculusBasePath = Environment.GetEnvironmentVariable(OculusBaseVarName);
        if (OculusBasePath == null)
            return null;

        return Directory.Exists(OculusBasePath) ? new DirectoryInfo(OculusBasePath) : null;
    }

    static string GetMD5Hash(string filePath)
    {
        using (var fileStream = new FileStream(filePath,
                                                   FileMode.Open,
                                                   FileAccess.Read,
                                                   FileShare.ReadWrite))
        {
            byte[] hash = System.IO.File.ReadAllBytes(filePath);
            byte[] hashValue = MD5.HashData(hash);
            return Convert.ToHexString(hashValue);
        }
    }

    static void MakeShortcut()
    {
        var parser = new FileIniDataParser();
        IniData configdata = parser.ReadFile("OculusKillSwitch.ini");
        var desktopFolderPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
        var shell = new WshShell();
        var shortCutLinkFilePath = desktopFolderPath + "\\Oculus Kill Switch.lnk";

        string[] fileArray = Directory.GetFiles(desktopFolderPath);
        List<string> fileHashList = new();
        try
        {
            if (configdata["OculusKillSwitch"]["DontShowShortcutDialog"] != "true")
            {
                using (TaskDialog dialog = new TaskDialog())
                {
                    TaskDialogButton butYes = new TaskDialogButton(ButtonType.Yes);
                    TaskDialogButton butNo = new TaskDialogButton(ButtonType.No);
                    dialog.WindowTitle = "Oculus Kill Switch";
                    dialog.Content = "Do you want me to make a desktop shortcut?";
                    dialog.MainIcon = TaskDialogIcon.Custom;
                    dialog.CustomMainIcon = Icon.FromHandle(NM.GetModernIcon("SIID_HELP"));
                    dialog.VerificationText = "Don't Show Again";
                    dialog.Buttons.Add(butYes);
                    dialog.Buttons.Add(butNo);
                    dialog.CenterParent = false;
                    TaskDialogButton result = dialog.ShowDialog();
                    if (dialog.IsVerificationChecked && result == butNo)
                    {
                        configdata["OculusKillSwitch"]["DontShowShortcutDialog"] = "true";
                        parser.WriteFile("OculusKillSwitch.ini", configdata);
                    }
                    if (result == butYes)
                    {
                        configdata["OculusKillSwitch"]["DontShowShortcutDialog"] = "true";
                        var windowsApplicationShortcut = (IWshShortcut)shell.CreateShortcut(shortCutLinkFilePath);
                        windowsApplicationShortcut.Description = "Toggle Oculus Killer and play your Oculus games.";
                        windowsApplicationShortcut.WorkingDirectory = Application.StartupPath;
                        windowsApplicationShortcut.TargetPath = Application.ExecutablePath;
                        windowsApplicationShortcut.Save();
                        parser.WriteFile("OculusKillSwitch.ini", configdata);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            Application.Exit();
        }

    }

    //Got lazy
    static void MakeShortcutStartMenu()
    {
        var parser = new FileIniDataParser();
        IniData configdata = parser.ReadFile("OculusKillSwitch.ini");
        var startFolderPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonStartMenu), "Programs");
        var shell = new WshShell();
        var shortCutLinkFilePath = startFolderPath + "\\Oculus Kill Switch.lnk";

        string[] fileArray = Directory.GetFiles(startFolderPath);
        List<string> fileHashList = new();
        try
        {
            if (configdata["OculusKillSwitch"]["DontShowStartShortcutDialog"] != "true")
            {
                using (TaskDialog dialog = new TaskDialog())
                {
                    TaskDialogButton butYes = new TaskDialogButton(ButtonType.Yes);
                    TaskDialogButton butNo = new TaskDialogButton(ButtonType.No);
                    dialog.WindowTitle = "Oculus Kill Switch";
                    dialog.Content = "Do you want me to make a start menu shortcut?\n(You'll need to remove the shortcut manually.)";
                    dialog.MainIcon = TaskDialogIcon.Custom;
                    dialog.CustomMainIcon = Icon.FromHandle(NM.GetModernIcon("SIID_HELP"));
                    dialog.VerificationText = "Don't Show Again";
                    dialog.Buttons.Add(butYes);
                    dialog.Buttons.Add(butNo);
                    dialog.CenterParent = false;
                    TaskDialogButton result = dialog.ShowDialog();
                    if (dialog.IsVerificationChecked && result == butNo)
                    {
                        configdata["OculusKillSwitch"]["DontShowStartShortcutDialog"] = "true";
                        parser.WriteFile("OculusKillSwitch.ini", configdata);
                    }
                    if (result == butYes)
                    {
                        configdata["OculusKillSwitch"]["DontShowStartShortcutDialog"] = "true";
                        var windowsApplicationShortcut = (IWshShortcut)shell.CreateShortcut(shortCutLinkFilePath);
                        windowsApplicationShortcut.Description = "Toggle Oculus Killer and play your Oculus games.";
                        windowsApplicationShortcut.WorkingDirectory = Application.StartupPath;
                        windowsApplicationShortcut.TargetPath = Application.ExecutablePath;
                        windowsApplicationShortcut.Save();
                        parser.WriteFile("OculusKillSwitch.ini", configdata);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            Application.Exit();
        }

    }

    static void CheckConfig()
    {
        if (System.IO.File.Exists("OculusDash.exe") == false)
        {
            try
            {
                Process.Start("explorer.exe", GetOculusBaseDirectory().FullName + "Support\\oculus-dash\\dash\\bin");

                DialogResult nuhuhbox = MessageBox.Show("I'm not in the right directory, I go here.\nAfter I close, would you please move me?", "Oculus Kill Switch", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                if (nuhuhbox == DialogResult.OK)
                {
                    Console.WriteLine("WRONG LOCATION/DASH NOT PRESENT");
                    Application.Exit();
                }
            }
            catch (Exception x)
            {
                Process.Start("explorer.exe", @"https://www.oculus.com/download_app/?id=1582076955407037");
                DialogResult Dialog1 = MessageBox.Show("Looks like you've never installed the Oculus Software, please install Oculus Software before using this program, ya goof.", "Oculus Kill Switch", MessageBoxButtons.OK);
                if (Dialog1 == DialogResult.OK)
                {
                    Console.WriteLine(x);
                    Console.WriteLine("NOT INSTALLED AT ALL???");
                    Application.Exit();
                }
            }
        }
        else
        {
            if (System.IO.File.Exists("OculusKillSwitch.ini") != true)
            {
                System.IO.File.Create("OculusKillSwitch.ini").Close();
            }
            var parser = new FileIniDataParser();
            IniData configdata = parser.ReadFile("OculusKillSwitch.ini");
            if (new FileInfo("OculusKillSwitch.ini").Length == 0)
            {
                configdata["OculusKillSwitch"]["IgnoreOculusClientOpen"] = "false";
                configdata["OculusKillSwitch"]["DontShowShortcutDialog"] = "false";
                configdata["OculusKillSwitch"]["IgnoreUpdate"] = "false";
                parser.WriteFile("OculusKillSwitch.ini", configdata);
            }
        }

    }

    static void CheckForUpdate()
    {
        var parser = new FileIniDataParser();
        IniData configdata = parser.ReadFile("OculusKillSwitch.ini");
        var startupFolderPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
        var shell = new WshShell();
        var shortCutLinkFilePath = startupFolderPath + "\\Oculus Kill Switch.lnk";
        string[] fileArray = Directory.GetFiles(startupFolderPath);
        GithubUpdateCheck update = new GithubUpdateCheck("kckarnige", "OculusKillSwitch");
        bool isUpdate = update.IsUpdateAvailable(getVersion(), VersionChange.Revision);

        if (isUpdate && configdata["OculusKillSwitch"]["IgnoreUpdate"] != "true")
        {
            using (TaskDialog dialog = new TaskDialog())
            {
                TaskDialogButton butYes = new TaskDialogButton(ButtonType.Yes);
                TaskDialogButton butNo = new TaskDialogButton(ButtonType.No);
                dialog.WindowTitle = "Oculus Kill Switch";
                dialog.Content = "Looks like there's a new update, wanna check it out?";
                dialog.MainIcon = TaskDialogIcon.Information;
                dialog.VerificationText = "Don't Show Again";
                dialog.Buttons.Add(butYes);
                dialog.Buttons.Add(butNo);
                dialog.CenterParent = false;
                TaskDialogButton result = dialog.ShowDialog();
                if (dialog.IsVerificationChecked && result == butNo)
                {
                    configdata["OculusKillSwitch"]["IgnoreUpdate"] = "true";
                    parser.WriteFile("OculusKillSwitch.ini", configdata);
                }
                if (result == butYes)
                {
                    Process.Start("explorer.exe", @"https://github.com/kckarnige/OculusKillSwitch");
                    Application.Exit();
                }
            }
        }
    }

    static void Main()
    {
        CheckConfig();
        Application.SetHighDpiMode(HighDpiMode.PerMonitorV2);
        CheckForUpdate();
        Process[] DashCheck = Process.GetProcessesByName("OculusDash");
        Process[] SteamVRCheck = Process.GetProcessesByName("vrmonitor");
        Process[] OculusAppCheck = Process.GetProcessesByName("OculusClient");

        var parser = new FileIniDataParser();
        IniData configdata = parser.ReadFile("OculusKillSwitch.ini");

        if (DashCheck.Length > 0 != true && SteamVRCheck.Length > 0 != true)
        {
            string activeFileHash;
            string backupFileHash;
            bool whoops = false;
            try
            {
                activeFileHash = GetMD5Hash("OculusDash.exe");
                configdata["OculusKillSwitch"]["OculusDashExecHash"] = activeFileHash;
                parser.WriteFile("OculusKillSwitch.ini", configdata);
                MakeShortcutStartMenu();
                MakeShortcut();
                try
                {
                    System.IO.File.Exists("OculusDash.exe.bak");
                    backupFileHash = GetMD5Hash("OculusDash.exe.bak");

                }
                catch (Exception)
                {
                    if (activeFileHash == "9DB7CC8B646A01C60859B318F85E65D0")
                    {
                        MessageBox.Show("Oculus Dash backup couldn't be found. If it's in a different directory, move it here. If you don't have it, you may need to reinstall the Oculus app to get it back.", "Oculus Kill Switch", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        whoops = true;
                        Console.WriteLine("NO BACKUP");
                    }
                    else if (activeFileHash == configdata["OculusKillSwitch"]["OculusDashExecHash"])
                    {
                        DialogResult Dialog1 = MessageBox.Show("Oculus Killer isn't installed, or the backup file has been renamed. Would you like for me to download it for you?", "Oculus Kill Switch", MessageBoxButtons.YesNo, MessageBoxIcon.Warning);
                        if (Dialog1 == DialogResult.Yes)
                        {
                            using (WebClient client = new WebClient())
                            {
                                client.DownloadFile("https://github.com/irlbunny/OculusKiller/releases/latest/download/OculusDash.exe", "OculusDash.exe.bak");
                            }

                        }
                        else
                        {
                            MessageBox.Show("Oculus Killer needs to be installed for me to do my job.", "Oculus Kill Switch", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            whoops = true;
                            Console.WriteLine("NO KILLER");
                            Application.Exit();
                        }
                    }
                    else
                    {
                        DialogResult Dialog1 = MessageBox.Show("Looks like the Oculus Client updated since this was last ran, give me a sec to update the stored hash value for the Oculus Client.", "Oculus Kill Switch", MessageBoxButtons.OK);
                        if (Dialog1 == DialogResult.OK)
                        {
                            configdata["OculusKillSwitch"]["OculusDashExecHash"] = GetMD5Hash("OculusDash.exe");
                            parser.WriteFile("OculusKillSwitch.ini", configdata);
                        }
                        else
                        {
                            whoops = true;
                            Console.WriteLine("SHOULDA PRESSED OK");
                            Application.Exit();
                        }
                    }
                }

            }
            catch (Exception ex)
            {
                activeFileHash = "null";
                Console.WriteLine(ex);
                whoops = true;
                Console.WriteLine("WRONG LOCATION/DASH NOT PRESENT");
            }
            if (OculusAppCheck.Length > 0 == true && configdata["OculusKillSwitch"]["IgnoreOculusClientOpen"] != "true" && whoops == false)
            {
                using (TaskDialog dialog = new TaskDialog())
                {
                    TaskDialogButton butOK = new TaskDialogButton(ButtonType.Ok);
                    TaskDialogButton butCancel = new TaskDialogButton(ButtonType.Cancel);
                    dialog.VerificationText = "Don't Show Again";
                    dialog.WindowTitle = "Oculus Kill Switch";
                    dialog.Content = "For safety reasons, I'm here to warn you of switching while in VR because I can't detect anything but the Oculus Client being open.\n\nIf you just took off your headset to switch, please make sure to save your game before either closing or restarting (Recommended) the Oculus app.\nIf all you did was open the Oculus app, you may continue, otherwise, click 'Cancel' to close this prompt and come back after you saved your progress.";
                    dialog.MainIcon = TaskDialogIcon.Warning;
                    dialog.Buttons.Add(butOK);
                    dialog.Buttons.Add(butCancel);
                    dialog.CenterParent = false;
                    TaskDialogButton result = dialog.ShowDialog();
                    if (dialog.IsVerificationChecked)
                    {
                        configdata["OculusKillSwitch"]["IgnoreOculusClientOpen"] = "true";
                        parser.WriteFile("OculusKillSwitch.ini", configdata);
                    }
                    if (result == butCancel)
                    {
                        whoops = true;
                        Console.WriteLine("WARNING ACKNOWLEDGED");
                        Application.Exit();
                    }
                }

            }
            string killerEnabled;

            if (activeFileHash == "9DB7CC8B646A01C60859B318F85E65D0")
            {
                killerEnabled = "enabled.";
            }
            else
            {
                killerEnabled = "disabled.";
            };

            DialogResult Dialog0;

            if (whoops == false)
            {
                Dialog0 = MessageBox.Show("Toggle Oculus Killer?\n" + "It's currently " + killerEnabled, "Oculus Kill Switch", MessageBoxButtons.OKCancel, MessageBoxIcon.Question);
            }
            else
            {
                Dialog0 = DialogResult.None;
            }

            // It'll be fiiiiiine
            if (Dialog0 == DialogResult.OK)
            {
                if (activeFileHash != "9DB7CC8B646A01C60859B318F85E65D0")
                {
                    // Stock -> Default
                    System.IO.File.Move("OculusDash.exe.bak", "tempkill.exe");
                    System.IO.File.Move("OculusDash.exe", "OculusDash.exe.bak");
                    System.IO.File.Move("tempkill.exe", "OculusDash.exe");
                    MessageBox.Show("Successfully enabled Oculus Killer!", "Oculus Kill Switch", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                else
                {
                    // Killer -> Stock
                    System.IO.File.Move("OculusDash.exe.bak", "tempbak.exe");
                    System.IO.File.Move("OculusDash.exe", "OculusDash.exe.bak");
                    System.IO.File.Move("tempbak.exe", "OculusDash.exe");
                    MessageBox.Show("Successfully disabled Oculus Killer!", "Oculus Kill Switch", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
        }
        else
        {
            MessageBox.Show("Please exit VR before switching your dash.\nIf this issue persists, try restarting the Oculus app.\nSettings > Beta > Restart Oculus", "Oculus Kill Switch", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}