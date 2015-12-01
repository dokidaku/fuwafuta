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
    
    public class BulletDisp : Form {
        public static String FontName = "华文黑体";
        protected CustomLabel label;
        
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
            
            this.FormBorderStyle = FormBorderStyle.None;
            this.StartPosition = FormStartPosition.Manual;
            this.TextColor = Color.White;
            this.FontSize = 44;
            this.OutlineWidth = 2;
            this.Text = "23333333";
        }
        
        public Color TextColor {
            get { return label.ForeColor; }
            set {
                label.ForeColor = value;
                if (value == Color.Gray) {
                    this.BackColor = Color.White;
                    this.TransparencyKey = Color.White;
                } else {
                    this.BackColor = Color.Gray;
                    this.TransparencyKey = Color.Gray;
                }
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
    }
    
    public static class Test {
        public static void Main() {
            BulletDisp bullet = new BulletDisp();
            bullet.Text = "こんにちは世界 おおおおおおおおはよう";
            bullet.Location = new Point(20, 100);
            BulletDisp bullet_2 = new BulletDisp();
            bullet_2.Text = "Hello World!";
            bullet_2.TextColor = Color.Black;
            bullet_2.Location = new Point(20, 170);
            bullet_2.Show();
            BulletDisp bullet_3 = new BulletDisp();
            bullet_3.Text = "(~~=u=)~~";
            bullet_3.TextColor = Color.Lime;
            bullet_3.Location = new Point(20, 240);
            bullet_3.Show();
            BulletDisp bullet_4 = new BulletDisp();
            bullet_4.Text = "Hello World!";
            bullet_4.TextColor = Color.Gray;
            bullet_4.Location = new Point(20, 310);
            bullet_4.Show();
            Application.Run(bullet);
        }
    }
}
