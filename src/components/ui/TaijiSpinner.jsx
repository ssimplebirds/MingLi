import { motion } from "framer-motion";
import { C } from "../../constants/designTokens.js";

export default function TaijiSpinner() {
  return (
    <motion.div className="relative w-52 h-52 mx-auto">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="w-full h-full"
      >
        <svg viewBox="0 0 200 200">
          <defs>
            <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={C.cyan} />
              <stop
                offset="100%"
                stopColor="rgba(153,246,228,.35)"
              />
            </linearGradient>
            <filter id="sg">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="none"
            stroke="url(#cg)"
            strokeWidth="1"
            className="breathe"
          />
          <path
            d="M100 10 A90 90 0 0 1 100 190 A45 45 0 0 1 100 100 A45 45 0 0 0 100 10"
            fill={C.cyan}
            opacity=".85"
            filter="url(#sg)"
          />
          <path
            d="M100 190 A90 90 0 0 1 100 10 A45 45 0 0 1 100 100 A45 45 0 0 0 100 190"
            fill="rgba(15,23,42,.95)"
            stroke={C.borderCyan}
            strokeWidth=".5"
          />
          <circle cx="100" cy="55" r="10" fill="rgba(15,23,42,.9)" />
          <circle cx="100" cy="145" r="10" fill={C.cyan} opacity=".8" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => {
            const r = (a * Math.PI) / 180;
            return (
              <text
                key={i}
                x={100 + 82 * Math.cos(r)}
                y={100 + 82 * Math.sin(r)}
                textAnchor="middle"
                dominantBaseline="central"
                fill={C.cyan}
                fontSize="9"
                opacity=".35"
                fontFamily="serif"
              >
                {"☰☱☲☳☴☵☶☷"[i]}
              </text>
            );
          })}
        </svg>
      </motion.div>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: C.cyan,
            top: "50%",
            left: "50%",
            boxShadow: `0 0 12px ${C.cyan}`,
          }}
          animate={{
            x: [0, Math.cos(i * 2.1) * 120, 0],
            y: [0, Math.sin(i * 2.1) * 120, 0],
            opacity: [0.15, 0.75, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

