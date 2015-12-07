using System;
using System.Collections;
using System.Collections.Generic;
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

    public class DanmakuLayer : Form {
        protected Timer timer;
        protected SortedList bullets;
        private static int lastID = 0;
        protected Random random = new Random();

        public const int XOffset = 20;
        public const int YOffset = 20;
        public static int LineHeight = 60;
        public static int TimerInterval = 40;

        public DanmakuLayer() {
            this.InitializeComponent();
            this.bullets = new SortedList();
        }

        private void InitializeComponent() {
            this.timer = new Timer();
            timer.Interval = TimerInterval;
            timer.Enabled = true;
            timer.Tick += Timer_Tick;
            timer.Start();

            this.FormBorderStyle = FormBorderStyle.None;
            this.Size = SystemInformation.WorkingArea.Size;
            this.StartPosition = FormStartPosition.Manual;
            this.Location = new Point(0, 0);
            this.BackColor = this.TransparencyKey = BulletDisp.BackgroundColor;
            this.ShowInTaskbar = false;
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

        protected double randomBetween(double l, double h) {
            return random.NextDouble() * (h - l) + l;
        }

        protected virtual bool AllocateSpace(ref BulletInfo bif) {
            Console.WriteLine("WARNING: This DanmakuLayer base class should not be used; use TopSlideDanmakuLayer etc. instead.");
            bif.xStartPos = 0;
            bif.xSpeed = 0;
            bif.bullet.Location = new Point(0, 0);
            bif.startTime = DateTime.Now.Ticks;
            bif.finishTime = DateTime.Now.AddSeconds(5).Ticks;
            return true;
        }
        public bool Fire(String text, Color color) {
            BulletInfo bif = new BulletInfo();
            bif.id = ++lastID;
            bif.bullet = BulletDisp.Fire(text, color, 0, 0);
            this.Controls.Add(bif.bullet);
            if (!this.AllocateSpace(ref bif)) {
                this.Controls.Remove(bif.bullet);
                bif.bullet.Dispose();
                return false;
            }
            bif.bullet.Show();
            bullets.Add(bif.id, bif);
            return true;
        }
        public void Fire(double delay, String text, Color color) {
            if (delay <= 0) {
                this.Fire(text, color);
            } else {
                Timer t = new Timer();
                t.Interval = (int)(delay * 1000);
                t.Tag = new KeyValuePair<String, Color>(text, color);
                t.Tick += DelayTimer_Tick;
                t.Start();
            }
        }
        private void DelayTimer_Tick(object sender, EventArgs e) {
            KeyValuePair<String, Color> args = (KeyValuePair<String, Color>)((Timer)sender).Tag;
            this.Fire(args.Key, args.Value);
            ((Timer)sender).Dispose();
        }
    }

    public class TopSlideDanmakuLayer : DanmakuLayer {
        public const double SlidingMinDuration = 5;
        public const double SlidingMaxDuration = 9;
        protected int MaxRows;
        protected long[] nextUnblockTime;
        protected long[] nextEmptyTime;

        public TopSlideDanmakuLayer() {
            this.MaxRows = SystemInformation.WorkingArea.Size.Height / LineHeight;
            this.nextUnblockTime = new long[MaxRows];
            this.nextEmptyTime = new long[MaxRows];
            for (int i = 0; i < MaxRows; ++i) {
                nextUnblockTime[i] = 0;
                nextEmptyTime[i] = 0;
            }
        }

        protected int GetAvailableRow(long blockTime, long borderTouchTime, long disappearTime) {
            long now = DateTime.Now.Ticks;
            int i = 0;
            for (; i < MaxRows; ++i) {
                if (nextUnblockTime[i] <= now && nextEmptyTime[i] <= borderTouchTime) {
                    nextUnblockTime[i] = blockTime;
                    nextEmptyTime[i] = disappearTime;
                    return i;
                }
            }
            return -1;
        }

        protected override bool AllocateSpace(ref BulletInfo bif) {
            double w = SystemInformation.WorkingArea.Size.Width;
            double xSpeed = -w / randomBetween(SlidingMinDuration, SlidingMaxDuration);
            bif.xStartPos = w;
            bif.xSpeed = xSpeed;
            bif.startTime = DateTime.Now.Ticks;
            bif.finishTime = DateTime.Now.AddSeconds((w + bif.bullet.Width) / -xSpeed).Ticks;
            long blockUntil = DateTime.Now.AddSeconds(bif.bullet.Width / -xSpeed).Ticks;
            long borderTouchTime = DateTime.Now.AddSeconds(w / -xSpeed).Ticks;
            int row = GetAvailableRow(blockUntil, borderTouchTime, bif.finishTime);
            if (row == -1) return false;
            double y = YOffset + LineHeight * row;
            bif.bullet.Location = new Point((int)w, (int)y);
            return true;
        }
    }

    public class TopStickDanmakuLayer : DanmakuLayer {
        public const double StickDuration = 6;
        public int MaxRows;
        protected long[] nextEmptyTime;

        public TopStickDanmakuLayer() {
            this.MaxRows = SystemInformation.WorkingArea.Size.Height / LineHeight;
            this.nextEmptyTime = new long[MaxRows];
            for (int i = 0; i < MaxRows; ++i) {
                nextEmptyTime[i] = 0;
            }
        }

        protected int GetAvailableRow(long disappearTime) {
            long now = DateTime.Now.Ticks;
            for (int i = 0; i < MaxRows; ++i) {
                if (nextEmptyTime[i] <= now) {
                    nextEmptyTime[i] = disappearTime;
                    return i;
                }
            }
            return -1;
        }

        protected override bool AllocateSpace(ref BulletInfo bif) {
            double w = SystemInformation.WorkingArea.Size.Width;
            bif.xStartPos = (w - bif.bullet.Width) / 2;
            bif.xSpeed = 0;
            bif.startTime = DateTime.Now.Ticks;
            bif.finishTime = DateTime.Now.AddSeconds(StickDuration).Ticks;
            int row = GetAvailableRow(bif.finishTime);
            if (row == -1) return false;
            double y = YOffset + LineHeight * row;
            bif.bullet.Location = new Point((int)w, (int)y);
            return true;
        }
    }

    public class BottomStickDanmakuLayer : TopStickDanmakuLayer {
        protected override bool AllocateSpace(ref BulletInfo bif) {
            if (!base.AllocateSpace(ref bif)) return false;
            double h = SystemInformation.WorkingArea.Size.Height;
            bif.bullet.Location =
                new Point(bif.bullet.Location.X, (int)(h - LineHeight + YOffset - bif.bullet.Location.Y));
            return true;
        }
    }
}
