using System;
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
		}
	}
}
