import { C } from "../../constants/designTokens.js";

export default function HelpIcon({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full border text-xs transition-all duration-200 hover:scale-110 ml-2 shrink-0"
      style={{
        borderColor: `${C.cyan}30`,
        color: C.cyan,
        background: C.cyanDim,
        fontSize: 10,
      }}
      title="点击了解更多"
    >
      ?
    </button>
  );
}

