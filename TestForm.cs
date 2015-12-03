using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace TwoDoubleThree {
    public class TestForm : Form {
        private TextBox txtComment;
        private Button btnSubmit;
        private RadioButton[] optCommentType = new RadioButton[3];
        private static string[] CommentTypeDesc = new string[3] {
            "Top sliding", "Top sticky", "Bottom sticky"
        };
        private Label lblColourDisp;
        private NumericUpDown[] updColour = new NumericUpDown[3];

        private DanmakuPool pool;

        private Random r;

        public TestForm() {
            this.InitializeComponent();
            this.r = new Random();
        }

        private void refreshDisp() {
            this.txtComment.Location = new Point(6, 6);
            this.txtComment.Size = new Size(this.Size.Width - 18, 0);
            this.btnSubmit.Size = new Size(120, 40);
            this.btnSubmit.Location = new Point(6, this.Size.Height - btnSubmit.Size.Height - 30);
        }

        private void InitializeComponent() {
            this.txtComment = new TextBox();
            this.txtComment.Font = new Font(BulletDisp.FontName, 28);
            this.Controls.Add(this.txtComment);
            this.txtComment.TabIndex = 0;

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
                this.optCommentType[i].TabIndex = 1 + i;
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
                this.updColour[i].TabIndex = 4 + i;
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
            this.txtComment.Focus();
            this.AcceptButton = this.btnSubmit;

            this.pool = new DanmakuPool();
            pool.RepresentativeForm().ShowInTaskbar = false;
        }

        private void updColour_ValueChanged(object sender, EventArgs e) {
            int r, g, b;
            r = (int)this.updColour[0].Value;
            g = (int)this.updColour[1].Value;
            b = (int)this.updColour[2].Value;
            Color c = Color.FromArgb(r, g, b);
            this.lblColourDisp.BackColor = c;
            this.txtComment.ForeColor = c;
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
