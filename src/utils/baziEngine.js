import {
  STEMS,
  BRANCHES,
  STEM_EL,
  STEM_YY,
  ZODIAC_M,
  HIDDEN,
  NAYIN_T,
  GEN_BY,
  CTRL_BY,
  GENERATES,
  CONTROLS,
} from "../constants/baziConstants.js";

function solLon(jd) {
  const T = (jd - 2451545) / 36525;
  const M = (357.52911 + 35999.05029 * T) * (Math.PI / 180);
  const C2 =
    (1.914602 - 0.004817 * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  const om = (125.04 - 1934.136 * T) * (Math.PI / 180);
  return (
    ((280.46646 + 36000.76983 * T + 0.0003032 * T * T) +
      C2 -
      0.00569 -
      0.00478 * Math.sin(om)) %
      360 +
    360
  ) % 360;
}

function d2jd(y, m, d, h = 0) {
  if (m <= 2) {
    y--;
    m += 12;
  }
  const A = Math.floor(y / 100);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d +
    h / 24 +
    (2 - A + Math.floor(A / 4)) -
    1524.5
  );
}

function stJD(yr, ti) {
  const tl = (ti * 15 + 285) % 360;
  let jd =
    d2jd(yr, ti < 4 ? 1 : Math.floor(ti / 2), 1) + (ti % 2 === 0 ? 5 : 20);
  for (let i = 0; i < 50; i++) {
    let df = tl - solLon(jd);
    if (df > 180) df -= 360;
    if (df < -180) df += 360;
    if (Math.abs(df) < 0.0001) break;
    jd += (df / 360) * 365.25;
  }
  return jd;
}

function getTerms(yr) {
  return Array.from({ length: 24 }, (_, i) => ({
    index: i,
    jd: stJD(yr, i) + 8 / 24,
  }));
}

function trueST(yr, mo, dy, hr, mi, lon) {
  const lc = (lon - 120) * 4;
  const jd = d2jd(yr, mo, dy, hr + mi / 60);
  const T = (jd - 2451545) / 36525;
  const L = (280.46646 + 36000.76983 * T) * (Math.PI / 180);
  const M = (357.52911 + 35999.05029 * T) * (Math.PI / 180);
  const e = 0.016708634 - 0.000042037 * T;
  const y2 = Math.tan((23.4393 * Math.PI) / 360) ** 2;
  const eot =
    (y2 * Math.sin(2 * L) -
      2 * e * Math.sin(M) +
      4 * e * y2 * Math.sin(M) * Math.cos(2 * L) -
      0.5 * y2 * y2 * Math.sin(4 * L) -
      1.25 * e * e * Math.sin(2 * M)) *
    229.18;
  const cm = hr * 60 + mi + lc + eot;
  return {
    hour: Math.floor(cm / 60),
    minute: Math.round(cm % 60),
    total: cm / 60,
  };
}

function yearP(yr, mo, dy, hr, terms) {
  const lc = terms.find((t) => t.index === 2);
  const cjd = d2jd(yr, mo, dy, hr) + 8 / 24;
  const ey = cjd < lc.jd ? yr - 1 : yr;
  const idx = ((ey - 4) % 60 + 60) % 60;
  return { stem: STEMS[idx % 10], branch: BRANCHES[idx % 12] };
}

function monthP(yr, mo, dy, hr, ysi, terms) {
  const cjd = d2jd(yr, mo, dy, hr) + 8 / 24;
  const jm = [
    [0, 1],
    [2, 2],
    [4, 3],
    [6, 4],
    [8, 5],
    [10, 6],
    [12, 7],
    [14, 8],
    [16, 9],
    [18, 10],
    [20, 11],
    [22, 0],
  ];
  const bs = jm.map((pair) => {
    const found = terms.find((t) => t.index === pair[0]);
    return { jd: found ? found.jd : 0, bi: pair[1] };
  });
  const pv = getTerms(yr - 1);
  const pd = pv.find((t) => t.index === 22);
  if (pd) bs.push({ jd: pd.jd, bi: 0 });
  bs.sort((a, b) => a.jd - b.jd);
  let mbi = 1;
  for (let i = bs.length - 1; i >= 0; i--) {
    if (cjd >= bs[i].jd) {
      mbi = bs[i].bi;
      break;
    }
  }
  const base = ((ysi % 5) * 2 + 2) % 10;
  const off = (mbi - 2 + 12) % 12;
  return { stem: STEMS[(base + off) % 10], branch: BRANCHES[mbi] };
}

function dayP(yr, mo, dy) {
  const diff = Math.round(
    (new Date(yr, mo - 1, dy) - new Date(2000, 0, 1)) / 864e5
  );
  const idx = ((diff % 60) + 60 + 54) % 60;
  return { stem: STEMS[idx % 10], branch: BRANCHES[idx % 12] };
}

function hourP(hr, dsi) {
  const bi = hr >= 23 ? 0 : Math.floor((hr + 1) / 2);
  const si = ((dsi % 5) * 2 + bi) % 10;
  return { stem: STEMS[si], branch: BRANCHES[bi] };
}

function tenGod(ds, ts) {
  const de = STEM_EL[ds];
  const te = STEM_EL[ts];
  const sp = STEM_YY[ds] === STEM_YY[ts];
  if (de === te) return sp ? "比肩" : "劫财";
  if (GENERATES[de] === te) return sp ? "食神" : "伤官";
  if (CONTROLS[de] === te) return sp ? "偏财" : "正财";
  if (CTRL_BY[de] === te) return sp ? "七杀" : "正官";
  if (GEN_BY[de] === te) return sp ? "偏印" : "正印";
  return "";
}

function getNY(si, bi) {
  for (let i = 0; i < 60; i++) {
    if (i % 10 === si && i % 12 === bi) {
      return NAYIN_T[Math.floor(i / 2)];
    }
  }
  return "";
}

function elemW(pillars, incH) {
  const w = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const pr = (p, sw, bw) => {
    w[STEM_EL[p.stem]] += sw;
    const h = HIDDEN[p.branch];
    if (h.length === 1) w[STEM_EL[h[0]]] += bw;
    else if (h.length === 2) {
      w[STEM_EL[h[0]]] += bw * 0.7;
      w[STEM_EL[h[1]]] += bw * 0.3;
    } else {
      w[STEM_EL[h[0]]] += bw * 0.6;
      w[STEM_EL[h[1]]] += bw * 0.25;
      w[STEM_EL[h[2]]] += bw * 0.15;
    }
  };
  pr(pillars.year, 1, 1.2);
  pr(pillars.month, 1.2, 1.5);
  pr(pillars.day, 1, 1.2);
  if (incH && pillars.hour) pr(pillars.hour, 0.8, 1);
  return w;
}

function detectPat(pillars, incH) {
  const ds = pillars.day.stem;
  const w = elemW(pillars, incH);
  const de = STEM_EL[ds];
  const h = w[de] + w[GEN_BY[de]];
  const tot = Object.values(w).reduce((a, b) => a + b, 0);
  const strong = h / tot > 0.4;
  const mh = HIDDEN[pillars.month.branch];
  const mg = tenGod(ds, mh[0]);
  const pm = {
    正官: ["正官格", "贵气天成"],
    七杀: ["七杀格", "魄力非凡"],
    正财: ["正财格", "稳健聚财"],
    偏财: ["偏财格", "财源广进"],
    正印: ["正印格", "学识渊博"],
    偏印: ["偏印格", "才思独特"],
    食神: ["食神格", "福禄寿全"],
    伤官: ["伤官格", "才华横溢"],
    比肩: ["建禄格", "自立自强"],
    劫财: ["建禄格", "自立自强"],
  };
  const p = pm[mg] || ["杂气格", "五行混杂"];
  return { pattern: p[0], desc: p[1], strong, mg };
}

function compDist(w) {
  const t = Object.values(w).reduce((a, b) => a + b, 0);
  const d = {};
  Object.entries(w).forEach(([k, v]) => {
    d[k] = t > 0 ? Math.round((v / t) * 100) : 20;
  });
  const s = Object.values(d).reduce((a, b) => a + b, 0);
  if (s !== 100) {
    const mk = Object.entries(d).sort((a, b) => b[1] - a[1])[0][0];
    d[mk] += 100 - s;
  }
  return d;
}

function compScore(dist, de, pat) {
  const vs = Object.values(dist);
  const mx = Math.max(...vs);
  const mn = Math.min(...vs);
  const bal = 100 - (mx - mn) * 0.8;
  const dp = dist[de] || 20;
  const ds2 =
    dp >= 15 && dp <= 30 ? 85 : dp >= 10 && dp <= 35 ? 75 : 65;
  const pb = pat.pattern !== "杂气格" ? 5 : 0;
  return Math.min(
    98,
    Math.max(62, Math.round(bal * 0.5 + ds2 * 0.4 + pb))
  );
}

export function calcBazi(
  year,
  month,
  day,
  hour = 12,
  minute = 0,
  longitude = 116.4
) {
  const unk = hour < 0;
  let eH = hour;
  let tst = null;
  if (!unk && longitude !== 120) {
    tst = trueST(year, month, day, hour, minute, longitude);
    eH = Math.floor(tst.total);
    if (eH < 0) eH += 24;
    if (eH >= 24) eH -= 24;
  }
  const terms = getTerms(year);
  const h = unk ? 12 : eH;
  const yp = yearP(year, month, day, h, terms);
  const mp = monthP(
    year,
    month,
    day,
    h,
    STEMS.indexOf(yp.stem),
    terms
  );
  const dp = dayP(year, month, day);
  const hp = unk ? null : hourP(eH, STEMS.indexOf(dp.stem));
  const pillars = { year: yp, month: mp, day: dp, hour: hp };
  const tg = {
    year: tenGod(dp.stem, yp.stem),
    month: tenGod(dp.stem, mp.stem),
    hour: hp ? tenGod(dp.stem, hp.stem) : null,
  };
  const ny = {
    year: getNY(STEMS.indexOf(yp.stem), BRANCHES.indexOf(yp.branch)),
    month: getNY(STEMS.indexOf(mp.stem), BRANCHES.indexOf(mp.branch)),
    day: getNY(STEMS.indexOf(dp.stem), BRANCHES.indexOf(dp.branch)),
    hour: hp
      ? getNY(STEMS.indexOf(hp.stem), BRANCHES.indexOf(hp.branch))
      : null,
  };
  const ew = elemW(pillars, !unk);
  const dist = compDist(ew);
  const pat = detectPat(
    hp ? pillars : { ...pillars, hour: { stem: "甲", branch: "子" } },
    !unk
  );
  const dm = {
    stem: dp.stem,
    element: STEM_EL[dp.stem],
    yy: STEM_YY[dp.stem],
    strong: pat.strong,
  };
  return {
    pillars,
    tg,
    ny,
    dm,
    ew,
    dist,
    pat,
    zodiac: ZODIAC_M[yp.branch],
    unk,
    tst,
    score: compScore(dist, dm.element, pat),
  };
}

