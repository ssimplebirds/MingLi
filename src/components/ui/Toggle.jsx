import { motion } from "framer-motion";
import { C } from "../../constants/designTokens.js";

export default function Toggle({ value, onChange, left, right }) {
  return (
    <div className="flex items-center gap-3 justify-center">
      <span
        className="text-xs tracking-wider"
        style={{ color: !value ? C.cyan : C.inkMuted }}
      >
        {left}
      </span>
      <button
        onClick={() => onChange(!value)}
        className="relative w-12 h-6 rounded-full border transition-all duration-300"
        style={{
          background: value ? C.cyanDim : "rgba(15,23,42,.6)",
          borderColor: value ? `${C.cyan}40` : C.goldBorder,
        }}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full"
          animate={{ left: value ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ background: value ? C.cyan : C.inkMuted }}
        />
      </button>
      <span
        className="text-xs tracking-wider"
        style={{ color: value ? C.cyan : C.inkMuted }}
      >
        {right}
      </span>
    </div>
  );
}

