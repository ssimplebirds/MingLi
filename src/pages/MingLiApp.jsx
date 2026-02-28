import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { C, EL_COLOR } from "../constants/designTokens.js";
import { calcBazi } from "../utils/baziEngine.js";
import { genReadingAI } from "../utils/readingAI.js";
import { genReadingLocal } from "../utils/readingLocal.js";
import GlassCard from "../components/ui/GlassCard.jsx";
import TypeWriter from "../components/ui/TypeWriter.jsx";
import Toggle from "../components/ui/Toggle.jsx";
import HelpIcon from "../components/ui/HelpIcon.jsx";
import InfoModal from "../components/ui/InfoModal.jsx";
import ScoreRing from "../components/ui/ScoreRing.jsx";
import PillarCard from "../components/ui/PillarCard.jsx";
import EnergyOrbs from "../components/ui/EnergyOrbs.jsx";
import ElementBars from "../components/ui/ElementBars.jsx";
import SectionLabel from "../components/ui/SectionLabel.jsx";
import Divider from "../components/ui/Divider.jsx";
import TaijiSpinner from "../components/ui/TaijiSpinner.jsx";

export default function MingLiApp() {
  const [phase, setPhase] = useState("input");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [isLunar, setIsLunar] = useState(false);
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15);
  const [hourIdx, setHourIdx] = useState(6);
  const [wish, setWish] = useState("");
  const [result, setResult] = useState(null);
  const [reveal, setReveal] = useState(0);
  const [modal, setModal] = useState(null);
  const [aiProgress, setAiProgress] = useState("");

  const shichen = [
    { l: "子时 (23-01)", h: 0 },
    { l: "丑时 (01-03)", h: 2 },
    { l: "寅时 (03-05)", h: 4 },
    { l: "卯时 (05-07)", h: 6 },
    { l: "辰时 (07-09)", h: 8 },
    { l: "巳时 (09-11)", h: 10 },
    { l: "午时 (11-13)", h: 12 },
    { l: "未时 (13-15)", h: 14 },
    { l: "申时 (15-17)", h: 16 },
    { l: "酉时 (17-19)", h: 18 },
    { l: "戌时 (19-21)", h: 20 },
    { l: "亥时 (21-23)", h: 22 },
    { l: "⚠ 时辰不详", h: -1 },
  ];
  const unk = hourIdx === 12;
  const lunarM = ["正","二","三","四","五","六","七","八","九","十","冬","腊"];
  const lunarD = [
    "初一","初二","初三","初四","初五","初六","初七","初八","初九","初十",
    "十一","十二","十三","十四","十五","十六","十七","十八","十九","二十",
    "廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十","三十一",
  ];

  const handleSubmit = () => {
    setPhase("loading");
    setAiProgress("正在排盘计算...");
    const h = unk ? -1 : shichen[hourIdx].h;
    const bazi = calcBazi(year, month, day, h, 0, 116.4);
    setTimeout(async () => {
      try {
        const reading = await genReadingAI(
          bazi,
          gender,
          name.trim(),
          wish.trim(),
          (msg) => setAiProgress(msg)
        );
        setResult(reading);
        setPhase("result");
        let s = 0;
        const iv = setInterval(() => {
          if (++s >= 8) clearInterval(iv);
          setReveal(s);
        }, 600);
      } catch (e) {
        console.error(e);
        const reading = genReadingLocal(
          bazi,
          gender,
          name.trim(),
          wish.trim()
        );
        setResult(reading);
        setPhase("result");
        let s = 0;
        const iv = setInterval(() => {
          if (++s >= 8) clearInterval(iv);
          setReveal(s);
        }, 600);
      }
    }, 1500);
  };

  const handleReset = () => {
    setPhase("input");
    setResult(null);
    setReveal(0);
    setAiProgress("");
  };

  const sel = {
    background: "rgba(15,23,42,.88)",
    border: `1px solid ${C.goldBorder}`,
    color: C.ink,
    backdropFilter: "blur(12px)",
    fontFamily: "'Noto Serif SC',serif",
  };
  const inp = { ...sel, outline: "none" };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        fontFamily: "'Noto Serif SC','Songti SC',serif",
        color: C.ink,
      }}
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center pt-8 pb-3"
      >
        <div className="flex items-center justify-center gap-3 mb-1.5">
          <div
            className="w-14 h-px"
            style={{
              background: `linear-gradient(90deg,transparent,${C.cyan}60)`,
            }}
          />
          <span
            className="text-xs tracking-[.5em] uppercase"
            style={{ color: C.cyanMuted }}
          >
            Destiny Unveiled
          </span>
          <div
            className="w-14 h-px"
            style={{
              background: `linear-gradient(270deg,transparent,${C.cyan}60)`,
            }}
          />
        </div>
        <h1
          className="text-5xl md:text-6xl font-bold tracking-wider text-glow"
          style={{ fontFamily: "'Ma Shan Zheng',cursive", color: C.cyan }}
        >
          天命明理
        </h1>
        <p className="text-sm mt-2" style={{ color: C.inkMuted }}>
          四柱八字 · 五行推演 · 丙午年运势
        </p>
      </motion.header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {phase === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40, scale: 0.97 }}
              transition={{ duration: 0.6 }}
            >
              <GlassCard glow>
                <h2
                  className="text-center text-lg mb-6 text-glow"
                  style={{ color: C.cyan }}
                >
                  请输入出生信息
                </h2>
                <div className="mb-5">
                  <label
                    className="text-xs mb-1.5 block tracking-widest"
                    style={{ color: C.inkMuted }}
                  >
                    姓名{" "}
                    <span style={{ opacity: 0.4 }}>
                      （可选 · 输入姓名可获得更具代入感的报告）
                    </span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入您的姓名..."
                    className="w-full rounded-xl px-4 py-2.5 text-sm"
                    style={inp}
                  />
                </div>

                <div className="flex justify-center gap-4 mb-5">
                  {[
                    { v: "male", l: "乾·男", i: "♂" },
                    { v: "female", l: "坤·女", i: "♀" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      onClick={() => setGender(o.v)}
                      className="px-7 py-3 rounded-xl border transition-all duration-300"
                      style={{
                        background:
                          gender === o.v ? C.cyanDim : "transparent",
                        borderColor:
                          gender === o.v ? `${C.cyan}40` : C.goldBorder,
                        color: gender === o.v ? C.cyan : C.inkMuted,
                        boxShadow:
                          gender === o.v
                            ? `0 0 24px ${C.cyanGlow}`
                            : "none",
                      }}
                    >
                      <span className="text-lg mr-2">{o.i}</span>
                      {o.l}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <Toggle
                    value={isLunar}
                    onChange={setIsLunar}
                    left="公历（阳历）"
                    right="农历（阴历）"
                  />
                  {isLunar && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-xs mt-2"
                      style={{ color: C.cyanMuted }}
                    >
                      已切换至农历模式
                    </motion.p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {[
                    {
                      lb: "年",
                      v: year,
                      s: setYear,
                      opts: Array.from({ length: 80 }, (_, i) => 1950 + i),
                      f: (v) => `${v}年`,
                    },
                    {
                      lb: "月",
                      v: month,
                      s: setMonth,
                      opts: Array.from({ length: 12 }, (_, i) => i + 1),
                      f: (v) =>
                        isLunar ? `${lunarM[v - 1]}月` : `${v}月`,
                    },
                    {
                      lb: "日",
                      v: day,
                      s: setDay,
                      opts: Array.from({ length: 31 }, (_, i) => i + 1),
                      f: (v) =>
                        isLunar ? lunarD[v - 1] : `${v}日`,
                    },
                    {
                      lb: "时辰",
                      v: hourIdx,
                      s: setHourIdx,
                      opts: Array.from({ length: 13 }, (_, i) => i),
                      f: (v) => shichen[v].l,
                    },
                  ].map((f) => (
                    <div key={f.lb} className="flex flex-col">
                      <label
                        className="text-xs mb-1.5 tracking-widest"
                        style={{ color: C.inkMuted }}
                      >
                        {f.lb}
                      </label>
                      <select
                        value={f.v}
                        onChange={(e) =>
                          f.s(Number(e.target.value))
                        }
                        className="rounded-xl px-3 py-2.5 text-sm outline-none appearance-none cursor-pointer"
                        style={sel}
                      >
                        {f.opts.map((o) => (
                          <option key={o} value={o}>
                            {f.f(o)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {unk ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl px-4 py-3 mb-3 border"
                      style={{
                        background: "rgba(212,175,55,.04)",
                        borderColor: "rgba(212,175,55,.15)",
                      }}
                    >
                      <p
                        className="text-xs"
                        style={{ color: C.gold }}
                      >
                        ⚡ 时辰不详模式：将侧重年、月、日三柱分析
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="mb-5">
                  <label
                    className="text-xs mb-1.5 block tracking-widest"
                    style={{ color: C.inkMuted }}
                  >
                    心中所求{" "}
                    <span style={{ opacity: 0.4 }}>
                      （可选 · 填写具体事项可获得定向分析）
                    </span>
                  </label>
                  <textarea
                    value={wish}
                    onChange={(e) => setWish(e.target.value)}
                    placeholder="例如：今年想转行做自媒体、下半年想结婚、考虑在杭州买房..."
                    rows={2}
                    className="w-full rounded-xl px-4 py-2.5 text-sm"
                    style={inp}
                  />
                </div>

                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 0 40px ${C.cyanGlow}`,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-xl border text-lg tracking-[.3em] transition-all duration-300 glow-border"
                  style={{
                    background: `linear-gradient(135deg,${C.cyanDim},rgba(212,175,55,.03))`,
                    borderColor: `${C.cyan}30`,
                    color: C.cyan,
                  }}
                >
                  开 启 天 机
                </motion.button>
                <p
                  className="text-center text-xs mt-5"
                  style={{ color: C.inkMuted, opacity: 0.4 }}
                >
                  * 本结果仅供娱乐参考，命运始终掌握在自己手中
                </p>
              </GlassCard>
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center py-16"
            >
              <TaijiSpinner />
              <motion.div
                className="mt-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p
                  className="text-lg tracking-[.25em] text-glow"
                  style={{ color: C.cyan }}
                >
                  <TypeWriter
                    text={
                      name
                        ? `${name}，天机正在为您推演...`
                        : "天地玄机，正在推演..."
                    }
                    speed={100}
                  />
                </p>
                <motion.div
                  className="flex justify-center gap-2 mt-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {(unk
                    ? ["排列三柱", "推算五行", "AI深度解读"]
                    : ["排列四柱", "推算五行", "AI深度解读"]
                  ).map((s, i) => (
                    <motion.span
                      key={s}
                      className="text-xs px-3 py-1 rounded-full border"
                      style={{
                        borderColor: C.borderCyan,
                        color: C.inkMuted,
                        background: C.cyanDim,
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 + i * 0.5 }}
                    >
                      {s}
                    </motion.span>
                  ))}
                </motion.div>
                {aiProgress ? (
                  <motion.p
                    className="text-xs mt-5 tracking-wider"
                    style={{ color: C.gold, opacity: 0.7 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    key={aiProgress}
                  >
                    {aiProgress}
                  </motion.p>
                ) : null}
              </motion.div>
            </motion.div>
          )}

          {phase === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {result.wish && reveal >= 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <span
                    className="inline-block text-xs px-4 py-1.5 rounded-full border"
                    style={{
                      borderColor: `${C.gold}30`,
                      color: C.gold,
                      background: "rgba(212,175,55,.06)",
                    }}
                  >
                    定向测算：{result.wish}
                  </span>
                </motion.div>
              )}

              {reveal >= 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center pt-2 pb-2"
                >
                  <span
                    className="text-xs tracking-[.35em] block mb-4"
                    style={{ color: C.inkMuted }}
                  >
                    命 格
                  </span>
                  {result._aiPowered ? (
                    <span
                      className="inline-block text-xs px-3 py-1 mb-3 rounded-full border"
                      style={{
                        borderColor: "rgba(153,246,228,0.25)",
                        color: C.cyan,
                        background: "rgba(153,246,228,0.06)",
                        fontSize: 10,
                      }}
                    >
                      ✦ AI 深度解读
                    </span>
                  ) : null}
                  <ScoreRing score={result.score} delay={0.2} />
                  <h2
                    className="text-2xl md:text-3xl mt-4 font-bold text-glow"
                    style={{
                      color: C.cyan,
                      fontFamily: "'Ma Shan Zheng',cursive",
                    }}
                  >
                    {result.destiny_code}
                  </h2>
                  <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
                    <span
                      className="text-xs"
                      style={{ color: C.inkMuted }}
                    >
                      生肖：{result.zodiac}
                    </span>
                    <span style={{ color: C.borderCyan }}>|</span>
                    <span
                      className="text-xs"
                      style={{ color: C.inkMuted }}
                    >
                      日主：{result.day_master}
                    </span>
                    <span style={{ color: C.borderCyan }}>|</span>
                    <span
                      className="text-xs"
                      style={{ color: C.inkMuted }}
                    >
                      {result.strong_desc}
                    </span>
                    <span style={{ color: C.borderCyan }}>|</span>
                    <span
                      className="text-xs"
                      style={{ color: C.inkMuted }}
                    >
                      纳音：{result.nayin_year}
                    </span>
                    {result.unk && (
                      <>
                        <span style={{ color: C.borderCyan }}>|</span>
                        <span
                          className="text-xs"
                          style={{ color: C.gold }}
                        >
                          三柱模式
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {reveal >= 2 && (
                <GlassCard glow delay={0.1}>
                  <div className="flex items-center justify-center mb-6">
                    <h3
                      className="text-sm tracking-[.3em]"
                      style={{ color: C.inkMuted }}
                    >
                      ─ 四柱排盘 ─
                    </h3>
                    <HelpIcon onClick={() => setModal("pillars")} />
                  </div>
                  <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
                    {[
                      {
                        l: "年柱",
                        s: "根基·祖上",
                        ...result.pillars.year,
                        d: 0.15,
                        dim: false,
                        tg: result.ten_gods.year,
                        ny: result.nayin.year,
                      },
                      {
                        l: "月柱",
                        s: "事业·父母",
                        ...result.pillars.month,
                        d: 0.35,
                        dim: false,
                        tg: result.ten_gods.month,
                        ny: result.nayin.month,
                      },
                      {
                        l: "日柱",
                        s: "自身·配偶",
                        ...result.pillars.day,
                        d: 0.55,
                        dim: false,
                        tg: "日主",
                        ny: result.nayin.day,
                      },
                      {
                        l: "时柱",
                        s: "晚运·子女",
                        ...(result.pillars.hour || {
                          stem: "?",
                          branch: "?",
                        }),
                        d: 0.75,
                        dim: result.unk,
                        tg: result.ten_gods.hour,
                        ny: result.nayin.hour,
                      },
                    ].map((p) => (
                      <PillarCard
                        key={p.l}
                        label={p.l}
                        sub={p.s}
                        stem={p.stem}
                        branch={p.branch}
                        delay={p.d}
                        dimmed={p.dim}
                        tenGod={p.tg}
                        nayin={p.ny}
                      />
                    ))}
                  </div>
                  {result.unk && (
                    <p
                      className="text-center text-xs mt-5"
                      style={{ color: C.gold, opacity: 0.7 }}
                    >
                      ⚠ 时柱因出生时辰不详而降低权重
                    </p>
                  )}
                </GlassCard>
              )}

              {reveal >= 3 && (
                <GlassCard delay={0.15}>
                  <div className="flex items-center justify-center mb-2">
                    <h3
                      className="text-sm tracking-[.3em]"
                      style={{ color: C.inkMuted }}
                    >
                      ─ 五行能量 ─
                    </h3>
                    <HelpIcon onClick={() => setModal("wuxing")} />
                  </div>
                  <EnergyOrbs dist={result.dist} />
                  <ElementBars dist={result.dist} />
                  <p
                    className="text-center text-sm mt-4 px-2 leading-7"
                    style={{ color: C.inkMuted }}
                  >
                    <TypeWriter
                      text={result.five_el_advice}
                      speed={22}
                    />
                  </p>
                </GlassCard>
              )}

              {reveal >= 4 && (
                <GlassCard delay={0.1}>
                  <SectionLabel>
                    {result.personality.title}
                  </SectionLabel>
                  <div className="space-y-5">
                    <div>
                      <h4
                        className="text-xs tracking-[.15em] mb-2 flex items-center gap-2"
                        style={{ color: C.cyan, opacity: 0.7 }}
                      >
                        <span
                          className="w-3 h-px"
                          style={{ background: C.cyan }}
                        />
                        {result.personality.outer.title}
                      </h4>
                      <div className="max-h-48 overflow-y-auto scroll-area pr-1">
                        <p
                          className="text-sm leading-7"
                          style={{ color: C.ink, opacity: 0.85 }}
                        >
                          <TypeWriter
                            text={result.personality.outer.content}
                            speed={18}
                          />
                        </p>
                      </div>
                    </div>
                    <Divider />
                    <div>
                      <h4
                        className="text-xs tracking-[.15em] mb-2 flex items-center gap-2"
                        style={{ color: C.cyan, opacity: 0.7 }}
                      >
                        <span
                          className="w-3 h-px"
                          style={{ background: C.cyan }}
                        />
                        {result.personality.inner.title}
                      </h4>
                      <div className="max-h-48 overflow-y-auto scroll-area pr-1">
                        <p
                          className="text-sm leading-7"
                          style={{ color: C.ink, opacity: 0.85 }}
                        >
                          <TypeWriter
                            text={result.personality.inner.content}
                            speed={18}
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {reveal >= 5 && (
                <GlassCard glow delay={0.1}>
                  <SectionLabel>{result.fortune.title}</SectionLabel>
                  <div className="space-y-5">
                    <div>
                      <h4
                        className="text-xs tracking-[.15em] mb-2"
                        style={{ color: C.cyan, opacity: 0.7 }}
                      >
                        ▸ {result.fortune.h1.title}
                      </h4>
                      <div className="max-h-56 overflow-y-auto scroll-area pr-1">
                        <p
                          className="text-sm leading-7"
                          style={{ color: C.ink, opacity: 0.85 }}
                        >
                          <TypeWriter
                            text={result.fortune.h1.content}
                            speed={18}
                          />
                        </p>
                      </div>
                    </div>
                    <Divider />
                    <div>
                      <h4
                        className="text-xs tracking-[.15em] mb-2"
                        style={{ color: C.cyan, opacity: 0.7 }}
                      >
                        ▸ {result.fortune.h2.title}
                      </h4>
                      <div className="max-h-56 overflow-y-auto scroll-area pr-1">
                        <p
                          className="text-sm leading-7"
                          style={{ color: C.ink, opacity: 0.85 }}
                        >
                          <TypeWriter
                            text={result.fortune.h2.content}
                            speed={18}
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {reveal >= 6 && (
                <GlassCard delay={0.1}>
                  <SectionLabel>
                    {result.career.title}
                  </SectionLabel>
                  <div className="space-y-5">
                    <div>
                      <h4
                        className="text-xs tracking-[.15em] mb-2"
                        style={{ color: "#f87171", opacity: 0.8 }}
                      >
                        {result.career.avoid.title}
                      </h4>
                      <div className="max-h-56 overflow-y-auto scroll-area pr-1">
                        <p
                          className="text-sm leading-7 whitespace-pre-line"
                          style={{ color: C.ink, opacity: 0.85 }}
                        >
                          <TypeWriter
                            text={result.career.avoid.content}
                            speed={16}
                          />
                        </p>
                      </div>
                    </div>
                    <Divider />
                    <div>
                      <h4
                        className="text-xs tracking-[.15em] mb-2"
                        style={{ color: "#4ade80", opacity: 0.8 }}
                      >
                        {result.career.tips.title}
                      </h4>
                      <div className="max-h-64 overflow-y-auto scroll-area pr-1">
                        <p
                          className="text-sm leading-7 whitespace-pre-line"
                          style={{ color: C.ink, opacity: 0.85 }}
                        >
                          <TypeWriter
                            text={result.career.tips.content}
                            speed={16}
                          />
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {reveal >= 7 && (
                <GlassCard delay={0.1}>
                  <SectionLabel>行动总纲</SectionLabel>
                  <p
                    className="text-sm leading-7"
                    style={{ color: C.ink, opacity: 0.85 }}
                  >
                    <TypeWriter
                      text={result.advice}
                      speed={22}
                    />
                  </p>
                </GlassCard>
              )}

              {reveal >= 8 && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.9 }}
                    className="relative rounded-2xl p-8 text-center overflow-hidden glow-border card-float"
                    style={{
                      background:
                        "linear-gradient(160deg,rgba(15,23,42,.72),rgba(212,175,55,.03),rgba(15,23,42,.68))",
                      backdropFilter: "blur(28px)",
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at 38% 42%,rgba(153,246,228,.04),transparent 60%)",
                      }}
                    />
                    <span
                      className="text-3xl block mb-3"
                      style={{ color: C.cyan, opacity: 0.2 }}
                    >
                      ❝
                    </span>
                    <p
                      className="text-lg md:text-xl leading-9 relative z-10 text-glow-gold"
                      style={{
                        color: C.gold,
                        fontFamily: "'Ma Shan Zheng',cursive",
                      }}
                    >
                      <TypeWriter
                        text={result.golden_sentence}
                        speed={55}
                      />
                    </p>
                    <span
                      className="text-3xl block mt-3"
                      style={{ color: C.cyan, opacity: 0.2 }}
                    >
                      ❞
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex items-center justify-center gap-4 pt-4 pb-8"
                  >
                    <button
                      onClick={handleReset}
                      className="px-6 py-2.5 rounded-xl border text-sm tracking-[.15em] transition-all duration-300 hover:border-opacity-60"
                      style={{
                        borderColor: C.borderCyan,
                        color: C.inkMuted,
                        background: C.cyanDim,
                      }}
                    >
                      重新排盘
                    </button>
                    <button
                      className="px-6 py-2.5 rounded-xl border text-sm tracking-[.15em] transition-all duration-300 hover:border-opacity-60"
                      style={{
                        borderColor: C.goldBorder,
                        color: C.gold,
                        background: "rgba(212,175,55,.04)",
                      }}
                    >
                      📷 保存报告为图片
                    </button>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <InfoModal
        open={modal === "pillars"}
        onClose={() => setModal(null)}
        title="📖 什么是四柱八字？"
      >
        <p>
          <strong style={{ color: C.cyan }}>
            四柱，就像是你人生的四根大梁。
          </strong>
        </p>
        <p>
          古人发现，一个人出生的年、月、日、时，各对应一组「天干」和「地支」的组合——合起来正好八个字，所以叫「八字」。
        </p>
        <div
          className="rounded-xl p-4 my-3"
          style={{
            background: "rgba(153,246,228,.04)",
            border: `1px solid ${C.borderCyan}`,
          }}
        >
          <p>
            <span style={{ color: EL_COLOR.木.text }}>
              🏠 年柱 · 根基
            </span>{" "}
            — 代表你的家族背景、祖上荫德。就像一棵树的根，决定了你人生的起点和底色。年柱看的是0-16岁的运势。
          </p>
          <p className="mt-2">
            <span style={{ color: EL_COLOR.火.text }}>
              💼 月柱 · 事业
            </span>{" "}
            — 代表你的社会角色、事业格局。月柱是四柱中权重最大的一根，古人说"月令提纲"，它决定了你命局的基本格局。看的是16-32岁。
          </p>
          <p className="mt-2">
            <span style={{ color: EL_COLOR.土.text }}>
              👤 日柱 · 自身
            </span>{" "}
            — 日柱的天干就是「你自己」，也叫「日主」或「日元」。它代表你的核心性格和本质。日柱的地支则代表你的配偶宫。看的是32-48岁。
          </p>
          <p className="mt-2">
            <span style={{ color: EL_COLOR.水.text }}>
              🌙 时柱 · 晚运
            </span>{" "}
            — 代表你的子女缘分和晚年运势。时柱看的是48岁之后，也暗示着你人生最终的归宿和境界。
          </p>
        </div>
        <p>
          四根柱子合在一起，就构成了一个完整的「命盘」。它不是宿命论，而是帮你认识自己、顺势而为的工具。
        </p>
      </InfoModal>

      <InfoModal
        open={modal === "wuxing"}
        onClose={() => setModal(null)}
        title="📖 什么是五行能量？"
      >
        <p>
          <strong style={{ color: C.cyan }}>
            五行，就是宇宙运行的五种基本能量模式。
          </strong>
        </p>
        <p>
          金、木、水、火、土——它们不是五种「物质」，而是五种「运动方式」。春天万物生发是木的能量，夏天热烈绽放是火的能量，长夏的沉稳滋养是土的能量，秋天的肃杀收敛是金的能量，冬天的静藏蛰伏是水的能量。
        </p>

        <div
          className="rounded-xl p-4 my-3"
          style={{
            background: "rgba(153,246,228,.04)",
            border: `1px solid ${C.borderCyan}`,
          }}
        >
          <p>
            <strong style={{ color: C.cyan }}>五行各论：</strong>
          </p>
          <p className="mt-2">
            <span style={{ color: EL_COLOR.木.text }}>🌿 木</span> — 生长、仁慈、创造。对应肝胆、东方、春季、绿色。木旺之人温和有礼、富有同情心；木弱则优柔寡断、缺乏主见。
          </p>
          <p className="mt-2">
            <span style={{ color: EL_COLOR.火.text }}>🔥 火</span> — 热情、礼节、光明。对应心脏、南方、夏季、红色。火旺之人热情开朗、行动力强；火弱则缺乏动力、容易消沉。
          </p>
          <p className="mt-2">
            <span style={{ color: EL_COLOR.土.text }}>🏔 土</span> — 稳定、信用、包容。对应脾胃、中央、长夏、黄色。土旺之人忠厚可靠、重承诺；土弱则缺乏安全感、易焦虑。
          </p>
          <p className="mt-2">
            <span style={{ color: EL_COLOR.金.text }}>⚔ 金</span> — 决断、义气、收敛。对应肺与大肠、西方、秋季、白色。金旺之人果断刚毅、有原则；金弱则犹豫不决、意志薄弱。
          </p>
          <p className="mt-2">
            <span style={{ color: EL_COLOR.水.text }}>💧 水</span> — 智慧、灵活、深藏。对应肾与膀胱、北方、冬季、黑/蓝色。水旺之人聪慧机敏、善于变通；水弱则思维迟钝、缺乏韧性。
          </p>
        </div>

        <div
          className="rounded-xl p-4 my-3"
          style={{
            background: "rgba(212,175,55,.03)",
            border: "1px solid " + C.goldBorder,
          }}
        >
          <p>
            <strong style={{ color: C.gold }}>
              生克制化 · 核心规律
            </strong>
          </p>
          <p className="mt-1">
            • <strong>相生</strong>（我滋养你）：木→火→土→金→水→木，循环不息。比如：木材燃烧生火，火烧成灰变土，土中蕴藏金属，金属凝结水珠，水滋润草木。
          </p>
          <p className="mt-1">
            • <strong>相克</strong>（我制约你）：木→土→水→火→金→木。比如：树根破土，堤坝挡水，水灭火焰，火熔金属，金斧伐木。
          </p>
          <p className="mt-2">
            生克并非「好坏」——相生过度会「溺爱」（如水多木漂），相克适度反而是「磨砺」（如金克木成器）。
          </p>
        </div>

        <p>
          <strong style={{ color: C.cyan }}>
            为什么「平衡」比「多」更重要？
          </strong>
        </p>
        <p>
          想象一个乐队：鼓手（土）太猛会淹没旋律，吉他（金）太响会刺耳，人声（火）太弱则缺乏感染力。五行也一样——完美的命局不是某个元素越多越好，而是五种能量各归其位、互相配合。
        </p>
        <p className="mt-2">
          所以看你的五行图时：能量球越均匀，说明你的命局越「和谐」，人生之路越从容。如果某个元素特别突出或缺失，也别担心——这正是命理师帮你找「喜用神」来调和的意义所在。
        </p>
      </InfoModal>
    </div>
  );
}

