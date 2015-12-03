using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace TwoDoubleThree {
    public enum BulletType {
        TOP_SLIDING, TOP_STICKY, BOTTOM_STICKY
    }

    public class DanmakuPool {
        public const int MaxLayers = 10;

        protected TopSlideDanmakuLayer[] topSlideLayers;
        protected TopStickDanmakuLayer[] topStickLayers;
        protected BottomStickDanmakuLayer[] bottomStickLayers;
        public DanmakuPool() {
            topSlideLayers = new TopSlideDanmakuLayer[MaxLayers];
            topStickLayers = new TopStickDanmakuLayer[MaxLayers];
            bottomStickLayers = new BottomStickDanmakuLayer[MaxLayers];
            for (int i = 0; i < MaxLayers; ++i) {
                topSlideLayers[i] = new TopSlideDanmakuLayer();
                topSlideLayers[i].Show();
                topStickLayers[i] = new TopStickDanmakuLayer();
                topStickLayers[i].Show();
                bottomStickLayers[i] = new BottomStickDanmakuLayer();
                bottomStickLayers[i].Show();
            }
            topSlideLayers[0].ShowInTaskbar = true;
            topSlideLayers[0].Activated += (object sender, EventArgs e) => {
                for (int i = 0; i < MaxLayers; ++i) {
                    if (i != 0) topSlideLayers[i].Activate();
                    topStickLayers[i].Activate();
                    bottomStickLayers[i].Activate();
                }
            };
        }

        public Form RepresentativeForm() {
            return topSlideLayers[0];
        }

        public bool Fire(BulletType btype, string text, Color color) {
            int i;
            switch (btype) {
            case BulletType.TOP_SLIDING:
                for (i = 0; i < MaxLayers; ++i)
                    if (topSlideLayers[i].Fire(text, color)) return true;
                return false;
            case BulletType.TOP_STICKY:
                for (i = 0; i < MaxLayers; ++i)
                    if (topStickLayers[i].Fire(text, color)) return true;
                return false;
            case BulletType.BOTTOM_STICKY:
                for (i = 0; i < MaxLayers; ++i)
                    if (bottomStickLayers[i].Fire(text, color)) return true;
                return false;
            default:
                return false;
            }
        }

        public void Fire(BulletType btype, double delay, string text, Color color) {
            if (delay <= 0) {
                this.Fire(btype, text, color);
            } else {
                Timer t = new Timer();
                t.Interval = (int)(delay * 1000);
                t.Tag = new KeyValuePair<BulletType, KeyValuePair<String, Color>>(
                    btype, new KeyValuePair<String, Color>(text, color));
                t.Tick += DelayTimer_Tick;
                t.Start();
            }
        }
        private void DelayTimer_Tick(object sender, EventArgs e) {
            KeyValuePair<BulletType, KeyValuePair<String, Color>> args
                = (KeyValuePair<BulletType, KeyValuePair<String, Color>>)((Timer)sender).Tag;
            this.Fire(args.Key, args.Value.Key, args.Value.Value);
            ((Timer)sender).Dispose();
        }
    }
}
