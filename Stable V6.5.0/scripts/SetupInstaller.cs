using System;
using System.IO;
using System.IO.Compression;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using System.Threading;
using System.Reflection;
using Microsoft.Win32;
using System.Runtime.InteropServices;

[assembly: AssemblyTitle("NeXusWeb Setup & Upgrader")]
[assembly: AssemblyDescription("NeXusWeb Setup and In-Place Upgrader by Chevron Nexus Software")]
[assembly: AssemblyCompany("Chevron Nexus Software")]
[assembly: AssemblyProduct("NeXusWeb")]
[assembly: AssemblyCopyright("Copyright (C) 2026 Chevron Nexus Software")]
[assembly: AssemblyVersion("6.5.0.0")]
[assembly: AssemblyFileVersion("6.5.0.0")]

namespace ChevronNexus.NeXusWeb.Setup
{
    static class Program
    {
        [DllImport("user32.dll")]
        private static extern bool SetProcessDPIAware();

        [STAThread]
        static void Main(string[] args)
        {
            try { SetProcessDPIAware(); } catch { }
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool isSilent = false;
            bool isUninstall = false;

            if (args != null)
            {
                foreach (var arg in args)
                {
                    string a = arg.Trim().ToUpperInvariant();
                    if (a == "/S" || a == "/SILENT" || a == "/UPDATE" || a == "-SILENT" || a == "--SILENT")
                    {
                        isSilent = true;
                    }
                    else if (a == "/UNINSTALL" || a == "-UNINSTALL" || a == "/U")
                    {
                        isUninstall = true;
                    }
                }
            }

            if (isUninstall)
            {
                RunUninstaller(isSilent);
                return;
            }

            if (isSilent)
            {
                RunSilentInstallOrUpgrade();
            }
            else
            {
                Application.Run(new MultiStepSetupForm());
            }
        }

        public static string GetDefaultInstallDir()
        {
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            return Path.Combine(localAppData, "ChevronNexus", "NeXusWeb-V6");
        }

        public static bool IsExistingInstallation(string dir)
        {
            return Directory.Exists(dir) && (
                File.Exists(Path.Combine(dir, "NeXusWeb-V6.exe")) ||
                File.Exists(Path.Combine(dir, "NeXusWeb.exe"))
            );
        }

        public static void TerminateRunningProcesses()
        {
            string[] procNames = new string[] { "NeXusWeb-V6", "NeXusWeb-V5", "NeXusWeb" };
            foreach (var name in procNames)
            {
                try
                {
                    var procs = Process.GetProcessesByName(name);
                    foreach (var p in procs)
                    {
                        try
                        {
                            p.CloseMainWindow();
                            if (!p.WaitForExit(1500))
                            {
                                p.Kill();
                            }
                        }
                        catch { }
                    }
                }
                catch { }
            }
            Thread.Sleep(500);
        }

        public static void CreateShortcut(string shortcutPath, string targetPath, string description, string iconPath)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType != null)
                {
                    dynamic shell = Activator.CreateInstance(shellType);
                    dynamic shortcut = shell.CreateShortcut(shortcutPath);
                    shortcut.TargetPath = targetPath;
                    shortcut.WorkingDirectory = Path.GetDirectoryName(targetPath);
                    shortcut.Description = description;
                    if (!string.IsNullOrEmpty(iconPath) && File.Exists(iconPath))
                    {
                        shortcut.IconLocation = iconPath + ",0";
                    }
                    shortcut.Save();
                }
            }
            catch { }
        }

        public static void RegisterUninstall(string installDir, string exePath)
        {
            try
            {
                using (var key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\NeXusWeb-V6"))
                {
                    if (key != null)
                    {
                        key.SetValue("DisplayName", "NeXusWeb (Chevron Nexus Software)");
                        key.SetValue("DisplayVersion", "6.5.0");
                        key.SetValue("Publisher", "Chevron Nexus Software");
                        key.SetValue("InstallLocation", installDir);
                        key.SetValue("DisplayIcon", exePath + ",0");
                        key.SetValue("UninstallString", "\"" + Path.Combine(installDir, "setup.exe") + "\" /UNINSTALL");
                        key.SetValue("NoModify", 1, RegistryValueKind.DWord);
                        key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                    }
                }
            }
            catch { }
        }

        public static void UnregisterUninstall()
        {
            try
            {
                Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\NeXusWeb-V6", false);
            }
            catch { }
        }

        private static void RunSilentInstallOrUpgrade()
        {
            try
            {
                string targetDir = GetDefaultInstallDir();
                TerminateRunningProcesses();

                if (!Directory.Exists(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                ExtractPayload(targetDir, null);

                string exePath = Path.Combine(targetDir, "NeXusWeb-V6.exe");
                string desktopPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "NeXusWeb V6.lnk");
                string startMenuPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "NeXusWeb V6.lnk");
                string appIcoPath = Path.Combine(targetDir, "app.ico");

                try
                {
                    Image img = ImageFromBase64(LogoData.NeXusWebLogoBase64);
                    if (img != null)
                    {
                        using (var bmp = new Bitmap(img, new Size(256, 256)))
                        {
                            IntPtr hIcon = bmp.GetHicon();
                            using (var ico = Icon.FromHandle(hIcon))
                            using (var fs = new FileStream(appIcoPath, FileMode.Create))
                            {
                                ico.Save(fs);
                            }
                        }
                    }
                }
                catch { }

                string iconTarget = File.Exists(appIcoPath) ? appIcoPath : exePath;
                CreateShortcut(desktopPath, exePath, "NeXusWeb V6 by Chevron Nexus Software", iconTarget);
                CreateShortcut(startMenuPath, exePath, "NeXusWeb V6 by Chevron Nexus Software", iconTarget);
                RegisterUninstall(targetDir, iconTarget);

                try
                {
                    string currentExe = Process.GetCurrentProcess().MainModule.FileName;
                    string destSetup = Path.Combine(targetDir, "setup.exe");
                    if (!string.Equals(currentExe, destSetup, StringComparison.OrdinalIgnoreCase))
                    {
                        File.Copy(currentExe, destSetup, true);
                    }
                }
                catch { }

                Process.Start(new ProcessStartInfo
                {
                    FileName = exePath,
                    WorkingDirectory = targetDir,
                    UseShellExecute = true
                });
            }
            catch { }
        }

        private static void RunUninstaller(bool isSilent)
        {
            if (!isSilent)
            {
                var result = MessageBox.Show(
                    "Are you sure you want to uninstall NeXusWeb v6.0.0?\n\n(Your bookmarks, history, and tabs stored in AppData will remain safe).",
                    "Uninstall NeXusWeb",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question
                );
                if (result != DialogResult.Yes) return;
            }

            TerminateRunningProcesses();

            string desktopPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "NeXusWeb V6.lnk");
            string startMenuPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "NeXusWeb V6.lnk");

            try { if (File.Exists(desktopPath)) File.Delete(desktopPath); } catch { }
            try { if (File.Exists(startMenuPath)) File.Delete(startMenuPath); } catch { }

            UnregisterUninstall();

            string targetDir = GetDefaultInstallDir();
            try
            {
                string cmd = string.Format("/C timeout /T 2 /NOBREAK > nul & rmdir /S /Q \"{0}\"", targetDir);
                Process.Start(new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = cmd,
                    WindowStyle = ProcessWindowStyle.Hidden,
                    CreateNoWindow = true
                });
            }
            catch { }

            if (!isSilent)
            {
                MessageBox.Show("NeXusWeb has been uninstalled successfully.", "NeXusWeb Uninstall", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        public static void ExtractPayload(string targetDir, Action<int, string> progressCallback)
        {
            if (progressCallback != null) progressCallback(10, "Searching for payload archive...");

            // 1. Check embedded resource first
            var assembly = Assembly.GetExecutingAssembly();
            Stream resourceStream = null;

            foreach (var resName in assembly.GetManifestResourceNames())
            {
                if (resName.EndsWith("app-payload.zip", StringComparison.OrdinalIgnoreCase))
                {
                    resourceStream = assembly.GetManifestResourceStream(resName);
                    break;
                }
            }

            if (resourceStream != null)
            {
                if (progressCallback != null) progressCallback(25, "Extracting application files...");
                using (var archive = new ZipArchive(resourceStream, ZipArchiveMode.Read))
                {
                    int count = archive.Entries.Count;
                    int current = 0;
                    foreach (var entry in archive.Entries)
                    {
                        current++;
                        string destPath = Path.Combine(targetDir, entry.FullName);
                        if (string.IsNullOrEmpty(entry.Name))
                        {
                            Directory.CreateDirectory(destPath);
                        }
                        else
                        {
                            Directory.CreateDirectory(Path.GetDirectoryName(destPath));
                            entry.ExtractToFile(destPath, true);
                        }
                        int pct = 25 + (int)((current / (float)count) * 60);
                        if (progressCallback != null) progressCallback(pct, "Extracting: " + entry.Name);
                    }
                }
                return;
            }

            // 2. Check companion zip or companion folder next to setup.exe
            string exeDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
            string companionZip = Path.Combine(exeDir, "app-payload.zip");

            if (File.Exists(companionZip))
            {
                if (progressCallback != null) progressCallback(30, "Extracting payload archive...");
                using (var archive = ZipFile.OpenRead(companionZip))
                {
                    int count = archive.Entries.Count;
                    int current = 0;
                    foreach (var entry in archive.Entries)
                    {
                        current++;
                        string destPath = Path.Combine(targetDir, entry.FullName);
                        if (string.IsNullOrEmpty(entry.Name))
                        {
                            Directory.CreateDirectory(destPath);
                        }
                        else
                        {
                            Directory.CreateDirectory(Path.GetDirectoryName(destPath));
                            entry.ExtractToFile(destPath, true);
                        }
                        int pct = 30 + (int)((current / (float)count) * 55);
                        if (progressCallback != null) progressCallback(pct, "Extracting: " + entry.Name);
                    }
                }
                return;
            }

            // 3. Check companion extracted binary folder: "NeXusWeb-V6-win32-x64"
            string companionFolder = Path.Combine(exeDir, "NeXusWeb-V6-win32-x64");
            if (Directory.Exists(companionFolder))
            {
                if (progressCallback != null) progressCallback(30, "Copying application binaries...");
                CopyDirectory(companionFolder, targetDir, (pct, file) =>
                {
                    if (progressCallback != null) progressCallback(30 + (int)(pct * 0.55f), "Copying: " + file);
                });
                return;
            }

            throw new FileNotFoundException("NeXusWeb payload package (app-payload.zip or NeXusWeb-V6-win32-x64) was not found.");
        }

        private static void CopyDirectory(string sourceDir, string destDir, Action<float, string> fileProgress)
        {
            var dir = new DirectoryInfo(sourceDir);
            var allFiles = dir.GetFiles("*", SearchOption.AllDirectories);
            int total = allFiles.Length;
            int count = 0;

            foreach (var file in allFiles)
            {
                count++;
                string relative = file.FullName.Substring(sourceDir.Length).TrimStart(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
                string targetFile = Path.Combine(destDir, relative);
                Directory.CreateDirectory(Path.GetDirectoryName(targetFile));
                file.CopyTo(targetFile, true);
                if (fileProgress != null) fileProgress(count / (float)total, file.Name);
            }
        }

        public static Image ImageFromBase64(string b64)
        {
            try
            {
                if (!string.IsNullOrEmpty(b64))
                {
                    byte[] bytes = Convert.FromBase64String(b64);
                    using (var ms = new MemoryStream(bytes))
                    {
                        return Image.FromStream(ms);
                    }
                }
            }
            catch { }
            return null;
        }
    }

    public class MultiStepSetupForm : Form
    {
        private int currentStep = 1; // 1 to 5
        private const int TOTAL_STEPS = 5;

        // UI Containers
        private Panel sidebarPanel;
        private Panel contentPanel;
        private Panel footerPanel;
        private Button btnBack;
        private Button btnNext;
        private Button btnCancel;

        // Step Panels
        private Panel step1Panel;
        private Panel step2Panel;
        private Panel step3Panel;
        private Panel step4Panel;
        private Panel step5Panel;

        // Step 3 Controls
        private CheckBox chkAgreeDisclaimer;

        // Step 4 Controls
        private TextBox txtInstallDir;
        private Button btnBrowse;
        private CheckBox chkDesktop;
        private CheckBox chkStartMenu;
        private CheckBox chkLaunch;
        private ProgressBar progressBar;
        private Label lblStatus;
        private bool isInstalling = false;
        private bool isUpgradeMode = false;
        private string targetDir;

        // Step Sidebar Labels
        private Panel[] stepContainers = new Panel[TOTAL_STEPS];
        private Label[] stepNumberLabels = new Label[TOTAL_STEPS];
        private Label[] stepTextLabels = new Label[TOTAL_STEPS];

        // Logos
        private Image chevronLogo;
        private Image nexuswebLogo;

        public MultiStepSetupForm()
        {
            this.targetDir = Program.GetDefaultInstallDir();
            this.isUpgradeMode = Program.IsExistingInstallation(targetDir);

            // Load high-res logos from Base64 constants
            this.chevronLogo = Program.ImageFromBase64(LogoData.ChevronNexusLogoBase64);
            this.nexuswebLogo = Program.ImageFromBase64(LogoData.NeXusWebLogoBase64);

            InitializeComponent();
            ShowStep(1);
        }

        private void InitializeComponent()
        {
            this.Text = isUpgradeMode
                ? "Chevron Nexus Software — NeXusWeb v6.5.0 Setup & Upgrader"
                : "Chevron Nexus Software — NeXusWeb v6.5.0 Setup";

            // Clean, wide layout with zero clipping
            this.ClientSize = new Size(880, 580);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = true;
            this.BackColor = Color.FromArgb(13, 17, 29); // Dark Obsidian
            this.ForeColor = Color.FromArgb(241, 245, 249);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            // ── 1. Left Sidebar (Explicit Bounds: 0, 0, 230, 515) ─────────────
            sidebarPanel = new Panel
            {
                Location = new Point(0, 0),
                Size = new Size(230, 515),
                BackColor = Color.FromArgb(9, 12, 22),
                Padding = new Padding(16, 20, 16, 20)
            };

            Label lblSideBrand = new Label
            {
                Text = "CHEVRON NEXUS",
                Font = new Font("Segoe UI", 10.0f, FontStyle.Bold),
                ForeColor = Color.FromArgb(0, 212, 255),
                Location = new Point(16, 18),
                AutoSize = true
            };
            sidebarPanel.Controls.Add(lblSideBrand);

            Label lblSideProduct = new Label
            {
                Text = "NeXusWeb v6.5.0 Production",
                Font = new Font("Segoe UI", 8.0f, FontStyle.Regular),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(16, 40),
                AutoSize = true
            };
            sidebarPanel.Controls.Add(lblSideProduct);

            Panel sideDivider = new Panel
            {
                Location = new Point(16, 64),
                Size = new Size(198, 1),
                BackColor = Color.FromArgb(30, 41, 59)
            };
            sidebarPanel.Controls.Add(sideDivider);

            string[] stepTitles = new string[] {
                "About ChevronNexus",
                "About NeXusWeb",
                "Disclaimer & Terms",
                "Install Destination",
                "Finish & Thanks"
            };

            int stepY = 80;
            for (int i = 0; i < TOTAL_STEPS; i++)
            {
                Panel stepItem = new Panel
                {
                    Location = new Point(12, stepY),
                    Size = new Size(206, 46),
                    BackColor = Color.Transparent
                };

                Label lblNum = new Label
                {
                    Text = (i + 1).ToString(),
                    Location = new Point(8, 12),
                    Size = new Size(22, 22),
                    Font = new Font("Segoe UI", 8.0f, FontStyle.Bold),
                    ForeColor = Color.FromArgb(148, 163, 184),
                    BackColor = Color.FromArgb(20, 28, 48),
                    TextAlign = ContentAlignment.MiddleCenter
                };

                Label lblText = new Label
                {
                    Text = stepTitles[i],
                    Location = new Point(36, 13),
                    Size = new Size(165, 20),
                    Font = new Font("Segoe UI", 8.5f, FontStyle.Regular),
                    ForeColor = Color.FromArgb(148, 163, 184),
                    TextAlign = ContentAlignment.MiddleLeft
                };

                stepContainers[i] = stepItem;
                stepNumberLabels[i] = lblNum;
                stepTextLabels[i] = lblText;

                stepItem.Controls.Add(lblNum);
                stepItem.Controls.Add(lblText);
                sidebarPanel.Controls.Add(stepItem);

                stepY += 52;
            }

            this.Controls.Add(sidebarPanel);

            // ── 2. Bottom Footer (Explicit Bounds: 0, 515, 880, 65) ───────────
            footerPanel = new Panel
            {
                Location = new Point(0, 515),
                Size = new Size(880, 65),
                BackColor = Color.FromArgb(8, 11, 20),
                Padding = new Padding(24, 14, 24, 14)
            };

            Panel footerBorder = new Panel
            {
                Location = new Point(0, 0),
                Size = new Size(880, 1),
                BackColor = Color.FromArgb(30, 41, 59)
            };
            footerPanel.Controls.Add(footerBorder);

            btnCancel = new Button
            {
                Text = "Cancel",
                Location = new Point(765, 14),
                Size = new Size(90, 36),
                BackColor = Color.FromArgb(30, 41, 59),
                ForeColor = Color.FromArgb(241, 245, 249),
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnCancel.FlatAppearance.BorderColor = Color.FromArgb(71, 85, 105);
            btnCancel.Click += (s, e) => this.Close();
            footerPanel.Controls.Add(btnCancel);

            btnNext = new Button
            {
                Text = "Next >",
                Location = new Point(635, 14),
                Size = new Size(120, 36),
                BackColor = Color.FromArgb(0, 212, 255),
                ForeColor = Color.FromArgb(0, 0, 0),
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnNext.FlatAppearance.BorderSize = 0;
            btnNext.Click += BtnNext_Click;
            footerPanel.Controls.Add(btnNext);

            btnBack = new Button
            {
                Text = "< Back",
                Location = new Point(530, 14),
                Size = new Size(95, 36),
                BackColor = Color.FromArgb(30, 41, 59),
                ForeColor = Color.FromArgb(241, 245, 249),
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand,
                Enabled = false
            };
            btnBack.FlatAppearance.BorderColor = Color.FromArgb(71, 85, 105);
            btnBack.Click += (s, e) => ShowStep(currentStep - 1);
            footerPanel.Controls.Add(btnBack);

            this.Controls.Add(footerPanel);

            // ── 3. Content Panel (Explicit Bounds: 230, 0, 650, 515) ──────────
            contentPanel = new Panel
            {
                Location = new Point(230, 0),
                Size = new Size(650, 515),
                BackColor = Color.FromArgb(13, 17, 29),
                Padding = new Padding(28, 24, 28, 20)
            };
            this.Controls.Add(contentPanel);

            BuildStep1Panel();
            BuildStep2Panel();
            BuildStep3Panel();
            BuildStep4Panel();
            BuildStep5Panel();
        }

        // ═════════════════════════════════════════════════════════════════════
        // 1st Layer: About Chevron Nexus (With ChevronNexus Logo & Website)
        // ═════════════════════════════════════════════════════════════════════
        private void BuildStep1Panel()
        {
            step1Panel = new Panel
            {
                Location = new Point(0, 0),
                Size = new Size(650, 515),
                BackColor = Color.Transparent,
                Visible = false
            };

            // High-Res Logo Box
            PictureBox pic = new PictureBox
            {
                Location = new Point(28, 20),
                Size = new Size(110, 110),
                SizeMode = PictureBoxSizeMode.Zoom,
                Image = chevronLogo,
                BackColor = Color.FromArgb(18, 24, 40)
            };
            step1Panel.Controls.Add(pic);

            Label lblBadge = new Label
            {
                Text = "PRIVACY-FIRST PERSONAL INFRASTRUCTURE",
                Font = new Font("Segoe UI", 8.0f, FontStyle.Bold),
                ForeColor = Color.FromArgb(56, 189, 248),
                Location = new Point(155, 20),
                AutoSize = true
            };
            step1Panel.Controls.Add(lblBadge);

            Label lblHeader = new Label
            {
                Text = "Take Back Your Digital Sovereignty.",
                Font = new Font("Segoe UI", 16.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(255, 255, 255),
                Location = new Point(152, 42),
                Size = new Size(465, 34)
            };
            step1Panel.Controls.Add(lblHeader);

            LinkLabel lnkWeb = new LinkLabel
            {
                Text = "🌐 www.ChevronNexus.com",
                Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                LinkColor = Color.FromArgb(0, 212, 255),
                Location = new Point(155, 80),
                AutoSize = true
            };
            lnkWeb.LinkClicked += (s, e) =>
            {
                try { Process.Start("https://www.ChevronNexus.com"); } catch { }
            };
            step1Panel.Controls.Add(lnkWeb);

            Label lblDesc = new Label
            {
                Text = "Chevron Nexus develops local-first, decentralized software that turns your everyday hardware into secure, private infrastructure. No cloud subscriptions. Just complete ownership.",
                Font = new Font("Segoe UI", 9.0f, FontStyle.Regular),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(155, 105),
                Size = new Size(465, 45)
            };
            step1Panel.Controls.Add(lblDesc);

            // Philosophy Section
            Panel cardPanel = new Panel
            {
                Location = new Point(28, 155),
                Size = new Size(595, 335),
                BackColor = Color.FromArgb(19, 24, 41),
                Padding = new Padding(16)
            };

            Label lblPhilTitle = new Label
            {
                Text = "OUR CORE PHILOSOPHY",
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(56, 189, 248),
                Location = new Point(14, 12),
                AutoSize = true
            };
            cardPanel.Controls.Add(lblPhilTitle);

            Label lblPhilSub = new Label
            {
                Text = "We believe that modern software has lost its way, locking users into continuous subscription fees and stealing data. We are changing that.",
                Font = new Font("Segoe UI", 9.0f, FontStyle.Regular),
                ForeColor = Color.FromArgb(203, 213, 225),
                Location = new Point(14, 34),
                Size = new Size(565, 36)
            };
            cardPanel.Controls.Add(lblPhilSub);

            string[,] pillars = new string[,] {
                { "🏠  Local-First", "Your software runs directly on your computer and local network. It continues to work even if you have no internet access." },
                { "🔒  True Privacy", "We never collect, store, or sell your data. Everything is end-to-end encrypted and kept inside your physical devices." },
                { "⭐  One-Time Buy", "No subscriptions. Pay once, own the software forever. Get updates and features included in your major version." }
            };

            int py = 76;
            for (int i = 0; i < 3; i++)
            {
                Panel pCard = new Panel
                {
                    Location = new Point(14, py),
                    Size = new Size(565, 68),
                    BackColor = Color.FromArgb(26, 33, 56),
                    Padding = new Padding(12, 8, 12, 8)
                };

                Label pTitle = new Label
                {
                    Text = pillars[i, 0],
                    Font = new Font("Segoe UI", 9.5f, FontStyle.Bold),
                    ForeColor = Color.FromArgb(0, 212, 255),
                    Location = new Point(10, 8),
                    AutoSize = true
                };

                Label pDesc = new Label
                {
                    Text = pillars[i, 1],
                    Font = new Font("Segoe UI", 8.5f, FontStyle.Regular),
                    ForeColor = Color.FromArgb(203, 213, 225),
                    Location = new Point(10, 30),
                    Size = new Size(545, 32)
                };

                pCard.Controls.Add(pTitle);
                pCard.Controls.Add(pDesc);
                cardPanel.Controls.Add(pCard);
                py += 78;
            }

            step1Panel.Controls.Add(cardPanel);
            contentPanel.Controls.Add(step1Panel);
        }

        // ═════════════════════════════════════════════════════════════════════
        // 2nd Layer: About NeXusWeb (With NeXusWeb Logo & Features)
        // ═════════════════════════════════════════════════════════════════════
        private void BuildStep2Panel()
        {
            step2Panel = new Panel
            {
                Location = new Point(0, 0),
                Size = new Size(650, 515),
                BackColor = Color.Transparent,
                Visible = false
            };

            // High-Res Logo Box
            PictureBox pic = new PictureBox
            {
                Location = new Point(28, 20),
                Size = new Size(110, 110),
                SizeMode = PictureBoxSizeMode.Zoom,
                Image = nexuswebLogo,
                BackColor = Color.FromArgb(18, 24, 40)
            };
            step2Panel.Controls.Add(pic);

            Label lblBadge = new Label
            {
                Text = "PRODUCTION RELEASE • VERSION 6.0.0",
                Font = new Font("Segoe UI", 8.0f, FontStyle.Bold),
                ForeColor = Color.FromArgb(192, 132, 252),
                Location = new Point(155, 20),
                AutoSize = true
            };
            step2Panel.Controls.Add(lblBadge);

            Label lblHeader = new Label
            {
                Text = "NeXusWeb Developer Browser",
                Font = new Font("Segoe UI", 16.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(255, 255, 255),
                Location = new Point(152, 42),
                Size = new Size(465, 34)
            };
            step2Panel.Controls.Add(lblHeader);

            Label lblTag = new Label
            {
                Text = "The Sovereign Workstation & Privacy Web Client",
                Font = new Font("Segoe UI", 9.0f, FontStyle.Regular),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(155, 78),
                AutoSize = true
            };
            step2Panel.Controls.Add(lblTag);

            Label lblDesc2 = new Label
            {
                Text = "A high-performance workstation browser built from the ground up for developers and privacy advocates. Integrates multi-terminals, local server detection, and virtual sandbox privacy.",
                Font = new Font("Segoe UI", 8.5f, FontStyle.Regular),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(155, 102),
                Size = new Size(465, 45)
            };
            step2Panel.Controls.Add(lblDesc2);

            // Features Panel
            Panel cardPanel = new Panel
            {
                Location = new Point(28, 155),
                Size = new Size(595, 335),
                BackColor = Color.FromArgb(19, 24, 41),
                Padding = new Padding(14)
            };

            string[,] features = new string[,] {
                { "🕵️  Virtual Sandbox (Private Den)", "RAM-only browsing partition. Disallows history, cookies, and wipes 100% of data upon window close." },
                { "🛡️  Direct VPN & High-Speed Tunnels", "1-Click bypass proxy switching across worldwide locations (Direct, NL, US, SG, UK)." },
                { "🔒  WebRTC Leak Shield & Privacy Filter", "Stops STUN IP leaks and injects anti-fingerprint noise to thwart online tracking." },
                { "⚡  Developer Suite & Live Port Scanner", "Integrated multi-terminal shell, REST workbench, and live localhost port auto-discovery." },
                { "📖  Distraction-Free Reader Mode", "Transforms noisy web pages into clean reading views with 10 customizable typography fonts." }
            };

            int fy = 10;
            for (int i = 0; i < 5; i++)
            {
                Panel fCard = new Panel
                {
                    Location = new Point(14, fy),
                    Size = new Size(565, 54),
                    BackColor = Color.FromArgb(26, 33, 56),
                    Padding = new Padding(10, 6, 10, 6)
                };

                Label fTitle = new Label
                {
                    Text = features[i, 0],
                    Font = new Font("Segoe UI", 9.0f, FontStyle.Bold),
                    ForeColor = Color.FromArgb(192, 132, 252),
                    Location = new Point(8, 6),
                    AutoSize = true
                };

                Label fDesc = new Label
                {
                    Text = features[i, 1],
                    Font = new Font("Segoe UI", 8.0f, FontStyle.Regular),
                    ForeColor = Color.FromArgb(203, 213, 225),
                    Location = new Point(8, 26),
                    Size = new Size(545, 22)
                };

                fCard.Controls.Add(fTitle);
                fCard.Controls.Add(fDesc);
                cardPanel.Controls.Add(fCard);
                fy += 62;
            }

            step2Panel.Controls.Add(cardPanel);
            contentPanel.Controls.Add(step2Panel);
        }

        // ═════════════════════════════════════════════════════════════════════
        // 3rd Layer: Disclaimer & Terms
        // ═════════════════════════════════════════════════════════════════════
        private void BuildStep3Panel()
        {
            step3Panel = new Panel
            {
                Location = new Point(0, 0),
                Size = new Size(650, 515),
                BackColor = Color.Transparent,
                Visible = false
            };

            Label lblTitle = new Label
            {
                Text = "Disclaimer & Privacy Commitment",
                Font = new Font("Segoe UI", 16.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(0, 212, 255),
                Location = new Point(28, 20),
                AutoSize = true
            };
            step3Panel.Controls.Add(lblTitle);

            Label lblSubtitle = new Label
            {
                Text = "Please review our privacy principles and license terms before proceeding with the setup.",
                Font = new Font("Segoe UI", 9.0f, FontStyle.Regular),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(28, 54),
                AutoSize = true
            };
            step3Panel.Controls.Add(lblSubtitle);

            TextBox txtDisclaimer = new TextBox
            {
                Multiline = true,
                ReadOnly = true,
                ScrollBars = ScrollBars.Vertical,
                Location = new Point(28, 85),
                Size = new Size(595, 335),
                BackColor = Color.FromArgb(19, 24, 41),
                ForeColor = Color.FromArgb(226, 232, 240),
                Font = new Font("Segoe UI", 9.0f, FontStyle.Regular),
                BorderStyle = BorderStyle.FixedSingle,
                Text = "CHEVRON NEXUS SOFTWARE — DISCLAIMER & PRIVACY COMMITMENT\r\n" +
                       "Last Updated: August 2026\r\n\r\n" +
                       "1. ZERO-TELEMETRY GUARANTEE\r\n" +
                       "Chevron Nexus Software does not collect, record, track, transmit, or monetize your personal browsing history, queries, bookmarks, or form inputs. Your activity never leaves your local physical device.\r\n\r\n" +
                       "2. LOCAL-FIRST ARCHITECTURE\r\n" +
                       "All configuration files, browser cache, extensions, notes, and credentials remain strictly stored on your computer under your direct physical ownership.\r\n\r\n" +
                       "3. NETWORK ISOLATION MODES\r\n" +
                       "NeXusWeb provides configurable security isolation modes (Normal, LAN, Strict, and Dev). Dev Mode relaxes certain web security checks for local testing. Users are advised to use Normal or Strict mode when navigating public websites.\r\n\r\n" +
                       "4. VIRTUAL SANDBOX & PRIVATE DEN\r\n" +
                       "Private Den operates in an ephemeral RAM partition. Closing a Private Den window triggers an irrecoverable wipe of cached sessions, cookies, and network storage.\r\n\r\n" +
                       "5. SOFTWARE LICENSE\r\n" +
                       "This software is provided on an 'AS IS' basis without warranty of any kind. By clicking 'Next', you acknowledge and accept these terms."
            };
            step3Panel.Controls.Add(txtDisclaimer);

            chkAgreeDisclaimer = new CheckBox
            {
                Text = "I have read and agree to the Chevron Nexus Software Disclaimer and Terms",
                Location = new Point(32, 440),
                Size = new Size(585, 26),
                Checked = true,
                ForeColor = Color.FromArgb(241, 245, 249),
                Font = new Font("Segoe UI", 9.0f, FontStyle.Bold)
            };
            chkAgreeDisclaimer.CheckedChanged += (s, e) =>
            {
                btnNext.Enabled = chkAgreeDisclaimer.Checked;
            };
            step3Panel.Controls.Add(chkAgreeDisclaimer);

            contentPanel.Controls.Add(step3Panel);
        }

        // ═════════════════════════════════════════════════════════════════════
        // 4th Layer: Install / Upgrade Section (Browse Path)
        // ═════════════════════════════════════════════════════════════════════
        private void BuildStep4Panel()
        {
            step4Panel = new Panel
            {
                Location = new Point(0, 0),
                Size = new Size(650, 515),
                BackColor = Color.Transparent,
                Visible = false
            };

            Label lblTitle = new Label
            {
                Text = isUpgradeMode ? "NeXusWeb In-Place Upgrade" : "Installation Destination & Options",
                Font = new Font("Segoe UI", 16.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(0, 212, 255),
                Location = new Point(28, 20),
                AutoSize = true
            };
            step4Panel.Controls.Add(lblTitle);

            Label lblSub = new Label
            {
                Text = isUpgradeMode
                    ? "Existing installation detected. Upgrades engine to v6.0.0 while preserving 100% of your bookmarks, history, and tabs."
                    : "Select the installation destination folder and shortcut preferences.",
                Font = new Font("Segoe UI", 9.0f, FontStyle.Regular),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(28, 54),
                Size = new Size(595, 32)
            };
            step4Panel.Controls.Add(lblSub);

            Panel pathCard = new Panel
            {
                Location = new Point(28, 95),
                Size = new Size(595, 95),
                BackColor = Color.FromArgb(19, 24, 41),
                Padding = new Padding(16)
            };

            Label lblPath = new Label
            {
                Text = "Destination Directory:",
                Location = new Point(14, 12),
                AutoSize = true,
                Font = new Font("Segoe UI", 9.0f, FontStyle.Bold),
                ForeColor = Color.FromArgb(203, 213, 225)
            };
            pathCard.Controls.Add(lblPath);

            txtInstallDir = new TextBox
            {
                Text = targetDir,
                Location = new Point(14, 38),
                Size = new Size(450, 28),
                BackColor = Color.FromArgb(26, 33, 56),
                ForeColor = Color.FromArgb(241, 245, 249),
                BorderStyle = BorderStyle.FixedSingle,
                Font = new Font("Segoe UI", 9.0f, FontStyle.Regular)
            };
            pathCard.Controls.Add(txtInstallDir);

            btnBrowse = new Button
            {
                Text = "Browse...",
                Location = new Point(475, 36),
                Size = new Size(100, 30),
                BackColor = Color.FromArgb(30, 41, 59),
                ForeColor = Color.FromArgb(241, 245, 249),
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btnBrowse.FlatAppearance.BorderColor = Color.FromArgb(71, 85, 105);
            btnBrowse.Click += (s, e) =>
            {
                using (var fbd = new FolderBrowserDialog())
                {
                    fbd.Description = "Select NeXusWeb Installation Directory";
                    fbd.SelectedPath = txtInstallDir.Text;
                    if (fbd.ShowDialog() == DialogResult.OK)
                    {
                        txtInstallDir.Text = fbd.SelectedPath;
                        this.targetDir = fbd.SelectedPath;
                    }
                }
            };
            pathCard.Controls.Add(btnBrowse);
            step4Panel.Controls.Add(pathCard);

            // Options Card
            Panel optCard = new Panel
            {
                Location = new Point(28, 205),
                Size = new Size(595, 130),
                BackColor = Color.FromArgb(19, 24, 41),
                Padding = new Padding(16)
            };

            chkDesktop = new CheckBox
            {
                Text = "Create Desktop Shortcut",
                Checked = true,
                Location = new Point(16, 14),
                AutoSize = true,
                ForeColor = Color.FromArgb(226, 232, 240)
            };
            optCard.Controls.Add(chkDesktop);

            chkStartMenu = new CheckBox
            {
                Text = "Create Start Menu Shortcut",
                Checked = true,
                Location = new Point(16, 48),
                AutoSize = true,
                ForeColor = Color.FromArgb(226, 232, 240)
            };
            optCard.Controls.Add(chkStartMenu);

            chkLaunch = new CheckBox
            {
                Text = "Launch NeXusWeb when setup completes",
                Checked = true,
                Location = new Point(16, 82),
                AutoSize = true,
                ForeColor = Color.FromArgb(226, 232, 240)
            };
            optCard.Controls.Add(chkLaunch);
            step4Panel.Controls.Add(optCard);

            // Progress Bar & Status
            lblStatus = new Label
            {
                Text = "Ready to proceed.",
                Location = new Point(28, 355),
                Size = new Size(595, 24),
                ForeColor = Color.FromArgb(148, 163, 184)
            };
            step4Panel.Controls.Add(lblStatus);

            progressBar = new ProgressBar
            {
                Location = new Point(28, 385),
                Size = new Size(595, 18),
                Style = ProgressBarStyle.Continuous,
                Value = 0
            };
            step4Panel.Controls.Add(progressBar);

            contentPanel.Controls.Add(step4Panel);
        }

        // ═════════════════════════════════════════════════════════════════════
        // 5th Layer: Thanks For Choosing ChevronNexus & Note
        // ═════════════════════════════════════════════════════════════════════
        private void BuildStep5Panel()
        {
            step5Panel = new Panel
            {
                Location = new Point(0, 0),
                Size = new Size(650, 515),
                BackColor = Color.Transparent,
                Visible = false
            };

            // Logos Side-by-Side
            PictureBox picCh = new PictureBox
            {
                Location = new Point(28, 20),
                Size = new Size(90, 90),
                SizeMode = PictureBoxSizeMode.Zoom,
                Image = chevronLogo,
                BackColor = Color.FromArgb(18, 24, 40)
            };
            step5Panel.Controls.Add(picCh);

            PictureBox picNx = new PictureBox
            {
                Location = new Point(130, 20),
                Size = new Size(90, 90),
                SizeMode = PictureBoxSizeMode.Zoom,
                Image = nexuswebLogo,
                BackColor = Color.FromArgb(18, 24, 40)
            };
            step5Panel.Controls.Add(picNx);

            Label lblThanks = new Label
            {
                Text = "Thanks For Choosing ChevronNexus!",
                Font = new Font("Segoe UI", 16.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(0, 212, 255),
                Location = new Point(235, 28),
                Size = new Size(390, 34)
            };
            step5Panel.Controls.Add(lblThanks);

            Label lblDoneSub = new Label
            {
                Text = "NeXusWeb v6.0.0 is ready on your machine.",
                Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(238, 68),
                AutoSize = true
            };
            step5Panel.Controls.Add(lblDoneSub);

            Panel cardPanel = new Panel
            {
                Location = new Point(28, 130),
                Size = new Size(595, 340),
                BackColor = Color.FromArgb(19, 24, 41),
                Padding = new Padding(18)
            };

            Label lblNoteTitle = new Label
            {
                Text = "A NOTE FROM CHEVRON NEXUS",
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(56, 189, 248),
                Location = new Point(14, 14),
                AutoSize = true
            };
            cardPanel.Controls.Add(lblNoteTitle);

            Label lblNote = new Label
            {
                Text = "Thank you for joining the movement for digital sovereignty. We believe software should empower you, respect your privacy, and never rent back your own hardware to you.\r\n\r\n" +
                       "NeXusWeb is built local-first. Your bookmarks, tabs, notes, and history will always remain in your hands.\r\n\r\n" +
                       "Enjoy seamless, secure, and blazingly fast web browsing!",
                Font = new Font("Segoe UI", 9.5f, FontStyle.Regular),
                ForeColor = Color.FromArgb(226, 232, 240),
                Location = new Point(14, 40),
                Size = new Size(565, 140)
            };
            cardPanel.Controls.Add(lblNote);

            Panel pSummary = new Panel
            {
                Location = new Point(14, 195),
                Size = new Size(565, 120),
                BackColor = Color.FromArgb(26, 33, 56),
                Padding = new Padding(14)
            };

            Label s1 = new Label { Text = "Installed Build: NeXusWeb v6.0.0 Stable (x64 Windows)", Location = new Point(14, 12), AutoSize = true, ForeColor = Color.FromArgb(0, 212, 255), Font = new Font("Segoe UI", 9.0f, FontStyle.Bold) };
            Label s2 = new Label { Text = "Publisher: Chevron Nexus Software", Location = new Point(14, 38), AutoSize = true, ForeColor = Color.FromArgb(148, 163, 184) };
            Label s3 = new Label { Text = "Website: www.ChevronNexus.com", Location = new Point(14, 64), AutoSize = true, ForeColor = Color.FromArgb(148, 163, 184) };
            Label s4 = new Label { Text = "Privacy Guarantee: 100% Local-First & Zero Telemetry", Location = new Point(14, 90), AutoSize = true, ForeColor = Color.FromArgb(34, 197, 94) };

            pSummary.Controls.Add(s1);
            pSummary.Controls.Add(s2);
            pSummary.Controls.Add(s3);
            pSummary.Controls.Add(s4);
            cardPanel.Controls.Add(pSummary);

            step5Panel.Controls.Add(cardPanel);
            contentPanel.Controls.Add(step5Panel);
        }

        // ═════════════════════════════════════════════════════════════════════
        // Step Navigation Controller
        // ═════════════════════════════════════════════════════════════════════
        private void ShowStep(int step)
        {
            if (step < 1 || step > TOTAL_STEPS) return;
            currentStep = step;

            step1Panel.Visible = (step == 1);
            step2Panel.Visible = (step == 2);
            step3Panel.Visible = (step == 3);
            step4Panel.Visible = (step == 4);
            step5Panel.Visible = (step == 5);

            // Update Sidebar highlighting
            for (int i = 0; i < TOTAL_STEPS; i++)
            {
                if (i + 1 == step)
                {
                    stepNumberLabels[i].ForeColor = Color.FromArgb(0, 0, 0);
                    stepNumberLabels[i].BackColor = Color.FromArgb(0, 212, 255);
                    stepTextLabels[i].ForeColor = Color.FromArgb(0, 212, 255);
                    stepTextLabels[i].Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                    stepContainers[i].BackColor = Color.FromArgb(20, 28, 48);
                }
                else if (i + 1 < step)
                {
                    stepNumberLabels[i].ForeColor = Color.FromArgb(255, 255, 255);
                    stepNumberLabels[i].BackColor = Color.FromArgb(34, 197, 94); // Completed Green
                    stepTextLabels[i].ForeColor = Color.FromArgb(34, 197, 94);
                    stepTextLabels[i].Font = new Font("Segoe UI", 8.5f, FontStyle.Regular);
                    stepContainers[i].BackColor = Color.Transparent;
                }
                else
                {
                    stepNumberLabels[i].ForeColor = Color.FromArgb(100, 116, 139);
                    stepNumberLabels[i].BackColor = Color.FromArgb(20, 28, 48);
                    stepTextLabels[i].ForeColor = Color.FromArgb(100, 116, 139);
                    stepTextLabels[i].Font = new Font("Segoe UI", 8.5f, FontStyle.Regular);
                    stepContainers[i].BackColor = Color.Transparent;
                }
            }

            btnBack.Enabled = (step > 1 && step < 5 && !isInstalling);

            if (step == 3)
            {
                btnNext.Text = "Next >";
                btnNext.Enabled = chkAgreeDisclaimer.Checked;
            }
            else if (step == 4)
            {
                btnNext.Text = isUpgradeMode ? "Upgrade Now" : "Install Now";
                btnNext.Enabled = !isInstalling;
            }
            else if (step == 5)
            {
                btnNext.Text = "Launch & Finish";
                btnNext.Enabled = true;
                btnBack.Visible = false;
                btnCancel.Visible = false;
            }
            else
            {
                btnNext.Text = "Next >";
                btnNext.Enabled = true;
            }
        }

        private void BtnNext_Click(object sender, EventArgs e)
        {
            if (currentStep == 4)
            {
                StartInstallation();
            }
            else if (currentStep == 5)
            {
                string exePath = Path.Combine(targetDir, "NeXusWeb-V6.exe");
                if (chkLaunch.Checked && File.Exists(exePath))
                {
                    try
                    {
                        Process.Start(new ProcessStartInfo
                        {
                            FileName = exePath,
                            WorkingDirectory = targetDir,
                            UseShellExecute = true
                        });
                    }
                    catch { }
                }
                this.Close();
            }
            else
            {
                ShowStep(currentStep + 1);
            }
        }

        private void StartInstallation()
        {
            isInstalling = true;
            btnNext.Enabled = false;
            btnBack.Enabled = false;
            btnCancel.Enabled = false;
            btnBrowse.Enabled = false;
            txtInstallDir.ReadOnly = true;
            chkDesktop.Enabled = false;
            chkStartMenu.Enabled = false;
            chkLaunch.Enabled = false;

            this.targetDir = txtInstallDir.Text.Trim();
            if (string.IsNullOrEmpty(this.targetDir))
            {
                this.targetDir = Program.GetDefaultInstallDir();
            }

            Thread worker = new Thread(() =>
            {
                try
                {
                    UpdateStatus(5, "Terminating any running NeXusWeb instances...");
                    Program.TerminateRunningProcesses();

                    UpdateStatus(15, "Preparing target installation directory...");
                    if (!Directory.Exists(targetDir))
                    {
                        Directory.CreateDirectory(targetDir);
                    }

                    Program.ExtractPayload(targetDir, (pct, status) =>
                    {
                        UpdateStatus(pct, status);
                    });

                    UpdateStatus(88, "Configuring shortcuts and Windows integration...");
                    string exePath = Path.Combine(targetDir, "NeXusWeb-V6.exe");
                    string appIcoPath = Path.Combine(targetDir, "app.ico");

                    try
                    {
                        Image img = Program.ImageFromBase64(LogoData.NeXusWebLogoBase64);
                        if (img != null)
                        {
                            using (var bmp = new Bitmap(img, new Size(256, 256)))
                            {
                                IntPtr hIcon = bmp.GetHicon();
                                using (var ico = Icon.FromHandle(hIcon))
                                using (var fs = new FileStream(appIcoPath, FileMode.Create))
                                {
                                    ico.Save(fs);
                                }
                            }
                        }
                    }
                    catch { }

                    string iconTarget = File.Exists(appIcoPath) ? appIcoPath : exePath;

                    if (chkDesktop.Checked)
                    {
                        string desktopPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), "NeXusWeb V6.lnk");
                        Program.CreateShortcut(desktopPath, exePath, "NeXusWeb V6 by Chevron Nexus Software", iconTarget);
                    }

                    if (chkStartMenu.Checked)
                    {
                        string startMenuPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "NeXusWeb V6.lnk");
                        Program.CreateShortcut(startMenuPath, exePath, "NeXusWeb V6 by Chevron Nexus Software", iconTarget);
                    }

                    Program.RegisterUninstall(targetDir, iconTarget);

                    try
                    {
                        string currentExe = Process.GetCurrentProcess().MainModule.FileName;
                        string destSetup = Path.Combine(targetDir, "setup.exe");
                        if (!string.Equals(currentExe, destSetup, StringComparison.OrdinalIgnoreCase))
                        {
                            File.Copy(currentExe, destSetup, true);
                        }
                    }
                    catch { }

                    UpdateStatus(100, isUpgradeMode ? "Upgrade complete! All user data preserved." : "Installation completed successfully!");

                    this.Invoke(new Action(() =>
                    {
                        isInstalling = false;
                        ShowStep(5);
                    }));
                }
                catch (Exception ex)
                {
                    this.Invoke(new Action(() =>
                    {
                        isInstalling = false;
                        lblStatus.ForeColor = Color.FromArgb(248, 113, 113);
                        lblStatus.Text = "Error: " + ex.Message;
                        btnCancel.Enabled = true;
                        btnBack.Enabled = true;
                        btnNext.Enabled = true;
                        MessageBox.Show("Installation failed: " + ex.Message, "Setup Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }));
                }
            });

            worker.IsBackground = true;
            worker.Start();
        }

        private void UpdateStatus(int progress, string text)
        {
            if (this.IsDisposed || !this.IsHandleCreated) return;
            this.Invoke(new Action(() =>
            {
                progressBar.Value = Math.Min(100, Math.Max(0, progress));
                lblStatus.Text = text;
            }));
        }
    }
}
