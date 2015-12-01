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
        public static Color WhiteReplacement = Color.FromArgb(254, 254, 254);
        
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

            this.BackColor = Color.White;
            this.TextColor = Color.White;
            this.FontSize = 44;
            this.OutlineWidth = 2;
            this.Text = "";
        }
        
        public Color TextColor {
            get { return label.ForeColor; }
            set {
                if (value == Color.White)
                    value = WhiteReplacement;
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
            DanmakuPool pool = new DanmakuPool();
            pool.Fire(BulletType.TOP_SLIDING, "こんにちは世界 おおおおおおおおはよう", Color.White);
            pool.Fire(BulletType.TOP_SLIDING, " Hello World!", Color.Black);
            pool.Fire(BulletType.TOP_SLIDING, "(~~=u=)~~", Color.Lime);
            pool.Fire(BulletType.TOP_SLIDING, "Hello World!", Color.Gray);
            Application.Run(pool);
        }
    }
}
