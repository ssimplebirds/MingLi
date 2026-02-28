import { motion } from "framer-motion";
import { C, EL_COLOR } from "../../constants/designTokens.js";
import { BR_EL, STEM_EL } from "../../constants/baziConstants.js";

export default function PillarCard({
  label,
  sub,
  stem,
  branch,
  delay = 0,
  dimmed = false,
  tenGod,
  nayin,
}) {
  const se = STEM_EL[stem] || "水";
  const be = BR_EL[branch] || "水";
  const sc = EL_COLOR[se];
  const bc = EL_COLOR[be];

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
      animate={{ opacity: dimmed ? 0.4 : 1, rotateY: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 800 }}
      className="flex flex-col items-center"
    >
      <span
        className="text-xs mb-2 tracking-[.2em]"
        style={{ color: C.inkMuted }}
      >
        {label}
      </span>
      <div
        className="rounded-2xl overflow-hidden card-float"
        style={{
          background:
            "linear-gradient(170deg,rgba(15,23,42,.82),rgba(20,28,50,.62))",
          backdropFilter: "blur(20px)",
          minWidth: 78,
          border: `1px solid ${C.goldBorder}`,
        }}
      >
        <div
          className="px-5 pt-4 pb-2 flex flex-col items-center"
          style={{ background: sc.bg }}
        >
          <span
            className="text-3xl font-bold"
            style={{
              color: sc.text,
              fontFamily: "'Noto Serif SC',serif",
              textShadow: `0 0 12px ${sc.glow}`,
            }}
          >
            {stem}
          </span>
          <span
            className="text-xs mt-0.5 opacity-70"
            style={{ color: sc.text }}
          >
            {se}·{sc.label}
          </span>
        </div>
        <div
          className="h-px mx-3"
          style={{
            background: `linear-gradient(90deg,transparent,${C.cyan}30,transparent)`,
          }}
        />
        <div
          className="px-5 pt-2 pb-3 flex flex-col items-center"
          style={{ background: bc.bg }}
        >
          <span
            className="text-3xl font-bold"
            style={{
              color: bc.text,
              fontFamily: "'Noto Serif SC',serif",
              textShadow: `0 0 12px ${bc.glow}`,
            }}
          >
            {branch}
          </span>
          <span
            className="text-xs mt-0.5 opacity-70"
            style={{ color: bc.text }}
          >
            {be}·{bc.label}
          </span>
        </div>
        {(tenGod || nayin) ? (
          <div
            className="px-3 py-1.5 text-center border-t"
            style={{
              borderColor: C.goldBorder,
              background: "rgba(15,23,42,.5)",
            }}
          >
            {tenGod ? (
              <span
                className="text-xs mr-2"
                style={{ color: C.cyanMuted }}
              >
                {tenGod}
              </span>
            ) : null}
            {nayin ? (
              <span className="text-xs" style={{ color: C.inkMuted }}>
                {nayin}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <span
        className="text-xs mt-2.5 tracking-wider"
        style={{ color: C.cyanMuted }}
      >
        {sub}
      </span>
    </motion.div>
  );
}

