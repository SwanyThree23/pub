import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const WS_URL  = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/^http/, "ws");

const T = {
  burgundy: "#800020", burgundyDeep: "#5a0016", gold: "#C9A84C",
  acidGreen: "#39FF14", violet: "#7B3FF2", cyan: "#00B2FF",
  nearBlack: "#0A0608", darkUmber: "#1A0F10", umber: "#2A1A1B",
  bone: "#F5E6D3",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@400;700;900&family=Barlow+Condensed:wght@300;400;600;700&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body,#root{background:#0A0608;color:#F5E6D3;font-family:'Barlow Condensed',sans-serif;min-height:100vh;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#1A0F10}::-webkit-scrollbar-thumb{background:#800020;border-radius:2px}
.app-shell{display:grid;grid-template-rows:52px 1fr;height:100vh;overflow:hidden}
.topnav{background:#1A0F10;border-bottom:1px solid #80002040;display:flex;align-items:center;justify-content:space-between;padding:0 16px;gap:12px;z-index:100}
.topnav-logo{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;display:flex;align-items:center;gap:6px}
.logo-see{color:#F5E6D3}.logo-why{color:#C9A84C}
.logo-live{background:#800020;color:#fff;font-family:'Orbitron',sans-serif;font-size:10px;padding:2px 6px;border-radius:3px;letter-spacing:1px;animation:lp 2s ease-in-out infinite}
@keyframes lp{0%,100%{box-shadow:0 0 6px #800020}50%{box-shadow:0 0 16px #800020,0 0 30px #80002060}}
.topnav-tabs{display:flex;gap:4px;flex:1;overflow-x:auto;scrollbar-width:none}
.topnav-tabs::-webkit-scrollbar{display:none}
.tnav-tab{background:none;border:none;color:#F5E6D380;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;padding:6px 12px;cursor:pointer;border-radius:4px;white-space:nowrap;transition:all .2s;text-transform:uppercase}
.tnav-tab:hover{color:#C9A84C;background:#80002020}
.tnav-tab.active{color:#C9A84C;background:#80002030;border-bottom:2px solid #C9A84C}
.golive-btn{background:#800020;color:#fff;border:none;font-family:'Orbitron',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;padding:8px 16px;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .2s;white-space:nowrap;flex-shrink:0}
.golive-btn:hover{background:#a00028;box-shadow:0 0 20px #80002080}
.golive-dot{width:7px;height:7px;background:#39FF14;border-radius:50%;animation:lp 1s ease-in-out infinite}
.main-layout{display:grid;grid-template-columns:1fr 300px;overflow:hidden;height:100%}
@media(max-width:768px){.main-layout{grid-template-columns:1fr}.sidebar{display:none}}
.feed-area{overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px}
.story-row{display:flex;gap:12px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px}
.story-row::-webkit-scrollbar{display:none}
.story-item{display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0;cursor:pointer}
.story-ring{width:56px;height:56px;border-radius:50%;padding:2px;position:relative}
.story-ring.live{background:linear-gradient(135deg,#800020,#C9A84C)}
.story-ring.you{background:#2A1A1B;border:2px dashed #C9A84C}
.story-avatar{width:100%;height:100%;border-radius:50%;background:#2A1A1B;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid #0A0608}
.story-live-badge{position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);background:#800020;color:#fff;font-family:'Orbitron',sans-serif;font-size:7px;padding:1px 5px;border-radius:2px;letter-spacing:1px}
.story-name{font-size:11px;color:#F5E6D380;max-width:56px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sec-header{display:flex;align-items:center;gap:10px;margin-bottom:4px}
.sec-title{font-family:'Orbitron',sans-serif;font-size:11px;letter-spacing:2px;color:#F5E6D360;text-transform:uppercase}
.sec-count{background:#800020;color:#fff;font-family:'DM Mono',monospace;font-size:10px;padding:1px 6px;border-radius:10px}
.sec-line{flex:1;height:1px;background:#F5E6D315}
.rooms-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.room-card{background:#2A1A1B;border:1px solid #80002030;border-radius:10px;overflow:hidden;cursor:pointer;transition:all .2s;position:relative}
.room-card:hover{border-color:#C9A84C60;transform:translateY(-2px);box-shadow:0 8px 24px #80002030}
.room-thumb{height:80px;background:linear-gradient(135deg,#80002040,#1A0F10);position:relative;display:flex;align-items:center;justify-content:center;font-size:28px}
.room-live-badge{position:absolute;top:8px;left:8px;background:#800020;color:#fff;font-family:'Orbitron',sans-serif;font-size:8px;padding:2px 6px;border-radius:3px;display:flex;align-items:center;gap:4px;letter-spacing:1px}
.room-viewers{position:absolute;top:8px;right:8px;background:rgba(0,0,0,.6);color:#F5E6D3;font-family:'DM Mono',monospace;font-size:10px;padding:2px 6px;border-radius:3px}
.room-info{padding:10px}
.room-title{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;color:#F5E6D3;line-height:1.2;margin-bottom:3px}
.room-host{font-size:11px;color:#F5E6D350}
.pk-card{background:#2A1A1B;border:1px solid #C9A84C40;border-radius:10px;overflow:hidden}
.pk-header{background:linear-gradient(90deg,#800020,#1A0F10,#800020);padding:8px 14px;display:flex;align-items:center;gap:8px;font-family:'Orbitron',sans-serif;font-size:11px;letter-spacing:2px;color:#C9A84C}
.pk-body{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:12px;gap:12px}
.pk-score{font-family:'Bebas Neue',sans-serif;font-size:36px;line-height:1;color:#C9A84C}
.pk-name{font-size:12px;color:#F5E6D370}
.pk-divider{font-family:'Orbitron',sans-serif;font-size:14px;font-weight:900;color:#800020}
.pk-bar{margin:0 14px 12px;height:6px;background:#1A0F10;border-radius:3px;overflow:hidden}
.pk-fill{height:100%;background:linear-gradient(90deg,#C9A84C,#800020);border-radius:3px;transition:width .5s ease}
.studio-area{overflow-y:auto;display:flex;flex-direction:column}
.stream-type-bar{background:#1A0F10;border-bottom:1px solid #80002030;display:flex;gap:0;padding:0 16px}
.stype-btn{background:none;border:none;border-bottom:2px solid transparent;color:#F5E6D350;font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;padding:10px 16px;cursor:pointer;text-transform:uppercase;transition:all .2s}
.stype-btn.active{color:#C9A84C;border-bottom-color:#C9A84C}
.panel-stage{display:grid;grid-template-columns:repeat(4,1fr);gap:3px;padding:12px;background:#0A0608}
.panel-cell{aspect-ratio:1;position:relative;cursor:pointer;border-radius:6px;overflow:hidden;transition:all .3s;clip-path:polygon(20% 0%,80% 0%,100% 20%,100% 80%,80% 100%,20% 100%,0% 80%,0% 20%);background:#2A1A1B}
.panel-cell.speaking{box-shadow:0 0 0 3px #00B2FF;clip-path:none;border-radius:8px;animation:sg 1.5s ease-in-out infinite}
.panel-cell.host-cell{box-shadow:0 0 0 2px #C9A84C;clip-path:none;border-radius:8px}
.panel-cell.spotlight{grid-column:span 2;grid-row:span 2;clip-path:none;border-radius:12px;box-shadow:0 0 0 3px #C9A84C,0 0 30px #C9A84C40}
@keyframes sg{0%,100%{box-shadow:0 0 0 3px #00B2FF}50%{box-shadow:0 0 0 3px #00B2FF,0 0 20px #00B2FF60}}
.panel-avatar{width:100%;height:100%;background:linear-gradient(135deg,#80002080,#1A0F10);display:flex;align-items:center;justify-content:center;font-size:24px;position:relative}
.panel-hud{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.8));padding:16px 6px 6px;display:flex;align-items:center;justify-content:space-between}
.panel-name{font-size:10px;font-weight:700;color:#F5E6D3;display:flex;align-items:center;gap:3px}
.audio-bars{display:flex;gap:1px;align-items:flex-end;height:12px}
.audio-bar{width:2px;background:#00B2FF;border-radius:1px;animation:aa .5s ease-in-out infinite alternate}
.audio-bar:nth-child(2){animation-delay:.1s}.audio-bar:nth-child(3){animation-delay:.2s}
@keyframes aa{from{height:3px}to{height:12px}}
.studio-controls{background:#1A0F10;border-top:1px solid #80002030;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:8px}
.ctrl-btn{background:#2A1A1B;border:1px solid #80002040;color:#F5E6D3;font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:600;padding:6px 12px;border-radius:6px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .2s;letter-spacing:.5px}
.ctrl-btn:hover{border-color:#C9A84C;color:#C9A84C}
.ctrl-btn.active{background:#800020;border-color:#800020}
.ctrl-btn.danger{border-color:#ff4444;color:#ff4444}
.ctrl-btn.danger:hover{background:#ff444420}
.audience-section{padding:10px 12px;border-top:1px solid #80002020}
.audience-title{font-family:'Orbitron',sans-serif;font-size:9px;letter-spacing:2px;color:#F5E6D340;margin-bottom:8px;text-transform:uppercase}
.audience-grid{display:flex;flex-wrap:wrap;gap:8px}
.audience-member{display:flex;flex-direction:column;align-items:center;gap:3px}
.audience-avatar{width:36px;height:36px;border-radius:50%;background:#2A1A1B;display:flex;align-items:center;justify-content:center;font-size:14px;border:1px solid #80002030}
.audience-name{font-size:9px;color:#F5E6D350}
.watchparty-area{display:flex;flex-direction:column;overflow:hidden;height:100%}
.video-container{position:relative;background:#000;aspect-ratio:16/9;flex-shrink:0}
.video-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#0A0608;flex-direction:column;gap:8px}
.sync-badge{position:absolute;top:12px;right:12px;background:rgba(0,0,0,.7);border:1px solid #39FF1460;color:#39FF14;font-family:'DM Mono',monospace;font-size:10px;padding:4px 8px;border-radius:4px;display:flex;align-items:center;gap:4px}
.reaction-bar{display:flex;justify-content:center;gap:8px;padding:10px;background:#1A0F10;border-bottom:1px solid #80002020}
.reaction-btn{background:#2A1A1B;border:none;font-size:20px;padding:6px 10px;border-radius:8px;cursor:pointer;transition:transform .15s}
.reaction-btn:hover{transform:scale(1.3)}
.floating-reactions{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.float-emoji{position:absolute;font-size:24px;animation:fu 2s ease-out forwards;bottom:0}
@keyframes fu{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-200px) scale(.5);opacity:0}}
.wp-sync-row{padding:10px 14px;background:#2A1A1B;display:flex;align-items:center;gap:12px;border-bottom:1px solid #80002020}
.wp-play-btn{width:36px;height:36px;background:#800020;border:none;border-radius:50%;color:#fff;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.wp-progress{flex:1;height:4px;background:#1A0F10;border-radius:2px;cursor:pointer;position:relative}
.wp-fill{height:100%;background:#C9A84C;border-radius:2px;position:relative}
.wp-fill::after{content:'';position:absolute;right:-5px;top:-3px;width:10px;height:10px;background:#C9A84C;border-radius:50%}
.sidebar{background:#1A0F10;border-left:1px solid #80002030;display:flex;flex-direction:column;overflow:hidden}
.sidebar-tabs{display:flex;border-bottom:1px solid #80002030}
.sidebar-tab{flex:1;background:none;border:none;color:#F5E6D350;font-family:'Barlow Condensed',sans-serif;font-size:11px;font-weight:600;letter-spacing:1px;padding:9px 4px;cursor:pointer;text-transform:uppercase;border-bottom:2px solid transparent;transition:all .2s}
.sidebar-tab.active{color:#C9A84C;border-bottom-color:#C9A84C}
.chat-area{flex:1;overflow-y:auto;padding:10px;display:flex;flex-direction:column;gap:8px}
.chat-guardian-hud{padding:6px 10px;background:rgba(0,0,0,.4);display:flex;justify-content:space-between;font-family:'DM Mono',monospace;font-size:9px;color:#C9A84C;border-bottom:1px solid #80002020;flex-shrink:0}
.guardian-dot{width:6px;height:6px;background:#39FF14;border-radius:50%;display:inline-block;margin-right:4px;animation:lp 1s infinite}
.chat-msg{display:flex;flex-direction:column;gap:2px}
.chat-msg-header{display:flex;align-items:center;gap:6px}
.chat-username{font-size:11px;font-weight:700;color:#C9A84C}
.chat-username.host{color:#800020}
.chat-badge{font-family:'Orbitron',sans-serif;font-size:7px;padding:1px 4px;border-radius:2px;letter-spacing:.5px}
.host-badge{background:#800020;color:#fff}
.mod-badge{background:#7B3FF2;color:#fff}
.chat-time{font-size:9px;color:#F5E6D330}
.chat-text{font-size:13px;color:#F5E6D3;line-height:1.3}
.chat-translation{font-size:11px;color:#C9A84C70;font-style:italic}
.tip-msg{background:linear-gradient(90deg,#C9A84C15,#80002015);border:1px solid #C9A84C40;border-radius:6px;padding:6px 10px}
.tip-amount{font-family:'Bebas Neue',sans-serif;font-size:18px;color:#C9A84C}
.chat-input-row{padding:10px;border-top:1px solid #80002030;display:flex;gap:6px;flex-shrink:0}
.chat-input{flex:1;background:#2A1A1B;border:1px solid #80002040;border-radius:6px;color:#F5E6D3;font-family:'Barlow Condensed',sans-serif;font-size:14px;padding:8px 10px;outline:none;transition:border-color .2s}
.chat-input:focus{border-color:#C9A84C}
.chat-send{background:#800020;border:none;border-radius:6px;color:#fff;font-size:14px;width:36px;cursor:pointer;transition:all .2s}
.chat-send:hover{background:#a00028}
.revenue-widget{padding:12px;border-top:1px solid #80002030;flex-shrink:0}
.revenue-label{font-family:'Orbitron',sans-serif;font-size:8px;letter-spacing:2px;color:#F5E6D340;margin-bottom:4px;text-transform:uppercase}
.revenue-amount{font-family:'Bebas Neue',sans-serif;font-size:32px;color:#C9A84C;line-height:1;margin-bottom:6px}
.revenue-bar{height:4px;background:#0A0608;border-radius:2px;overflow:hidden;display:flex}
.revenue-creator{height:100%;background:#C9A84C}
.revenue-platform{height:100%;background:#800020}
.revenue-labels{display:flex;justify-content:space-between;margin-top:4px;font-family:'DM Mono',monospace;font-size:9px}
.rev-creator{color:#C9A84C}.rev-platform{color:#800020}
.paywall-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.92);backdrop-filter:blur(20px);animation:fadeIn .3s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.paywall-card{background:#1A0F10;border:2px solid #C9A84C;border-radius:20px;padding:32px 24px;text-align:center;max-width:340px;width:90%;box-shadow:0 0 60px #C9A84C20;animation:slideUp .3s ease}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.paywall-icon{width:64px;height:64px;background:#C9A84C;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 16px}
.paywall-title{font-family:'Bebas Neue',sans-serif;font-size:28px;color:#C9A84C;letter-spacing:2px;margin-bottom:8px}
.paywall-sub{font-size:14px;color:#F5E6D370;margin-bottom:20px;line-height:1.4}
.paywall-tiers{display:flex;gap:6px;justify-content:center;margin-bottom:12px}
.tier-btn{background:#2A1A1B;border:1px solid #80002040;color:#F5E6D3;font-family:'DM Mono',monospace;font-size:11px;padding:5px 10px;border-radius:6px;cursor:pointer;transition:all .2s}
.tier-btn.selected{background:#800020;border-color:#800020}
.paywall-unlock{width:100%;background:#800020;border:none;color:#fff;font-family:'Orbitron',sans-serif;font-size:14px;font-weight:700;padding:14px;border-radius:10px;cursor:pointer;letter-spacing:1px;transition:all .2s;margin-bottom:10px}
.paywall-unlock:hover{background:#a00028;box-shadow:0 0 24px #80002060}
.modal-overlay{position:fixed;inset:0;z-index:500;display:flex;align-items:flex-end;background:rgba(0,0,0,.8);backdrop-filter:blur(10px)}
.modal-sheet{background:#1A0F10;border:1px solid #80002040;border-radius:20px 20px 0 0;padding:20px;width:100%;max-height:85vh;overflow-y:auto;animation:slideUpSheet .3s ease}
@keyframes slideUpSheet{from{transform:translateY(100%)}to{transform:translateY(0)}}
.modal-handle{width:40px;height:4px;background:#F5E6D330;border-radius:2px;margin:0 auto 20px}
.modal-title{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:2px;color:#C9A84C;margin-bottom:16px;text-align:center}
.stream-type-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
.stype-card{background:#2A1A1B;border:2px solid #80002030;border-radius:10px;padding:14px 8px;text-align:center;cursor:pointer;transition:all .2s}
.stype-card.selected{border-color:#C9A84C;background:#C9A84C10}
.stype-card .icon{font-size:22px;margin-bottom:6px}
.stype-card .label{font-family:'Orbitron',sans-serif;font-size:9px;letter-spacing:1px;color:#F5E6D370}
.stype-card.selected .label{color:#C9A84C}
.modal-field-label{font-family:'Orbitron',sans-serif;font-size:9px;letter-spacing:1.5px;color:#F5E6D350;text-transform:uppercase;margin-bottom:6px}
.modal-input{width:100%;background:#2A1A1B;border:1px solid #80002040;border-radius:8px;color:#F5E6D3;font-family:'Barlow Condensed',sans-serif;font-size:15px;padding:10px 12px;outline:none;margin-bottom:12px}
.modal-input:focus{border-color:#C9A84C}
.perm-row{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#2A1A1B;border-radius:8px;margin-bottom:8px}
.perm-label{display:flex;align-items:center;gap:8px;font-size:14px}
.perm-status{font-family:'DM Mono',monospace;font-size:11px;padding:3px 8px;border-radius:4px}
.perm-status.granted{background:#39FF1420;color:#39FF14}
.go-live-now{width:100%;background:#800020;border:none;color:#fff;font-family:'Orbitron',sans-serif;font-size:14px;font-weight:700;padding:16px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:2px;transition:all .2s;margin-top:8px}
.go-live-now:hover{background:#a00028;box-shadow:0 0 30px #80002060}
`;

const GUESTS = [
  { id: 0, name: "Host Swany", emoji: "👑", isHost: true, isSpeaking: true, hasVideo: true },
  { id: 1, name: "Guest 1",    emoji: "🎙", isHost: false, isSpeaking: false, hasVideo: false },
  { id: 2, name: "Guest 2",    emoji: "🎧", isHost: false, isSpeaking: false, hasVideo: true  },
  { id: 3, name: "Guest 3",    emoji: "🎵", isHost: false, isSpeaking: false, hasVideo: true  },
  { id: 4, name: "Guest 4",    emoji: "🎤", isHost: false, isSpeaking: false, hasVideo: false },
  { id: 5, name: "Guest 5",    emoji: "🎬", isHost: false, isSpeaking: false, hasVideo: false },
  { id: 6, name: "Guest 6",    emoji: "🎼", isHost: false, isSpeaking: false, hasVideo: false },
  { id: 7, name: "Guest 7",    emoji: "🎹", isHost: false, isSpeaking: false, hasVideo: false },
];

const ROOMS = [
  { id: 1, title: "SwanyThree Creator Masterclass",           host: "SwanyThree23",    viewers: 137, emoji: "🎓" },
  { id: 2, title: "Wednesday Tech Tastings: World AI Report", host: "DurandsReport",   viewers: 67,  emoji: "🤖" },
  { id: 3, title: "DOMINO! ARENA — Live Finals",              host: "SwanyThree23",    viewers: 512, emoji: "🎲" },
  { id: 4, title: "Culture & Vibes Vol.4",                    host: "chandrawalston1", viewers: 89,  emoji: "🎵" },
];

const CHAT_INIT = [
  { id: 1, user: "SwanyBot",        badge: "mod",  text: "Party started. Chat synchronized. Host controls active.", time: "10:36" },
  { id: 2, user: "Joyce 🦋",        badge: "host", text: "Welcome to the Watch Party! 🎉", time: "10:36" },
  { id: 3, user: "DurandsReport",   badge: null,   text: "¡Esto es increíble! La plataforma está 🔥", time: "10:37", translation: "This is incredible! The platform is 🔥" },
  { id: 4, user: "chandrawalston1", badge: null,   text: "90% revenue split is unmatched fr", time: "10:38" },
  { id: 5, user: "SwanyThree23",    badge: "host", isTip: true, tipAmount: "$5.00", time: "10:38" },
];

const AUDIENCE = [
  { id:1,emoji:"🎩",name:"Phelo"  }, { id:2,emoji:"📚",name:"ObiKnow" },
  { id:3,emoji:"🎸",name:"Marvin" }, { id:4,emoji:"💜",name:"Sim11"   },
  { id:5,emoji:"🎤",name:"Durand" }, { id:6,emoji:"🦋",name:"Joyce"   },
  { id:7,emoji:"👑",name:"SW15"   }, { id:8,emoji:"🎧",name:"Obi16"   },
];

const TIERS = [{ label:"Bronze",price:"$1" },{ label:"Silver",price:"$5" },{ label:"Gold",price:"$15" }];

export default function SeeWhyLIVE({ token }) {
  const [activeTab,    setActiveTab]    = useState("studio");
  const [sidebarTab,   setSidebarTab]   = useState("chat");
  const [spotlight,    setSpotlight]    = useState(null);
  const [chatMsg,      setChatMsg]      = useState("");
  const [messages,     setMessages]     = useState(CHAT_INIT);
  const [muted,        setMuted]        = useState(false);
  const [camOn,        setCamOn]        = useState(true);
  const [isLive,       setIsLive]       = useState(false);
  const [showPaywall,  setShowPaywall]  = useState(false);
  const [paywallTimer, setPaywallTimer] = useState(120);
  const [selectedTier, setSelectedTier] = useState(1);
  const [showGoLive,   setShowGoLive]   = useState(false);
  const [streamType,   setStreamType]   = useState("panel");
  const [streamTitle,  setStreamTitle]  = useState("");
  const [floatEmojis,  setFloatEmojis]  = useState([]);
  const [wpProgress,   setWpProgress]   = useState(12);
  const [guests,       setGuests]       = useState(GUESTS);
  const [earnings,     setEarnings]     = useState(47.50);
  const [liveStats,    setLiveStats]    = useState(null);
  const [moderating,   setModerating]   = useState(false);
  const chatRef  = useRef(null);
  const timerRef = useRef(null);
  const wsRef    = useRef(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  useEffect(() => {
    if (activeTab === "watchparty" && !isLive) {
      timerRef.current = setInterval(() => {
        setPaywallTimer(p => { if (p <= 1) { clearInterval(timerRef.current); setShowPaywall(true); return 0; } return p - 1; });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [activeTab, isLive]);

  useEffect(() => {
    if (activeTab !== "watchparty") return;
    const t = setInterval(() => setWpProgress(p => p >= 100 ? 0 : p + 0.1), 300);
    return () => clearInterval(t);
  }, [activeTab]);

  useEffect(() => {
    const t = setInterval(() => setEarnings(e => Math.round((e + Math.random() * 0.5) * 100) / 100), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const t = setInterval(() => {
      setGuests(prev => {
        const next = prev.map(g => ({ ...g, isSpeaking: false }));
        next[Math.floor(Math.random() * next.length)].isSpeaking = true;
        return next;
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  // Fetch live analytics from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/analytics/overview`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) setLiveStats(await res.json());
      } catch { /* backend offline — keep mock data */ }
    };
    fetchStats();
    const t = setInterval(fetchStats, 15000);
    return () => clearInterval(t);
  }, [token]);

  // WebSocket — receive scene switch + audio level events
  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "scene_switch") {
          setMessages(m => [...m, {
            id: Date.now(), user: "SwanyBot", badge: "mod",
            text: `Scene switched → ${msg.scene}`,
            time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })
          }]);
        }
        if (msg.type === "chat") {
          setMessages(m => [...m, {
            id: msg.id || Date.now(), user: msg.user, badge: null,
            text: msg.text, time: msg.time || ""
          }]);
        }
      } catch { /* ignore malformed */ }
    };
    return () => ws.close();
  }, []);

  const sendChat = useCallback(async () => {
    if (!chatMsg.trim() || moderating) return;
    const text = chatMsg;
    setChatMsg("");
    setModerating(true);
    try {
      const res = await fetch(`${API_URL}/chat/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ message: text, username: "You", streamId: "seewhy-live" })
      });
      const data = res.ok ? await res.json() : null;
      const blocked = data?.action === "remove";
      setMessages(m => [...m,
        blocked
          ? { id: Date.now(), user: "GuardianAI", badge: "mod", text: "⚠️ Message blocked by Guardian AI", time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) }
          : { id: Date.now(), user: "You", badge: null, text, time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) }
      ]);
    } catch {
      // Backend unreachable — show message unmoderated
      setMessages(m => [...m, { id: Date.now(), user: "You", badge: null, text, time: new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }) }]);
    } finally {
      setModerating(false);
    }
  }, [chatMsg, moderating, token]);

  const addReaction = useCallback(emoji => {
    const id = Date.now();
    setFloatEmojis(f => [...f, { id, emoji, left: 20 + Math.random() * 60 }]);
    setTimeout(() => setFloatEmojis(f => f.filter(x => x.id !== id)), 2000);
  }, []);

  const goLive = useCallback(() => { setIsLive(true); setShowGoLive(false); setShowPaywall(false); setActiveTab("studio"); }, []);

  const pkLeft = 9492, pkRight = 2400, pkPct = (pkLeft / (pkLeft + pkRight)) * 100;

  return (
    <div className="app-shell">
      <nav className="topnav">
        <div className="topnav-logo">
          <span className="logo-see">SEE</span><span className="logo-why">WHY</span><span className="logo-live">LIVE</span>
        </div>
        <div className="topnav-tabs">
          {[["explore","Explore"],["studio","Studio"],["watchparty","Watch Party"],["analytics","Analytics"]].map(([k,l]) => (
            <button key={k} className={`tnav-tab${activeTab===k?" active":""}`} onClick={() => setActiveTab(k)}>{l}</button>
          ))}
        </div>
        <button className="golive-btn" onClick={() => setShowGoLive(true)}>
          <span className="golive-dot" />{isLive ? "● LIVE" : "GO LIVE"}
        </button>
      </nav>

      <div className="main-layout">
        <div style={{ overflow:"hidden", display:"flex", flexDirection:"column" }}>

          {/* ── EXPLORE ── */}
          {activeTab === "explore" && (
            <div className="feed-area">
              <div className="story-row">
                <div className="story-item">
                  <div className="story-ring you"><div className="story-avatar">➕</div></div>
                  <span className="story-name">You</span>
                </div>
                {["kellym","dj.wise","SwanyThree","ObiKnow","Joyce","Phelo"].map((n,i) => (
                  <div key={n} className="story-item">
                    <div className="story-ring live" style={{ position:"relative" }}>
                      <div className="story-avatar">{["🎵","🎧","👑","📚","🦋","🎤"][i]}</div>
                      <span className="story-live-badge">LIVE</span>
                    </div>
                    <span className="story-name">{n}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="sec-header">
                  <span className="sec-title">Live Right Now</span>
                  <span className="sec-count">6</span>
                  <div className="sec-line" />
                </div>
                <div className="rooms-grid">
                  {ROOMS.map(r => (
                    <div key={r.id} className="room-card" onClick={() => setActiveTab("watchparty")}>
                      <div className="room-thumb">
                        <span style={{ fontSize:32 }}>{r.emoji}</span>
                        <div className="room-live-badge"><span style={{ width:5,height:5,background:"#ff4444",borderRadius:"50%",display:"inline-block" }} />LIVE</div>
                        <div className="room-viewers">👥 {r.viewers}</div>
                      </div>
                      <div className="room-info">
                        <div className="room-title">{r.title}</div>
                        <div className="room-host">by {r.host}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="sec-header"><span className="sec-title">🔥 PK Battle · Round 7</span><div className="sec-line" /></div>
                <div className="pk-card">
                  <div className="pk-header">🔥 PK BATTLE · LIVE</div>
                  <div className="pk-body">
                    <div><div className="pk-score">{pkLeft.toLocaleString()}</div><div className="pk-name">Team SwanyThree</div></div>
                    <div className="pk-divider">VS</div>
                    <div style={{ textAlign:"right" }}><div className="pk-score">{pkRight.toLocaleString()}</div><div className="pk-name">Team Joyce</div></div>
                  </div>
                  <div className="pk-bar"><div className="pk-fill" style={{ width:`${pkPct}%` }} /></div>
                </div>
              </div>
            </div>
          )}

          {/* ── STUDIO ── */}
          {activeTab === "studio" && (
            <div className="studio-area">
              <div className="stream-type-bar">
                {[["single","📷 Single Cam"],["panel","👥 Panel"],["audio","🎙 Audio Room"]].map(([k,l]) => (
                  <button key={k} className={`stype-btn${streamType===k?" active":""}`} onClick={() => setStreamType(k)}>{l}</button>
                ))}
              </div>

              <div className="panel-stage">
                {guests.map(g => (
                  <div
                    key={g.id}
                    className={`panel-cell${g.isSpeaking&&!g.isHost?" speaking":""}${g.isHost?" host-cell":""}${spotlight===g.id?" spotlight":""}`}
                    onDoubleClick={() => setSpotlight(spotlight===g.id ? null : g.id)}
                  >
                    <div className="panel-avatar">
                      {g.hasVideo
                        ? <div style={{ width:"100%",height:"100%",background:"linear-gradient(135deg,#800020aa,#1A0F10)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28 }}>{g.emoji}</div>
                        : <span style={{ color:"rgba(245,230,211,.3)",fontSize:10,fontFamily:"'DM Mono',monospace" }}>No Feed</span>
                      }
                    </div>
                    <div className="panel-hud">
                      <div className="panel-name">{g.isHost && <span style={{ fontSize:9 }}>👑</span>}{g.name}</div>
                      {g.isSpeaking && <div className="audio-bars"><div className="audio-bar" style={{ height:4 }} /><div className="audio-bar" style={{ height:8 }} /><div className="audio-bar" style={{ height:12 }} /></div>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="audience-section">
                <div className="audience-title">Others in the Room · {AUDIENCE.length}</div>
                <div className="audience-grid">
                  {AUDIENCE.map(a => (
                    <div key={a.id} className="audience-member">
                      <div className="audience-avatar">{a.emoji}</div>
                      <span className="audience-name">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="studio-controls">
                <button className={`ctrl-btn${!camOn?" active":""}`} onClick={() => setCamOn(c => !c)}>{camOn?"📷 Cam On":"🚫 Cam Off"}</button>
                <button className={`ctrl-btn${muted?" active":""}`} onClick={() => setMuted(m => !m)}>{muted?"🔇 Unmute":"🎙 Mute"}</button>
                <button className="ctrl-btn">⚙ Settings</button>
                <button className="ctrl-btn danger">■ End</button>
              </div>
            </div>
          )}

          {/* ── WATCH PARTY ── */}
          {activeTab === "watchparty" && (
            <div className="watchparty-area">
              <div className="video-container">
                <div className="video-placeholder">
                  <span style={{ fontSize:48 }}>▶</span>
                  <span style={{ fontFamily:"'Orbitron',sans-serif",fontSize:11,color:"rgba(245,230,211,.4)",letterSpacing:2 }}>SEEWHY LIVE OFFICIAL SHOWCASE</span>
                  {paywallTimer > 0 && <span style={{ fontFamily:"'DM Mono',monospace",fontSize:11,color:T.gold }}>Free preview: {Math.floor(paywallTimer/60)}:{String(paywallTimer%60).padStart(2,"0")}</span>}
                </div>
                <div className="sync-badge"><span style={{ width:6,height:6,background:T.acidGreen,borderRadius:"50%",display:"inline-block" }} />±0ms</div>
                <span style={{ position:"absolute",top:12,left:12,background:T.burgundy,color:"#fff",fontFamily:"'Orbitron',sans-serif",fontSize:8,padding:"3px 8px",borderRadius:4,letterSpacing:1 }}>● SYNC 17s ago</span>
                <div className="floating-reactions">{floatEmojis.map(fe => <span key={fe.id} className="float-emoji" style={{ left:`${fe.left}%` }}>{fe.emoji}</span>)}</div>
              </div>

              <div className="reaction-bar">
                {["👏","❤️","😂","🔥","😮"].map(e => <button key={e} className="reaction-btn" onClick={() => addReaction(e)}>{e}</button>)}
              </div>

              <div className="wp-sync-row">
                <span style={{ fontFamily:"'Orbitron',sans-serif",fontSize:9,color:T.gold,letterSpacing:1 }}>HOST</span>
                <button className="wp-play-btn">▶</button>
                <div className="wp-progress"><div className="wp-fill" style={{ width:`${wpProgress}%` }} /></div>
                <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(245,230,211,.5)",flexShrink:0 }}>{Math.floor(wpProgress*.06)}:{String(Math.floor(wpProgress*3.6)%60).padStart(2,"0")} / 6:00</span>
              </div>

              <div className="audience-section">
                <div className="audience-title">Stage · {guests.length}</div>
                <div className="audience-grid">
                  {guests.slice(0,4).map(g => (
                    <div key={g.id} className="audience-member">
                      <div className="audience-avatar" style={{ borderColor: g.isSpeaking ? T.cyan : `${T.burgundy}30` }}>{g.emoji}</div>
                      <span className="audience-name">{g.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && (
            <div className="feed-area">
              <div style={{ textAlign:"center",paddingTop:40 }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:48,color:T.gold }}>${earnings.toFixed(2)}</div>
                <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:10,color:"rgba(245,230,211,.4)",letterSpacing:2,marginBottom:24 }}>TOTAL EARNINGS TODAY</div>
              </div>
              {[
                { label:"Total Streams",        value: liveStats?.total_streams   ?? "—",    icon:"📡" },
                { label:"Messages Moderated",   value: liveStats?.total_messages  ?? "—",    icon:"💬" },
                { label:"Human Reviews",        value: liveStats?.human_reviews   ?? "—",    icon:"👥" },
                { label:"Avg Toxicity",         value: liveStats ? `${((liveStats.avg_toxicity||0)*100).toFixed(1)}%` : "—", icon:"⚠️" },
                { label:"Creator Split",        value:"90%",   icon:"💰", color:T.gold },
                { label:"Platform Fee",         value:"10%",   icon:"🏛", color:T.burgundy },
              ].map(s => (
                <div key={s.label} style={{ background:T.umber,border:`1px solid ${T.burgundy}30`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ fontSize:20 }}>{s.icon}</span>
                    <span style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:15,fontWeight:600 }}>{s.label}</span>
                  </div>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:s.color||T.bone }}>{s.value}</span>
                </div>
              ))}
              <div style={{ background:T.umber,border:`1px solid ${T.gold}30`,borderRadius:10,padding:14 }}>
                <div style={{ fontFamily:"'Orbitron',sans-serif",fontSize:9,letterSpacing:2,color:"rgba(245,230,211,.4)",marginBottom:10,textTransform:"uppercase" }}>Revenue Split · 90/10</div>
                <div className="revenue-bar" style={{ height:8,marginBottom:6 }}>
                  <div className="revenue-creator" style={{ width:"90%" }} />
                  <div className="revenue-platform" style={{ width:"10%" }} />
                </div>
                <div className="revenue-labels">
                  <span className="rev-creator">Creator 90% — ${(earnings*.9).toFixed(2)}</span>
                  <span className="rev-platform">Platform 10% — ${(earnings*.1).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="sidebar-tabs">
            {[["chat","Chat"],["revenue","Revenue"],["guests","Guests"]].map(([k,l]) => (
              <button key={k} className={`sidebar-tab${sidebarTab===k?" active":""}`} onClick={() => setSidebarTab(k)}>{l}</button>
            ))}
          </div>

          {sidebarTab === "chat" && (
            <>
              <div className="chat-guardian-hud">
                <span><span className="guardian-dot" />GUARDIAN AI ACTIVE</span>
                <span>LLMLINGUA: 72% SAVED</span>
              </div>
              <div className="chat-area" ref={chatRef}>
                {messages.map(msg => msg.isTip ? (
                  <div key={msg.id} className="tip-msg">
                    <div style={{ fontSize:10,color:"rgba(245,230,211,.5)",marginBottom:2 }}>{msg.user} · {msg.time}</div>
                    <div className="tip-amount">{msg.tipAmount} TIP 💰</div>
                  </div>
                ) : (
                  <div key={msg.id} className="chat-msg">
                    <div className="chat-msg-header">
                      <span className={`chat-username${msg.badge==="host"?" host":""}`}>{msg.user}</span>
                      {msg.badge==="host" && <span className="chat-badge host-badge">HOST</span>}
                      {msg.badge==="mod"  && <span className="chat-badge mod-badge">BOT</span>}
                      <span className="chat-time">{msg.time}</span>
                    </div>
                    <div className="chat-text">{msg.text}</div>
                    {msg.translation && <div className="chat-translation">↳ {msg.translation}</div>}
                  </div>
                ))}
              </div>
              <div className="chat-input-row">
                <input className="chat-input" placeholder={moderating ? "Checking..." : "Say something..."} value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key==="Enter" && sendChat()} disabled={moderating} />
                <button className="chat-send" onClick={sendChat} disabled={moderating} style={{ opacity: moderating ? 0.5 : 1 }}>➤</button>
              </div>
            </>
          )}

          {sidebarTab === "revenue" && (
            <div style={{ padding:16,display:"flex",flexDirection:"column",gap:12,overflowY:"auto" }}>
              <div style={{ background:T.umber,borderRadius:12,padding:16,border:`1px solid ${T.gold}30` }}>
                <div className="revenue-label">Creator Earnings (90%)</div>
                <div className="revenue-amount">${(earnings*.9).toFixed(2)}</div>
                <div className="revenue-bar"><div className="revenue-creator" style={{ width:"90%" }} /><div className="revenue-platform" style={{ width:"10%" }} /></div>
                <div className="revenue-labels"><span className="rev-creator">90% YOU</span><span className="rev-platform">10% PLATFORM</span></div>
              </div>
              <div style={{ background:T.umber,borderRadius:12,padding:16,border:`1px solid ${T.burgundy}30` }}>
                <div className="revenue-label">Subscription Tiers</div>
                {TIERS.map(t => (
                  <div key={t.label} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid rgba(245,230,211,.05)`,fontFamily:"'Barlow Condensed',sans-serif" }}>
                    <span>{t.label}</span>
                    <span style={{ color:T.gold,fontFamily:"'DM Mono',monospace" }}>{t.price}/mo</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sidebarTab === "guests" && (
            <div style={{ padding:12,display:"flex",flexDirection:"column",gap:8,overflowY:"auto" }}>
              {guests.map(g => (
                <div key={g.id} style={{ background:T.umber,border:`1px solid ${g.isHost?T.gold:T.burgundy}30`,borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontSize:20 }}>{g.emoji}</span>
                    <div>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13 }}>{g.name}</div>
                      <div style={{ fontSize:10,color:"rgba(245,230,211,.4)",fontFamily:"'DM Mono',monospace" }}>{g.isHost?"HOST":"GUEST"} · {g.hasVideo?"CAM ON":"NO FEED"}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex",gap:4,alignItems:"center" }}>
                    {g.isSpeaking && <span style={{ fontSize:10,color:T.cyan,fontFamily:"'Orbitron',sans-serif" }}>●</span>}
                    {!g.isHost && <button style={{ background:"none",border:`1px solid ${T.burgundy}40`,color:"rgba(245,230,211,.5)",fontSize:10,padding:"2px 6px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Mono',monospace" }}>MUTE</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* ── PAYWALL ── */}
      {showPaywall && (
        <div className="paywall-overlay">
          <div className="paywall-card">
            <div className="paywall-icon">🔒</div>
            <div className="paywall-title">The Culture Is Inside.</div>
            <p className="paywall-sub">Your 2-minute free preview has ended. Unlock to keep watching.</p>
            <div className="paywall-tiers">
              {TIERS.map((t,i) => <button key={t.label} className={`tier-btn${selectedTier===i?" selected":""}`} onClick={() => setSelectedTier(i)}>{t.label}<br />{t.price}</button>)}
            </div>
            <button className="paywall-unlock" onClick={() => { setShowPaywall(false); setIsLive(true); }}>🔓 UNLOCK · {TIERS[selectedTier].price}</button>
            <div style={{ fontSize:12,color:"rgba(245,230,211,.3)",cursor:"pointer" }} onClick={() => setShowPaywall(false)}>Maybe later</div>
          </div>
        </div>
      )}

      {/* ── GO LIVE MODAL ── */}
      {showGoLive && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowGoLive(false)}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <div className="modal-title">Go Live</div>
            <div className="stream-type-cards">
              {[["single","📷","Single Cam"],["panel","👥","Panel"],["audio","🎙","Audio Room"]].map(([k,ic,l]) => (
                <div key={k} className={`stype-card${streamType===k?" selected":""}`} onClick={() => setStreamType(k)}>
                  <div className="icon">{ic}</div><div className="label">{l}</div>
                </div>
              ))}
            </div>
            <div className="modal-field-label">Stream Title</div>
            <input className="modal-input" placeholder="e.g. Late Night Chill Stream" value={streamTitle} onChange={e => setStreamTitle(e.target.value)} />
            <div className="modal-field-label">Permissions</div>
            {[["📷 Camera","granted"],["🎙 Microphone","granted"]].map(([l,s]) => (
              <div key={l} className="perm-row">
                <span className="perm-label">{l}</span>
                <span className={`perm-status ${s}`}>{s.toUpperCase()}</span>
              </div>
            ))}
            <button className="go-live-now" onClick={goLive}>
              <span style={{ width:8,height:8,background:"#fff",borderRadius:"50%",animation:"lp 1s infinite" }} />
              GO LIVE NOW
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
