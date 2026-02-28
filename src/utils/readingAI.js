import {
  EN,
  HIDDEN,
  STEM_EL,
} from "../constants/baziConstants.js";
import { genReadingLocal } from "./readingLocal.js";

// 远程 AI 解读，依赖 VITE_ANTHROPIC_API_KEY
export async function genReadingAI(
  bazi,
  gender,
  name,
  wish,
  onProgress
) {
  const { dm, dist, pat, zodiac, unk, score, pillars, ew, tg, ny } =
    bazi;
  const de = dm.element;
  const yy = dm.yy;
  const ds = dm.stem;
  const title = name
    ? name + (gender === "male" ? "先生" : "女士")
    : gender === "male"
    ? "先生"
    : "女士";
  const eN = (k) => k + "(" + EN[k] + ")";

  const hiddenDesc = (p) => {
    if (!p) return "无";
    const h = HIDDEN[p.branch];
    return h
      .map((s) => s + "(" + STEM_EL[s] + ")")
      .join("、");
  };

  const baziData = {
    name: title,
    gender: gender === "male" ? "男" : "女",
    four_pillars: {
      year:
        pillars.year.stem +
        pillars.year.branch +
        " (天干:" +
        pillars.year.stem +
        " 地支:" +
        pillars.year.branch +
        " 藏干:" +
        hiddenDesc(pillars.year) +
        " 十神:" +
        tg.year +
        " 纳音:" +
        ny.year +
        ")",
      month:
        pillars.month.stem +
        pillars.month.branch +
        " (天干:" +
        pillars.month.stem +
        " 地支:" +
        pillars.month.branch +
        " 藏干:" +
        hiddenDesc(pillars.month) +
        " 十神:" +
        tg.month +
        " 纳音:" +
        ny.month +
        ")",
      day:
        pillars.day.stem +
        pillars.day.branch +
        " (天干:" +
        pillars.day.stem +
        "[日主] 地支:" +
        pillars.day.branch +
        " 藏干:" +
        hiddenDesc(pillars.day) +
        " 纳音:" +
        ny.day +
        ")",
      hour: unk
        ? "时辰不详（三柱模式）"
        : pillars.hour.stem +
          pillars.hour.branch +
          " (天干:" +
          pillars.hour.stem +
          " 地支:" +
          pillars.hour.branch +
          " 藏干:" +
          hiddenDesc(pillars.hour) +
          " 十神:" +
          tg.hour +
          " 纳音:" +
          ny.hour +
          ")",
    },
    day_master: ds + " " + yy + de + "命",
    day_master_strength: dm.strong ? "偏旺" : "偏弱",
    pattern: pat.pattern + " (" + pat.desc + ")",
    month_dominant_god: pat.mg,
    five_element_weights: dist,
    raw_weights: ew,
    zodiac: zodiac,
    score: score,
    wish: wish || "无特定问题",
  };

  const systemPrompt =
    "你是一位精通子平八字的命理大师，兼具「穷通宝鉴」的深度和「蔡康永说话之道」的温暖。你为每位用户提供完全独一无二的八字解读。\n\n## 命主信息\n" +
    JSON.stringify(baziData, null, 2) +
    "\n\n## 输出要求\n请返回一个纯JSON对象（不要包含markdown代码块标记），结构如下：\n{\n  \"personality_outer\": \"外在性格描述（200-350字）——根据日主五行+阴阳+格局+十神组合来写，必须结合此人命局的独特之处（如伤官配印的矛盾感，正官格偏弱的隐忍等），不要写泛泛的五行性格\",\n  \"personality_inner\": \"内在潜意识描述（200-350字）——从藏干、月令、日支来分析深层心理需求，写出此命局独有的内心世界\",\n  \"fortune_h1\": \"2026丙午年上半年运势（250-400字）——结合流年天干丙火、地支午火与此人命局的具体生克关系来写。说明哪几个月最关键，为什么。必须针对此人的格局和喜忌来分析\",\n  \"fortune_h2\": \"2026丙午年下半年运势（250-400字）——同上，分析秋冬季节五行变化对此命局的具体影响\",\n  \"career_avoid\": \"三条避坑指南（每条50-80字）——基于此人的忌神、格局弱点来定制，用①②③编号\",\n  \"career_tips\": \"四条转运技巧（每条50-80字）——基于此人的喜用神来定制具体可行的建议，用①②③④编号\",\n  \"five_el_advice\": \"五行调和建议（80-120字）——说明喜用神和忌神，给出调和方向\",\n  \"advice\": \"行动总纲（100-150字）——全年最核心的一段话\",\n  \"golden_sentence\": \"赠言金句——一句古诗词或经典名言，要与此人命局特点呼应（不超过30字）\",\n  \"wish_response\": \"" +
    (wish
      ? "针对命主所求「" +
        wish +
        "」的定向解读（150-250字）——结合命局和流年给出具体建议"
      : "空字符串") +
    "\"\n}\n\n## 重要规则\n1. 所有内容必须根据上述八字数据推演，不要写通用模板\n2. 语言风格：温暖、有洞察力、不故弄玄虚，像一位智慧的长者在聊天\n3. 不要预测死亡、重大疾病、具体灾祸\n4. " +
    (unk
      ? "时辰不详，分析以年月日三柱为主，减少对时柱的依赖"
      : "四柱俱全，可做完整分析") +
    "\n5. 必须返回合法JSON，不要加任何markdown标记、代码块或注释";

  if (onProgress) onProgress("正在解析命局数据...");

  try {
    if (onProgress) onProgress("AI 命理师正在推演四柱...");

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("缺少 VITE_ANTHROPIC_API_KEY 环境变量");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        messages: [{ role: "user", content: systemPrompt }],
      }),
    });

    if (!response.ok) {
      throw new Error("API request failed: " + response.status);
    }

    if (onProgress) onProgress("天机已成，正在整理解读...");

    const data = await response.json();
    const content = data.content || [];
    const textContent = content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("");

    let cleaned = textContent.trim();
    if (cleaned.indexOf("```") !== -1) {
      cleaned = cleaned
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();
    }

    const ai = JSON.parse(cleaned);

    let wishNote = "";
    if (wish && ai.wish_response) {
      wishNote = "\n\n【定向解读 · " + wish + "】" + ai.wish_response;
    }

    return {
      title: title,
      zodiac: zodiac,
      score: score,
      unk: unk,
      wish: wish,
      destiny_code: pat.pattern + "（" + yy + eN(de) + "命）",
      nayin_year: ny.year,
      pattern_desc: pat.desc,
      day_master: ds + (yy === "阳" ? "（阳）" : "（阴）"),
      day_element: de,
      strong_desc: dm.strong
        ? "日主偏旺，精力充沛但需收敛锋芒"
        : "日主偏弱，内敛沉稳但需寻求外部助力",
      ten_gods: tg,
      nayin: ny,
      dist: dist,
      ew: ew,
      pillars: pillars,
      personality: {
        title: "性格全解",
        outer: {
          title: "外在特质 · 世人所见",
          content: ai.personality_outer,
        },
        inner: {
          title: "内在潜意识 · 心之所藏",
          content: ai.personality_inner,
        },
      },
      five_el_advice: ai.five_el_advice,
      fortune: {
        title: "2026 丙午年 · 流年运势",
        h1: {
          title: "上半年运势（正月至六月）",
          content: ai.fortune_h1,
        },
        h2: {
          title: "下半年运势（七月至腊月）",
          content: ai.fortune_h2,
        },
      },
      career: {
        title: "事业指南",
        avoid: {
          title: "⚠ 避坑指南（三忌）",
          content: ai.career_avoid,
        },
        tips: {
          title: "✦ 转运技巧（四法）",
          content: ai.career_tips + wishNote,
        },
      },
      advice: ai.advice,
      golden_sentence: ai.golden_sentence,
      _aiPowered: true,
    };
  } catch (err) {
    console.error("AI reading failed, falling back to local:", err);
    if (onProgress) {
      onProgress("AI 连接受限，启用本地推演...");
    }
    return genReadingLocal(bazi, gender, name, wish);
  }
}

