import { C } from "../../constants/designTokens.js";

export default function Divider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(90deg,transparent,${C.borderCyan},transparent)`,
        }}
      />
      <span style={{ color: C.cyan, opacity: 0.2, fontSize: 10 }}>◆</span>
      <div
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(90deg,transparent,${C.borderCyan},transparent)`,
        }}
      />
    </div>
  );
}

