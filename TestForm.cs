using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace TwoDoubleThree {
    public class TestForm : Form {
        private TextBox txtComment;
        private PictureBox picDraw;
        private Button btnSubmit, btnSwitchMode;
        private RadioButton[] optCommentType = new RadioButton[3];
        private Label lblColourDisp;
        private NumericUpDown[] updColour = new NumericUpDown[3];

        private static string[] CommentTypeDesc = new string[3] {
            "Top sliding", "Top sticky", "Bottom sticky"
        };
        private static string ModeTextDesc = "Aa";
        private static string ModeDrawDesc = "&#";
        private DanmakuPool pool;
        private Random r;
        public int PenRadius { get; set; }  // Weight?

        private bool isDrawingMode;
        private bool isMouseDown;
        // NOTE: Jagged arrays might be used to enable dynamic resizing http://stackoverflow.com/q/12567329/
        private Bitmap drawnBitmap;

        public TestForm() {
            this.InitializeComponent();
            this.r = new Random();
            this.isDrawingMode = false;
            this.isMouseDown = false;
            this.PenRadius = 3;
            int w = SystemInformation.WorkingArea.Width, h = this.picDraw.Size.Height;
            this.drawnBitmap = new Bitmap(w, h, System.Drawing.Imaging.PixelFormat.Format24bppRgb);
            for (int i = 0; i < w; ++i)
                for (int j = 0; j < h; ++j) this.drawnBitmap.SetPixel(i, j, picDraw.BackColor);
        }

        private void refreshDisp() {
            this.txtComment.Location = this.picDraw.Location = new Point(6, 6);
            this.txtComment.Size = new Size(this.Size.Width - 18, 0);
            this.picDraw.Size = this.txtComment.Size;   // XXX: Can be written in one line using B = A = ...
            this.btnSwitchMode.Location = new Point(
                this.Size.Width - this.btnSwitchMode.Size.Width - 18,
                txtComment.Location.Y + txtComment.Size.Height + 12);
            this.btnSubmit.Size = new Size(120, 40);
            this.btnSubmit.Location = new Point(6, this.Size.Height - btnSubmit.Size.Height - 30);
        }

        private void InitializeComponent() {
            this.txtComment = new TextBox();
            this.txtComment.Font = new Font(BulletDisp.FontName, 28);
            this.Controls.Add(this.txtComment);
            this.txtComment.TabIndex = 0;
            this.picDraw = new PictureBox();
            this.picDraw.Size = this.txtComment.Size;
            this.picDraw.BorderStyle = BorderStyle.FixedSingle;
            this.picDraw.Visible = false;
            this.Controls.Add(this.picDraw);
            this.picDraw.MouseDown += picDraw_MouseDown;
            this.picDraw.MouseMove += picDraw_MouseMove;
            this.picDraw.MouseUp += picDraw_MouseUp;

            this.btnSwitchMode = new Button();
            this.btnSwitchMode.Font = new Font(BulletDisp.FontName, 14);
            this.btnSwitchMode.Text = ModeDrawDesc;
            this.btnSwitchMode.Size = new Size(54, 28);
            this.Controls.Add(this.btnSwitchMode);
            this.btnSwitchMode.Click += btnSwitchMode_Click;
            this.btnSwitchMode.TabIndex = 1;

            this.btnSubmit = new Button();
            this.btnSubmit.Font = new Font(BulletDisp.FontName, 20);
            this.btnSubmit.Text = "Go!";
            this.Controls.Add(this.btnSubmit);
            this.btnSubmit.Click += btnSubmit_Click;
            this.btnSubmit.TabIndex = 666;

            for (int i = 0; i < 3; ++i) {
                this.optCommentType[i] = new RadioButton();
                this.optCommentType[i].AutoSize = true;
                this.optCommentType[i].Font = new Font(BulletDisp.FontName, 20);
                this.optCommentType[i].Text = CommentTypeDesc[i];
                this.optCommentType[i].Location = new Point(6,
                    txtComment.Location.Y + txtComment.Size.Height + 12 + (this.optCommentType[i].Size.Height + 6) * i);
                this.Controls.Add(this.optCommentType[i]);
                this.optCommentType[i].TabIndex = 10 + i;
            }
            this.optCommentType[0].Select();

            for (int i = 0; i < 3; ++i) {
                this.updColour[i] = new NumericUpDown();
                this.updColour[i].Font = new Font(BulletDisp.FontName, 28);
                this.updColour[i].Minimum = 0;
                this.updColour[i].Maximum = 255;
                this.updColour[i].Increment = 1;
                this.updColour[i].Location = new Point(
                    this.updColour[0].Height + 12 + (this.updColour[0].Width + 6) * i,
                    this.optCommentType[2].Location.Y + this.optCommentType[2].Size.Height + 12
                );
                this.Controls.Add(this.updColour[i]);
                this.updColour[i].ValueChanged += updColour_ValueChanged;
                this.updColour[i].TabIndex = 20 + i;
            }
            this.lblColourDisp = new Label();
            this.lblColourDisp.AutoSize = false;
            this.lblColourDisp.Size = new Size(this.updColour[0].Height, this.updColour[0].Height);
            this.lblColourDisp.Location = new Point(6, this.updColour[0].Location.Y);
            this.lblColourDisp.BackColor = Color.Black;
            this.Controls.Add(this.lblColourDisp);
            this.lblColourDisp.Click += lblColourDisp_Click;

            this.Size = new Size(500, 300);
            this.FormBorderStyle = FormBorderStyle.Sizable;
            this.Resize += (object sender, EventArgs e) => ((TestForm)sender).refreshDisp();
            this.refreshDisp();
            this.Load += (object sender, EventArgs e) => this.txtComment.Focus();
            this.AcceptButton = this.btnSubmit;

            this.pool = new DanmakuPool();
            pool.RepresentativeForm().ShowInTaskbar = false;
            #if DEBUG
            pool.Hide();
            #endif
        }

        private void btnSwitchMode_Click(object sender, EventArgs e) {
            this.isDrawingMode = !this.isDrawingMode;
            if (this.isDrawingMode) {
                this.btnSwitchMode.Text = ModeTextDesc;
                this.txtComment.Visible = false;
                this.picDraw.Visible = true;
            } else {
                this.btnSwitchMode.Text = ModeDrawDesc;
                this.txtComment.Visible = true;
                this.picDraw.Visible = false;
            }
        }

        private void picDraw_MouseDown(object sender, MouseEventArgs e) {
            this.isMouseDown = true;
            picDraw_MouseMove(sender, e);
        }
        private void picDraw_MouseMove(object sender, MouseEventArgs e) {
            if (this.isMouseDown) {
                if ((e.Button & MouseButtons.Left) == MouseButtons.Left) {
                    for (int i = -PenRadius; i <= PenRadius; ++i) {
                        int t = (int)Math.Round(Math.Sqrt(PenRadius * PenRadius - i * i));
                        for (int j = -t; j < t; ++j)
                            this.drawnBitmap.SetPixel(e.X + i, e.Y + j, Color.Red);
                    }
                } else if ((e.Button & MouseButtons.Right) == MouseButtons.Right) {
                    for (int i = -PenRadius; i <= PenRadius; ++i) {
                        int t = (int)Math.Round(Math.Sqrt(PenRadius * PenRadius - i * i));
                        for (int j = -t; j < t; ++j)
                            this.drawnBitmap.SetPixel(e.X + i, e.Y + j, picDraw.BackColor);
                    }
                }
                this.picDraw.Image = this.drawnBitmap;
            }
        }
        private void picDraw_MouseUp(object sender, MouseEventArgs e) {
            this.isMouseDown = false;
        }

        private void updColour_ValueChanged(object sender, EventArgs e) {
            int r, g, b;
            r = (int)this.updColour[0].Value;
            g = (int)this.updColour[1].Value;
            b = (int)this.updColour[2].Value;
            Color c = Color.FromArgb(r, g, b);
            this.lblColourDisp.BackColor = c;
            this.txtComment.ForeColor = c;
            // TODO: Replace these with more precise parameters.
            if (r * 0.3 + g * 0.65 + b * 0.05 <= 128) {
                this.txtComment.BackColor = Color.White;
            } else {
                this.txtComment.BackColor = Color.Black;
            }
        }

        private void btnSubmit_Click(object sender, EventArgs e) {
            int typeIdx;
            for (typeIdx = 0; typeIdx < 3; ++typeIdx)
                if (this.optCommentType[typeIdx].Checked) break;
            int r, g, b;
            r = (int)this.updColour[0].Value;
            g = (int)this.updColour[1].Value;
            b = (int)this.updColour[2].Value;
            Color c = Color.FromArgb(r, g, b);
            this.pool.Fire((BulletType)typeIdx, this.txtComment.Text, c);
        }

        private void lblColourDisp_Click(object sender, EventArgs e) {
            for (int i = 0; i < 3; ++i)
                this.updColour[i].Value = r.Next() % 256;
        }
    }

    public static class Test {
        public static void Main() {
            Application.Run(new TestForm());
        }
    }
}
