import { motion } from "framer-motion";
import { C } from "../../constants/designTokens.js";

export default function GlassCard({
  children,
  className = "",
  glow = false,
  delay = 0,
  style = {},
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: "easeOut" }}
      className={`rounded-2xl p-6 card-float ${glow ? "glow-border" : ""} ${className}`}
      style={{
        background: "linear-gradient(165deg,rgba(15,23,42,.68),rgba(20,28,55,.52))",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: `1px solid ${C.goldBorder}`,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

