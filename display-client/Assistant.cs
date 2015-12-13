using System;

namespace TwoDoubleThree {
    public class Assistant {
        public static int ParseBase36(string s) {
            int ret = 0, a;
            for (int i = 0; i < s.Length; ++i) {
                if (s[i] >= '0' && s[i] <= '9') a = s[i] - '0';
                else if (s[i] >= 'a' && s[i] <= 'z') a = s[i] - 'a' + 10;
                else a = s[i] - 'A' + 10;
                ret = ret * 36 + a;
            }
            return ret;
        }

        public static int[] ParseBase36Array(string s) {
            string[] a = s.Split(' ');
            int[] n = new int[a.Length];
            for (int i = 0; i < a.Length; ++i) n[i] = Assistant.ParseBase36(a[i]);
            return n;
        }

        public static int GetNumLines(string textOrImg) {
            if (textOrImg.StartsWith("#") && !textOrImg.StartsWith("##")) {
                int[] a = Assistant.ParseBase36Array(textOrImg.Substring(1));
                if (a.Length < 2) return 1; // ╮(╯▽╰)╭
                else return (int)Math.Ceiling((double)a[1] / DanmakuLayer.LineHeight);
            } else {
                return 1;
            }
        }
    }
}
