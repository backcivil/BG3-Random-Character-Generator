import React, { useEffect, useState } from "react";

/** BG3 랜덤 생성기 · 안정반영
 * - 포인트바이(27) + 보너스(+2/+1) 적용, 능력치 표 아래에 표기
 * - 초기 진입 시 무기 공란 방지(숙련 풀이 없으면 아무무기 2개로 대체)
 * - 무기 아무거나(2), 숙련 무기 재뽑기
 * - 기술 자동 선택(배경 2 + 클래스 N)
 * - 주사위 굴리기(예: 1d4, 5d30, 3d6+2)
 * - 이름 대전 주사위(이름별 굴림, 최고값 승자)
 * - 한/영 전환(기본 한국어)
 */

const rand = (n: number) => Math.floor(Math.random() * n);
const choice = <T,>(arr: T[]): T => arr[rand(arr.length)];
const shuffle = <T,>(arr: T[]) => {
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
    skills: "기술",
    abilities: "능력치",
    bonus: "보너스",
    rollAll: "전체 랜덤",
    onlyRace: "종족만",
    onlyClass: "클래스만",
    onlyBG: "출신만",
    rollStats: "능력치만",
    rerollWeapons: "숙련된 무기만",
    any2Weapons: "무기만 (아무거나 2)",
    rollSkills: "기술 다시 뽑기",
    featSection: "재주",
    rollFeat: "재주 뽑기",
    langBtn: "English",
    str: "힘", dex: "민첩", con: "건강", int: "지능", wis: "지혜", cha: "매력",
    bonus2: "+2 → ", bonus1: "+1 → ",
    diceTitle: "주사위 굴리기",
    dicePH: "예: 1d4, 5d30, 3d6+2",
    rollDice: "주사위 굴리기",
    vsTitle: "이름 대전 주사위",
    vsPH: "이름들을 쉼표로 구분하여 입력 (예: 알프레드, 보리, 시라)",
    vsRoll: "대전 굴리기 (기본 1d20)",
    winner: "승자",
  },
  en: {
    title: "BG3 Random Generator",
    sub: "Character · Abilities · Skills · Weapons",
    result: "Result",
    race: "Race",
    klass: "Class",
    background: "Background",
    weapons: "Weapons",
    skills: "Skills",
    abilities: "Abilities",
    bonus: "Bonus",
    rollAll: "Roll All",
    onlyRace: "Race Only",
    onlyClass: "Class Only",
    onlyBG: "Background Only",
    rollStats: "Roll Abilities",
    rerollWeapons: "Proficient Weapons",
    any2Weapons: "Any Weapons (2)",
    rollSkills: "Reroll Skills",
    featSection: "Feats",
    rollFeat: "Roll Feat",
    langBtn: "한국어",
    str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
    bonus2: "+2 → ", bonus1: "+1 → ",
    diceTitle: "Dice Roller",
    dicePH: "e.g., 1d4, 5d30, 3d6+2",
    rollDice: "Roll",
    vsTitle: "Names Versus Roller",
    vsPH: "Comma-separated names (e.g., Alex, Bora, Choi)",
    vsRoll: "Roll (1d20)",
    winner: "Winner",
  },
} as const;

const ABILS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
type Abil = typeof ABILS[number];

const abilKo: Record<Abil, string> = {
  STR: "힘", DEX: "민첩", CON: "건강", INT: "지능", WIS: "지혜", CHA: "매력",
};

const CLASSES: Record<
  string,
  { ko: string; subclasses: string[] }
> = {
  Barbarian: { ko: "바바리안", subclasses: ["야생의 심장", "광전사", "야생 마법", "거인"] },
  Bard: { ko: "바드", subclasses: ["전승학파", "용맹학파", "검술학파", "요술학파"] },
  Cleric: { ko: "클레릭", subclasses: ["생명 권역", "빛 권역", "기만 권역", "지식 권역", "자연 권역", "폭풍 권역", "전쟁 권역", "죽음 권역"] },
  Druid: { ko: "드루이드", subclasses: ["땅의 회합", "달의 회합", "포자의 회합", "별의 회합"] },
  Fighter: { ko: "파이터", subclasses: ["전투의 대가", "비술 기사", "투사", "비전 궁수"] },
  Monk: { ko: "몽크", subclasses: ["사원소의 길", "열린 손의 길", "그림자의 길", "취권 달인의 길"] },
  Paladin: { ko: "팔라딘", subclasses: ["헌신의 맹세", "선조의 맹세", "복수의 맹세", "왕관의 맹세", "맹세파기자"] },
  Ranger: { ko: "레인저", subclasses: ["사냥꾼", "야수 조련사", "어둠 추적자", "무리지기"] },
  Rogue: { ko: "로그", subclasses: ["도둑", "비전 괴도", "암살자", "칼잡이"] },
  Sorcerer: { ko: "소서러", subclasses: ["용의 혈통", "야생 마법", "폭풍 술사", "그림자 마법"] },
  Warlock: { ko: "워락", subclasses: ["마족", "고대의 지배자", "대요정", "주술 칼날"] },
  Wizard: { ko: "위저드", subclasses: ["방호술", "방출술", "사령술", "창조술", "환혹술", "예지술", "환영술", "변환술", "칼날 노래"] },
};

const RACES: Record<string, { ko: string; subs?: string[] }> = {
  Human: { ko: "인간" },
  Elf: { ko: "엘프", subs: ["하이 엘프", "우드 엘프"] },
  Tiefling: { ko: "티플링", subs: ["아스모데우스 티플링", "메피스토펠레스 티플링", "자리엘 티플링"] },
  Drow: { ko: "드로우", subs: ["롤쓰 스원 드로우", "셀다린 드로우"] },
  Githyanki: { ko: "기스양키" },
  Dwarf: { ko: "드워프", subs: ["골드 드워프", "실드 드워프", "드웨가"] },
  "Half-Elf": { ko: "하프엘프", subs: ["하이 하프 엘프", "우드 하프 엘프", "드로우 하프 엘프"] },
  Halfling: { ko: "하플링", subs: ["라이트풋 하플링", "스트롱하트 하플링"] },
  Gnome: { ko: "노움", subs: ["바위 노움", "숲 노움", "딥 노움"] },
  Dragonborn: { ko: "드래곤본", subs: ["블랙", "코퍼", "블루", "브론즈", "브래스", "레드", "골드", "그린", "화이트", "실버"] },
  "Half-Orc": { ko: "하프오크" },
};

const BACKGROUNDS = ["복사","사기꾼","범죄자","연예인","시골 영웅","길드 장인","귀족","이방인","현자","군인","부랑아"];

// 재주(표시는 별도 섹션에서만)
const FEATS = [
  "능력 향상(Ability Improvements)","배우(Actor)","경계(Alert)","운동선수(Athlete)","돌격자(Charger)","쇠뇌 전문가(Crossbow Expert)",
  "방어적인 결투가(Defensive Duelist)","쌍수 전문가(Dual Wielder)","던전 탐구자(Dungeon Delver)","불굴(Durable)","원소 숙련(Elemental Adept)",
  "대형 무기의 달인(Great Weapon Master)","중갑 무장(Heavily Armoured)","중갑의 달인(Heavy Armour Master)","경갑 무장(Lightly Armoured)",
  "행운(Lucky)","마법사 슬레이어(Mage Slayer)","마법 입문: 바드","마법 입문: 클레릭","마법 입문: 드루이드","마법 입문: 소서러","마법 입문: 워락","마법 입문: 위자드",
  "무예 숙련(Martial Adept)","평갑의 달인(Medium Armour Master)","기동력(Mobile)","적당히 무장함(Moderately Armoured)","공연가(Performer)",
  "장병기의 달인(Polearm Master)","저항력(Resilient)","의식 시전자(Ritual Caster)","맹렬한 공격자(Savage Attacker)","파수꾼(Sentinel)",
  "명사수(Sharpshooter)","방패의 달인(Shield Master)","숙련가(Skilled)","주문 저격수(Spell Sniper)","술집 싸움꾼(Tavern Brawler)",
  "강골(Tough)","전쟁 시전자(War Caster)","무기의 달인(Weapon Master)"
];

// 무기 리스트(총 32종 구성)
const SIMPLE = ["곤봉","단검","대형 곤봉","손도끼","투창","경쇠뇌","경량 망치","철퇴","육척봉","단궁","낫","창"];
const MARTIAL = ["전투 도끼","도리깨","협도","대형 도끼","대검","미늘창","손 쇠뇌","중쇠뇌","장궁","장검","대형 망치","모닝스타","장창","레이피어","언월도","소검","삼지창","전쟁 망치","전쟁 곡괭이"];
const EXTRA = ["채찍"]; // 31→32 보정
const ALL_WEAPONS = Array.from(new Set([...SIMPLE, ...MARTIAL, ...EXTRA]));
const SHIELD = "방패";

// 종족/클래스 숙련(간단화)
const RACE_WEAP: Record<string,string[]> = {
  "인간": ["언월도","미늘창","장창","창"],
  "하프엘프": ["언월도","미늘창","장창","창"],
  "엘프": ["단검","단궁","장검","장궁"],
  "드로우": ["레이피어","소검","손 쇠뇌"],
  "기스양키": ["대검","장검","소검"],
  "드워프": ["경량 망치","손도끼","전투 도끼","전쟁 망치"],
};
const RACE_SHIELD = new Set(["인간","하프엘프"]);
const CLASS_WEAP: Record<string,string[]> = {
  "드루이드": ["곤봉","낫","단검","언월도","육척봉","투창","창","철퇴"],
  "몽크": [...SIMPLE,"소검"],
  "바드": [...SIMPLE,"레이피어","소검","장검","손 쇠뇌"],
  "로그": [...SIMPLE,"레이피어","소검","장검","손 쇠뇌"],
  "소서러": ["단검","육척봉","경쇠뇌"],
  "위저드": ["단검","육척봉","경쇠뇌"],
  "워락": [...SIMPLE],
  "클레릭": [...SIMPLE],
  "레인저": [...SIMPLE, ...MARTIAL],
  "바바리안": [...SIMPLE, ...MARTIAL],
  "팔라딘": [...SIMPLE, ...MARTIAL],
  "파이터": [...SIMPLE, ...MARTIAL],
};
const CLASS_SHIELD = new Set(["파이터","팔라딘","클레릭","레인저","바바리안","드루이드"]);

// 기술(스킬)
const SK = {
  KO: {
    Athletics: "운동", Acrobatics: "곡예", Sleight: "손재주", Stealth: "은신",
    Arcana: "비전", History: "역사", Investigation: "조사", Nature: "자연", Religion: "종교",
    Animal: "동물 조련", Insight: "통찰", Medicine: "의학", Perception: "포착", Survival: "생존",
    Deception: "기만", Intimidation: "협박", Performance: "공연", Persuasion: "설득",
  }
};
// 배경 → 고정 2개
const BG_SKILLS: Record<string, [string, string]> = {
  "복사": [SK.KO.Insight, SK.KO.Religion],
  "사기꾼": [SK.KO.Deception, SK.KO.Sleight],
  "범죄자": [SK.KO.Deception, SK.KO.Stealth],
  "연예인": [SK.KO.Acrobatics, SK.KO.Performance],
  "시골 영웅": [SK.KO.Animal, SK.KO.Survival],
  "길드 장인": [SK.KO.Insight, SK.KO.Persuasion],
  "귀족": [SK.KO.History, SK.KO.Persuasion],
  "이방인": [SK.KO.Athletics, SK.KO.Survival],
  "현자": [SK.KO.Arcana, SK.KO.History],
  "군인": [SK.KO.Athletics, SK.KO.Intimidation],
  "부랑아": [SK.KO.Sleight, SK.KO.Stealth],
};
// 클래스 → 선택 풀 + 개수
const CLASS_SK_CHOICE: Record<string, { n: number; list: string[] }> = {
  "바바리안": { n: 2, list: [SK.KO.Animal, SK.KO.Athletics, SK.KO.Intimidation, SK.KO.Nature, SK.KO.Perception, SK.KO.Survival] },
  "바드": { n: 3, list: [SK.KO.Deception, SK.KO.Performance, SK.KO.Persuasion, SK.KO.Sleight, SK.KO.Intimidation, SK.KO.Acrobatics, SK.KO.Insight] },
  "클레릭": { n: 2, list: [SK.KO.History, SK.KO.Insight, SK.KO.Medicine, SK.KO.Persuasion, SK.KO.Religion] },
  "드루이드": { n: 2, list: [SK.KO.Animal, SK.KO.Insight, SK.KO.Medicine, SK.KO.Nature, SK.KO.Perception, SK.KO.Survival] },
  "파이터": { n: 2, list: [SK.KO.Acrobatics, SK.KO.Animal, SK.KO.Athletics, SK.KO.History, SK.KO.Insight, SK.KO.Intimidation, SK.KO.Perception, SK.KO.Survival] },
  "몽크": { n: 2, list: [SK.KO.Acrobatics, SK.KO.Athletics, SK.KO.Insight, SK.KO.History, SK.KO.Religion, SK.KO.Stealth] },
  "팔라딘": { n: 2, list: [SK.KO.Athletics, SK.KO.Insight, SK.KO.Intimidation, SK.KO.Medicine, SK.KO.Persuasion, SK.KO.Religion] },
  "레인저": { n: 3, list: [SK.KO.Animal, SK.KO.Athletics, SK.KO.Insight, SK.KO.Investigation, SK.KO.Nature, SK.KO.Perception, SK.KO.Stealth, SK.KO.Survival] },
  "로그": { n: 4, list: [SK.KO.Acrobatics, SK.KO.Athletics, SK.KO.Deception, SK.KO.Insight, SK.KO.Intimidation, SK.KO.Investigation, SK.KO.Perception, SK.KO.Performance, SK.KO.Persuasion, SK.KO.Sleight, SK.KO.Stealth] },
  "소서러": { n: 2, list: [SK.KO.Arcana, SK.KO.Deception, SK.KO.Insight, SK.KO.Intimidation, SK.KO.Persuasion, SK.KO.Religion] },
  "워락": { n: 2, list: [SK.KO.Arcana, SK.KO.Deception, SK.KO.History, SK.KO.Intimidation, SK.KO.Investigation, SK.KO.Nature, SK.KO.Religion] },
  "위저드": { n: 2, list: [SK.KO.Arcana, SK.KO.History, SK.KO.Insight, SK.KO.Investigation, SK.KO.Medicine, SK.KO.Religion] },
};

// 능력치: 포인트바이 + 보너스
const ABILS_ARR = ["STR","DEX","CON","INT","WIS","CHA"] as const;
type PBMap = Record<typeof ABILS_ARR[number], number>;
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
    vals[i] += 1;
    budget -= c;
  }
  return { STR: vals[0], DEX: vals[1], CON: vals[2], INT: vals[3], WIS: vals[4], CHA: vals[5] };
}
type PBResult = { base: PBMap; bonus2: Abil; bonus1: Abil; final: PBMap };
function rollPointBuyWithBonuses(): PBResult {
  const base = rollPointBuyRaw();
  let b2: Abil = ABILS_ARR[rand(6)] as Abil;
  let b1: Abil = ABILS_ARR[rand(6)] as Abil;
  while (b1 === b2) b1 = ABILS_ARR[rand(6)] as Abil;
  const final: PBMap = { ...base };
  final[b2] = Math.min(17, final[b2] + 2);
  final[b1] = Math.min(17, final[b1] + 1);
  return { base, bonus2: b2, bonus1: b1, final };
}

// 주사위 파서/굴림: NdM(+/-K)
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
  const [bg, setBg] = useState<string>("-");
  const [stats, setStats] = useState<PBMap>({STR:8,DEX:8,CON:8,INT:8,WIS:8,CHA:8});
  const [pbBonus2, setPbBonus2] = useState<Abil | null>(null);
  const [pbBonus1, setPbBonus1] = useState<Abil | null>(null);
  const [weapons, setWeapons] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [feat, setFeat] = useState<string>("");

  // Dice Roller states
  const [diceExpr, setDiceExpr] = useState<string>("1d20");
  const [diceDetail, setDiceDetail] = useState<string>("");
  const [diceTotal, setDiceTotal] = useState<number | null>(null);

  // Versus Roller states
  const [names, setNames] = useState<string>("");
  const [vsLines, setVsLines] = useState<string[]>([]);
  const [vsWinner, setVsWinner] = useState<string>("");

  // 초기 1회: 다음 틱에 무기/스킬 계산까지 확실히
  useEffect(()=>{
    rollAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  function rollBackground(){ setBg(choice(BACKGROUNDS)); }
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

    // 방패 숙련
    const hasShield = (raceKo && RACE_SHIELD.has(raceKo)) || (classKo && CLASS_SHIELD.has(classKo));
    if (hasShield && !pool.includes(SHIELD)) pool.push(SHIELD);

    // 풀 비었으면 아무무기 2개로 대체(초기 공란 방지)
    if (pool.length === 0) {
      setWeapons(shuffle(ALL_WEAPONS).slice(0,2));
      return;
    }

    const pickN = pool.length <= 8 ? 1 : 2;
    setWeapons(shuffle(pool).slice(0, Math.min(pickN, pool.length)));
  }
  function rollAny2Weapons(){ setWeapons(shuffle(ALL_WEAPONS).slice(0,2)); }
  function rollSkills(){
    const bgSkills = BG_SKILLS[bg] ?? [];
    const clsKo = classKey === "-" ? "" : CLASSES[classKey].ko;
    const cfg = CLASS_SK_CHOICE[clsKo];
    let chosen: string[] = [];
    if (cfg) {
      const pool = cfg.list.filter(s => !bgSkills.includes(s));
      chosen = shuffle(pool).slice(0, cfg.n);
    }
    setSkills([...bgSkills, ...chosen]);
  }
  function rollFeat(){ setFeat(choice(FEATS)); }

  function rollAll(){
    rollRace();
    rollClass();
    rollBackground();
    rollStats();
    // 다음 tick에서 종속 계산(무/스)
    setTimeout(()=>{ rollWeapons(); rollSkills(); }, 0);
  }

  // Dice Roller
  function handleRollDice() {
    const p = parseDice(diceExpr);
    if(!p){ setDiceDetail("형식 오류"); setDiceTotal(null); return; }
    const rolls = rollNdM(p.n, p.m);
    const total = rolls.reduce((a,b)=>a+b,0) + p.mod;
    setDiceDetail(`${p.n}d${p.m}${p.mod? (p.mod>0?`+${p.mod}`:p.mod):""} = [${rolls.join(", ")}] ${p.mod? (p.mod>0?`+${p.mod}`:`${p.mod}`):""}`);
    setDiceTotal(total);
  }

  // Versus Roller (기본 1d20)
  function handleVersus() {
    const list = names.split(",").map(s=>s.trim()).filter(Boolean);
    if(list.length===0){ setVsLines(["이름을 입력하세요"]); setVsWinner(""); return; }
    const results = list.map(n=>({ name:n, roll: 1+rand(20)}));
    const max = Math.max(...results.map(r=>r.roll));
    const winners = results.filter(r=>r.roll===max).map(r=>r.name);
    setVsLines(results.map(r=>`${r.name}: ${r.roll}`));
    setVsWinner(winners.join(", "));
  }

  // 표시 라벨
  const T = L[lang];
  const abilLabel = (k: Abil) => (lang === "ko" ? abilKo[k] : (L.en as any)[k.toLowerCase()]);

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
              <div>{raceKey !== "-" ? RACES[raceKey].ko : "-"}{subraceKo !== "-" ? ` / ${subraceKo}` : ""}</div>

              <div style={{ color:'#6b7280' }}>{T.klass}</div>
              <div>{classKey !== "-" ? CLASSES[classKey].ko : "-"}{subclassKo !== "-" ? ` / ${subclassKo}` : ""}</div>

              <div style={{ color:'#6b7280' }}>{T.background}</div>
              <div>{bg}</div>

              <div style={{ color:'#6b7280' }}>{T.weapons}</div>
              <div>{weapons.length ? weapons.join(", ") : "-"}</div>

              <div style={{ color:'#6b7280' }}>{T.skills}</div>
              <div>{skills.length ? skills.join(", ") : "-"}</div>
            </div>

            {/* 능력치 */}
            <div style={{ marginTop:12 }}>
              <h3 style={{ fontWeight:700, margin:'0 0 6px' }}>{T.abilities}</h3>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>{ABILS.map(k=> <th key={k} style={{ textAlign:'left', padding:6, borderBottom:'1px solid #eee' }}>{abilLabel(k)}</th>)}</tr>
                </thead>
                <tbody>
                  <tr>{ABILS.map(k=> <td key={k} style={{ padding:6, borderBottom:'1px solid #f3f4f6' }}>{stats[k]}</td>)}</tr>
                </tbody>
              </table>
              <div style={{ marginTop:8, color:'#374151', fontSize:14 }}>
                <span style={{ fontWeight:700 }}>{T.bonus}:</span>{" "}
                {pbBonus2 ? `${T.bonus2}${lang==='ko'?abilKo[pbBonus2]:pbBonus2}` : "-"}
                {"  /  "}
                {pbBonus1 ? `${T.bonus1}${lang==='ko'?abilKo[pbBonus1]:pbBonus1}` : "-"}
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

        {/* 재주 섹션 */}
        <section style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16, marginTop:16 }}>
          <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 12px' }}>{T.featSection}</h2>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <button onClick={rollFeat} style={btn}>{T.rollFeat}</button>
            {feat && <div style={{ fontWeight:700 }}>{feat}</div>}
          </div>
        </section>

        {/* 주사위 섹션 */}
        <section style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16, marginTop:16 }}>
          <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 12px' }}>{T.diceTitle}</h2>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <input
              value={diceExpr}
              onChange={e=>setDiceExpr(e.target.value)}
              placeholder={T.dicePH}
              style={input}
            />
            <button onClick={handleRollDice} style={btn}>{T.rollDice}</button>
          </div>
          {diceDetail && <div style={{ marginTop:8, color:"#374151" }}>{diceDetail}</div>}
          {diceTotal!==null && <div style={{ marginTop:4, fontWeight:700 }}>= {diceTotal}</div>}
        </section>

        {/* 이름 대전 섹션 */}
        <section style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16, marginTop:16, marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700, margin:'0 0 12px' }}>{T.vsTitle}</h2>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <input
              value={names}
              onChange={e=>setNames(e.target.value)}
              placeholder={T.vsPH}
              style={input}
            />
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
