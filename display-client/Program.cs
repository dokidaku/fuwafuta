using System;
using System.Collections;
using System.Drawing;
using System.IO;
using System.Text;
using System.Windows.Forms;
using Quobject.SocketIoClientDotNet.Client;
using Newtonsoft.Json.Linq;

namespace TwoDoubleThree {
    public class Program {
        static string serverUrl = "http://localhost:25252/";

        static Form f;
        static Label l;
        static DanmakuPool pool;
        static bool started = false;
        static Timer connectTimer;

        private static void LoadSettings() {
            string[] lines = File.ReadAllLines("settings.txt", Encoding.UTF8);
            Hashtable h = new Hashtable(1, 1.0F);
            string splitter = " - ";
            for (int i = 0; i < lines.Length; ++i) {
                int pos = lines[i].IndexOf(splitter);
                if (pos == -1) continue;
                h.Add(lines[i].Substring(0, pos), lines[i].Substring(pos + splitter.Length));
                // Console.WriteLine(lines[i].Substring(0, pos) + '\n' + lines[i].Substring(pos + splitter.Length));
            }
            // Load
            Program.serverUrl = (string)h["Host"];
            BulletDisp.FontName = (string)h["Font Family"];
            BulletDisp.DefaultFontSize = int.Parse((string)h["Font Size"]);
            DanmakuLayer.LineHeight = int.Parse((string)h["Line Height"]);
            DanmakuLayer.TimerInterval = int.Parse((string)h["Timer Interval"]);
            DanmakuPool.MaxLayers = int.Parse((string)h["Display Layers"]);
        }

        public static void Main() {
            LoadSettings();

            f = new Form();
            l = new Label();
            l.Font = new Font(BulletDisp.FontName, 28);
            l.Text = "Initializing (*/ω＼*)\nServer: " + serverUrl;
            l.AutoSize = false;
            f.Size = l.Size = new Size(SystemInformation.WorkingArea.Width, 108);
            l.Location = new Point(0, 0);
            l.TextAlign = ContentAlignment.MiddleCenter;
            f.Controls.Add(l);
            f.FormBorderStyle = FormBorderStyle.None;
            f.StartPosition = FormStartPosition.CenterScreen;

            Socket socket = IO.Socket(serverUrl);
            socket.Connect();

            socket.On("registResult", (data) => {
                if (started) return; // Prevent multiple messages
                if ((string)data == "ok") {
                    l.Text = "Connected! ヾ(＠⌒ー⌒＠)ノ";
                    started = true;
                    Timer t = new Timer();
                    t.Interval = 3000;
                    t.Tick += (object sender, EventArgs e) => {
                        ((Timer)sender).Dispose();
                        connectTimer.Dispose();
                        f.Hide();
                        pool = new DanmakuPool();
                        pool.Fire(BulletType.TOP_STICKY, "Let's have fun :)", Color.White);
                    };
                    t.Start();
                } else {
                    l.Text = "There's already a displayer connected T^T Quitting";
                    Timer t = new Timer();
                    t.Interval = 3000;
                    t.Tick += (object sender, EventArgs e) => Application.Exit();
                    t.Start();
                }
            });

            socket.On("comment", (data) => {
                JToken json = data as JToken;
                string text = json.Value<string>("text");
                int type = json.Value<int>("type");
                JToken c = json.SelectToken("color");
                int i = 0, r = 255, g = 255, b = 255;
                foreach (var val in c) {
                    if (++i == 1) r = (int)val;
                    else if (i == 2) g = (int)val;
                    else b = (int)val;
                }
                // Delay 50 ms to prevent trouble caused by multi-threading... qwq
                pool.Fire((BulletType)type, 0.05, text, Color.FromArgb(r, g, b));
            });

            socket.On(Socket.EVENT_CONNECT, () => {
                connectTimer = new Timer();
                connectTimer.Interval = 1000;
                connectTimer.Tick += (object sender, EventArgs e) => socket.Emit("registAsDisp");
                connectTimer.Start();
            });

            f.FormClosed += (object sender, FormClosedEventArgs e) => socket.Close();
            Application.Run(f);
        }
    }
}
