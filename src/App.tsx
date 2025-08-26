import React, { useEffect, useState } from "react";

/** BG3 랜덤 생성기 · 정리반영
 * - 초기 진입/새로고침: 무기·기술 랜덤(공란 방지)
 * - 스탯 표 균등 정렬 + 각 능력치 아래 보너스 배지(+2/+1)
 * - 기술: 배경 2개 제외, 클래스 N개만 랜덤 제안(내가 찍을 것만 표시)
 * - 재주: 한글만
 * - 언어 전환: Race/Class(EN), Background/Skills(EN), 그 외 라벨 다국어
 * - 다이스 롤러: 합계 제거
 * - “무기만 (아무거나 2)” → “무기만 (아무거나)”
 */

const rand = (n: number) => Math.floor(Math.random() * n);
const choice = <T,>(arr: readonly T[]): T => arr[rand(arr.length)];
const shuffle = <T,>(arr: readonly T[]) => {
  const a = [...arr]; // readonly 받아도 복사해서 사용
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Lang = "ko" | "en";

const L = {
  ko: {
    title: "BG3 랜덤 생성기",
    sub: "캐릭터 · 능력치 · 기술 · 무기",
    result: "결과",
    race: "종족",
    klass: "클래스",
    background: "출신",
    weapons: "무기",
    skills: "기술(선택 N개 제안)",
    abilities: "능력치",
    bonus: "보너스",
    rollAll: "전체 랜덤",
    onlyRace: "종족만",
    onlyClass: "클래스만",
    onlyBG: "출신만",
    rollStats: "능력치만",
    rerollWeapons: "숙련된 무기만",
    any2Weapons: "무기만 (아무거나)",
    rollSkills: "기술 다시 뽑기",
    featSection: "재주",
    rollFeat: "재주 뽑기",
    langBtn: "English",
    str: "힘", dex: "민첩", con: "건강", int: "지능", wis: "지혜", cha: "매력",
    diceTitle: "주사위 굴리기",
    dicePH: "예: 1d4, 5d30, 3d6+2",
    rollDice: "주사위 굴리기",
    vsTitle: "승자 정하기",
    vsPH: "이름들을 쉼표로 구분 (예: 알프레드, 보리, 시라)",
    vsRoll: "굴리기 (기본 1d20)",
    winner: "승자",
    nPick: (n:number)=>`(이 중 ${n}개 선택)`,
  },
  en: {
    title: "BG3 Random Generator",
    sub: "Character · Abilities · Skills · Weapons",
    result: "Result",
    race: "Race",
    klass: "Class",
    background: "Background",
    weapons: "Weapons",
    skills: "Skills (Suggested Picks)",
    abilities: "Abilities",
    bonus: "Bonus",
    rollAll: "Roll All",
    onlyRace: "Race Only",
    onlyClass: "Class Only",
    onlyBG: "Background Only",
    rollStats: "Roll Abilities",
    rerollWeapons: "Proficient Weapons",
    any2Weapons: "Any Weapons",
    rollSkills: "Reroll Skills",
    featSection: "Feats",
    rollFeat: "Roll Feat",
    langBtn: "한국어",
    str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
    diceTitle: "Dice Roller",
    dicePH: "e.g., 1d4, 5d30, 3d6+2",
    rollDice: "Roll",
    vsTitle: "Decide Winner",
    vsPH: "Comma-separated names (e.g., Alex, Bora, Choi)",
    vsRoll: "Roll (1d20)",
    winner: "Winner",
    nPick: (n:number)=>`(pick ${n})`,
  },
} as const;

const ABILS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
type Abil = typeof ABILS[number];
const abilKo: Record<Abil, string> = { STR:"힘", DEX:"민첩", CON:"건강", INT:"지능", WIS:"지혜", CHA:"매력" };

// --- 데이터 ---
const CLASSES: Record<string, { ko: string; subclasses: string[] }> = {
  Barbarian: { ko: "바바리안", subclasses: ["야생의 심장","광전사","야생 마법","거인"] },
  Bard: { ko: "바드", subclasses: ["전승학파","용맹학파","검술학파","요술학파"] },
  Cleric: { ko: "클레릭", subclasses: ["생명 권역","빛 권역","기만 권역","지식 권역","자연 권역","폭풍 권역","전쟁 권역","죽음 권역"] },
  Druid: { ko: "드루이드", subclasses: ["땅의 회합","달의 회합","포자의 회합","별의 회합"] },
  Fighter: { ko: "파이터", subclasses: ["전투의 대가","비술 기사","투사","비전 궁수"] },
  Monk: { ko: "몽크", subclasses: ["사원소의 길","열린 손의 길","그림자의 길","취권 달인의 길"] },
  Paladin: { ko: "팔라딘", subclasses: ["헌신의 맹세","선조의 맹세","복수의 맹세","왕관의 맹세","맹세파기자"] },
  Ranger: { ko: "레인저", subclasses: ["사냥꾼","야수 조련사","어둠 추적자","무리지기"] },
  Rogue: { ko: "로그", subclasses: ["도둑","비전 괴도","암살자","칼잡이"] },
  Sorcerer: { ko: "소서러", subclasses: ["용의 혈통","야생 마법","폭풍 술사","그림자 마법"] },
  Warlock: { ko: "워락", subclasses: ["마족","고대의 지배자","대요정","주술 칼날"] },
  Wizard: { ko: "위저드", subclasses: ["방호술","방출술","사령술","창조술","환혹술","예지술","환영술","변환술","칼날 노래"] },
};

const RACES: Record<string, { ko: string; subs?: string[] }> = {
  Human: { ko: "인간" },
  Elf: { ko: "엘프", subs: ["하이 엘프","우드 엘프"] },
  Tiefling: { ko: "티플링", subs: ["아스모데우스 티플링","메피스토펠레스 티플링","자리엘 티플링"] },
  Drow: { ko: "드로우", subs: ["롤쓰 스원 드로우","셀다린 드로우"] },
  Githyanki: { ko: "기스양키" },
  Dwarf: { ko: "드워프", subs: ["골드 드워프","실드 드워프","드웨가"] },
  "Half-Elf": { ko: "하프엘프", subs: ["하이 하프 엘프","우드 하프 엘프","드로우 하프 엘프"] },
  Halfling: { ko: "하플링", subs: ["라이트풋 하플링","스트롱하트 하플링"] },
  Gnome: { ko: "노움", subs: ["바위 노움","숲 노움","딥 노움"] },
  Dragonborn: { ko: "드래곤본", subs: ["블랙","코퍼","블루","브론즈","브래스","레드","골드","그린","화이트","실버"] },
  "Half-Orc": { ko: "하프오크" },
};

const BACK_KO = ["복사","사기꾼","범죄자","연예인","시골 영웅","길드 장인","귀족","이방인","현자","군인","부랑아"] as const;
const BACK_EN: Record<typeof BACK_KO[number], string> = {
  "복사":"Acolyte","사기꾼":"Charlatan","범죄자":"Criminal","연예인":"Entertainer","시골 영웅":"Folk Hero","길드 장인":"Guild Artisan","귀족":"Noble","이방인":"Outlander","현자":"Sage","군인":"Soldier","부랑아":"Urchin"
};

// 재주(한글만)
const FEATS = [
  "능력 향상","배우","경계","운동선수","돌격자","쇠뇌 전문가","방어적인 결투가","쌍수 전문가","던전 탐구자","불굴","원소 숙련",
  "대형 무기의 달인","중갑 무장","중갑의 달인","경갑 무장","행운","마법사 슬레이어","마법 입문: 바드","마법 입문: 클레릭","마법 입문: 드루이드",
  "마법 입문: 소서러","마법 입문: 워락","마법 입문: 위자드","무예 숙련","평갑의 달인","기동력","적당히 무장함","공연가","장병기의 달인",
  "저항력","의식 시전자","맹렬한 공격자","파수꾼","명사수","방패의 달인","숙련가","주문 저격수","술집 싸움꾼","강골","전쟁 시전자","무기의 달인"
];

// 무기
const SIMPLE = ["곤봉","단검","대형 곤봉","손도끼","투창","경쇠뇌","경량 망치","철퇴","육척봉","단궁","낫","창"];
const MARTIAL = ["전투 도끼","도리깨","협도","대형 도끼","대검","미늘창","손 쇠뇌","중쇠뇌","장궁","장검","대형 망치","모닝스타","장창","레이피어","언월도","소검","삼지창","전쟁 망치","전쟁 곡괭이"];
const EXTRA = ["채찍"];
const ALL_WEAPONS = Array.from(new Set([...SIMPLE, ...MARTIAL, ...EXTRA]));
const SHIELD = "방패";

// 숙련(간단화)
const RACE_WEAP: Record<string,string[]> = {
  "인간":["언월도","미늘창","장창","창"],
  "하프엘프":["언월도","미늘창","장창","창"],
  "엘프":["단검","단궁","장검","장궁"],
  "드로우":["레이피어","소검","손 쇠뇌"],
  "기스양키":["대검","장검","소검"],
  "드워프":["경량 망치","손도끼","전투 도끼","전쟁 망치"],
};
const RACE_SHIELD = new Set(["인간","하프엘프"]);
const CLASS_WEAP: Record<string,string[]> = {
  "드루이드":["곤봉","낫","단검","언월도","육척봉","투창","창","철퇴"],
  "몽크":[...SIMPLE,"소검"],
  "바드":[...SIMPLE,"레이피어","소검","장검","손 쇠뇌"],
  "로그":[...SIMPLE,"레이피어","소검","장검","손 쇠뇌"],
  "소서러":["단검","육척봉","경쇠뇌"],
  "위저드":["단검","육척봉","경쇠뇌"],
  "워락":[...SIMPLE],
  "클레릭":[...SIMPLE],
  "레인저":[...SIMPLE, ...MARTIAL],
  "바바리안":[...SIMPLE, ...MARTIAL],
  "팔라딘":[...SIMPLE, ...MARTIAL],
  "파이터":[...SIMPLE, ...MARTIAL],
};
const CLASS_SHIELD = new Set(["파이터","팔라딘","클레릭","레인저","바바리안","드루이드"]);

// 스킬 라벨
const SK = {
  KO: {
    Athletics:"운동", Acrobatics:"곡예", Sleight:"손재주", Stealth:"은신",
    Arcana:"비전", History:"역사", Investigation:"조사", Nature:"자연", Religion:"종교",
    Animal:"동물 조련", Insight:"통찰", Medicine:"의학", Perception:"포착", Survival:"생존",
    Deception:"기만", Intimidation:"협박", Performance:"공연", Persuasion:"설득",
  },
  EN: {
    Athletics:"Athletics", Acrobatics:"Acrobatics", Sleight:"Sleight of Hand", Stealth:"Stealth",
    Arcana:"Arcana", History:"History", Investigation:"Investigation", Nature:"Nature", Religion:"Religion",
    Animal:"Animal Handling", Insight:"Insight", Medicine:"Medicine", Perception:"Perception", Survival:"Survival",
    Deception:"Deception", Intimidation:"Intimidation", Performance:"Performance", Persuasion:"Persuasion",
  }
};
// 배경(고정 2개)
const BG_SKILLS: Record<typeof BACK_KO[number], [keyof typeof SK.KO, keyof typeof SK.KO]> = {
  "복사": ["Insight","Religion"],
  "사기꾼": ["Deception","Sleight"],
  "범죄자": ["Deception","Stealth"],
  "연예인": ["Acrobatics","Performance"],
  "시골 영웅": ["Animal","Survival"],
  "길드 장인": ["Insight","Persuasion"],
  "귀족": ["History","Persuasion"],
  "이방인": ["Athletics","Survival"],
  "현자": ["Arcana","History"],
  "군인": ["Athletics","Intimidation"],
  "부랑아": ["Sleight","Stealth"],
};
// 클래스(선택 풀 + 개수)
const CLASS_SK_CHOICE: Record<string, { n: number; list: (keyof typeof SK.KO)[] }> = {
  "바바리안": { n: 2, list: ["Animal","Athletics","Intimidation","Nature","Perception","Survival"] },
  "바드": { n: 3, list: ["Deception","Performance","Persuasion","Sleight","Intimidation","Acrobatics","Insight"] },
  "클레릭": { n: 2, list: ["History","Insight","Medicine","Persuasion","Religion"] },
  "드루이드": { n: 2, list: ["Animal","Insight","Medicine","Nature","Perception","Survival"] },
  "파이터": { n: 2, list: ["Acrobatics","Animal","Athletics","History","Insight","Intimidation","Perception","Survival"] },
  "몽크": { n: 2, list: ["Acrobatics","Athletics","Insight","History","Religion","Stealth"] },
  "팔라딘": { n: 2, list: ["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"] },
  "레인저": { n: 3, list: ["Animal","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"] },
  "로그": { n: 4, list: ["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Performance","Persuasion","Sleight","Stealth"] },
  "소서러": { n: 2, list: ["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"] },
  "워락": { n: 2, list: ["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"] },
  "위저드": { n: 2, list: ["Arcana","History","Insight","Investigation","Medicine","Religion"] },
};

// --- 포인트바이 ---
type PBMap = Record<Abil, number>;
function rollPointBuyRaw(): PBMap {
  const vals = [8,8,8,8,8,8];
  let budget = 27;
  const cost = (v:number) => (v >= 13 ? 2 : 1);
  let guard = 2000;
  while (budget > 0 && guard-- > 0) {
    const i = rand(6);
    const cur = vals[i];
    if (cur >= 15) continue;
    const c = cost(cur);
    if (budget < c) {
      const any = vals.some(v => (v < 13 && budget >= 1) || (v >= 13 && v < 15 && budget >= 2));
      if (!any) break;
      continue;
    }
    vals[i] += 1; budget -= c;
  }
  return { STR: vals[0], DEX: vals[1], CON: vals[2], INT: vals[3], WIS: vals[4], CHA: vals[5] };
}
type PBResult = { base: PBMap; bonus2: Abil; bonus1: Abil; final: PBMap };
function rollPointBuyWithBonuses(): PBResult {
  const base = rollPointBuyRaw();
  let b2 = ABILS[rand(6)];
  let b1 = ABILS[rand(6)];
  while (b1 === b2) b1 = ABILS[rand(6)];
  const final: PBMap = { ...base };
  final[b2] = Math.min(17, final[b2] + 2);
  final[b1] = Math.min(17, final[b1] + 1);
  return { base, bonus2: b2, bonus1: b1, final };
}

// --- Dice ---
function parseDice(expr: string): {n:number;m:number;mod:number}|null {
  const t = expr.trim().replace(/\s+/g,'');
  const m = t.match(/^(\d+)[dD](\d+)([+-]\d+)?$/);
  if(!m) return null;
  const n = Math.max(1, parseInt(m[1],10));
  const sides = Math.max(2, parseInt(m[2],10));
  const mod = m[3] ? parseInt(m[3],10) : 0;
  return { n, m: sides, mod };
}
function rollNdM(n:number,m:number){ return Array.from({length:n},()=>1+rand(m)); }

export default function App(){
  const [lang, setLang] = useState<Lang>("ko");

  const [raceKey, setRaceKey] = useState<keyof typeof RACES | "-">("-");
  const [subraceKo, setSubraceKo] = useState<string>("-");
  const [classKey, setClassKey] = useState<keyof typeof CLASSES | "-">("-");
  const [subclassKo, setSubclassKo] = useState<string>("-");
  const [bg, setBg] = useState<Background>("-");

// rollBackground 그대로 OK (choice 가 readonly 허용하므로)
function rollBackground(){ setBg(choice(BACK_KO)); }

// BG_SKILLS 타입도 Background에서 "-" 제외하도록 더 안전하게 하고 싶다면(선택)
const BG_SKILLS: Record<Exclude<Background, "-">,
  [keyof typeof SK.KO, keyof typeof SK.KO]
  const [stats, setStats] = useState<PBMap>({STR:8,DEX:8,CON:8,INT:8,WIS:8,CHA:8});
  const [pbBonus2, setPbBonus2] = useState<Abil | null>(null);
  const [pbBonus1, setPbBonus1] = useState<Abil | null>(null);
  const [weapons, setWeapons] = useState<string[]>([]);
  const [skills, setSkills] = useState<(keyof typeof SK.KO)[]>([]);
  const [feat, setFeat] = useState<string>("");

  // Dice states
  const [diceExpr, setDiceExpr] = useState<string>("1d20");
  const [diceDetail, setDiceDetail] = useState<string>("");

  // Versus states
  const [names, setNames] = useState<string>("");
  const [vsLines, setVsLines] = useState<string[]>([]);
  const [vsWinner, setVsWinner] = useState<string>("");

  useEffect(()=>{ rollAll(); }, []);

  function rollRace(){
    const keys = Object.keys(RACES) as (keyof typeof RACES)[];
    const r = choice(keys);
    setRaceKey(r);
    const subs = RACES[r].subs;
    setSubraceKo(subs ? choice(subs) : "-");
  }
  function rollClass(){
    const keys = Object.keys(CLASSES) as (keyof typeof CLASSES)[];
    const k = choice(keys);
    setClassKey(k);
    setSubclassKo(choice(CLASSES[k].subclasses));
  }
  function rollBackground(){ setBg(choice(BACK_KO)); }
  function rollStats(){
    const { bonus2, bonus1, final } = rollPointBuyWithBonuses();
    setPbBonus2(bonus2); setPbBonus1(bonus1); setStats(final);
  }
  function rollWeapons(){
    const raceKo = raceKey === "-" ? "" : RACES[raceKey].ko;
    const classKo = classKey === "-" ? "" : CLASSES[classKey].ko;
    const racePool = RACE_WEAP[raceKo] || [];
    const classPool = CLASS_WEAP[classKo] || [];
    let pool = Array.from(new Set([...racePool, ...classPool]));
    const hasShield = (raceKo && RACE_SHIELD.has(raceKo)) || (classKo && CLASS_SHIELD.has(classKo));
    if (hasShield && !pool.includes(SHIELD)) pool.push(SHIELD);
    if (pool.length === 0) { setWeapons(shuffle(ALL_WEAPONS).slice(0,2)); return; }
    const pickN = pool.length <= 8 ? 1 : 2;
    setWeapons(shuffle(pool).slice(0, Math.min(pickN, pool.length)));
  }
  function rollAny2Weapons(){ setWeapons(shuffle(ALL_WEAPONS).slice(0,2)); }
  function rollSkills(){
    if (bg === "-") { setSkills([]); return; }
    const [bg1, bg2] = BG_SKILLS[bg];
    const clsKo = classKey === "-" ? "" : CLASSES[classKey].ko;
    const cfg = CLASS_SK_CHOICE[clsKo];
    if (!cfg) { setSkills([]); return; }
    const pool = cfg.list.filter(s => s !== bg1 && s !== bg2);
    const picks = shuffle(pool).slice(0, cfg.n);
    setSkills(picks); // 배경 고정 2개 제외 → “내가 찍을 것”만 보여줌
  }
  function rollFeat(){ setFeat(choice(FEATS)); }

  function rollAll(){
    rollRace(); rollClass(); rollBackground(); rollStats();
    setTimeout(()=>{ rollWeapons(); rollSkills(); }, 0);
  }

  // Dice Roller
  function handleRollDice() {
    const p = parseDice(diceExpr);
    if(!p){ setDiceDetail("형식 오류"); return; }
    const rolls = rollNdM(p.n, p.m);
    const modStr = p.mod ? (p.mod>0?`+${p.mod}`:`${p.mod}`) : "";
    setDiceDetail(`${p.n}d${p.m}${modStr} → [ ${rolls.join(", ")} ]`);
  }

  // Versus (1d20)
  function handleVersus() {
    const list = names.split(",").map(s=>s.trim()).filter(Boolean);
    if(list.length===0){ setVsLines(["이름을 입력하세요"]); setVsWinner(""); return; }
    const results = list.map(n=>({ name:n, roll: 1+rand(20)}));
    const max = Math.max(...results.map(r=>r.roll));
    const winners = results.filter(r=>r.roll===max).map(r=>r.name);
    setVsLines(results.map(r=>`${r.name}: ${r.roll}`));
    setVsWinner(winners.join(", "));
  }

  const T = L[lang];
  const abilLabel = (k: Abil) => (lang==="ko" ? abilKo[k] : (L.en as any)[k.toLowerCase()]);
  const bgLabel = (b: typeof BACK_KO[number] | "-") => b==="-" ? "-" : (lang==="ko" ? b : BACK_EN[b]);

  return (
    <div style={{ minHeight:'100vh', display:'flex', justifyContent:'center', alignItems:'flex-start', background:'#fff' }}>
      <div style={{ width:'min(1100px, 96%)', margin:'24px auto', fontFamily:'ui-sans-serif, system-ui' }}>
        <header style={{ textAlign:'center', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ width:120 }} />
          <div>
            <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>{T.title}</h1>
            <p style={{ color:'#6b7280', margin:'6px 0 0' }}>{T.sub}</p>
          </div>
          <div style={{ width:120, textAlign:'right' }}>
            <button onClick={()=>setLang(lang==='ko'?'en':'ko')} style={btnSecondary}>{T.langBtn}</button>
          </div>
        </header>

        {/* 결과 */}
        <section style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }}>
          <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16 }}>
            <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 12px' }}>{T.result}</h2>

            <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', rowGap:8 }}>
              <div style={{ color:'#6b7280' }}>{T.race}</div>
              <div>
                {raceKey !== "-" ? (lang==="ko" ? RACES[raceKey].ko : String(raceKey)) : "-"}
                {subraceKo !== "-" ? ` / ${subraceKo}` : ""}
              </div>

              <div style={{ color:'#6b7280' }}>{T.klass}</div>
              <div>
                {classKey !== "-" ? (lang==="ko" ? CLASSES[classKey].ko : String(classKey)) : "-"}
                {subclassKo !== "-" ? ` / ${subclassKo}` : ""}
              </div>

              <div style={{ color:'#6b7280' }}>{T.background}</div>
              <div>{bgLabel(bg)}</div>

              <div style={{ color:'#6b7280' }}>{T.weapons}</div>
              <div>{weapons.length ? weapons.join(", ") : "-"}</div>

              <div style={{ color:'#6b7280' }}>
                {T.skills} {classKey!=="-" ? (lang==="ko" ? L.ko.nPick(CLASS_SK_CHOICE[CLASSES[classKey].ko]?.n ?? 0) : L.en.nPick(CLASS_SK_CHOICE[CLASSES[classKey].ko]?.n ?? 0)) : ""}
              </div>
              <div>
                {skills.length
                  ? skills.map(s=> (lang==="ko" ? SK.KO[s] : SK.EN[s])).join(", ")
                  : "-"}
              </div>
            </div>

            {/* 능력치 */}
            <div style={{ marginTop:12 }}>
              <h3 style={{ fontWeight:700, margin:'0 0 6px' }}>{T.abilities}</h3>

              {/* 균등 그리드 + 보너스 배지 */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:8, textAlign:'center' }}>
                {ABILS.map((k)=>(
                  <div key={k} style={{ border:'1px solid #f1f5f9', borderRadius:10, padding:'8px 6px' }}>
                    <div style={{ fontSize:12, color:'#6b7280', marginBottom:4 }}>{abilLabel(k)}</div>
                    <div style={{ fontSize:20, fontWeight:800, lineHeight:1 }}>{stats[k]}</div>
                    <div style={{ height:18, marginTop:4 }}>
                      {pbBonus2===k && <span style={badge}>+2</span>}
                      {pbBonus1===k && <span style={{...badge, background:'#e5e7eb', color:'#111827'}}>+1</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 조작 버튼 */}
            <div style={{ marginTop:12, display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
              <button onClick={rollAll} style={btnPrimary}>{T.rollAll}</button>
              <button onClick={()=>{rollRace(); setTimeout(rollWeapons,0);}} style={btn}>{T.onlyRace}</button>
              <button onClick={()=>{rollClass(); setTimeout(()=>{rollWeapons(); rollSkills();},0);}} style={btn}>{T.onlyClass}</button>
              <button onClick={()=>{rollBackground(); setTimeout(rollSkills,0);}} style={btn}>{T.onlyBG}</button>
              <button onClick={rollStats} style={btn}>{T.rollStats}</button>
              <button onClick={rollWeapons} style={btn}>{T.rerollWeapons}</button>
              <button onClick={rollAny2Weapons} style={btn}>{T.any2Weapons}</button>
              <button onClick={rollSkills} style={btn}>{T.rollSkills}</button>
            </div>
          </div>
        </section>

        {/* 재주 */}
        <section style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16, marginTop:16 }}>
          <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 12px' }}>{T.featSection}</h2>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <button onClick={rollFeat} style={btn}>{T.rollFeat}</button>
            {feat && <div style={{ fontWeight:700 }}>{feat}</div>}
          </div>
        </section>

        {/* 주사위 */}
        <section style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16, marginTop:16 }}>
          <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 12px' }}>{T.diceTitle}</h2>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <input value={diceExpr} onChange={e=>setDiceExpr(e.target.value)} placeholder={T.dicePH} style={input}/>
            <button onClick={handleRollDice} style={btn}>{T.rollDice}</button>
          </div>
          {diceDetail && <div style={{ marginTop:8, color:"#374151" }}>{diceDetail}</div>}
        </section>

        {/* 승자 정하기 */}
        <section style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16, marginTop:16, marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 12px' }}>{T.vsTitle}</h2>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <input value={names} onChange={e=>setNames(e.target.value)} placeholder={T.vsPH} style={input}/>
            <button onClick={handleVersus} style={btn}>{T.vsRoll}</button>
          </div>
          {vsLines.length>0 && (
            <div style={{ marginTop:8 }}>
              {vsLines.map((l,i)=><div key={i}>{l}</div>)}
              {vsWinner && <div style={{ marginTop:6, fontWeight:800 }}>{T.winner}: {vsWinner}</div>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// 스타일
const btnBase: React.CSSProperties = { padding:"10px 14px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer" };
const btn: React.CSSProperties = { ...btnBase };
const btnPrimary: React.CSSProperties = { ...btnBase, background:"#111827", color:"#fff", borderColor:"#111827" };
const btnSecondary: React.CSSProperties = { ...btnBase, background:"#f3f4f6" };
const input: React.CSSProperties = { padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, minWidth:260 };
const badge: React.CSSProperties = { display:'inline-block', padding:'0 6px', fontSize:12, borderRadius:999, background:'#111827', color:'#fff', lineHeight:'18px', height:18, margin:'0 2px' };
