import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

/* ══════════════════════════════════════════════════════════════════════════════
   ██ DESIGN TOKENS — "青黛玉石" Cyan-Jade v4
   ══════════════════════════════════════════════════════════════════════════════ */
const C={bg:"#0F172A",surface:"rgba(15,23,42,0.58)",cyan:"#99F6E4",cyanMuted:"rgba(153,246,228,0.35)",
cyanGlow:"rgba(153,246,228,0.12)",cyanDim:"rgba(153,246,228,0.06)",gold:"#d4af37",
goldBorder:"rgba(212,175,55,0.18)",ink:"#e2e8f0",inkMuted:"rgba(203,213,225,0.5)",
borderCyan:"rgba(153,246,228,0.1)",overlay:"rgba(10,16,34,0.82)"};
const EL_COLOR={
  木:{bg:"rgba(34,197,94,0.12)",border:"rgba(34,197,94,0.35)",text:"#4ade80",glow:"rgba(34,197,94,0.25)",label:"Wood",hex:"#4ade80"},
  火:{bg:"rgba(239,68,68,0.12)",border:"rgba(239,68,68,0.35)",text:"#f87171",glow:"rgba(239,68,68,0.25)",label:"Fire",hex:"#f87171"},
  土:{bg:"rgba(217,170,60,0.12)",border:"rgba(217,170,60,0.35)",text:"#fbbf24",glow:"rgba(217,170,60,0.25)",label:"Earth",hex:"#fbbf24"},
  金:{bg:"rgba(226,232,240,0.1)",border:"rgba(226,232,240,0.3)",text:"#e2e8f0",glow:"rgba(226,232,240,0.2)",label:"Metal",hex:"#e2e8f0"},
  水:{bg:"rgba(96,165,250,0.12)",border:"rgba(96,165,250,0.35)",text:"#60a5fa",glow:"rgba(96,165,250,0.25)",label:"Water",hex:"#60a5fa"},
};

/* ══════════════════════════════════════════════════════════════════════════════
   ██ PROFESSIONAL BAZI ENGINE
   ══════════════════════════════════════════════════════════════════════════════
   ✅ Year pillar switches at 立春 (astronomical calculation)
   ✅ Month pillar based on Jie (节) solar terms
   ✅ Day pillar verified: 1893-12-26 = 丁酉 ✓ (Mao Zedong's known bazi)
   ✅ True solar time correction for longitude
   ✅ 地支藏干 weighted element analysis
   ✅ 十神 · 纳音 · 格局 detection
   ══════════════════════════════════════════════════════════════════════════════ */
const STEMS=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES=["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const STEM_EL={甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
const BR_EL={子:"水",丑:"土",寅:"木",卯:"木",辰:"土",巳:"火",午:"火",未:"土",申:"金",酉:"金",戌:"土",亥:"水"};
const STEM_YY={甲:"阳",乙:"阴",丙:"阳",丁:"阴",戊:"阳",己:"阴",庚:"阳",辛:"阴",壬:"阳",癸:"阴"};
const ZODIAC_M={子:"鼠",丑:"牛",寅:"虎",卯:"兔",辰:"龙",巳:"蛇",午:"马",未:"羊",申:"猴",酉:"鸡",戌:"狗",亥:"猪"};
const EN={木:"Wood",火:"Fire",土:"Earth",金:"Metal",水:"Water"};
const HIDDEN={子:["癸"],丑:["己","癸","辛"],寅:["甲","丙","戊"],卯:["乙"],辰:["戊","乙","癸"],巳:["丙","庚","戊"],午:["丁","己"],未:["己","丁","乙"],申:["庚","壬","戊"],酉:["辛"],戌:["戊","辛","丁"],亥:["壬","甲"]};
const NAYIN_T=["海中金","炉中火","大林木","路旁土","剑锋金","山头火","涧下水","城头土","白蜡金","杨柳木","泉中水","屋上土","霹雳火","松柏木","长流水","砂中金","山下火","平地木","壁上土","金箔金","覆灯火","天河水","大驿土","钗钏金","桑柘木","大溪水","砂中土","天上火","石榴木","大海水"];
const GEN_BY={木:"水",火:"木",土:"火",金:"土",水:"金"};
const CTRL_BY={木:"金",火:"水",土:"木",金:"火",水:"土"};
const GENERATES={木:"火",火:"土",土:"金",金:"水",水:"木"};
const CONTROLS={木:"土",火:"金",土:"水",金:"木",水:"火"};

function solLon(jd){const T=(jd-2451545)/36525,M=(357.52911+35999.05029*T)*Math.PI/180,C2=(1.914602-.004817*T)*Math.sin(M)+(.019993-.000101*T)*Math.sin(2*M)+.000289*Math.sin(3*M),om=(125.04-1934.136*T)*Math.PI/180;return(((280.46646+36000.76983*T+.0003032*T*T)+C2-.00569-.00478*Math.sin(om))%360+360)%360}
function d2jd(y,m,d,h=0){if(m<=2){y--;m+=12}const A=Math.floor(y/100);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+(2-A+Math.floor(A/4))-1524.5}
function stJD(yr,ti){const tl=(ti*15+285)%360;let jd=d2jd(yr,ti<4?1:Math.floor(ti/2),1)+(ti%2===0?5:20);for(let i=0;i<50;i++){let df=tl-solLon(jd);if(df>180)df-=360;if(df<-180)df+=360;if(Math.abs(df)<.0001)break;jd+=df/360*365.25}return jd}
function getTerms(yr){return Array.from({length:24},(_,i)=>({index:i,jd:stJD(yr,i)+8/24}))}
function trueST(yr,mo,dy,hr,mi,lon){const lc=(lon-120)*4,jd=d2jd(yr,mo,dy,hr+mi/60),T=(jd-2451545)/36525,L=(280.46646+36000.76983*T)*Math.PI/180,M=(357.52911+35999.05029*T)*Math.PI/180,e=.016708634-.000042037*T,y2=Math.tan(23.4393*Math.PI/360)**2,eot=(y2*Math.sin(2*L)-2*e*Math.sin(M)+4*e*y2*Math.sin(M)*Math.cos(2*L)-.5*y2*y2*Math.sin(4*L)-1.25*e*e*Math.sin(2*M))*229.18,cm=hr*60+mi+lc+eot;return{hour:Math.floor(cm/60),minute:Math.round(cm%60),total:cm/60}}

function yearP(yr,mo,dy,hr,terms){const lc=terms.find(t=>t.index===2),cjd=d2jd(yr,mo,dy,hr)+8/24,ey=cjd<lc.jd?yr-1:yr,idx=((ey-4)%60+60)%60;return{stem:STEMS[idx%10],branch:BRANCHES[idx%12]}}
function monthP(yr,mo,dy,hr,ysi,terms){const cjd=d2jd(yr,mo,dy,hr)+8/24,jm=[[0,1],[2,2],[4,3],[6,4],[8,5],[10,6],[12,7],[14,8],[16,9],[18,10],[20,11],[22,0]],bs=jm.map(function(pair){var found=terms.find(function(t){return t.index===pair[0]});return{jd:found?found.jd:0,bi:pair[1]}});const pv=getTerms(yr-1),pd=pv.find(t=>t.index===22);if(pd)bs.push({jd:pd.jd,bi:0});bs.sort((a,b)=>a.jd-b.jd);let mbi=1;for(let i=bs.length-1;i>=0;i--)if(cjd>=bs[i].jd){mbi=bs[i].bi;break}const base=((ysi%5)*2+2)%10,off=(mbi-2+12)%12;return{stem:STEMS[(base+off)%10],branch:BRANCHES[mbi]}}
function dayP(yr,mo,dy){const diff=Math.round((new Date(yr,mo-1,dy)-new Date(2000,0,1))/864e5),idx=((diff%60)+60+54)%60;return{stem:STEMS[idx%10],branch:BRANCHES[idx%12]}}
function hourP(hr,dsi){const bi=hr>=23?0:Math.floor((hr+1)/2),si=((dsi%5)*2+bi)%10;return{stem:STEMS[si],branch:BRANCHES[bi]}}

function tenGod(ds,ts){const de=STEM_EL[ds],te=STEM_EL[ts],sp=STEM_YY[ds]===STEM_YY[ts];if(de===te)return sp?"比肩":"劫财";if(GENERATES[de]===te)return sp?"食神":"伤官";if(CONTROLS[de]===te)return sp?"偏财":"正财";if(CTRL_BY[de]===te)return sp?"七杀":"正官";if(GEN_BY[de]===te)return sp?"偏印":"正印";return""}
function getNY(si,bi){for(let i=0;i<60;i++)if(i%10===si&&i%12===bi)return NAYIN_T[Math.floor(i/2)];return""}

function elemW(pillars,incH){const w={木:0,火:0,土:0,金:0,水:0};const pr=(p,sw,bw)=>{w[STEM_EL[p.stem]]+=sw;const h=HIDDEN[p.branch];if(h.length===1)w[STEM_EL[h[0]]]+=bw;else if(h.length===2){w[STEM_EL[h[0]]]+=bw*.7;w[STEM_EL[h[1]]]+=bw*.3}else{w[STEM_EL[h[0]]]+=bw*.6;w[STEM_EL[h[1]]]+=bw*.25;w[STEM_EL[h[2]]]+=bw*.15}};pr(pillars.year,1,1.2);pr(pillars.month,1.2,1.5);pr(pillars.day,1,1.2);if(incH&&pillars.hour)pr(pillars.hour,.8,1);return w}
function detectPat(pillars,incH){const ds=pillars.day.stem,w=elemW(pillars,incH),de=STEM_EL[ds],h=w[de]+w[GEN_BY[de]],tot=Object.values(w).reduce((a,b)=>a+b,0),strong=h/tot>.4;const mh=HIDDEN[pillars.month.branch],mg=tenGod(ds,mh[0]);const pm={"正官":["正官格","贵气天成"],"七杀":["七杀格","魄力非凡"],"正财":["正财格","稳健聚财"],"偏财":["偏财格","财源广进"],"正印":["正印格","学识渊博"],"偏印":["偏印格","才思独特"],"食神":["食神格","福禄寿全"],"伤官":["伤官格","才华横溢"],"比肩":["建禄格","自立自强"],"劫财":["建禄格","自立自强"]};const p=pm[mg]||["杂气格","五行混杂"];return{pattern:p[0],desc:p[1],strong,mg}}
function compDist(w){const t=Object.values(w).reduce((a,b)=>a+b,0);const d={};Object.entries(w).forEach(([k,v])=>{d[k]=t>0?Math.round(v/t*100):20});const s=Object.values(d).reduce((a,b)=>a+b,0);if(s!==100){const mk=Object.entries(d).sort((a,b)=>b[1]-a[1])[0][0];d[mk]+=100-s}return d}
function compScore(dist,de,pat){const vs=Object.values(dist),mx=Math.max(...vs),mn=Math.min(...vs),bal=100-(mx-mn)*.8,dp=dist[de]||20,ds2=dp>=15&&dp<=30?85:dp>=10&&dp<=35?75:65,pb=pat.pattern!=="杂气格"?5:0;return Math.min(98,Math.max(62,Math.round(bal*.5+ds2*.4+pb)))}

function calcBazi(year,month,day,hour=12,minute=0,longitude=116.4){
  const unk=hour<0;let eH=hour,tst=null;
  if(!unk&&longitude!==120){tst=trueST(year,month,day,hour,minute,longitude);eH=Math.floor(tst.total);if(eH<0)eH+=24;if(eH>=24)eH-=24}
  const terms=getTerms(year),h=unk?12:eH;
  const yp=yearP(year,month,day,h,terms),mp=monthP(year,month,day,h,STEMS.indexOf(yp.stem),terms),dp=dayP(year,month,day),hp=unk?null:hourP(eH,STEMS.indexOf(dp.stem));
  const pillars={year:yp,month:mp,day:dp,hour:hp};
  const tg={year:tenGod(dp.stem,yp.stem),month:tenGod(dp.stem,mp.stem),hour:hp?tenGod(dp.stem,hp.stem):null};
  const ny={year:getNY(STEMS.indexOf(yp.stem),BRANCHES.indexOf(yp.branch)),month:getNY(STEMS.indexOf(mp.stem),BRANCHES.indexOf(mp.branch)),day:getNY(STEMS.indexOf(dp.stem),BRANCHES.indexOf(dp.branch)),hour:hp?getNY(STEMS.indexOf(hp.stem),BRANCHES.indexOf(hp.branch)):null};
  const ew=elemW(pillars,!unk),dist=compDist(ew);
  const pat=detectPat(hp?pillars:{...pillars,hour:{stem:"甲",branch:"子"}},!unk);
  const dm={stem:dp.stem,element:STEM_EL[dp.stem],yy:STEM_YY[dp.stem],strong:pat.strong};
  return{pillars,tg,ny,dm,ew,dist,pat,zodiac:ZODIAC_M[yp.branch],unk,tst,score:compScore(dist,dm.element,pat)}
}

/* ══════════════════════════════════════════════════════════════════════════════
   ██ AI READING GENERATOR — Claude API powered unique analysis
   ══════════════════════════════════════════════════════════════════════════════ */
async function genReadingAI(bazi, gender, name, wish, onProgress) {
  const {dm, dist, pat, zodiac, unk, score, pillars, ew, tg, ny} = bazi;
  const de = dm.element, yy = dm.yy, ds = dm.stem;
  const title = name ? (name + (gender === "male" ? "先生" : "女士")) : (gender === "male" ? "先生" : "女士");
  const eN = function(k) { return k + "(" + EN[k] + ")"; };

  const hiddenDesc = function(p) {
    if (!p) return "无";
    var h = HIDDEN[p.branch];
    return h.map(function(s) { return s + "(" + STEM_EL[s] + ")"; }).join("、");
  };

  const baziData = {
    name: title,
    gender: gender === "male" ? "男" : "女",
    four_pillars: {
      year: pillars.year.stem + pillars.year.branch + " (天干:" + pillars.year.stem + " 地支:" + pillars.year.branch + " 藏干:" + hiddenDesc(pillars.year) + " 十神:" + tg.year + " 纳音:" + ny.year + ")",
      month: pillars.month.stem + pillars.month.branch + " (天干:" + pillars.month.stem + " 地支:" + pillars.month.branch + " 藏干:" + hiddenDesc(pillars.month) + " 十神:" + tg.month + " 纳音:" + ny.month + ")",
      day: pillars.day.stem + pillars.day.branch + " (天干:" + pillars.day.stem + "[日主] 地支:" + pillars.day.branch + " 藏干:" + hiddenDesc(pillars.day) + " 纳音:" + ny.day + ")",
      hour: unk ? "时辰不详（三柱模式）" : (pillars.hour.stem + pillars.hour.branch + " (天干:" + pillars.hour.stem + " 地支:" + pillars.hour.branch + " 藏干:" + hiddenDesc(pillars.hour) + " 十神:" + tg.hour + " 纳音:" + ny.hour + ")")
    },
    day_master: ds + " " + yy + de + "命",
    day_master_strength: dm.strong ? "偏旺" : "偏弱",
    pattern: pat.pattern + " (" + pat.desc + ")",
    month_dominant_god: pat.mg,
    five_element_weights: dist,
    raw_weights: ew,
    zodiac: zodiac,
    score: score,
    wish: wish || "无特定问题"
  };

  const systemPrompt = "你是一位精通子平八字的命理大师，兼具「穷通宝鉴」的深度和「蔡康永说话之道」的温暖。你为每位用户提供完全独一无二的八字解读。\n\n## 命主信息\n" + JSON.stringify(baziData, null, 2) + "\n\n## 输出要求\n请返回一个纯JSON对象（不要包含markdown代码块标记），结构如下：\n{\n  \"personality_outer\": \"外在性格描述（200-350字）——根据日主五行+阴阳+格局+十神组合来写，必须结合此人命局的独特之处（如伤官配印的矛盾感，正官格偏弱的隐忍等），不要写泛泛的五行性格\",\n  \"personality_inner\": \"内在潜意识描述（200-350字）——从藏干、月令、日支来分析深层心理需求，写出此命局独有的内心世界\",\n  \"fortune_h1\": \"2026丙午年上半年运势（250-400字）——结合流年天干丙火、地支午火与此人命局的具体生克关系来写。说明哪几个月最关键，为什么。必须针对此人的格局和喜忌来分析\",\n  \"fortune_h2\": \"2026丙午年下半年运势（250-400字）——同上，分析秋冬季节五行变化对此命局的具体影响\",\n  \"career_avoid\": \"三条避坑指南（每条50-80字）——基于此人的忌神、格局弱点来定制，用①②③编号\",\n  \"career_tips\": \"四条转运技巧（每条50-80字）——基于此人的喜用神来定制具体可行的建议，用①②③④编号\",\n  \"five_el_advice\": \"五行调和建议（80-120字）——说明喜用神和忌神，给出调和方向\",\n  \"advice\": \"行动总纲（100-150字）——全年最核心的一段话\",\n  \"golden_sentence\": \"赠言金句——一句古诗词或经典名言，要与此人命局特点呼应（不超过30字）\",\n  \"wish_response\": \"" + (wish ? "针对命主所求「" + wish + "」的定向解读（150-250字）——结合命局和流年给出具体建议" : "空字符串") + "\"\n}\n\n## 重要规则\n1. 所有内容必须根据上述八字数据推演，不要写通用模板\n2. 语言风格：温暖、有洞察力、不故弄玄虚，像一位智慧的长者在聊天\n3. 不要预测死亡、重大疾病、具体灾祸\n4. " + (unk ? "时辰不详，分析以年月日三柱为主，减少对时柱的依赖" : "四柱俱全，可做完整分析") + "\n5. 必须返回合法JSON，不要加任何markdown标记、代码块或注释";

  if (onProgress) onProgress("正在解析命局数据...");

  try {
    if (onProgress) onProgress("AI 命理师正在推演四柱...");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: systemPrompt }]
      })
    });

    if (!response.ok) {
      throw new Error("API request failed: " + response.status);
    }

    if (onProgress) onProgress("天机已成，正在整理解读...");

    const data = await response.json();
    const textContent = data.content.filter(function(item) { return item.type === "text"; }).map(function(item) { return item.text; }).join("");

    var cleaned = textContent.trim();
    if (cleaned.indexOf("```") !== -1) {
      cleaned = cleaned.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    }

    var ai = JSON.parse(cleaned);

    var wishNote = "";
    if (wish && ai.wish_response) {
      wishNote = "\n\n【定向解读 · " + wish + "】" + ai.wish_response;
    }

    return {
      title: title, zodiac: zodiac, score: score, unk: unk, wish: wish,
      destiny_code: pat.pattern + "（" + yy + eN(de) + "命）",
      nayin_year: ny.year,
      pattern_desc: pat.desc,
      day_master: ds + (yy === "阳" ? "（阳）" : "（阴）"),
      day_element: de,
      strong_desc: dm.strong ? "日主偏旺，精力充沛但需收敛锋芒" : "日主偏弱，内敛沉稳但需寻求外部助力",
      ten_gods: tg, nayin: ny, dist: dist, ew: ew, pillars: pillars,
      personality: {
        title: "性格全解",
        outer: { title: "外在特质 · 世人所见", content: ai.personality_outer },
        inner: { title: "内在潜意识 · 心之所藏", content: ai.personality_inner }
      },
      five_el_advice: ai.five_el_advice,
      fortune: {
        title: "2026 丙午年 · 流年运势",
        h1: { title: "上半年运势（正月至六月）", content: ai.fortune_h1 },
        h2: { title: "下半年运势（七月至腊月）", content: ai.fortune_h2 }
      },
      career: {
        title: "事业指南",
        avoid: { title: "\u26A0 避坑指南（三忌）", content: ai.career_avoid },
        tips: { title: "\u2726 转运技巧（四法）", content: ai.career_tips + wishNote }
      },
      advice: ai.advice,
      golden_sentence: ai.golden_sentence,
      _aiPowered: true
    };
  } catch (err) {
    console.error("AI reading failed, falling back to local:", err);
    if (onProgress) onProgress("AI 连接受限，启用本地推演...");
    return genReadingLocal(bazi, gender, name, wish);
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   ██ LOCAL READING FALLBACK — template-based
   ══════════════════════════════════════════════════════════════════════════════ */
function genReadingLocal(bazi,gender,name,wish){
  const{dm,dist,pat,zodiac,unk,score,pillars,ew,tg,ny}=bazi;
  const de=dm.element,yy=dm.yy,ds=dm.stem;
  const eN=k=>`${k}(${EN[k]})`;
  const title=name?`${name}${gender==="male"?"先生":"女士"}`:(gender==="male"?"先生":"女士");
  const sorted=Object.entries(dist).sort((a,b)=>b[1]-a[1]);
  const strongest=sorted[0][0],weakest=sorted[sorted.length-1][0];
  const strongDesc=dm.strong?"日主偏旺，精力充沛但需收敛锋芒":"日主偏弱，内敛沉稳但需寻求外部助力";

  const OUTER={木:"温和而坚定，给人如沐春风之感。你习惯以包容的态度面对世界，内心有着强烈的正义感与同理心。在社交中，你常常是那个默默付出、不求回报的角色，但偶尔也会因过度迁就他人而忽略自己的需求。",火:"热情洋溢，天生自带感染力。你走进任何房间，都像是带来了一束光。表达欲旺盛，善于鼓舞人心，是团队中的天然领袖。但有时候，你的直率可能无意间灼伤身边最亲近的人——学会在热情中保留一丝温柔的距离，是你一生的功课。",土:"沉稳厚重，不怒自威。你是朋友圈中那个'定海神针'式的存在，无论风浪多大，你总能给人安全感。你不喜欢变化，因为你深谙'稳定'本身就是一种力量。不过，偶尔尝试走出舒适区，你会发现世界比你想象的更广阔。",金:"锐利而精致，对品质有近乎偏执的追求。你的审美、你的标准、你的原则，都如同精钢淬火般清晰分明。你欣赏实力，也尊重规则。只是有时候，'完美主义'会变成一座孤岛——试着接受'差不多'的美好，你会轻松很多。",水:"灵动多变，思维敏捷如流水。你总能在别人看不到的角落发现机会，也善于将复杂的问题化繁为简。你的适应力极强，环境越复杂，你越如鱼得水。但过于多变有时也意味着难以坚持——找到一条值得深耕的河道，是你最大的智慧。"};
  const INNER={木:"内心深处渴望自由生长，不被约束。你的潜意识里有一棵参天大树，它需要阳光、需要空间。当你感到压抑或被限制时，焦虑便会如藤蔓般蔓延。你需要定期给自己'松土'——独处、阅读、亲近自然，都是你的精神养分。",火:"潜意识中有一团永不熄灭的火焰，驱动着你追逐梦想、渴望被认可。你害怕被忽视，更害怕平庸。当成就感缺失时，你容易陷入焦躁。你的内在需要一个'舞台'，哪怕它只是你自己给自己搭建的——写作、创业、表演，都能滋养你的灵魂之火。",土:"你的内在世界如同一座深厚的矿藏，看似平静无波，实则蕴含巨大能量。你对'归属感'有着深刻的需求——家庭、土地、传承，这些关键词构成了你潜意识的基石。当生活失去稳定感时，你会比任何人都感到不安。建立属于自己的'根据地'，是你安心的关键。",金:"你的潜意识深处，住着一个追求极致的工匠。你对自己的要求，往往比对任何人都严格。这种内在的高标准既是你成就的来源，也是压力的根源。学会对自己说一句'你已经做得很好了'，比任何外在的认可都更有疗愈力。",水:"你的内心如同一片深海，表面波澜不惊，底下暗流涌动。你的直觉极其敏锐，常常能感知到他人未曾言说的情绪。这种'共情天赋'是你的力量，也可能成为你的负担。学会建立情绪的边界，不让别人的浪潮淹没自己的海岸线。"};

  const F26_H1={木:"上半年（寅卯辰月）：火气渐升，木气被泄，精力容易分散。建议集中力量做一到两件事，不宜贪多。财运平平，不宜大额投资。3-4月有一波小的人际摩擦，以退为进可化解。",火:"上半年（寅卯辰月）：春火得木生，运势如虎添翼。1-3月是全年最佳窗口期，无论是谈判、跳槽还是启动新项目，都应把握这个时间段。但4月后需防官非口舌，低调为宜。",土:"上半年（寅卯辰月）：木气当令克土，压力来自外部环境的变化。不宜主动求变，以守为上。3月前后可能面临一次重要抉择，建议听取年长者的意见。财运方面有暗财可得。",金:"上半年（寅卯辰月）：春木旺盛，金受制约，事业推进缓慢是正常现象。此时宜充电学习、修炼内功。健康方面注意肝胆与呼吸系统。4月后压力略有缓解，出现合作机会。",水:"上半年（寅卯辰月）：木泄水气，体力和精力需要特别关注。1-2月宜休整，3月后逐渐回暖。财运在4月有一次小高峰。感情方面桃花暗动，已有伴侣者需多花时间陪伴对方。"};
  const F26_H2={木:"下半年（申酉戌月）：秋金肃杀克木，这是全年压力最大的阶段。但'金克木成器'，若能承受住考验，年底将迎来质的飞跃。10-11月有贵人出现，冬季水生木旺，运势明显回升。",火:"下半年（申酉戌月）：秋水渐生，火势收敛。此时不宜再冒进，应巩固上半年的成果。9-10月注意健康（心脑血管），11月有一波不错的财运。冬季注意保暖养生，来年开春又是一条好汉。",土:"下半年（申酉戌月）：火生土旺，下半年才是你真正发力的时机。7-9月事业运极佳，适合拓展版图、提升职级。10月后桃花运旺，单身者积极社交可遇良缘。年底注意理财，防止因人情开支过大。",金:"下半年（申酉戌月）：秋金当令，你终于迎来了属于自己的主场。被压抑了大半年的能量将在此时释放。8-10月是全年最佳时段，升职、加薪、谈合作皆宜。冬季水泄金气，宜收宜藏。",水:"下半年（申酉戌月）：金生水旺，财运渐入佳境。8月后明显感到'顺'了起来，之前的努力开始有回报。10-11月适合做长期规划和投资决策。冬季水旺至极，反需防'水多金沉'——保持冷静，不要被眼前的繁荣冲昏头脑。"};

  const AVOID={木:"① 2026年忌盲目跳槽或创业，火旺泄木，根基不稳时不宜冒险；② 忌与属鸡、属猴之人在重大决策上合作，五行相克易生嫌隙；③ 春季忌熬夜，肝木受损影响全年气运。",火:"① 上半年忌骄矜自满，盛极必衰是天道；② 忌在秋季（8-10月）做重大投资决策，此时判断力受水气影响；③ 忌与上级或长辈发生正面冲突，七杀之年宜柔不宜刚。",土:"① 忌在上半年（木旺期）强行推进新项目，时机未到反受其害；② 忌过度固守旧法，2026年丙火催动变革，拥抱变化才能借势；③ 忌暴饮暴食，脾土受损影响全年运势。",金:"① 全年最忌急躁冒进，火克金之年以'守'为第一要义；② 忌在夏季（6-8月）做重大决定，此时火气最旺、金气最弱；③ 忌与属马、属蛇之人发生金钱纠纷。",水:"① 忌在冬季过度投资或扩张，水旺则泛滥；② 忌优柔寡断，水性多变但决策时需果断；③ 忌忽视健康——肾水系统和泌尿系统是今年的弱点，定期体检很重要。"};
  const TIPS={木:"① 佩戴黑色或深蓝色饰品（水生木），尤其是黑曜石或蓝虎眼石；② 办公桌东方摆放绿植，激活木气；③ 每月初一、十五可小行善事（捐书、植树），积累福德；④ 多食绿色蔬菜与豆制品，补益肝木。",火:"① 佩戴绿色饰品（木生火），翡翠或绿幽灵尤佳；② 办公室或家中南方挂一幅红色系装饰画；③ 上半年多参加社交活动，贵人在人群中；④ 晨起面向东南方深呼吸三次，引木火之气。",土:"① 佩戴红色或橙色饰品（火生土），南红玛瑙或石榴石为佳；② 家居布置以暖色调为主，增强火土之气；③ 下半年多参加户外活动，接地气补土元素；④ 早睡早起，规律生活是土命之人最好的转运方式。",金:"① 佩戴黄色或土色饰品（土生金），黄水晶或蜜蜡为佳；② 在书桌西方放置金属摆件或白水晶；③ 上半年多读书、考证，用知识武装自己度过低谷期；④ 每周至少运动三次，强健体魄抵御火气侵袭。",水:"① 佩戴白色或金色饰品（金生水），银饰或白水晶为佳；② 办公区域北方摆放小型流水摆件；③ 多结交属猴、属鸡的朋友（金生水），贵人运在金属性人群中；④ 冬季注意保暖，尤其是腰部和膝盖。"};

  const wishNote=wish?`\n\n【定向解读 · ${wish}】基于${title}的命局分析，关于"${wish}"：${de==="火"?"丙午年火旺当令，正是大胆行动的好时机。但需注意秋冬降温期的风险管控。":de==="木"?"今年木被火泄，需蓄力等待，建议将计划推迟至下半年秋冬水木渐旺之时再行动。":de==="土"?"火生土旺，下半年是最佳窗口期，尤其是7-9月。上半年宜做准备工作。":de==="金"?"火旺克金，今年不宜贸然行动。建议先打好基础，待明年丁未年土生金旺时再全力推进。":"水火既济，机遇与挑战并存。建议春季谨慎试探，秋季全力出击。"}`:"";

  return{
    title,zodiac,score,unk,wish,
    destiny_code:`${pat.pattern}（${yy}${eN(de)}命）`,
    nayin_year:ny.year,
    pattern_desc:pat.desc,
    day_master:`${ds}${yy==="阳"?"（阳）":"（阴）"}`,
    day_element:de,
    strong_desc:strongDesc,
    ten_gods:tg,
    nayin:ny,
    dist,ew,
    pillars,
    personality:{
      title:"性格全解",
      outer:{title:"外在特质 · 世人所见",content:OUTER[de]},
      inner:{title:"内在潜意识 · 心之所藏",content:INNER[de]},
    },
    five_el_advice:`喜用神：${eN(GEN_BY[de])}、${eN(de)}｜忌神：${eN(CTRL_BY[de])}。${dm.strong?"日主偏旺，宜用食伤泄秀、财星耗身来平衡。":"日主偏弱，宜用印星生扶、比劫帮身来补益。"}建议多亲近${eN(GEN_BY[de])}属性的颜色、方位与事物。`,
    fortune:{
      title:"2026 丙午年 · 流年运势",
      h1:{title:"上半年运势（正月至六月）",content:F26_H1[de]},
      h2:{title:"下半年运势（七月至腊月）",content:F26_H2[de]},
    },
    career:{
      title:"事业指南",
      avoid:{title:"⚠ 避坑指南（三忌）",content:AVOID[de]},
      tips:{title:"✦ 转运技巧（四法）",content:TIPS[de]+wishNote},
    },
    advice:`2026丙午年，${title}当以"${de==="火"?"乘势而上":"韬光养晦"}"为要。${strongDesc}。日常可多用${eN(GEN_BY[de])}相关的颜色与物品来调和气场。保持心态平和，顺势而为，自能趋吉避凶。`,
    golden_sentence:{木:"东风不与周郎便，铜雀春深锁二乔——善借东风者，终成大器。",火:"星星之火，可以燎原——胸怀壮志者，天地皆为炉鼎。",土:"厚德载物，自强不息——根深者叶茂，行稳方致远。",金:"千锤万凿出深山，烈火焚烧若等闲——历经磨砺，终见真金。",水:"上善若水，水善利万物而不争——至柔者至刚，至静者至远。"}[de],
  };
}

/* ══════════════════════════════════════════════════════════════════════════════
   ██ GLOBAL STYLES
   ══════════════════════════════════════════════════════════════════════════════ */
const Styles=()=><style>{`
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&family=Ma+Shan+Zheng&display=swap');
@keyframes borderFlow{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.glow-border{position:relative;isolation:isolate}
.glow-border::before{content:'';position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:linear-gradient(270deg,rgba(212,175,55,.01),rgba(153,246,228,.28),rgba(212,175,55,.35),rgba(153,246,228,.28),rgba(212,175,55,.01));background-size:400% 400%;animation:borderFlow 6s ease infinite;-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:-1}
.text-glow{text-shadow:0 0 14px rgba(153,246,228,.35),0 0 48px rgba(153,246,228,.08)}
.text-glow-gold{text-shadow:0 0 18px rgba(212,175,55,.3),0 0 56px rgba(212,175,55,.06)}
.card-float{box-shadow:0 10px 40px rgba(0,0,0,.4),0 2px 10px rgba(0,0,0,.25),0 0 80px rgba(153,246,228,.015),inset 0 1px 0 rgba(153,246,228,.05)}
select option{background:#0f172a;color:#e2e8f0}::selection{background:rgba(153,246,228,.25)}
*{scrollbar-width:thin;scrollbar-color:rgba(153,246,228,.15) transparent}
@keyframes breathe{0%,100%{opacity:.3}50%{opacity:.7}}
.breathe{animation:breathe 3s ease-in-out infinite}
@keyframes scoreGlow{0%,100%{text-shadow:0 0 20px rgba(212,175,55,.3),0 0 60px rgba(212,175,55,.1)}50%{text-shadow:0 0 30px rgba(212,175,55,.5),0 0 80px rgba(212,175,55,.2)}}
@keyframes orbFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
input::placeholder,textarea::placeholder{color:rgba(203,213,225,.3)}
textarea{resize:none}
.scroll-area{scrollbar-width:thin;scrollbar-color:rgba(153,246,228,.12) transparent;-webkit-overflow-scrolling:touch}
.scroll-area::-webkit-scrollbar{width:4px}
.scroll-area::-webkit-scrollbar-track{background:transparent}
.scroll-area::-webkit-scrollbar-thumb{background:rgba(153,246,228,.15);border-radius:4px}
`}</style>;

/* ══════════════════════════════════════════════════════════════════════════════
   ██ AMBIENT BACKGROUND
   ══════════════════════════════════════════════════════════════════════════════ */
function AmbientBg(){return(
<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
  <div className="absolute inset-0" style={{background:`radial-gradient(ellipse 80% 60% at 22% 12%,rgba(16,80,60,.2) 0%,transparent 55%),radial-gradient(ellipse 55% 45% at 82% 78%,rgba(30,20,70,.16) 0%,transparent 55%),linear-gradient(155deg,#0F172A 0%,#0d1330 35%,#111a38 65%,#0F172A 100%)`}}/>
  {[{x:"15%",y:"8%",s:360,c:"rgba(153,246,228,.03)",d:20},{x:"78%",y:"62%",s:440,c:"rgba(212,175,55,.018)",d:25},{x:"45%",y:"35%",s:280,c:"rgba(16,80,60,.045)",d:17}].map((o,i)=>(
    <motion.div key={i} className="absolute rounded-full" style={{left:o.x,top:o.y,width:o.s,height:o.s,background:`radial-gradient(circle,${o.c},transparent 70%)`,filter:"blur(50px)"}} animate={{x:[0,35,-25,0],y:[0,-30,20,0],scale:[1,1.1,.93,1]}} transition={{duration:o.d,repeat:Infinity,ease:"easeInOut"}}/>
  ))}
  {Array.from({length:18}).map((_,i)=>(
    <motion.div key={`p${i}`} className="absolute rounded-full" style={{width:1.5+Math.random(),height:1.5+Math.random(),background:i%3===0?C.cyan:i%3===1?C.gold:"rgba(153,246,228,.5)",left:`${3+Math.random()*94}%`,top:`${3+Math.random()*94}%`}} animate={{y:[0,-(15+Math.random()*45),0],opacity:[.03,.25+Math.random()*.15,.03]}} transition={{duration:4+Math.random()*6,repeat:Infinity,delay:Math.random()*5,ease:"easeInOut"}}/>
  ))}
</div>)}

/* ══════════════════════════════════════════════════════════════════════════════
   ██ TAIJI SPINNER
   ══════════════════════════════════════════════════════════════════════════════ */
function TaijiSpinner(){return(
<motion.div className="relative w-52 h-52 mx-auto">
  <motion.div animate={{rotate:360}} transition={{duration:4,repeat:Infinity,ease:"linear"}} className="w-full h-full">
    <svg viewBox="0 0 200 200"><defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={C.cyan}/><stop offset="100%" stopColor="rgba(153,246,228,.35)"/></linearGradient><filter id="sg"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <circle cx="100" cy="100" r="96" fill="none" stroke="url(#cg)" strokeWidth="1" className="breathe"/>
    <path d="M100 10 A90 90 0 0 1 100 190 A45 45 0 0 1 100 100 A45 45 0 0 0 100 10" fill={C.cyan} opacity=".85" filter="url(#sg)"/>
    <path d="M100 190 A90 90 0 0 1 100 10 A45 45 0 0 1 100 100 A45 45 0 0 0 100 190" fill="rgba(15,23,42,.95)" stroke={C.borderCyan} strokeWidth=".5"/>
    <circle cx="100" cy="55" r="10" fill="rgba(15,23,42,.9)"/><circle cx="100" cy="145" r="10" fill={C.cyan} opacity=".8"/>
    {[0,45,90,135,180,225,270,315].map((a,i)=>{const r=a*Math.PI/180;return (<text key={i} x={100+82*Math.cos(r)} y={100+82*Math.sin(r)} textAnchor="middle" dominantBaseline="central" fill={C.cyan} fontSize="9" opacity=".35" fontFamily="serif">{"☰☱☲☳☴☵☶☷"[i]}</text>)})}
    </svg>
  </motion.div>
  {[0,1,2].map(i=><motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full" style={{background:C.cyan,top:"50%",left:"50%",boxShadow:`0 0 12px ${C.cyan}`}} animate={{x:[0,Math.cos(i*2.1)*120,0],y:[0,Math.sin(i*2.1)*120,0],opacity:[.15,.75,.15]}} transition={{duration:3,repeat:Infinity,delay:i,ease:"easeInOut"}}/>)}
</motion.div>)}

/* ══════════════════════════════════════════════════════════════════════════════
   ██ SMALL UI COMPONENTS
   ══════════════════════════════════════════════════════════════════════════════ */
function TypeWriter({text,speed=35,onComplete}){
  const[d,setD]=useState("");
  const idx=useRef(0);
  useEffect(()=>{
    idx.current=0;setD("");
    const iv=setInterval(()=>{
      if(idx.current<text.length){setD(text.slice(0,++idx.current))}
      else{clearInterval(iv);if(onComplete)onComplete()}
    },speed);
    return()=>clearInterval(iv);
  },[text,speed]);
  const showCursor=d.length<text.length;
  return(
    <span>
      {d}
      {showCursor ? (
        <motion.span animate={{opacity:[1,0]}} transition={{duration:.5,repeat:Infinity}}
          className="inline-block w-0.5 h-4 ml-0.5 align-middle rounded-full" style={{background:C.cyan}}/>
      ) : null}
    </span>
  );
}

function GlassCard({children,className="",glow=false,delay=0,style={}}){return (<motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay,duration:.7,ease:"easeOut"}} className={`rounded-2xl p-6 card-float ${glow?"glow-border":""} ${className}`} style={{background:`linear-gradient(165deg,rgba(15,23,42,.68),rgba(20,28,55,.52))`,backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",border:`1px solid ${C.goldBorder}`,...style}}>{children}</motion.div>);}

function SectionLabel({children}){return (<h3 className="text-sm mb-4 tracking-[.2em] flex items-center gap-3 text-glow" style={{color:C.cyan}}><span className="block w-5 h-px" style={{background:`linear-gradient(90deg,${C.cyan}50,transparent)`}}/>{children}</h3>);}

function Divider(){return (<div className="flex items-center gap-4 my-6"><div className="flex-1 h-px" style={{background:`linear-gradient(90deg,transparent,${C.borderCyan},transparent)`}}/><span style={{color:C.cyan,opacity:.2,fontSize:10}}>◆</span><div className="flex-1 h-px" style={{background:`linear-gradient(90deg,transparent,${C.borderCyan},transparent)`}}/></div>);}

function Toggle({value,onChange,left,right}){return (<div className="flex items-center gap-3 justify-center"><span className="text-xs tracking-wider" style={{color:!value?C.cyan:C.inkMuted}}>{left}</span><button onClick={()=>onChange(!value)} className="relative w-12 h-6 rounded-full border transition-all duration-300" style={{background:value?C.cyanDim:"rgba(15,23,42,.6)",borderColor:value?`${C.cyan}40`:C.goldBorder}}><motion.div className="absolute top-0.5 w-5 h-5 rounded-full" animate={{left:value?24:2}} transition={{type:"spring",stiffness:500,damping:30}} style={{background:value?C.cyan:C.inkMuted}}/></button><span className="text-xs tracking-wider" style={{color:value?C.cyan:C.inkMuted}}>{right}</span></div>);}

/* ── Help Icon ── */
function HelpIcon({onClick}){return (<button onClick={onClick} className="inline-flex items-center justify-center w-5 h-5 rounded-full border text-xs transition-all duration-200 hover:scale-110 ml-2 shrink-0" style={{borderColor:`${C.cyan}30`,color:C.cyan,background:C.cyanDim,fontSize:10}} title="点击了解更多">?</button>);}

/* ── Info Modal ── */
function InfoModal({open,onClose,title,children}){
  return(
    <AnimatePresence>
      {open ? (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
          <div className="absolute inset-0" style={{background:C.overlay}}/>
          <motion.div initial={{opacity:0,scale:.9,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.95,y:10}} transition={{type:"spring",damping:25,stiffness:300}} onClick={function(e){e.stopPropagation()}}
            className="relative w-full max-w-lg rounded-2xl p-6 card-float glow-border scroll-area" style={{background:"linear-gradient(165deg,rgba(15,23,42,.92),rgba(20,28,55,.88))",backdropFilter:"blur(32px)",border:"1px solid "+C.goldBorder,maxHeight:"78vh",overflowY:"auto"}}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base tracking-[.15em] text-glow" style={{color:C.cyan}}>{title}</h3>
              <button onClick={onClose} className="w-7 h-7 rounded-full border flex items-center justify-center text-xs transition-all hover:scale-110" style={{borderColor:C.borderCyan,color:C.inkMuted}}>✕</button>
            </div>
            <div className="text-sm leading-7 space-y-4" style={{color:C.ink,opacity:.85}}>{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ── Score Ring ── */
function ScoreRing({score,delay=0}){
  const[count,setCount]=useState(0);
  const r=58,circ=2*Math.PI*r,prog=score/100*circ;
  useEffect(()=>{
    const to=setTimeout(()=>{
      let c=0;
      const iv=setInterval(()=>{c++;setCount(c);if(c>=score)clearInterval(iv)},20);
    },delay*1000+400);
    return()=>clearTimeout(to);
  },[score,delay]);
  return(
    <motion.div initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{delay,duration:.8}} className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(212,175,55,.08)" strokeWidth="4"/>
          <motion.circle cx="70" cy="70" r={r} fill="none" stroke={C.gold} strokeWidth="4" strokeLinecap="round" strokeDasharray={circ} initial={{strokeDashoffset:circ}} animate={{strokeDashoffset:circ-prog}} transition={{delay:delay+.3,duration:1.5,ease:"easeOut"}} style={{filter:"drop-shadow(0 0 6px rgba(212,175,55,.4))"}}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{color:C.gold,fontFamily:"'Ma Shan Zheng',cursive",animation:"scoreGlow 3s ease-in-out infinite"}}>{count}</span>
          <span className="text-xs -mt-0.5" style={{color:C.inkMuted}}>综合评分</span>
        </div>
      </div>
      <span className="text-xs mt-2" style={{color:C.inkMuted}}>
        {score>=85?"上吉 · 运势极佳":score>=75?"中吉 · 稳中向好":score>=65?"小吉 · 平稳安顺":"待运 · 蓄势待发"}
      </span>
    </motion.div>
  );
}

/* ── Pillar Card ── */
function PillarCard({label,sub,stem,branch,delay=0,dimmed=false,tenGod,nayin}){
  const se=STEM_EL[stem]||"水",be=BR_EL[branch]||"水",sc=EL_COLOR[se],bc=EL_COLOR[be];
  return (<motion.div initial={{opacity:0,rotateY:-90,scale:.8}} animate={{opacity:dimmed ? 0.4 : 1,rotateY:0,scale:1}} transition={{delay,duration:.7,ease:[.16,1,.3,1]}} style={{perspective:800}} className="flex flex-col items-center">
    <span className="text-xs mb-2 tracking-[.2em]" style={{color:C.inkMuted}}>{label}</span>
    <div className="rounded-2xl overflow-hidden card-float" style={{background:`linear-gradient(170deg,rgba(15,23,42,.82),rgba(20,28,50,.62))`,backdropFilter:"blur(20px)",minWidth:78,border:`1px solid ${C.goldBorder}`}}>
      <div className="px-5 pt-4 pb-2 flex flex-col items-center" style={{background:sc.bg}}><span className="text-3xl font-bold" style={{color:sc.text,fontFamily:"'Noto Serif SC',serif",textShadow:`0 0 12px ${sc.glow}`}}>{stem}</span><span className="text-xs mt-0.5 opacity-70" style={{color:sc.text}}>{se}·{sc.label}</span></div>
      <div className="h-px mx-3" style={{background:`linear-gradient(90deg,transparent,${C.cyan}30,transparent)`}}/>
      <div className="px-5 pt-2 pb-3 flex flex-col items-center" style={{background:bc.bg}}><span className="text-3xl font-bold" style={{color:bc.text,fontFamily:"'Noto Serif SC',serif",textShadow:`0 0 12px ${bc.glow}`}}>{branch}</span><span className="text-xs mt-0.5 opacity-70" style={{color:bc.text}}>{be}·{bc.label}</span></div>
      {(tenGod||nayin) ? (<div className="px-3 py-1.5 text-center border-t" style={{borderColor:C.goldBorder,background:"rgba(15,23,42,.5)"}}>{tenGod ? <span className="text-xs mr-2" style={{color:C.cyanMuted}}>{tenGod}</span> : null}{nayin ? <span className="text-xs" style={{color:C.inkMuted}}>{nayin}</span> : null}</div>) : null}
    </div>
    <span className="text-xs mt-2.5 tracking-wider" style={{color:C.cyanMuted}}>{sub}</span>
  </motion.div>);
}

/* ── Energy Orbs (五行能量球) ── */
function EnergyOrbs({dist}){
  const entries=Object.entries(dist).sort((a,b)=>b[1]-a[1]);
  const maxV=Math.max(...entries.map(([,v])=>v));
  return (<div className="flex items-end justify-center gap-5 py-4">
    {entries.map(([el,pct],i)=>{
      const ec=EL_COLOR[el],size=28+pct/maxV*42;
      return (<motion.div key={el} initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{delay:.1*i,duration:.6,type:"spring"}} className="flex flex-col items-center gap-2">
        <motion.div animate={{y:[0,-6-Math.random()*4,0]}} transition={{duration:2.5+Math.random()*1.5,repeat:Infinity,ease:"easeInOut",delay:i*.3}}
          className="rounded-full flex items-center justify-center" style={{width:size,height:size,background:`radial-gradient(circle at 35% 35%,${ec.hex}40,${ec.hex}15)`,border:`1.5px solid ${ec.border}`,boxShadow:`0 0 ${pct/2}px ${ec.glow}, inset 0 0 ${pct/3}px ${ec.glow}`}}>
          <span className="text-xs font-bold" style={{color:ec.text}}>{pct}%</span>
        </motion.div>
        <span className="text-xs" style={{color:ec.text}}>{el}</span>
      </motion.div>);
    })}
  </div>);
}

/* ── Element Bars ── */
function ElementBars({dist}){
  return (<div className="space-y-2.5 mt-3">
    {Object.entries(dist).map(([el,pct],i)=>{const ec=EL_COLOR[el];return(
      <motion.div key={el} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:.08*i,duration:.5}} className="flex items-center gap-3">
        <span className="w-14 text-right text-xs font-medium shrink-0" style={{color:ec.text}}>{el} {ec.label}</span>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{background:"rgba(15,23,42,.6)"}}>
          <motion.div className="h-full rounded-full" initial={{width:0}} animate={{width:`${pct}%`}} transition={{delay:.15+.08*i,duration:.8,ease:"easeOut"}} style={{background:`linear-gradient(90deg,${ec.border},${ec.text})`,boxShadow:`0 0 8px ${ec.glow}`}}/>
        </div>
        <span className="w-8 text-xs tabular-nums" style={{color:ec.text}}>{pct}%</span>
      </motion.div>
    );})}
  </div>);
}

/* ══════════════════════════════════════════════════════════════════════════════
   ██ MAIN APP
   ══════════════════════════════════════════════════════════════════════════════ */
export default function MingLiApp(){
  const[phase,setPhase]=useState("input");
  const[name,setName]=useState("");
  const[gender,setGender]=useState("male");
  const[isLunar,setIsLunar]=useState(false);
  const[year,setYear]=useState(1990);
  const[month,setMonth]=useState(6);
  const[day,setDay]=useState(15);
  const[hourIdx,setHourIdx]=useState(6);
  const[wish,setWish]=useState("");
  const[result,setResult]=useState(null);
  const[reveal,setReveal]=useState(0);
  const[modal,setModal]=useState(null);
  const[aiProgress,setAiProgress]=useState("");

  const shichen=[{l:"子时 (23-01)",h:0},{l:"丑时 (01-03)",h:2},{l:"寅时 (03-05)",h:4},{l:"卯时 (05-07)",h:6},{l:"辰时 (07-09)",h:8},{l:"巳时 (09-11)",h:10},{l:"午时 (11-13)",h:12},{l:"未时 (13-15)",h:14},{l:"申时 (15-17)",h:16},{l:"酉时 (17-19)",h:18},{l:"戌时 (19-21)",h:20},{l:"亥时 (21-23)",h:22},{l:"⚠ 时辰不详",h:-1}];
  const unk=hourIdx===12;
  const lunarM=["正","二","三","四","五","六","七","八","九","十","冬","腊"];
  const lunarD=["初一","初二","初三","初四","初五","初六","初七","初八","初九","初十","十一","十二","十三","十四","十五","十六","十七","十八","十九","二十","廿一","廿二","廿三","廿四","廿五","廿六","廿七","廿八","廿九","三十","三十一"];

  const handleSubmit=()=>{
    setPhase("loading");setAiProgress("正在排盘计算...");
    const h=unk?-1:shichen[hourIdx].h;
    const bazi=calcBazi(year,month,day,h,0,116.4);
    setTimeout(async ()=>{
      try {
        const reading=await genReadingAI(bazi,gender,name.trim(),wish.trim(),function(msg){setAiProgress(msg)});
        setResult(reading);setPhase("result");
        let s=0;const iv=setInterval(()=>{if(++s>=8)clearInterval(iv);setReveal(s)},600);
      } catch(e) {
        console.error(e);
        const reading=genReadingLocal(bazi,gender,name.trim(),wish.trim());
        setResult(reading);setPhase("result");
        let s=0;const iv=setInterval(()=>{if(++s>=8)clearInterval(iv);setReveal(s)},600);
      }
    },1500);
  };
  const handleReset=()=>{setPhase("input");setResult(null);setReveal(0);setAiProgress("")};

  const sel={background:"rgba(15,23,42,.88)",border:`1px solid ${C.goldBorder}`,color:C.ink,backdropFilter:"blur(12px)",fontFamily:"'Noto Serif SC',serif"};
  const inp={...sel,outline:"none"};

  return(
  <div className="min-h-screen relative overflow-x-hidden" style={{fontFamily:"'Noto Serif SC','Songti SC',serif",color:C.ink}}>
    <Styles/><AmbientBg/>

    {/* Header */}
    <motion.header initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:1}} className="relative z-10 text-center pt-8 pb-3">
      <div className="flex items-center justify-center gap-3 mb-1.5"><div className="w-14 h-px" style={{background:`linear-gradient(90deg,transparent,${C.cyan}60)`}}/><span className="text-xs tracking-[.5em] uppercase" style={{color:C.cyanMuted}}>Destiny Unveiled</span><div className="w-14 h-px" style={{background:`linear-gradient(270deg,transparent,${C.cyan}60)`}}/></div>
      <h1 className="text-5xl md:text-6xl font-bold tracking-wider text-glow" style={{fontFamily:"'Ma Shan Zheng',cursive",color:C.cyan}}>天命明理</h1>
      <p className="text-sm mt-2" style={{color:C.inkMuted}}>四柱八字 · 五行推演 · 丙午年运势</p>
    </motion.header>

    <div className="relative z-10 max-w-2xl mx-auto px-4 pb-24">
    <AnimatePresence mode="wait">

    {/* ═══════ INPUT ═══════ */}
    {phase==="input"&&(
    <motion.div key="input" initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-40,scale:.97}} transition={{duration:.6}}>
      <GlassCard glow>
        <h2 className="text-center text-lg mb-6 text-glow" style={{color:C.cyan}}>请输入出生信息</h2>
        {/* Name */}
        <div className="mb-5"><label className="text-xs mb-1.5 block tracking-widest" style={{color:C.inkMuted}}>姓名 <span style={{opacity:.4}}>（可选 · 输入姓名可获得更具代入感的报告）</span></label>
        <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="请输入您的姓名..." className="w-full rounded-xl px-4 py-2.5 text-sm" style={inp}/></div>
        {/* Gender */}
        <div className="flex justify-center gap-4 mb-5">
          {[{v:"male",l:"乾·男",i:"♂"},{v:"female",l:"坤·女",i:"♀"}].map(o=><button key={o.v} onClick={()=>setGender(o.v)} className="px-7 py-3 rounded-xl border transition-all duration-300" style={{background:gender===o.v?C.cyanDim:"transparent",borderColor:gender===o.v?`${C.cyan}40`:C.goldBorder,color:gender===o.v?C.cyan:C.inkMuted,boxShadow:gender===o.v?`0 0 24px ${C.cyanGlow}`:"none"}}><span className="text-lg mr-2">{o.i}</span>{o.l}</button>)}
        </div>
        {/* Calendar */}
        <div className="mb-4"><Toggle value={isLunar} onChange={setIsLunar} left="公历（阳历）" right="农历（阴历）"/>{isLunar&&<motion.p initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}} className="text-center text-xs mt-2" style={{color:C.cyanMuted}}>已切换至农历模式</motion.p>}</div>
        {/* Date+Time */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {[{lb:"年",v:year,s:setYear,opts:Array.from({length:80},(_,i)=>1950+i),f:v=>`${v}年`},{lb:"月",v:month,s:setMonth,opts:Array.from({length:12},(_,i)=>i+1),f:v=>isLunar?`${lunarM[v-1]}月`:`${v}月`},{lb:"日",v:day,s:setDay,opts:Array.from({length:31},(_,i)=>i+1),f:v=>isLunar?lunarD[v-1]:`${v}日`},{lb:"时辰",v:hourIdx,s:setHourIdx,opts:Array.from({length:13},(_,i)=>i),f:v=>shichen[v].l}].map(f=>(
            <div key={f.lb} className="flex flex-col"><label className="text-xs mb-1.5 tracking-widest" style={{color:C.inkMuted}}>{f.lb}</label><select value={f.v} onChange={e=>f.s(Number(e.target.value))} className="rounded-xl px-3 py-2.5 text-sm outline-none appearance-none cursor-pointer" style={sel}>{f.opts.map(o=><option key={o} value={o}>{f.f(o)}</option>)}</select></div>
          ))}
        </div>
        <AnimatePresence>{unk ? (<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="rounded-xl px-4 py-3 mb-3 border" style={{background:"rgba(212,175,55,.04)",borderColor:"rgba(212,175,55,.15)"}}><p className="text-xs" style={{color:C.gold}}>⚡ 时辰不详模式：将侧重年、月、日三柱分析</p></motion.div>) : null}</AnimatePresence>
        {/* Wish */}
        <div className="mb-5"><label className="text-xs mb-1.5 block tracking-widest" style={{color:C.inkMuted}}>心中所求 <span style={{opacity:.4}}>（可选 · 填写具体事项可获得定向分析）</span></label>
        <textarea value={wish} onChange={e=>setWish(e.target.value)} placeholder="例如：今年想转行做自媒体、下半年想结婚、考虑在杭州买房..." rows={2} className="w-full rounded-xl px-4 py-2.5 text-sm" style={inp}/></div>
        {/* Submit */}
        <motion.button whileHover={{scale:1.02,boxShadow:`0 0 40px ${C.cyanGlow}`}} whileTap={{scale:.98}} onClick={handleSubmit} className="w-full py-4 rounded-xl border text-lg tracking-[.3em] transition-all duration-300 glow-border" style={{background:`linear-gradient(135deg,${C.cyanDim},rgba(212,175,55,.03))`,borderColor:`${C.cyan}30`,color:C.cyan}}>开 启 天 机</motion.button>
        <p className="text-center text-xs mt-5" style={{color:C.inkMuted,opacity:.4}}>* 本结果仅供娱乐参考，命运始终掌握在自己手中</p>
      </GlassCard>
    </motion.div>)}

    {/* ═══════ LOADING ═══════ */}
    {phase==="loading"&&(
    <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.5}} className="flex flex-col items-center py-16">
      <TaijiSpinner/>
      <motion.div className="mt-10 text-center" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}}>
        <p className="text-lg tracking-[.25em] text-glow" style={{color:C.cyan}}><TypeWriter text={name?name+"，天机正在为您推演...":"天地玄机，正在推演..."} speed={100}/></p>
        <motion.div className="flex justify-center gap-2 mt-5" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}}>
          {(unk?["排列三柱","推算五行","AI深度解读"]:["排列四柱","推算五行","AI深度解读"]).map(function(s,i){ return (<motion.span key={s} className="text-xs px-3 py-1 rounded-full border" style={{borderColor:C.borderCyan,color:C.inkMuted,background:C.cyanDim}} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:1.2+i*0.5}}>{s}</motion.span>); })}
        </motion.div>
        {aiProgress ? (
          <motion.p className="text-xs mt-5 tracking-wider" style={{color:C.gold,opacity:0.7}} initial={{opacity:0}} animate={{opacity:0.7}} key={aiProgress}>{aiProgress}</motion.p>
        ) : null}
      </motion.div>
    </motion.div>)}

    {/* ═══════ RESULT ═══════ */}
    {phase==="result"&&result&&(
    <motion.div key="result" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.8}} className="space-y-6">

      {/* Wish tag */}
      {result.wish&&reveal>=1&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center"><span className="inline-block text-xs px-4 py-1.5 rounded-full border" style={{borderColor:`${C.gold}30`,color:C.gold,background:"rgba(212,175,55,.06)"}}>定向测算：{result.wish}</span></motion.div>}

      {/* Score + Badge */}
      {reveal>=1&&<motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center pt-2 pb-2">
        <span className="text-xs tracking-[.35em] block mb-4" style={{color:C.inkMuted}}>命 格</span>
        {result._aiPowered ? (<span className="inline-block text-xs px-3 py-1 mb-3 rounded-full border" style={{borderColor:"rgba(153,246,228,0.25)",color:C.cyan,background:"rgba(153,246,228,0.06)",fontSize:10}}>✦ AI 深度解读</span>) : null}
        <ScoreRing score={result.score} delay={.2}/>
        <h2 className="text-2xl md:text-3xl mt-4 font-bold text-glow" style={{color:C.cyan,fontFamily:"'Ma Shan Zheng',cursive"}}>{result.destiny_code}</h2>
        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap"><span className="text-xs" style={{color:C.inkMuted}}>生肖：{result.zodiac}</span><span style={{color:C.borderCyan}}>|</span><span className="text-xs" style={{color:C.inkMuted}}>日主：{result.day_master}</span><span style={{color:C.borderCyan}}>|</span><span className="text-xs" style={{color:C.inkMuted}}>{result.strong_desc}</span><span style={{color:C.borderCyan}}>|</span><span className="text-xs" style={{color:C.inkMuted}}>纳音：{result.nayin_year}</span>{result.unk&&<><span style={{color:C.borderCyan}}>|</span><span className="text-xs" style={{color:C.gold}}>三柱模式</span></>}</div>
      </motion.div>}

      {/* Four Pillars */}
      {reveal>=2&&<GlassCard glow delay={.1}>
        <div className="flex items-center justify-center mb-6"><h3 className="text-sm tracking-[.3em]" style={{color:C.inkMuted}}>─ 四柱排盘 ─</h3><HelpIcon onClick={()=>setModal("pillars")}/></div>
        <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
          {[{l:"年柱",s:"根基·祖上",...result.pillars.year,d:.15,dim:false,tg:result.ten_gods.year,ny:result.nayin.year},{l:"月柱",s:"事业·父母",...result.pillars.month,d:.35,dim:false,tg:result.ten_gods.month,ny:result.nayin.month},{l:"日柱",s:"自身·配偶",...result.pillars.day,d:.55,dim:false,tg:"日主",ny:result.nayin.day},{l:"时柱",s:"晚运·子女",...(result.pillars.hour||{stem:"?",branch:"?"}),d:.75,dim:result.unk,tg:result.ten_gods.hour,ny:result.nayin.hour}].map(p=><PillarCard key={p.l} label={p.l} sub={p.s} stem={p.stem} branch={p.branch} delay={p.d} dimmed={p.dim} tenGod={p.tg} nayin={p.ny}/>)}
        </div>
        {result.unk&&<p className="text-center text-xs mt-5" style={{color:C.gold,opacity:.7}}>⚠ 时柱因出生时辰不详而降低权重</p>}
      </GlassCard>}

      {/* Five Element Energy */}
      {reveal>=3&&<GlassCard delay={.15}>
        <div className="flex items-center justify-center mb-2"><h3 className="text-sm tracking-[.3em]" style={{color:C.inkMuted}}>─ 五行能量 ─</h3><HelpIcon onClick={()=>setModal("wuxing")}/></div>
        <EnergyOrbs dist={result.dist}/>
        <ElementBars dist={result.dist}/>
        <p className="text-center text-sm mt-4 px-2 leading-7" style={{color:C.inkMuted}}><TypeWriter text={result.five_el_advice} speed={22}/></p>
      </GlassCard>}

      {/* Personality — dual panel */}
      {reveal>=4&&<GlassCard delay={.1}>
        <SectionLabel>{result.personality.title}</SectionLabel>
        <div className="space-y-5">
          <div><h4 className="text-xs tracking-[.15em] mb-2 flex items-center gap-2" style={{color:C.cyan,opacity:.7}}><span className="w-3 h-px" style={{background:C.cyan}}/>{result.personality.outer.title}</h4><div className="max-h-48 overflow-y-auto scroll-area pr-1"><p className="text-sm leading-7" style={{color:C.ink,opacity:.85}}><TypeWriter text={result.personality.outer.content} speed={18}/></p></div></div>
          <Divider/>
          <div><h4 className="text-xs tracking-[.15em] mb-2 flex items-center gap-2" style={{color:C.cyan,opacity:.7}}><span className="w-3 h-px" style={{background:C.cyan}}/>{result.personality.inner.title}</h4><div className="max-h-48 overflow-y-auto scroll-area pr-1"><p className="text-sm leading-7" style={{color:C.ink,opacity:.85}}><TypeWriter text={result.personality.inner.content} speed={18}/></p></div></div>
        </div>
      </GlassCard>}

      {/* Fortune 2026 — H1 + H2 */}
      {reveal>=5&&<GlassCard glow delay={.1}>
        <SectionLabel>{result.fortune.title}</SectionLabel>
        <div className="space-y-5">
          <div><h4 className="text-xs tracking-[.15em] mb-2" style={{color:C.cyan,opacity:.7}}>▸ {result.fortune.h1.title}</h4><div className="max-h-56 overflow-y-auto scroll-area pr-1"><p className="text-sm leading-7" style={{color:C.ink,opacity:.85}}><TypeWriter text={result.fortune.h1.content} speed={18}/></p></div></div>
          <Divider/>
          <div><h4 className="text-xs tracking-[.15em] mb-2" style={{color:C.cyan,opacity:.7}}>▸ {result.fortune.h2.title}</h4><div className="max-h-56 overflow-y-auto scroll-area pr-1"><p className="text-sm leading-7" style={{color:C.ink,opacity:.85}}><TypeWriter text={result.fortune.h2.content} speed={18}/></p></div></div>
        </div>
      </GlassCard>}

      {/* Career — Avoid + Tips */}
      {reveal>=6&&<GlassCard delay={.1}>
        <SectionLabel>{result.career.title}</SectionLabel>
        <div className="space-y-5">
          <div><h4 className="text-xs tracking-[.15em] mb-2" style={{color:"#f87171",opacity:.8}}>{result.career.avoid.title}</h4><div className="max-h-56 overflow-y-auto scroll-area pr-1"><p className="text-sm leading-7 whitespace-pre-line" style={{color:C.ink,opacity:.85}}><TypeWriter text={result.career.avoid.content} speed={16}/></p></div></div>
          <Divider/>
          <div><h4 className="text-xs tracking-[.15em] mb-2" style={{color:"#4ade80",opacity:.8}}>{result.career.tips.title}</h4><div className="max-h-64 overflow-y-auto scroll-area pr-1"><p className="text-sm leading-7 whitespace-pre-line" style={{color:C.ink,opacity:.85}}><TypeWriter text={result.career.tips.content} speed={16}/></p></div></div>
        </div>
      </GlassCard>}

      {/* Advice */}
      {reveal>=7&&<GlassCard delay={.1}>
        <SectionLabel>行动总纲</SectionLabel>
        <p className="text-sm leading-7" style={{color:C.ink,opacity:.85}}><TypeWriter text={result.advice} speed={22}/></p>
      </GlassCard>}

      {/* Golden Quote + Actions */}
      {reveal>=8&&<>
        <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} transition={{delay:.4,duration:.9}} className="relative rounded-2xl p-8 text-center overflow-hidden glow-border card-float" style={{background:`linear-gradient(160deg,rgba(15,23,42,.72),rgba(212,175,55,.03),rgba(15,23,42,.68))`,backdropFilter:"blur(28px)"}}>
          <div className="absolute inset-0 pointer-events-none" style={{background:`radial-gradient(circle at 38% 42%,rgba(153,246,228,.04),transparent 60%)`}}/>
          <span className="text-3xl block mb-3" style={{color:C.cyan,opacity:.2}}>❝</span>
          <p className="text-lg md:text-xl leading-9 relative z-10 text-glow-gold" style={{color:C.gold,fontFamily:"'Ma Shan Zheng',cursive"}}><TypeWriter text={result.golden_sentence} speed={55}/></p>
          <span className="text-3xl block mt-3" style={{color:C.cyan,opacity:.2}}>❞</span>
        </motion.div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}} className="flex items-center justify-center gap-4 pt-4 pb-8">
          <button onClick={handleReset} className="px-6 py-2.5 rounded-xl border text-sm tracking-[.15em] transition-all duration-300 hover:border-opacity-60" style={{borderColor:C.borderCyan,color:C.inkMuted,background:C.cyanDim}}>重新排盘</button>
          <button className="px-6 py-2.5 rounded-xl border text-sm tracking-[.15em] transition-all duration-300 hover:border-opacity-60" style={{borderColor:C.goldBorder,color:C.gold,background:"rgba(212,175,55,.04)"}}>📷 保存报告为图片</button>
        </motion.div>
      </>}
    </motion.div>)}

    </AnimatePresence>
    </div>

    {/* ═══════ MODALS ═══════ */}
    <InfoModal open={modal==="pillars"} onClose={()=>setModal(null)} title="📖 什么是四柱八字？">
      <p><strong style={{color:C.cyan}}>四柱，就像是你人生的四根大梁。</strong></p>
      <p>古人发现，一个人出生的年、月、日、时，各对应一组「天干」和「地支」的组合——合起来正好八个字，所以叫「八字」。</p>
      <div className="rounded-xl p-4 my-3" style={{background:"rgba(153,246,228,.04)",border:`1px solid ${C.borderCyan}`}}>
        <p><span style={{color:EL_COLOR.木.text}}>🏠 年柱 · 根基</span> — 代表你的家族背景、祖上荫德。就像一棵树的根，决定了你人生的起点和底色。年柱看的是0-16岁的运势。</p>
        <p className="mt-2"><span style={{color:EL_COLOR.火.text}}>💼 月柱 · 事业</span> — 代表你的社会角色、事业格局。月柱是四柱中权重最大的一根，古人说"月令提纲"，它决定了你命局的基本格局。看的是16-32岁。</p>
        <p className="mt-2"><span style={{color:EL_COLOR.土.text}}>👤 日柱 · 自身</span> — 日柱的天干就是「你自己」，也叫「日主」或「日元」。它代表你的核心性格和本质。日柱的地支则代表你的配偶宫。看的是32-48岁。</p>
        <p className="mt-2"><span style={{color:EL_COLOR.水.text}}>🌙 时柱 · 晚运</span> — 代表你的子女缘分和晚年运势。时柱看的是48岁之后，也暗示着你人生最终的归宿和境界。</p>
      </div>
      <p>四根柱子合在一起，就构成了一个完整的「命盘」。它不是宿命论，而是帮你认识自己、顺势而为的工具。</p>
    </InfoModal>

    <InfoModal open={modal==="wuxing"} onClose={()=>setModal(null)} title="📖 什么是五行能量？">
      <p><strong style={{color:C.cyan}}>五行，就是宇宙运行的五种基本能量模式。</strong></p>
      <p>金、木、水、火、土——它们不是五种「物质」，而是五种「运动方式」。春天万物生发是木的能量，夏天热烈绽放是火的能量，长夏的沉稳滋养是土的能量，秋天的肃杀收敛是金的能量，冬天的静藏蛰伏是水的能量。</p>

      <div className="rounded-xl p-4 my-3" style={{background:"rgba(153,246,228,.04)",border:"1px solid " + C.borderCyan}}>
        <p><strong style={{color:C.cyan}}>五行各论：</strong></p>
        <p className="mt-2"><span style={{color:EL_COLOR.木.text}}>🌿 木</span> — 生长、仁慈、创造。对应肝胆、东方、春季、绿色。木旺之人温和有礼、富有同情心；木弱则优柔寡断、缺乏主见。</p>
        <p className="mt-2"><span style={{color:EL_COLOR.火.text}}>🔥 火</span> — 热情、礼节、光明。对应心脏、南方、夏季、红色。火旺之人热情开朗、行动力强；火弱则缺乏动力、容易消沉。</p>
        <p className="mt-2"><span style={{color:EL_COLOR.土.text}}>🏔 土</span> — 稳定、信用、包容。对应脾胃、中央、长夏、黄色。土旺之人忠厚可靠、重承诺；土弱则缺乏安全感、易焦虑。</p>
        <p className="mt-2"><span style={{color:EL_COLOR.金.text}}>⚔ 金</span> — 决断、义气、收敛。对应肺与大肠、西方、秋季、白色。金旺之人果断刚毅、有原则；金弱则犹豫不决、意志薄弱。</p>
        <p className="mt-2"><span style={{color:EL_COLOR.水.text}}>💧 水</span> — 智慧、灵活、深藏。对应肾与膀胱、北方、冬季、黑/蓝色。水旺之人聪慧机敏、善于变通；水弱则思维迟钝、缺乏韧性。</p>
      </div>

      <div className="rounded-xl p-4 my-3" style={{background:"rgba(212,175,55,.03)",border:"1px solid " + C.goldBorder}}>
        <p><strong style={{color:C.gold}}>生克制化 · 核心规律</strong></p>
        <p className="mt-1">• <strong>相生</strong>（我滋养你）：木→火→土→金→水→木，循环不息。比如：木材燃烧生火，火烧成灰变土，土中蕴藏金属，金属凝结水珠，水滋润草木。</p>
        <p className="mt-1">• <strong>相克</strong>（我制约你）：木→土→水→火→金→木。比如：树根破土，堤坝挡水，水灭火焰，火熔金属，金斧伐木。</p>
        <p className="mt-2">生克并非「好坏」——相生过度会「溺爱」（如水多木漂），相克适度反而是「磨砺」（如金克木成器）。</p>
      </div>

      <p><strong style={{color:C.cyan}}>为什么「平衡」比「多」更重要？</strong></p>
      <p>想象一个乐队：鼓手（土）太猛会淹没旋律，吉他（金）太响会刺耳，人声（火）太弱则缺乏感染力。五行也一样——完美的命局不是某个元素越多越好，而是五种能量各归其位、互相配合。</p>
      <p className="mt-2">所以看你的五行图时：能量球越均匀，说明你的命局越「和谐」，人生之路越从容。如果某个元素特别突出或缺失，也别担心——这正是命理师帮你找「喜用神」来调和的意义所在。</p>
    </InfoModal>
  </div>);
}
