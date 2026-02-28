import { C } from "../../constants/designTokens.js";

export default function SectionLabel({ children }) {
  return (
    <h3
      className="text-sm mb-4 tracking-[.2em] flex items-center gap-3 text-glow"
      style={{ color: C.cyan }}
    >
      <span
        className="block w-5 h-px"
        style={{ background: `linear-gradient(90deg,${C.cyan}50,transparent)` }}
      />
      {children}
    </h3>
  );
}

