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
            IsDrawingMode = false;
        }
        public Color OutlineForeColor { get; set; }
        public float OutlineWidth { get; set; }
        public bool IsDrawingMode { get; set; }
        public int DrawWidth, DrawHeight;
        public byte[, ] Pixels;
        private Bitmap drawnImage;
        public void InitializeImage() {
            if (this.IsDrawingMode) {
                drawnImage = new Bitmap(DrawWidth, DrawHeight, System.Drawing.Imaging.PixelFormat.Format24bppRgb);
                for (int i = 0; i < DrawWidth; ++i)
                    for (int j = 0; j < DrawHeight; ++j)
                        if (Pixels[i, j] == 1) drawnImage.SetPixel(i, j, ForeColor);
                        else drawnImage.SetPixel(i, j, BackColor);
            }
        }
        protected override void OnPaint(PaintEventArgs e) {
            if (this.IsDrawingMode) {
                e.Graphics.DrawImage(drawnImage, new PointF(0, 0));
            } else {
                e.Graphics.FillRectangle(new SolidBrush(BackColor), ClientRectangle);
                GraphicsPath gp = new GraphicsPath();
                Pen outline = new Pen(OutlineForeColor, OutlineWidth) { LineJoin = LineJoin.Round };
                StringFormat sf = new StringFormat();
                Brush foreBrush = new SolidBrush(ForeColor);
                Rectangle r = this.ClientRectangle;
                gp.AddString(this.Text, Font.FontFamily, (int)Font.Style, Font.Size, r, sf);
                e.Graphics.ScaleTransform(1.3f, 1.35f);
                e.Graphics.SmoothingMode = SmoothingMode.Default;
                e.Graphics.DrawPath(outline, gp);
                e.Graphics.FillPath(foreBrush, gp);
            }
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
                label.InitializeImage();
            }
        }

        public new String Text {
            get { return label.Text; }
            set {
                // #WIDTH HEIGHT WHITES BLACKS WHITES BLACKS...
                // WHITE -> Transparent, BLACK -> Solid
                if (value.StartsWith("#")) {
                    if (value.StartsWith("##")) {
                        label.IsDrawingMode = false;
                        label.Text = value.Substring(1).Replace(' ', '　');
                        this.Size = label.Size;
                    } else {
                        string[] s = value.Substring(1).Split(' ');
                        if (s.Length < 2) {
                            Console.WriteLine("ERROR: Width and height must be provided to a bullet.");
                            return;
                        }
                        int[] n = new int[s.Length];
                        for (int i = 0; i < s.Length; ++i) n[i] = int.Parse(s[i]);
                        if (n[0] <= 0 || n[1] <= 0) {
                            Console.WriteLine("ERROR: Invalid width/height.");
                            return;
                        }
                        label.IsDrawingMode = true;
                        label.DrawWidth = n[0];
                        label.DrawHeight = n[1];
                        label.Pixels = new byte[n[0], n[1]];
                        int x = 0, y = 0;
                        for (int i = 2; i < n.Length; ++i) for (int j = 0; j < n[i]; ++j) {
                            label.Pixels[y, x] = (byte)(i % 2);
                            if (++y == n[0]) { y = 0; ++x; }
                        }
                        label.InitializeImage();
                        label.Text = value; // ... Or the optimization applied will disable OnPaint()
                        this.Size = new Size(n[0], n[1]);
                    }
                } else {
                    label.IsDrawingMode = false;
                    label.Text = value.Replace(' ', '　');
                    this.Size = label.Size;
                }
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
}
