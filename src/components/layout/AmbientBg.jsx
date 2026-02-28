import { motion } from "framer-motion";
import { C } from "../../constants/designTokens.js";

export default function AmbientBg() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 22% 12%,rgba(16,80,60,.2) 0%,transparent 55%),
radial-gradient(ellipse 55% 45% at 82% 78%,rgba(30,20,70,.16) 0%,transparent 55%),
linear-gradient(155deg,#0F172A 0%,#0d1330 35%,#111a38 65%,#0F172A 100%)`,
        }}
      />
      {[{x:"15%",y:"8%",s:360,c:"rgba(153,246,228,.03)",d:20},
        {x:"78%",y:"62%",s:440,c:"rgba(212,175,55,.018)",d:25},
        {x:"45%",y:"35%",s:280,c:"rgba(16,80,60,.045)",d:17}].map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: o.x,
            top: o.y,
            width: o.s,
            height: o.s,
            background: `radial-gradient(circle,${o.c},transparent 70%)`,
            filter: "blur(50px)",
          }}
          animate={{ x: [0, 35, -25, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.93, 1] }}
          transition={{ duration: o.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={`p${i}`}
          className="absolute rounded-full"
          style={{
            width: 1.5 + Math.random(),
            height: 1.5 + Math.random(),
            background:
              i % 3 === 0
                ? C.cyan
                : i % 3 === 1
                ? C.gold
                : "rgba(153,246,228,.5)",
            left: `${3 + Math.random() * 94}%`,
            top: `${3 + Math.random() * 94}%`,
          }}
          animate={{
            y: [0, -(15 + Math.random() * 45), 0],
            opacity: [0.03, 0.25 + Math.random() * 0.15, 0.03],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

