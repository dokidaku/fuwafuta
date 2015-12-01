using System;
using System.Collections;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace TwoDoubleThree {
    public enum BulletType {
        TOP_SLIDING, TOP_STICKY, BOTTOM_STICKY
    }
    public class BulletInfo {
        public BulletDisp bullet;
        public BulletType type;
        public int id;
        public long startTime, finishTime;
        public double xStartPos;
        public double xSpeed;
    }

    public class DanmakuPool : Form {
        protected Timer timer;
        SortedList bullets;
        private static int lastID = 0;

        public DanmakuPool() {
            this.InitializeComponent();
            this.bullets = new SortedList();
        }

        private void InitializeComponent() {
            this.timer = new Timer();
            timer.Interval = 20;
            timer.Enabled = true;
            timer.Tick += Timer_Tick;
            timer.Start();

            this.FormBorderStyle = FormBorderStyle.None;
            this.TransparencyKey = this.BackColor;
        }

        //private long lastTick;
        private void Timer_Tick(object sender, EventArgs e) {
            long now = DateTime.Now.Ticks;
            BulletInfo bif;
            foreach (DictionaryEntry o in this.bullets) {
                bif = (BulletInfo)(o.Value);
                if (bif.finishTime <= now) {
                    bif.bullet.Hide();
                    this.bullets.Remove(bif.id);
                    return;
                }
            }
            //int delta = (new TimeSpan(now - lastTick)).Seconds;
            foreach (DictionaryEntry o in this.bullets) {
                bif = (BulletInfo)(o.Value);
                bif.bullet.Left =
                    (int)(bif.xStartPos + bif.xSpeed * (now - bif.startTime) / TimeSpan.TicksPerSecond);
            }
            //lastTick = now;
        }

        public void Fire(BulletType type, String text, Color color) {
            BulletInfo bif = new BulletInfo();
            int x = 20, y = 50 + lastID * 70;
            double xStartPos = SystemInformation.WorkingArea.Size.Width;
            double xSpeed = -120.0;
            bif.bullet = BulletDisp.Fire(text, color, x, y);
            bif.type = type;
            bif.id = ++lastID;
            bif.startTime = DateTime.Now.Ticks;
            bif.finishTime = DateTime.Now.AddSeconds(lastID + 5).Ticks;
            bif.xStartPos = xStartPos;
            bif.xSpeed = xSpeed;
            bullets.Add(bif.id, bif);
        }
    }
}
