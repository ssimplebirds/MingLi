import { AnimatePresence, motion } from "framer-motion";
import { C } from "../../constants/designTokens.js";

export default function InfoModal({
  open,
  onClose,
  title,
  children,
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div
            className="absolute inset-0"
            style={{ background: C.overlay }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl p-6 card-float glow-border scroll-area"
            style={{
              background:
                "linear-gradient(165deg,rgba(15,23,42,.92),rgba(20,28,55,.88))",
              backdropFilter: "blur(32px)",
              border: "1px solid " + C.goldBorder,
              maxHeight: "78vh",
              overflowY: "auto",
            }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className="text-base tracking-[.15em] text-glow"
                style={{ color: C.cyan }}
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full border flex items-center justify-center text-xs transition-all hover:scale-110"
                style={{ borderColor: C.borderCyan, color: C.inkMuted }}
              >
                ✕
              </button>
            </div>
            <div
              className="text-sm leading-7 space-y-4"
              style={{ color: C.ink, opacity: 0.85 }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

