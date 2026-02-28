import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { C } from "../../constants/designTokens.js";

export default function TypeWriter({ text, speed = 35, onComplete }) {
  const [d, setD] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setD("");
    const iv = setInterval(() => {
      if (idx.current < text.length) {
        setD(text.slice(0, ++idx.current));
      } else {
        clearInterval(iv);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, onComplete]);

  const showCursor = d.length < text.length;

  return (
    <span>
      {d}
      {showCursor ? (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 ml-0.5 align-middle rounded-full"
          style={{ background: C.cyan }}
        />
      ) : null}
    </span>
  );
}

