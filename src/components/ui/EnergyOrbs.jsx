import { motion } from "framer-motion";
import { EL_COLOR } from "../../constants/designTokens.js";

export default function EnergyOrbs({ dist }) {
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  const maxV = Math.max(...entries.map(([, v]) => v));

  return (
    <div className="flex items-end justify-center gap-5 py-4">
      {entries.map(([el, pct], i) => {
        const ec = EL_COLOR[el];
        const size = 28 + (pct / maxV) * 42;
        return (
          <motion.div
            key={el}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.6, type: "spring" }}
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              animate={{ y: [0, -6 - Math.random() * 4, 0] }}
              transition={{
                duration: 2.5 + Math.random() * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
              className="rounded-full flex items-center justify-center"
              style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 35% 35%,${ec.hex}40,${ec.hex}15)`,
                border: `1.5px solid ${ec.border}`,
                boxShadow: `0 0 ${pct / 2}px ${ec.glow}, inset 0 0 ${
                  pct / 3
                }px ${ec.glow}`,
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: ec.text }}
              >
                {pct}%
              </span>
            </motion.div>
            <span className="text-xs" style={{ color: ec.text }}>
              {el}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

