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
            timer.Interval = 50;
            timer.Enabled = true;
            timer.Tick += Timer_Tick;
            //this.Controls.Add(timer);

            this.FormBorderStyle = FormBorderStyle.None;
            this.TransparencyKey = this.BackColor;
        }

        private void Timer_Tick(object sender, EventArgs e) {
            
        }

        public void Fire(BulletType type, String text, Color color) {
            BulletInfo bif = new BulletInfo();
            int x = 20, y = 50;
            bif.bullet = BulletDisp.Fire(text, color, x, y);
            bif.type = type;
            bif.id = ++lastID;
            bullets.Add(bif.id, bif);
        }
    }
}
