using System;
using System.Collections;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace TwoDoubleThree {
    public class BulletInfo {
        public BulletDisp bullet;
        public int id;
        public long startTime, finishTime;
        public double xStartPos;
        public double xSpeed;
    }

    public class DanmakuPool : Form {
        protected Timer timer;
        SortedList bullets;
        private static int lastID = 0;
        protected Random random = new Random();

        public const int XOffset = 20;
        public const int YOffset = 20;
        public const int LineHeight = 64;
        public const double SlidingMinDuration = 5;
        public const double SlidingMaxDuration = 9;

        public DanmakuPool() {
            this.InitializeComponent();
            this.bullets = new SortedList();
        }

        private void InitializeComponent() {
            this.timer = new Timer();
            timer.Interval = 40;
            timer.Enabled = true;
            timer.Tick += Timer_Tick;
            timer.Start();

            this.FormBorderStyle = FormBorderStyle.None;
            this.Size = SystemInformation.WorkingArea.Size;
            this.StartPosition = FormStartPosition.Manual;
            this.Location = new Point(0, 0);
            this.BackColor = this.TransparencyKey = BulletDisp.BackgroundColor;
        }

        private void Timer_Tick(object sender, EventArgs e) {
            long now = DateTime.Now.Ticks;
            BulletInfo bif;
            foreach (DictionaryEntry o in this.bullets) {
                bif = (BulletInfo)(o.Value);
                if (bif.finishTime <= now) {
                    this.Controls.Remove(bif.bullet);
                    bif.bullet.Dispose();
                    this.bullets.Remove(bif.id);
                    break;
                }
            }
            foreach (DictionaryEntry o in this.bullets) {
                bif = (BulletInfo)(o.Value);
                bif.bullet.Left =
                    (int)(bif.xStartPos + bif.xSpeed * (now - bif.startTime) / TimeSpan.TicksPerSecond);
            }
        }

        private double randomBetween(double l, double h) {
            return random.NextDouble() * (h - l) + l;
        }

        protected void AllocateSpace(ref BulletInfo bif) {
            double y = YOffset + LineHeight * bif.id;
            double w = SystemInformation.WorkingArea.Size.Width;
            double xStartPos = SystemInformation.WorkingArea.Size.Width;
            double xSpeed = -w / randomBetween(SlidingMinDuration, SlidingMaxDuration);
            bif.xStartPos = xStartPos;
            bif.xSpeed = xSpeed;
            bif.bullet.Location = new Point((int)w, (int)y);
            bif.startTime = DateTime.Now.Ticks;
            bif.finishTime = DateTime.Now.AddSeconds((w + bif.bullet.Width) / -xSpeed).Ticks;
        }
        public void Fire(String text, Color color) {
            BulletInfo bif = new BulletInfo();
            bif.id = ++lastID;
            bif.bullet = BulletDisp.Fire(text, color, 0, 0);
            this.AllocateSpace(ref bif);
            this.Controls.Add(bif.bullet);
            bif.bullet.Show();
            bullets.Add(bif.id, bif);
        }
    }
}
