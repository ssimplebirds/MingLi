import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { C } from "../../constants/designTokens.js";

export default function ScoreRing({ score, delay = 0 }) {
  const [count, setCount] = useState(0);
  const r = 58;
  const circ = 2 * Math.PI * r;
  const prog = (score / 100) * circ;

  useEffect(() => {
    const to = setTimeout(() => {
      let c = 0;
      const iv = setInterval(() => {
        c++;
        setCount(c);
        if (c >= score) clearInterval(iv);
      }, 20);
    }, delay * 1000 + 400);
    return () => clearTimeout(to);
  }, [score, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="rgba(212,175,55,.08)"
            strokeWidth="4"
          />
          <motion.circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={C.gold}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - prog }}
            transition={{ delay: delay + 0.3, duration: 1.5, ease: "easeOut" }}
            style={{
              filter: "drop-shadow(0 0 6px rgba(212,175,55,.4))",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold"
            style={{
              color: C.gold,
              fontFamily: "'Ma Shan Zheng',cursive",
              animation: "scoreGlow 3s ease-in-out infinite",
            }}
          >
            {count}
          </span>
          <span
            className="text-xs -mt-0.5"
            style={{ color: C.inkMuted }}
          >
            综合评分
          </span>
        </div>
      </div>
      <span className="text-xs mt-2" style={{ color: C.inkMuted }}>
        {score >= 85
          ? "上吉 · 运势极佳"
          : score >= 75
          ? "中吉 · 稳中向好"
          : score >= 65
          ? "小吉 · 平稳安顺"
          : "待运 · 蓄势待发"}
      </span>
    </motion.div>
  );
}

