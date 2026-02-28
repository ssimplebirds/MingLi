import { motion } from "framer-motion";
import { EL_COLOR } from "../../constants/designTokens.js";

export default function ElementBars({ dist }) {
  return (
    <div className="space-y-2.5 mt-3">
      {Object.entries(dist).map(([el, pct], i) => {
        const ec = EL_COLOR[el];
        return (
          <motion.div
            key={el}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <span
              className="w-14 text-right text-xs font-medium shrink-0"
              style={{ color: ec.text }}
            >
              {el} {ec.label}
            </span>
            <div
              className="flex-1 h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(15,23,42,.6)" }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  delay: 0.15 + 0.08 * i,
                  duration: 0.8,
                  ease: "easeOut",
                }}
                style={{
                  background: `linear-gradient(90deg,${ec.border},${ec.text})`,
                  boxShadow: `0 0 8px ${ec.glow}`,
                }}
              />
            </div>
            <span
              className="w-8 text-xs tabular-nums"
              style={{ color: ec.text }}
            >
              {pct}%
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

