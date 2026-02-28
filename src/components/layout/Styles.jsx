import { C } from "../../constants/designTokens.js";

export default function Styles() {
  return (
    <style>{`
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
    `}</style>
  );
}

