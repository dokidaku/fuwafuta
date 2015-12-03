using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace TwoDoubleThree {
    // http://stackoverflow.com/questions/19842722/setting-a-font-with-outline-color-in-c-sharp
    public class CustomLabel : Label {
        public CustomLabel() {
            OutlineForeColor = Color.Green;
            OutlineWidth = 2;
        }
        public Color OutlineForeColor { get; set; }
        public float OutlineWidth { get; set; }
        protected override void OnPaint(PaintEventArgs e) {
            e.Graphics.FillRectangle(new SolidBrush(BackColor), ClientRectangle);
            GraphicsPath gp = new GraphicsPath();
            Pen outline = new Pen(OutlineForeColor, OutlineWidth) { LineJoin = LineJoin.Round };
            StringFormat sf = new StringFormat();
            Brush foreBrush = new SolidBrush(ForeColor);
            Rectangle r = this.ClientRectangle;
            gp.AddString(this.Text, Font.FontFamily, (int)Font.Style, Font.Size, r, sf);
            e.Graphics.ScaleTransform(1.3f, 1.35f);
            e.Graphics.SmoothingMode = SmoothingMode.HighQuality;
            e.Graphics.DrawPath(outline, gp);
            e.Graphics.FillPath(foreBrush, gp);
        }
    }
    
    public class BulletDisp : Control {
        public static String FontName = "华文黑体";
        protected CustomLabel label;
        public static Color BackgroundColor = Color.FromArgb(128, 128, 128);
        public static Color BackgroundReplacement = Color.FromArgb(126, 126, 126);
        
        public BulletDisp() {
            this.InitializeComponent();
            this.DoubleBuffered = true;
        }
        
        private void InitializeComponent() {
            label = new CustomLabel();
            label.Location = new Point(0, 0);
            label.AutoSize = true;
            label.OutlineForeColor = Color.Black;
            this.Controls.Add(label);

            this.BackColor = BackgroundColor;
            this.TextColor = Color.White;
            this.FontSize = 36;
            this.OutlineWidth = 2;
            this.Text = "";
        }
        
        public Color TextColor {
            get { return label.ForeColor; }
            set {
                if (Math.Abs(value.R - BackgroundColor.R) < 2
                    && Math.Abs(value.G - BackgroundColor.G) < 2
                    && Math.Abs(value.B - BackgroundColor.B) < 2)
                {
                    value = BackgroundReplacement;
                }
                label.ForeColor = value;
            }
        }
        
        public new String Text {
            get { return label.Text; }
            set {
                label.Text = value.Replace(' ', '　');
                this.Size = label.Size;
            }
        }
        
        public Single FontSize {
            get { return label.Font.Size; }
            set {
                label.Font = new Font(BulletDisp.FontName, value);
                this.Size = label.Size;
            }
        }
        
        public float OutlineWidth {
            get { return label.OutlineWidth; }
            set { label.OutlineWidth = value; }
        }

        public static BulletDisp Fire(String text, Color color, int x, int y) {
            BulletDisp ret = new BulletDisp();
            ret.Text = text;
            ret.TextColor = color;
            ret.Location = new Point(x, y);
            ret.Hide();
            return ret;
        }
    }
    
    public static class Test {
        public static void Main() {
            DanmakuPool[] pool = new DanmakuPool[3];
            pool[0] = new TopSlideDanmakuPool();
            pool[1] = new TopStickDanmakuPool();
            pool[2] = new BottomStickDanmakuPool();
            pool[0].Fire(0, "こんにちは世界 おおおおおおおおはよう", Color.White);
            pool[0].Fire(0, "Hello World 1!", Color.Black);
            pool[0].Fire(1, "(~~=u=)~~", Color.Lime);
            pool[0].Fire(3, "Hello World 2!", Color.Gray);
            pool[0].Fire(2, "Hello World 3!", Color.Yellow);
            pool[0].Fire(7, "Hello World 4!", Color.Red);
            pool[0].Fire(5, "にゃんぱすー", Color.Magenta);
            for (int i = 0; i < 10; ++i) {
				int nowTicks = (int)(DateTime.Now.Ticks % int.MaxValue);
				pool[0].Fire(i * 0.12 + 0.12, "+++++++++++++++++xxxx+++++++++++++", Color.PowderBlue);
				pool[0].Fire(6 + i * 0.1, "++++++++++++++++++++++++++++++", Color.Yellow);
				pool[2].Fire(2.6 + i * 0.1, "++++++++++++++++++++++++++++++", Color.Magenta);
				pool[1].Fire(i * 0.26, "aaaa " + DateTime.Now.AddSeconds(i * 0.3).Ticks, Color.FromArgb((nowTicks + i * 233 + i * i * 999 + 6666) % 255, (nowTicks + i * 178888) % 255, nowTicks % 255));
				pool[2].Fire(i * 0.3, "NNNNN", Color.FromArgb(((nowTicks % 233) * (nowTicks % 266) + i * 888) % 255, (nowTicks + 998244 * i * i + 7) % 255, (nowTicks / 2 + 9944 * i * i + 7) % 255));
            }
            pool[1].Show();
            pool[2].Show();
            pool[0].ShowInTaskbar = true;
            Application.Run(pool[0]);
        }
    }
}
