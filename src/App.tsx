import React, { useState } from "react";

/** ========= 유틸 ========= */
const rand = (n: number) => Math.floor(Math.random() * n);
const choice = <T,>(arr: readonly T[]): T => arr[rand(arr.length)];
const shuffle = <T,>(arr: readonly T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const sampleN = <T,>(arr: readonly T[], n: number) =>
  shuffle(arr).slice(0, Math.max(0, Math.min(n, arr.length)));

type Lang = "ko" | "en";

/** ========= 다국어 ========= */
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
    str: "힘",
    dex: "민첩",
    con: "건강",
    int: "지능",
    wis: "지혜",
    cha: "매력",
    diceTitle: "주사위 굴리기",
    dicePH: "예: 1d4, 3d6+2",
    rollDice: "굴리기",
    vsTitle: "승자 정하기",
    vsPH: "공백/쉼표로 구분 (레드 유히 함마김 …)",
    vsRoll: "굴리기 (1d20)",
    winner: "승자",
    manualPanel: "수동 선택 & 고정",
    locks: "고정",
    growth: "클래스별 특성",
    classPick: "클래스",
    subPick: "서브클래스",
    levelPick: "레벨",
    howManySpells: "배울 주문 수",
    suggest: "랜덤 추천",
    openPicker: "선택",
    apply: "적용",
    cancel: "취소",
    exclude: "제외",
    excluded: "제외 목록",
    clear: "되돌리기",
    replaceRoll: "교체 굴림",
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
    rollAll: "Roll All",
    onlyRace: "Race Only",
    onlyClass: "Class Only",
    onlyBG: "Background Only",
    rollStats: "Roll Abilities",
    rerollWeapons: "Reroll Proficient",
    any2Weapons: "Any Weapons",
    rollSkills: "Reroll Skills",
    featSection: "Feats",
    rollFeat: "Roll Feat",
    langBtn: "한국어",
    str: "STR",
    dex: "DEX",
    con: "CON",
    int: "INT",
    wis: "WIS",
    cha: "CHA",
    diceTitle: "Dice Roller",
    dicePH: "e.g., 1d4, 3d6+2",
    rollDice: "Roll",
    vsTitle: "Decide Winner",
    vsPH: "Whitespace/commas",
    vsRoll: "Roll (1d20)",
    winner: "Winner",
    manualPanel: "Manual Picks & Locks",
    locks: "Lock",
    growth: "Class Features",
    classPick: "Class",
    subPick: "Subclass",
    levelPick: "Level",
    howManySpells: "Spell Picks",
    suggest: "Suggest",
    openPicker: "Pick",
    apply: "Apply",
    cancel: "Cancel",
    exclude: "Exclude",
    excluded: "Excluded",
    clear: "Unexclude",
    replaceRoll: "Replace Roll",
  },
} as const;

/** ========= 능력치 ========= */
const ABILS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
type Abil = (typeof ABILS)[number];
const abilKo: Record<Abil, string> = {
  STR: "힘",
  DEX: "민첩",
  CON: "건강",
  INT: "지능",
  WIS: "지혜",
  CHA: "매력",
};

/** ========= 클래스/종족 ========= */
const CLASSES: Record<string, { ko: string; subclasses: string[] }> = {
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

/** ========= 배경/스킬 ========= */
const BACK_KO = ["복사", "사기꾼", "범죄자", "연예인", "시골 영웅", "길드 장인", "귀족", "이방인", "현자", "군인", "부랑아"] as const;
type Background = (typeof BACK_KO)[number] | "-";
const BACK_EN: Record<Exclude<Background, "-">, string> = {
  복사: "Acolyte",
  사기꾼: "Charlatan",
  범죄자: "Criminal",
  연예인: "Entertainer",
  "시골 영웅": "Folk Hero",
  "길드 장인": "Guild Artisan",
  귀족: "Noble",
  이방인: "Outlander",
  현자: "Sage",
  군인: "Soldier",
  부랑아: "Urchin",
};

const SK = {
  KO: {
    Athletics: "운동",
    Acrobatics: "곡예",
    Sleight: "손재주",
    Stealth: "은신",
    Arcana: "비전",
    History: "역사",
    Investigation: "조사",
    Nature: "자연",
    Religion: "종교",
    Animal: "동물 조련",
    Insight: "통찰",
    Medicine: "의학",
    Perception: "포착",
    Survival: "생존",
    Deception: "기만",
    Intimidation: "협박",
    Performance: "공연",
    Persuasion: "설득",
  },
  EN: {
    Athletics: "Athletics",
    Acrobatics: "Acrobatics",
    Sleight: "Sleight of Hand",
    Stealth: "Stealth",
    Arcana: "Arcana",
    History: "History",
    Investigation: "Investigation",
    Nature: "Nature",
    Religion: "Religion",
    Animal: "Animal Handling",
    Insight: "Insight",
    Medicine: "Medicine",
    Perception: "Perception",
    Survival: "Survival",
    Deception: "Deception",
    Intimidation: "Intimidation",
    Performance: "Performance",
    Persuasion: "Persuasion",
  },
};
type SkillKey = keyof typeof SK.KO;

const BG_SKILLS: Record<Exclude<Background, "-">, [SkillKey, SkillKey]> = {
  복사: ["Insight", "Religion"],
  사기꾼: ["Deception", "Sleight"],
  범죄자: ["Deception", "Stealth"],
  연예인: ["Acrobatics", "Performance"],
  "시골 영웅": ["Animal", "Survival"],
  "길드 장인": ["Insight", "Persuasion"],
  귀족: ["History", "Persuasion"],
  이방인: ["Athletics", "Survival"],
  현자: ["Arcana", "History"],
  군인: ["Athletics", "Intimidation"],
  부랑아: ["Sleight", "Stealth"],
};

const CLASS_SK_CHOICE: Record<string, { n: number; list: SkillKey[] }> = {
  바바리안: { n: 2, list: ["Animal", "Athletics", "Intimidation", "Nature", "Perception", "Survival"] },
  바드: { n: 3, list: ["Deception", "Performance", "Persuasion", "Sleight", "Intimidation", "Acrobatics", "Insight"] },
  클레릭: { n: 2, list: ["History", "Insight", "Medicine", "Persuasion", "Religion"] },
  드루이드: { n: 2, list: ["Animal", "Insight", "Medicine", "Nature", "Perception", "Survival"] },
  파이터: { n: 2, list: ["Acrobatics", "Animal", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"] },
  몽크: { n: 2, list: ["Acrobatics", "Athletics", "Insight", "History", "Religion", "Stealth"] },
  팔라딘: { n: 2, list: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"] },
  레인저: { n: 3, list: ["Animal", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"] as any },
  로그: { n: 4, list: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight", "Stealth"] as any },
  소서러: { n: 2, list: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"] },
  워락: { n: 2, list: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"] as any },
  위저드: { n: 2, list: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"] as any },
};

/** ========= 무기 ========= */
const SIMPLE = ["Club", "Dagger", "Greatclub", "Handaxe", "Javelin", "Light Crossbow", "Light Hammer", "Mace", "Quarterstaff", "Shortbow", "Sickle", "Spear"] as const;
const SIMPLE_KO: Record<(typeof SIMPLE)[number], string> = {
  Club: "곤봉",
  Dagger: "단검",
  Greatclub: "대형 곤봉",
  Handaxe: "손도끼",
  Javelin: "투창",
  "Light Crossbow": "경쇠뇌",
  "Light Hammer": "경량 망치",
  Mace: "철퇴",
  Quarterstaff: "육척봉",
  Shortbow: "단궁",
  Sickle: "낫",
  Spear: "창",
};
const MARTIAL = ["Battleaxe","Flail","Scimitar","Greataxe","Greatsword","Halberd","Hand Crossbow","Heavy Crossbow","Longbow","Longsword","Maul","Morningstar","Pike","Rapier","Glaive","Shortsword","Trident","Warhammer","War Pick"] as const;
const MARTIAL_KO: Record<(typeof MARTIAL)[number], string> = {
  Battleaxe: "전투 도끼", Flail: "도리깨", Scimitar: "협도", Greataxe: "대형 도끼", Greatsword: "대검",
  Halberd: "미늘창", "Hand Crossbow": "손 쇠뇌", "Heavy Crossbow": "중쇠뇌", Longbow: "장궁", Longsword: "장검",
  Maul: "대형 망치", Morningstar: "모닝스타", Pike: "장창", Rapier: "레이피어", Glaive: "언월도",
  Shortsword: "소검", Trident: "삼지창", Warhammer: "전쟁 망치", "War Pick": "전쟁 곡괭이"
};
const ALL_WEAPONS_EN = [...SIMPLE, ...MARTIAL] as const;
const WEAPON_KO: Record<(typeof ALL_WEAPONS_EN)[number], string> = { ...SIMPLE_KO, ...MARTIAL_KO };
const SHIELD_KO = "방패";

const RACE_WEAP_KO: Record<string, string[]> = {
  인간: ["언월도", "미늘창", "장창", "창"],
  하프엘프: ["언월도", "미늘창", "장창", "창"],
  엘프: ["단검", "단궁", "장검", "장궁"],
  드로우: ["레이피어", "소검", "손 쇠뇌"],
  기스양키: ["대검", "장검", "소검"],
  드워프: ["경량 망치", "손도끼", "전투 도끼", "전쟁 망치"],
};
const RACE_SHIELD = new Set(["인간", "하프엘프"]);
const CLASS_WEAP_KO: Record<string, string[]> = {
  드루이드: ["곤봉", "낫", "단검", "언월도", "육척봉", "투창", "창", "철퇴"],
  몽크: Object.values(SIMPLE_KO).concat("소검"),
  바드: Object.values(SIMPLE_KO).concat(["레이피어", "소검", "장검", "손 쇠뇌"]),
  로그: Object.values(SIMPLE_KO).concat(["레이피어", "소검", "장검", "손 쇠뇌"]),
  소서러: ["단검", "육척봉", "경쇠뇌"],
  위저드: ["단검", "육척봉", "경쇠뇌"],
  워락: Object.values(SIMPLE_KO),
  클레릭: Object.values(SIMPLE_KO),
  레인저: Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  바바리안: Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  팔라딘: Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  파이터: Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
};
const CLASS_SHIELD = new Set(["파이터","팔라딘","클레릭","레인저","바바리안","드루이드"]);

// 서브클래스 추가 숙련
const SUBCLASS_EXTRA_WEAPONS: Record<string, string[]> = {
  "클레릭:폭풍 권역": Object.values(MARTIAL_KO),
  "클레릭:전쟁 권역": Object.values(MARTIAL_KO),
  "클레릭:죽음 권역": Object.values(MARTIAL_KO),
  "위저드:칼날 노래": ["단검","장검","레이피어","협도","소검","낫"],
};

/** ========= 스타일 ========= */
const btn: React.CSSProperties = { padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:10, background:"#fff", cursor:"pointer" };
const btnPrimary: React.CSSProperties = { ...btn, background:"#111827", color:"#fff", borderColor:"#111827" };
const btnSecondary: React.CSSProperties = { ...btn, background:"#f3f4f6" };
const input: React.CSSProperties = { padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, minWidth:220 };
const select: React.CSSProperties = { ...input };
const row: React.CSSProperties = { display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" };
const label: React.CSSProperties = { color:"#6b7280", width:90 };
const badge: React.CSSProperties = { display:"inline-block", background:"#111827", color:"#fff", fontSize:12, padding:"2px 6px", borderRadius:6 };
/** ========= 포인트바이 ========= */
function rollPointBuyRaw(): Record<Abil, number> {
  const vals = [8,8,8,8,8,8]; let budget = 27; const cost = (v:number)=>(v>=13?2:1);
  let guard = 2000;
  while(budget>0 && guard-- > 0){
    const i = rand(6); const cur=vals[i]; if(cur>=15) continue;
    const c=cost(cur); if(budget<c){ const any=vals.some(v=>(v<13&&budget>=1)||(v>=13&&v<15&&budget>=2)); if(!any) break; continue; }
    vals[i]+=1; budget-=c;
  }
  return { STR:vals[0], DEX:vals[1], CON:vals[2], INT:vals[3], WIS:vals[4], CHA:vals[5] };
}
type PBResult = { base: Record<Abil,number>; bonus2: Abil; bonus1: Abil; final: Record<Abil,number> };
function rollPointBuyWithBonuses(): PBResult {
  const base=rollPointBuyRaw(); let b2=ABILS[rand(6)]; let b1=ABILS[rand(6)]; while(b1===b2) b1=ABILS[rand(6)];
  const final={...base}; final[b2]=Math.min(17, final[b2]+2); final[b1]=Math.min(17, final[b1]+1);
  return { base, bonus2:b2, bonus1:b1, final };
}

/** ========= Dice ========= */
function parseDice(expr: string): { n:number; m:number; mod:number } | null {
  const t=expr.trim().replace(/\s+/g,''); const m=t.match(/^(\d+)[dD](\d+)([+-]\d+)?$/); if(!m) return null;
  const n=Math.max(1,parseInt(m[1],10)); const sides=Math.max(2,parseInt(m[2],10)); const mod=m[3]?parseInt(m[3],10):0;
  return { n, m:sides, mod };
}
function rollNdM(expr: string): { rolls:number[]; total:number } | null {
  const p = parseDice(expr); if(!p) return null;
  const rolls = Array.from({length:p.n}, ()=> 1+rand(p.m));
  const total = rolls.reduce((a,b)=>a+b,0)+p.mod;
  return { rolls, total };
}

/** ========= 무기/기술 계산 ========= */
function randomAny2KO(): string[] {
  const picks = shuffle(ALL_WEAPONS_EN).slice(0, 2);
  return picks.map((w) => WEAPON_KO[w]);
}
function computeWeapons(raceKo: string, classKo: string, subclass?: string): string[] {
  const racePool = RACE_WEAP_KO[raceKo] || [];
  const classPool = CLASS_WEAP_KO[classKo] || [];
  let pool = Array.from(new Set([...racePool, ...classPool]));
  if (classKo === "몽크") pool = Array.from(new Set([...pool, "비무장 공격"]));
  const hasShield = (raceKo && RACE_SHIELD.has(raceKo)) || (classKo && CLASS_SHIELD.has(classKo));
  if (hasShield && !pool.includes(SHIELD_KO)) pool.push(SHIELD_KO);
  if (classKo && subclass) {
    const key = `${classKo}:${subclass}`;
    if (SUBCLASS_EXTRA_WEAPONS[key]) pool = Array.from(new Set([...pool, ...SUBCLASS_EXTRA_WEAPONS[key]]));
  }
  if (pool.length === 0) return randomAny2KO();
  const pickN = pool.length <= 8 ? 1 : 2;
  return shuffle(pool).slice(0, Math.min(pickN, pool.length));
}
function computeWeaponPoolNow(raceKo: string, classKo: string, subclass?: string): string[] {
  const racePool = RACE_WEAP_KO[raceKo] || [];
  const classPool = CLASS_WEAP_KO[classKo] || [];
  let pool = Array.from(new Set([...racePool, ...classPool]));
  if (classKo === "몽크") pool = Array.from(new Set([...pool, "비무장 공격"]));
  const hasShield = (raceKo && RACE_SHIELD.has(raceKo)) || (classKo && CLASS_SHIELD.has(classKo));
  if (hasShield && !pool.includes(SHIELD_KO)) pool.push(SHIELD_KO);
  if (classKo && subclass) {
    const key = `${classKo}:${subclass}`;
    if (SUBCLASS_EXTRA_WEAPONS[key]) pool = Array.from(new Set([...pool, ...SUBCLASS_EXTRA_WEAPONS[key]]));
  }
  if (pool.length === 0) pool = Object.values(WEAPON_KO);
  return pool.sort();
}
function computeClassSkills(classKo: string, bgSel: Background): SkillKey[] {
  if (bgSel === "-") return [];
  const cfg = CLASS_SK_CHOICE[classKo];
  if (!cfg) return [];
  const [bg1, bg2] = BG_SKILLS[bgSel];
  const pool = cfg.list.filter((s) => s !== bg1 && s !== bg2);
  return sampleN(pool, cfg.n);
}

/** ========= 재주(Feat) — 슬롯/풀/즉시 재굴림 ========= */
type FeatId =
  | "ASI" | "Athlete" | "ElementalAdept" | "LightlyArmored" | "MagicInitiate"
  | "MartialAdept" | "ModeratelyArmored" | "Resilient" | "RitualCaster"
  | "Skilled" | "SpellSniper" | "TavernBrawler" | "WeaponMaster";

const SPELL_SNIPER_CANTRIPS = ["뼛속 냉기","섬뜩한 파동","화염살","서리 광선","전격의 손아귀","가시 채찍"] as const;
const ELEMENT_TYPES = ["산성","냉기","화염","번개","천둥"] as const;

type FeatSlot =
  | { kind:"ABIL_PAIR" }
  | { kind:"ONE_OF"; label:string; pool:string[] }
  | { kind:"N_OF"; label:string; pool:string[]; n:number }
  | { kind:"CLASS_MI"; label:string; classId:"Bard"|"Cleric"|"Druid"|"Sorcerer"|"Warlock"|"Wizard" };

const FEAT_SCHEMA: Record<FeatId, FeatSlot[]> = {
  ASI: [{ kind:"ABIL_PAIR" }],
  Athlete: [{ kind:"ONE_OF", label:"운동선수: 능력", pool:["근력","민첩"] }],
  ElementalAdept: [{ kind:"ONE_OF", label:"원소숙련", pool:[...ELEMENT_TYPES] as unknown as string[] }],
  LightlyArmored: [{ kind:"ONE_OF", label:"경갑 무장: 능력", pool:["근력","민첩"] }],
  MagicInitiate: [
    { kind:"ONE_OF", label:"마법입문: 클래스", pool:["Bard","Cleric","Druid","Sorcerer","Warlock","Wizard"] },
    { kind:"CLASS_MI", label:"마법입문: 주문 선택", classId:"Wizard" },
  ],
  MartialAdept: [{ kind:"N_OF", label:"무예 숙련", pool:["사령관의 일격","무장 해제 공격","교란의 일격","날렵한 발놀림","속임수 공격","도발 공격","전투 기법 공격","위협 공격","정밀 공격","밀치기 공격","고양 응수","휩쓸기","다리 걸기 공격"], n:2 }],
  ModeratelyArmored: [{ kind:"ONE_OF", label:"평갑 무장: 능력", pool:["근력","민첩"] }],
  Resilient: [{ kind:"ONE_OF", label:"저항력: 능력", pool:["근력","민첩","건강","지능","지혜","매력"] }],
  RitualCaster: [{ kind:"N_OF", label:"의식 시전자", pool:["망자와 대화","소환수 찾기","활보","도약 강화","변장","동물과 대화"], n:2 }],
  Skilled: [{ kind:"N_OF", label:"숙련가", pool:Object.keys(SK.KO) as string[], n:3 }],
  SpellSniper: [{ kind:"ONE_OF", label:"주문 저격수", pool:[...SPELL_SNIPER_CANTRIPS] as unknown as string[] }],
  TavernBrawler: [{ kind:"ONE_OF", label:"술집 싸움꾼: 능력", pool:["근력","건강"] }],
  WeaponMaster: [
    { kind:"ONE_OF", label:"무기의 달인: 능력", pool:["근력","민첩"] },
    { kind:"N_OF", label:"무기의 달인: 무기", pool:[...new Set(Object.values(WEAPON_KO))] as string[], n:4 },
  ],
};

function getMIClassSpellPools(classId:"Bard"|"Cleric"|"Druid"|"Sorcerer"|"Warlock"|"Wizard"){
  const WIZ_C = ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","마법사의 손","하급 환영","진실의 일격"];
  const WIZ_1 = ["불타는 손길","인간형 매혹","오색 보주","오색 빛보라","변장","신속 후퇴","거짓 목숨","깃털 낙하","소환수 찾기","안개구름","기름칠","얼음 칼","도약 강화","활보","마법사의 갑옷","마력탄","선악 보호","독 광선","방어막","수면","타샤의 끔찍한 웃음","천둥파","마녀의 화살"];
  switch(classId){
    case "Bard": return { cantrips: ["신랄한 조롱","도검 결계","마법사의 손","진실의 일격","친구","춤추는 빛","빛","하급 환영"], level1: ["동물 교감","액운","인간형 매혹","상처 치료","변장","불협화음의 속삭임","요정불","깃털 낙하","치유의 단어","영웅심","활보","수면","동물과 대화","타샤의 끔찍한 웃음","천둥파"] };
    case "Cleric": return { cantrips: ["기적술","신성한 불길","인도","저항","빛","도검 결계","불꽃 생성"], level1: ["신앙의 방패","선악 보호","성역","액운","명령","축복","상처 치료","치유의 단어","유도 화살","상처 유발","물 생성 또는 제거"] };
    case "Druid": return { cantrips: ["인도","독 분사","불꽃 생성","저항","마법 곤봉","가시 채찍"], level1: ["얼음 칼","휘감기","안개구름","동물과 대화","동물 교감","인간형 매혹","천둥파","치유의 단어","상처 치료","요정불","도약 강화","활보","맛있는 열매","물 생성 또는 제거"] };
    case "Sorcerer": return { cantrips: WIZ_C, level1: WIZ_1 };
    case "Warlock": return { cantrips: ["도검 결계","뼛속 냉기","섬뜩한 파동","친구","마법사의 손","하급 환영","독 분사","진실의 일격"], level1: ["아거티스의 갑옷","하다르의 팔","인간형 매혹","신속 후퇴","지옥의 질책","주술","선악 보호","마녀의 화살"] };
    default: return { cantrips: WIZ_C, level1: WIZ_1 };
  }
}

type FeatPick = { name: string; lines: string[] };
function rollFeat(excludedItems:Set<string>): FeatPick {
  const ids = Object.keys(FEAT_SCHEMA) as (keyof typeof FEAT_SCHEMA)[];
  const feat = choice(ids);
  const schema = FEAT_SCHEMA[feat];
  const lines: string[] = [];
  const AB = ["근력","민첩","건강","지능","지혜","매력"];

  const pickOne = (pool:string[])=>{
    const filtered = pool.filter(x=>!excludedItems.has(x));
    return filtered.length? choice(filtered): choice(pool);
  };

  for(const s of schema){
    if(s.kind==="ABIL_PAIR"){
      const a = pickOne(AB);
      const b = pickOne(AB.filter(x=>x!==a));
      lines.push(`능력치 +1: ${a}`);
      lines.push(`능력치 +1: ${b}`);
    } else if(s.kind==="ONE_OF"){
      const v = pickOne(s.pool);
      lines.push(`${s.label}: ${v}`);
    } else if(s.kind==="N_OF"){
      const taken: string[] = [];
      for(let i=0;i<s.n;i++){
        const v = pickOne(s.pool.filter(x=>!taken.includes(x)));
        taken.push(v);
        lines.push(`${s.label}: ${v}`);
      }
    } else if(s.kind==="CLASS_MI"){
      const clsLine = lines.find(l=>l.startsWith("마법입문: 클래스"));
      const cls = (clsLine?.split(": ").pop() as any) || "Wizard";
      const { cantrips, level1 } = getMIClassSpellPools(cls);
      const c1 = pickOne(cantrips);
      const c2 = pickOne(cantrips.filter(x=>x!==c1));
      const l1 = pickOne(level1);
      lines.push(`${s.label}: 소마법 ${c1}`);
      lines.push(`${s.label}: 소마법 ${c2}`);
      lines.push(`${s.label}: 1레벨 ${l1}`);
    }
  }
  const nice = feat==="ASI" ? "능력치 향상" :
               feat==="MagicInitiate" ? "마법 입문" :
               feat==="MartialAdept" ? "무예 숙련" :
               feat==="SpellSniper" ? "주문 저격수" :
               feat==="Skilled" ? "숙련가" :
               feat==="WeaponMaster" ? "무기의 달인" :
               feat==="Athlete" ? "운동선수" :
               feat==="Resilient" ? "저항력" :
               feat==="RitualCaster" ? "의식 시전자" :
               feat==="LightlyArmored" ? "경갑 무장" :
               feat==="ModeratelyArmored" ? "평갑 무장" :
               feat==="ElementalAdept" ? "원소 숙련" : String(feat);
  return { name: nice, lines };
}

/** ========= 승자 정하기 ========= */
function rollUniqueD20(names: string[]): { lines: string[]; winner: string } {
  const rolls = new Map<string, number>();
  const used = new Set<number>();
  for(const n of names){
    let r = 1+rand(20);
    while(used.has(r)) r = 1+rand(20);
    used.add(r); rolls.set(n, r);
  }
  const sorted = [...rolls.entries()].sort((a,b)=>b[1]-a[1]);
  return { lines: sorted.map(([n,r])=> `${n}: ${r}`), winner: sorted[0]?.[0] ?? "" };
}
/** ========= 성장/주문 — 핵심 풀 & 규칙 ========= */
const WIZ_CANTRIPS = ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","마법사의 손","하급 환영","진실의 일격","폭음의 검","망자의 종소리"];
const WIZ_L1 = ["불타는 손길","인간형 매혹","오색 보주","오색 빛보라","변장","신속 후퇴","거짓 목숨","깃털 낙하","소환수 찾기","안개구름","기름칠","얼음 칼","도약 강화","활보","마법사의 갑옷","마력탄","선악 보호","독 광선","방어막","수면","타샤의 끔찍한 웃음","천둥파","마녀의 화살"];
const WIZ_L2 = ["비전 자물쇠","실명","잔상","단검 구름","광기의 왕관","어둠","암시야","생각 탐지","확대/축소","화염 구체","돌풍","인간형 포박","투명","노크","마법 무기","멜프의 산성 화살","거울 분신","안개 걸음","환영력","약화 광선","작열 광선","투명체 감지","파쇄","거미줄","그림자 검"];

const AT_L1_ONLY = ["인간형 매혹","오색 빛보라","변장","타샤의 끔찍한 웃음","수면"];
const AT_MIX_7PLUS = ["잔상","광기의 왕관","인간형 포박","투명","거울 분신","환영력", ...AT_L1_ONLY];

const EK_L1 = ["불타는 손길","오색 보주","마력탄","마법사의 갑옷","선악 보호","방어막","천둥파","마녀의 화살"];
const EK_L2_ADD_7 = ["멜프의 산성 화살","비전 자물쇠","어둠","돌풍","작열 광선","파쇄"];

const MONK_ELE_L3 = [
  "산의 냉기","불 뱀의 송곳니","얼음 조형","폭풍의 손길",
  "서리의 검","네 천둥의 주먹","굳건한 대기의 주먹","강풍 영혼의 돌진",
  "원소 균형의 구체","휩쓰는 재의 일격","물 채찍",
];
const MONK_ELE_L6_ADD = ["북풍의 손아귀","불지옥의 포옹","정상의 징"];
const MONK_ELE_L11_ADD = ["불사조의 불꽃","안개 태세","바람 타기"];

type GrowthSlot = { label:string; pool:string[]; pick?:string; poolId:string };
type GrowthPlan = { slots: GrowthSlot[] };

function knownCountAT(lv:number){ const t: Record<number,number> = {4:3,5:4,6:4,7:4,8:5,9:6,10:6,11:7,12:8}; return t[lv] ?? 0; }
function knownCountEK(lv:number){ const t: Record<number,number> = {4:3,5:4,6:4,7:4,8:6,9:7,10:7,11:8,12:9}; return t[lv] ?? 0; }
function knownCountMonkEle(lv:number){ if(lv<=6) return 3; if(lv<=9) return 4; if(lv<=11) return 5; return 6; }
function bardKnownAt(lv:number){ return lv===1?4 : 4 + (lv-1); }
function sorcKnownAt(lv:number){ return lv===1?2 : 2 + (lv-1); }
function warlockKnownAt(lv:number){ return lv===1?2 : 2 + (lv-1); }
function rangerKnownAt(lv:number){ if(lv<2) return 0; let k=2; for(let i=3;i<=lv;i++) if(i%2===1) k++; return k; }

function mkPlan(classKo:string, subKo:string, lv:number, spellPicks:number): GrowthPlan {
  const slots: GrowthSlot[] = [];
  const addSlots = (label:string, pool:string[], n:number, poolId:string)=>{
    for(let i=0;i<n;i++) slots.push({ label, pool, poolId });
  };

  /** 파이터: 전투의 대가/비전 궁수/비술 기사 */
  if(classKo==="파이터" && subKo==="전투의 대가"){
    const maneuvers = ["사령관의 일격","무장 해제 공격","교란의 일격","날렵한 발놀림","속임수 공격","도발 공격","전투 기법 공격","위협 공격","정밀 공격","밀치기 공격","고양 응수","휩쓸기","다리 걸기 공격"];
    if(lv===3) addSlots("전투 기법", maneuvers, 3, "BM");
    if(lv===7) addSlots("전투 기법", maneuvers, 2, "BM");
    if(lv===10) addSlots("전투 기법", maneuvers, 2, "BM");
  }
  if(classKo==="파이터" && subKo==="비전 궁수"){
    const shots = ["추방 화살","현혹 화살","폭발 화살","약화 화살","속박 화살","추적 화살","그림자 화살","관통 화살"];
    if(lv===3){ addSlots("주문(소마법)", ["인도","빛","진실의 일격"], 1, "EA-SCAN"); addSlots("비전 사격", shots, 3, "EA-SHOT"); }
    if(lv===7) addSlots("비전 사격", shots, 1, "EA-SHOT");
    if(lv===10) addSlots("비전 사격", shots, 1, "EA-SHOT");
  }
  if(classKo==="파이터" && subKo==="비술 기사"){
    if(lv===3){ addSlots("소마법(위저드)", WIZ_CANTRIPS, 2, "EK-C"); addSlots("비술기사 주문(1레벨)", EK_L1, 2, "EK-1"); addSlots("확장(위저드 1레벨)", WIZ_L1, 1, "EK-W1"); }
    if(lv===4) addSlots("비술기사 주문", EK_L1, 1, "EK-1");
    if(lv===7) addSlots("비술기사 주문", [...EK_L1, ...EK_L2_ADD_7], 2, "EK-1+2");
    if(lv===8) addSlots("확장(위저드 2레벨)", WIZ_L2, 1, "EK-W2");
    if(lv===10){ addSlots("소마법(위저드)", WIZ_CANTRIPS, 1, "EK-C"); addSlots("비술기사 주문", [...EK_L1, ...EK_L2_ADD_7], 1, "EK-1+2"); }
    if(lv===11) addSlots("비술기사 주문", [...EK_L1, ...EK_L2_ADD_7], 1, "EK-1+2");
    if(lv>=4){ const k = knownCountEK(lv); if(k>0) addSlots(`${L.ko.replaceRoll} (1d${k})`, [`교체: 1..${k} 중 제거 → 허용 주문 1개 추가`], 1, "EK-REP"); }
  }

  /** 로그: 비전 괴도 */
  if(classKo==="로그" && subKo==="비전 괴도"){
    if(lv===3){ addSlots("소마법(위저드)", WIZ_CANTRIPS, 2, "AT-C"); addSlots("비전 괴도(1레벨)", AT_L1_ONLY, 2, "AT-1"); addSlots("확장(위저드 1레벨)", WIZ_L1, 1, "AT-W1"); }
    if(lv===4) addSlots("비전 괴도(1레벨)", AT_L1_ONLY, 1, "AT-1");
    if(lv===7) addSlots("비전 괴도(확장 풀)", AT_MIX_7PLUS, 1, "AT-1/2");
    if(lv===8) addSlots("확장(위저드 2레벨)", WIZ_L2, 1, "AT-W2");
    if(lv===10){ addSlots("소마법(위저드)", WIZ_CANTRIPS, 1, "AT-C"); addSlots("비전 괴도(확장 풀)", AT_MIX_7PLUS, 1, "AT-1/2"); }
    if(lv===11) addSlots("비전 괴도(확장 풀)", AT_MIX_7PLUS, 1, "AT-1/2");
    if(lv>=4){ const k = knownCountAT(lv); if(k>0) addSlots(`${L.ko.replaceRoll} (1d${k})`, [`교체: 1..${k} 중 제거 → 허용 주문 1개 추가`], 1, "AT-REP"); }
  }

  /** 몽크: 사원소(3레벨 기본 3개), 교체 4레벨부터 */
  if(classKo==="몽크" && subKo==="사원소의 길"){
    const pool = [...MONK_ELE_L3]; if(lv>=6) pool.push(...MONK_ELE_L6_ADD); if(lv>=11) pool.push(...MONK_ELE_L11_ADD);
    const nDefault = lv===3 ? 3 : Math.max(0, spellPicks);
    addSlots("원소의 길", pool, nDefault, "ME");
    if(lv>=4){ const k = knownCountMonkEle(lv); addSlots(`${L.ko.replaceRoll} (1d${k})`, [`교체: 1..${k} 중 제거 → 원소 주문 풀에서 1개 추가`], 1, "ME-REP"); }
  }

  /** 바바리안: 야생의 심장 — 4레벨부터 교체 가능 → 3~12레벨 계속 굴림 */
  if(classKo==="바바리안" && subKo==="야생의 심장"){
    const HEARTS = ["곰의 심장","독수리의 심장","엘크의 심장","호랑이의 심장","늑대의 심장"];
    if(lv>=3) addSlots("야수의 심장", HEARTS, 1, "BH-HEART"); // 매 레벨 굴림(교체 가정)
    if(lv===6 || lv===10){
      const ASPECTS = ["곰","침팬지","악어","독수리","엘크","벌꿀오소리","말","호랑이","늑대","울버린"];
      addSlots("야수의 상", ASPECTS, 1, "BH-ASPECT");
    }
  }

  /** 레인저 — 1/2/6/10 기본 선택들 + 무리지기(상시 교체 랜덤) */
  if(classKo==="레인저"){
    const FAVORED = ["현상금 사냥꾼","장막의 수호자","마법사 파괴자","레인저 나이트","성스러운 추적자"];
    const EXPLORER = ["야수 조련사","도시 추적자","황무지 방랑자:냉기","황무지 방랑자:화염","황무지 방랑자:독"];
    const STYLE = ["궁술","방어술","결투술","쌍수 전투"];

    if(lv===1){ addSlots("선호하는 적", FAVORED, 1, "RNG-FAV"); addSlots("타고난 탐험가", EXPLORER, 1, "RNG-EXP"); }
    if(lv===2){ addSlots("전투 방식", STYLE, 1, "RNG-STYLE"); }
    if(lv===6){ addSlots("선호하는 적", FAVORED, 1, "RNG-FAV"); addSlots("타고난 탐험가", EXPLORER, 1, "RNG-EXP"); }
    if(lv===10){ addSlots("선호하는 적", FAVORED, 1, "RNG-FAV"); addSlots("타고난 탐험가", EXPLORER, 1, "RNG-EXP"); }

    // 무리지기: 3~12레벨 계속 굴림(교체 가능)
    if(subKo==="무리지기" && lv>=3){
      const SWARM = ["꿀벌 군단","해파리 떼","나방 쇄도"];
      addSlots("무리지기 대군", SWARM, 1, "RNG-SWARM");
    }

    const k = rangerKnownAt(lv);
    if(k>0) addSlots(`${L.ko.replaceRoll} (1d${k})`, [`교체: 1..${k} 중 제거 → 레벨 허용 주문 중 1개 추가`], 1, "RNG-REP");
  }

  /** 기타 캐스터 교체 라인(안내) */
  if(classKo==="바드"){ const k=bardKnownAt(lv); if(k>0) addSlots(`${L.ko.replaceRoll} (1d${k})`, [`교체: 1..${k} 중 제거 → 허용 주문 1개 추가`], 1, "BRD-REP"); }
  if(classKo==="소서러"){ const k=sorcKnownAt(lv); if(k>0) addSlots(`${L.ko.replaceRoll} (1d${k})`, [`교체: 1..${k} 중 제거 → 허용 주문 1개 추가`], 1, "SOR-REP"); }
  if(classKo==="워락"){ const k=warlockKnownAt(lv); if(k>0) addSlots(`${L.ko.replaceRoll} (1d${k})`, [`교체: 1..${k} 중 제거 → 허용 주문 1개 추가`], 1, "WLK-REP"); }

  /** 자유 추가 Picks */
  if(spellPicks>0){
    if(classKo==="위저드") addSlots("주문(자유)", [...WIZ_L1, ...WIZ_L2], spellPicks, "WIZ-FLEX");
    else if(classKo==="바드") addSlots("주문(자유)", ["저주 부여","공포","죽은 척","결계 문양","최면 문양","식물 성장","망자와 대화","악취 구름","혼란","차원문","자유 이동","중급 투명","변신"], spellPicks, "BRD-FLEX");
    else if(classKo==="워락") addSlots("주문(자유)", ["아거티스의 갑옷","하다르의 팔","마녀의 화살","단검 구름","광기의 왕관","어둠","노예화","인간형 포박","투명","거울 분신","안개 걸음","약화 광선","파쇄","주문 방해","공포","비행 부여","기체 형태","하다르의 굶주림"], spellPicks, "WLK-FLEX");
    else if(classKo==="소서러") addSlots("주문(자유)", [...WIZ_L1, ...WIZ_L2], spellPicks, "SOR-FLEX");
    else if(classKo==="레인저") addSlots("주문(자유)", ["동물 교감","속박의 일격","가시 세례","사냥꾼의 표식","나무껍질 피부","암시야","하급 회복","신출귀몰","침묵","가시밭","포화 소환","번개 화살","식물 성장"], spellPicks, "RNG-FLEX");
  }

  return { slots };
}
function fillPlanWithRandom(plan: GrowthPlan, excluded:Set<string>): GrowthPlan {
  const slots = plan.slots.map(s=>{
    const pool = s.pool.filter(x=>!excluded.has(`${s.label}:${x}`));
    const v = pool.length ? choice(pool) : (s.pool[0]||"");
    return { ...s, pick: `${s.label}: ${v}` };
  });
  return { slots };
}

/** ========= 메인 ========= */
export default function App() {
  const [lang, setLang] = useState<Lang>("ko");

  // 결과 상태
  const [raceKey, setRaceKey] = useState<keyof typeof RACES | "-">("-");
  const [subraceKo, setSubraceKo] = useState<string>("-");
  const [classKey, setClassKey] = useState<keyof typeof CLASSES | "-">("-");
  const [subclassKo, setSubclassKo] = useState<string>("-");
  const [bg, setBg] = useState<Background>("-");
  const [stats, setStats] = useState<Record<Abil, number>>({ STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 });
  const [pbBonus2, setPbBonus2] = useState<Abil | null>(null);
  const [pbBonus1, setPbBonus1] = useState<Abil | null>(null);
  const [weaponsKO, setWeaponsKO] = useState<string[]>([]);
  const [skills, setSkills] = useState<SkillKey[]>([]);

  // 재주
  const [featName, setFeatName] = useState<string>("");
  const [featLines, setFeatLines] = useState<string[]>([]);
  const [featExcluded, setFeatExcluded] = useState<Set<string>>(new Set());

  // 수동 픽커
  const [showWeaponPicker, setShowWeaponPicker] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [tempWeapons, setTempWeapons] = useState<Set<string>>(new Set());
  const [tempSkills, setTempSkills] = useState<Set<SkillKey>>(new Set());

  // Dice / Versus
  const [diceExpr, setDiceExpr] = useState<string>("1d20");
  const [diceDetail, setDiceDetail] = useState<string>("");
  const [names, setNames] = useState<string>("");
  const [vsLines, setVsLines] = useState<string[]>([]);
  const [vsWinner, setVsWinner] = useState<string>("");

  // 성장
  const [growClass, setGrowClass] = useState<keyof typeof CLASSES | "-">("-");
  const [growSub, setGrowSub] = useState<string>("-");
  const [growLevel, setGrowLevel] = useState<number>(3);
  const [growSpellCount, setGrowSpellCount] = useState<number>(1);
  const [growPlan, setGrowPlan] = useState<GrowthPlan>({ slots: [] });
  const [growExcluded, setGrowExcluded] = useState<Set<string>>(new Set());

  // 락
  const [lockRace, setLockRace] = useState(false);
  const [lockClass, setLockClass] = useState(false);
  const [lockBG, setLockBG] = useState(false);
  const [lockWeapons, setLockWeapons] = useState(false);
  const [lockSkills, setLockSkills] = useState(false);

  // 라벨/헬퍼
  const T = L[lang];
  const abilLabel = (k: Abil) => (lang === "ko" ? abilKo[k] : (k as string));
  const skillLabel = (s: SkillKey) => (lang === "ko" ? SK.KO[s] : SK.EN[s]);
  const raceOut  = raceKey  === "-" ? "" : (lang === "ko" ? RACES[raceKey].ko  : String(raceKey));
  const classOut = classKey === "-" ? "" : (lang === "ko" ? CLASSES[classKey].ko : String(classKey));
  const bgLabel = (b: Background) => b==="-" ? "-" : (lang==="ko" ? b : BACK_EN[b]);

  const raceOptions = Object.keys(RACES) as (keyof typeof RACES)[];
  const classOptions = Object.keys(CLASSES) as (keyof typeof CLASSES)[];
  const allSkills = Object.keys(SK.KO) as SkillKey[];

  /** ===== 롤 ===== */
  function rollRace() {
    if (lockRace) return;
    const r = choice(raceOptions);
    setRaceKey(r);
    setSubraceKo(RACES[r].subs ? choice(RACES[r].subs!) : "-");
  }
  function rollClass() {
    if (lockClass) return;
    const k = choice(classOptions);
    setClassKey(k);
    setSubclassKo(choice(CLASSES[k].subclasses));
  }
  function rollBackground() { if (!lockBG) setBg(choice(BACK_KO)); }
  function rollStatsBtn() { const { bonus2, bonus1, final } = rollPointBuyWithBonuses(); setPbBonus2(bonus2); setPbBonus1(bonus1); setStats(final); }
  function rollWeaponsBtn() {
    if (lockWeapons) return;
    const raceKo = raceKey === "-" ? "" : RACES[raceKey].ko;
    const picks = computeWeapons(raceKo, classKey === "-" ? "" : CLASSES[classKey].ko, subclassKo);
    setWeaponsKO(picks);
  }
  function rollAny2WeaponsBtn() { if(!lockWeapons) setWeaponsKO(randomAny2KO()); }
  function rollSkillsBtn() {
    if (lockSkills) return;
    const classKo = classKey === "-" ? "" : CLASSES[classKey].ko;
    const picks = computeClassSkills(classKo, bg);
    setSkills(picks);
  }
  function rollAll() {
    if (!lockRace) { const r = choice(raceOptions); setRaceKey(r); setSubraceKo(RACES[r].subs ? choice(RACES[r].subs!) : "-"); }
    if (!lockClass) { const k = choice(classOptions); setClassKey(k); setSubclassKo(choice(CLASSES[k].subclasses)); }
    if (!lockBG) setBg(choice(BACK_KO));
    rollStatsBtn();
    rollWeaponsBtn();
    rollSkillsBtn();
  }

  /** ===== 주사위/승자 ===== */
  function handleRollDice(){
    const r = rollNdM(diceExpr);
    if(!r){ setDiceDetail(lang==="ko"?"형식 오류":"Invalid format"); return; }
    setDiceDetail(`${r.rolls.join(" + ")} = ${r.total}`);
  }
  function handleVersus(){
    const list = names.split(/[, \n\r\t]+/).map(s=>s.trim()).filter(Boolean);
    if(list.length<2){ setVsLines([]); setVsWinner(""); return; }
    const r = rollUniqueD20(list);
    setVsLines(r.lines);
    setVsWinner(r.winner);
  }

  /** ===== 재주 ===== */
  function rollFeatBtn(){
    const { name, lines } = rollFeat(featExcluded);
    setFeatName(name);
    setFeatLines(lines);
  }
  function excludeFeatItem(line: string){
    // line은 보통 "라벨: 값" → 값만 추출하여 제외 풀에 추가
    const val = line.includes(":") ? line.split(":").slice(1).join(":").trim() : line.trim();
    const next = new Set(featExcluded); next.add(val);
    setFeatExcluded(next);
    rollFeatBtn(); // 즉시 재굴림
  }
  function unexcludeFeatItem(val: string){
    const next = new Set(featExcluded); next.delete(val);
    setFeatExcluded(next);
    rollFeatBtn(); // 즉시 재굴림
  }

  /** ===== 성장 ===== */
  function doSuggestGrowth(){
    if(growClass === "-"){ setGrowPlan({slots:[]}); return; }
    const classKo = CLASSES[growClass].ko;
    const subKo = growSub === "-" ? "-" : growSub;
    const plan = mkPlan(classKo, subKo, growLevel, growSpellCount);
    const filled = fillPlanWithRandom(plan, growExcluded);
    setGrowPlan(filled);
  }
  function excludeGrowthItem(pickLine:string){
    const key = pickLine.trim(); // "라벨: 값"
    const next = new Set(growExcluded); next.add(key);
    setGrowExcluded(next);
    doSuggestGrowth(); // 즉시 재굴림
  }
  function unexcludeGrowthItem(key:string){
    const next = new Set(growExcluded); next.delete(key);
    setGrowExcluded(next);
    doSuggestGrowth();
  }

  /** ===== 렌더 ===== */
  const weaponPoolNow = computeWeaponPoolNow(
    raceKey==="-"?"":RACES[raceKey].ko,
    classKey==="-"?"":CLASSES[classKey].ko,
    subclassKo
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", justifyContent:"center", alignItems:"flex-start", background:"#fff" }}>
      <div style={{ width:"min(1200px, 96%)", margin:"24px auto", fontFamily:"ui-sans-serif, system-ui" }}>
        <header style={{ textAlign:"center", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ width:120 }} />
          <div>
            <h1 style={{ fontSize:28, fontWeight:800, margin:0 }}>{T.title}</h1>
            <p style={{ color:"#6b7280", margin:"6px 0 0" }}>{T.sub}</p>
          </div>
          <div style={{ width:120, textAlign:"right" }}>
            <button onClick={()=>setLang(lang==='ko'?'en':'ko')} style={btnSecondary}>{T.langBtn}</button>
          </div>
        </header>

        <div style={{ display:"grid", gridTemplateColumns:"1.1fr 0.9fr", gap:16 }}>
          {/* 좌측 */}
          <div>
            {/* 결과 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16 }}>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 12px" }}>{T.result}</h2>
              <div style={{ display:"grid", gridTemplateColumns:"120px 1fr", rowGap:8 }}>
                <div style={{ color:"#6b7280" }}>{T.race}</div>
                <div>{raceOut}{subraceKo !== "-" ? ` / ${subraceKo}` : ""}</div>

                <div style={{ color:"#6b7280" }}>{T.klass}</div>
                <div>{classOut}{subclassKo !== "-" ? ` / ${subclassKo}` : ""}</div>

                <div style={{ color:"#6b7280" }}>{T.background}</div>
                <div>{bgLabel(bg)}</div>

                <div style={{ color:"#6b7280" }}>{T.weapons}</div>
                <div>{weaponsKO.join(", ")}</div>

                <div style={{ color:"#6b7280" }}>{T.skills}</div>
                <div>{skills.map(skillLabel).join(", ")}</div>
              </div>

              {/* 능력치 */}
              <div style={{ marginTop:12 }}>
                <h3 style={{ fontWeight:700, margin:"0 0 6px" }}>{T.abilities}</h3>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:8, textAlign:"center" }}>
                  {ABILS.map((k)=>(
                    <div key={k} style={{ border:"1px solid #f1f5f9", borderRadius:10, padding:"8px 6px" }}>
                      <div style={{ fontSize:12, color:"#6b7280", marginBottom:4 }}>{abilLabel(k)}</div>
                      <div style={{ fontSize:20, fontWeight:800, lineHeight:1 }}>{stats[k]}</div>
                      <div style={{ height:18, marginTop:4 }}>
                        {pbBonus2===k && <span style={badge}>+2</span>}
                        {pbBonus1===k && <span style={{...badge, background:"#e5e7eb", color:"#111827"}}>+1</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 조작 */}
              <div style={{ marginTop:12, display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
                <button onClick={rollAll} style={btnPrimary}>{T.rollAll}</button>
                <button onClick={()=>{rollRace(); rollWeaponsBtn();}} style={btn}>{T.onlyRace}</button>
                <button onClick={()=>{rollClass(); rollWeaponsBtn(); rollSkillsBtn();}} style={btn}>{T.onlyClass}</button>
                <button onClick={()=>{rollBackground(); rollSkillsBtn();}} style={btn}>{T.onlyBG}</button>
                <button onClick={rollStatsBtn} style={btn}>{T.rollStats}</button>
                <button onClick={rollWeaponsBtn} style={btn}>{T.rerollWeapons}</button>
                <button onClick={rollAny2WeaponsBtn} style={btn}>{T.any2Weapons}</button>
                <button onClick={rollSkillsBtn} style={btn}>{T.rollSkills}</button>
              </div>
            </section>

            {/* 재주 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginTop:16 }}>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 12px" }}>{T.featSection}</h2>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <button onClick={rollFeatBtn} style={btn}>{T.rollFeat}</button>
                {featName && <div style={{ fontWeight:700 }}>{featName}</div>}
              </div>
              {featLines.length>0 && (
                <div style={{ marginTop:10, display:"grid", gap:6 }}>
                  {featLines.map((ln,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span>• {ln}</span>
                      <button style={btnSecondary} onClick={()=>excludeFeatItem(ln)}>{T.exclude}</button>
                    </div>
                  ))}
                  {featExcluded.size>0 && (
                    <div style={{ marginTop:8 }}>
                      <div style={{ fontSize:12, color:"#6b7280", marginBottom:4 }}>{T.excluded}</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {Array.from(featExcluded).map(v=>(
                          <button key={v} style={btnSecondary} onClick={()=>unexcludeFeatItem(v)}>{T.clear}: {v}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 주사위 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginTop:16 }}>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 12px" }}>{T.diceTitle}</h2>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <input value={diceExpr} onChange={(e)=>setDiceExpr(e.target.value)} placeholder={T.dicePH} style={input}/>
                <button onClick={handleRollDice} style={btn}>{T.rollDice}</button>
              </div>
              {diceDetail && <div style={{ marginTop:8, color:"#374151" }}>{diceDetail}</div>}
            </section>

            {/* 승자 정하기 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginTop:16, marginBottom:24 }}>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 12px" }}>{T.vsTitle}</h2>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <input value={names} onChange={(e)=>setNames(e.target.value)} placeholder={T.vsPH} style={{...input, minWidth:640}}/>
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

          {/* 우측 패널 */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* 수동 선택 & 고정 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16 }}>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 12px" }}>{T.manualPanel}</h3>

              {/* 종족 */}
              <div style={row}>
                <label style={label}>{T.race}</label>
                <select value={raceKey} onChange={(e:any)=>{ const k = e.target.value as keyof typeof RACES | "-"; setRaceKey(k); setSubraceKo(k==="-"?"-":(RACES[k].subs?.[0] ?? "-")); }} style={select}>
                  <option value="-">-</option>
                  {raceOptions.map(k=><option key={k} value={k}>{lang==="ko"?RACES[k].ko:k}</option>)}
                </select>
                <select disabled={raceKey==="-" || !(RACES[raceKey].subs?.length)} value={subraceKo} onChange={e=>setSubraceKo(e.target.value)} style={select}>
                  {(raceKey==="-" || !RACES[raceKey].subs) ? <option value="-">-</option> : RACES[raceKey].subs!.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <label style={{ color:"#6b7280" }}>{L[lang].locks}</label>
                <input type="checkbox" checked={lockRace} onChange={e=>setLockRace(e.target.checked)}/>
              </div>

              {/* 클래스 */}
              <div style={row}>
                <label style={label}>{T.klass}</label>
                <select value={classKey} onChange={(e:any)=>{ const k = e.target.value as keyof typeof CLASSES | "-"; setClassKey(k); setSubclassKo(k==="-"?"-":CLASSES[k].subclasses[0]); }} style={select}>
                  <option value="-">-</option>
                  {classOptions.map(k=><option key={k} value={k}>{lang==="ko"?CLASSES[k].ko:k}</option>)}
                </select>
                <select disabled={classKey==="-" } value={subclassKo} onChange={e=>setSubclassKo(e.target.value)} style={select}>
                  {classKey==="-" ? <option value="-">-</option> : CLASSES[classKey].subclasses.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <label style={{ color:"#6b7280" }}>{L[lang].locks}</label>
                <input type="checkbox" checked={lockClass} onChange={e=>setLockClass(e.target.checked)}/>
              </div>

              {/* 출신 */}
              <div style={row}>
                <label style={label}>{T.background}</label>
                <select value={bg} onChange={(e:any)=>setBg(e.target.value as Background)} style={select}>
                  <option value="-">-</option>
                  {BACK_KO.map(b=><option key={b} value={b}>{lang==="ko"?b:BACK_EN[b]}</option>)}
                </select>
                <label style={{ color:"#6b7280" }}>{L[lang].locks}</label>
                <input type="checkbox" checked={lockBG} onChange={e=>setLockBG(e.target.checked)}/>
              </div>

              {/* 무기 선택 + 락 */}
              <div style={row}>
                <label style={label}>{T.weapons}</label>
                <button style={btn} onClick={()=>{ setTempWeapons(new Set(weaponsKO)); setShowWeaponPicker(true); }}>{T.openPicker}</button>
                <div style={{ color:"#374151" }}>{weaponsKO.join(", ")}</div>
                <label style={{ color:"#6b7280" }}>{L[lang].locks}</label>
                <input type="checkbox" checked={lockWeapons} onChange={e=>setLockWeapons(e.target.checked)}/>
              </div>

              {/* 기술 선택 + 락 */}
              <div style={row}>
                <label style={label}>{T.skills}</label>
                <button style={btn} onClick={()=>{ setTempSkills(new Set(skills)); setShowSkillPicker(true); }}>{T.openPicker}</button>
                <div style={{ color:"#374151" }}>{skills.map(skillLabel).join(", ")}</div>
                <label style={{ color:"#6b7280" }}>{L[lang].locks}</label>
                <input type="checkbox" checked={lockSkills} onChange={e=>setLockSkills(e.target.checked)}/>
              </div>
            </section>

            {/* 성장 패널 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16 }}>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 12px" }}>{T.growth}</h3>
              <div style={{ display:"grid", gap:8 }}>
                <div style={row}>
                  <label style={label}>{T.classPick}</label>
                  <select value={growClass} onChange={(e:any)=>{ const v=e.target.value as keyof typeof CLASSES | "-"; setGrowClass(v); setGrowSub("-"); }} style={select}>
                    <option value="-">-</option>
                    {classOptions.map(k=><option key={k} value={k}>{lang==="ko"?CLASSES[k].ko:k}</option>)}
                  </select>
                </div>
                <div style={row}>
                  <label style={label}>{T.subPick}</label>
                  <select value={growSub} onChange={(e)=>setGrowSub(e.target.value)} style={select} disabled={growClass==="-"}>
                    {growClass==="-"? <option value="-">-</option> : ["-"].concat(CLASSES[growClass].subclasses).map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={row}>
                  <label style={label}>{T.levelPick}</label>
                  <input type="number" min={1} max={12} value={growLevel} onChange={(e)=>setGrowLevel(parseInt(e.target.value||"1",10))} style={{padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, width:120}}/>
                </div>
                <div style={row}>
                  <label style={label}>{T.howManySpells}</label>
                  <input type="number" min={0} max={5} value={growSpellCount} onChange={(e)=>setGrowSpellCount(parseInt(e.target.value||"0",10))} style={{padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, width:120}}/>
                </div>
                <div>
                  <button onClick={doSuggestGrowth} style={btn}>{T.suggest}</button>
                </div>

                {growPlan.slots.length>0 && (
                  <div style={{ marginTop:8 }}>
                    {growPlan.slots.map((s,i)=>(
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span>• {s.pick ?? `${s.label}: -`}</span>
                        {s.pick && <button style={btnSecondary} onClick={()=>excludeGrowthItem(s.pick!)}>{T.exclude}</button>}
                      </div>
                    ))}
                    {growExcluded.size>0 && (
                      <div style={{ marginTop:6 }}>
                        <div style={{ fontSize:12, color:"#6b7280", marginBottom:4 }}>{T.excluded}</div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          {Array.from(growExcluded).map(x=>(
                            <button key={x} style={btnSecondary} onClick={()=>unexcludeGrowthItem(x)}>{T.clear}: {x}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 무기 픽커 */}
      {showWeaponPicker && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", padding:16, borderRadius:12, minWidth:360, maxWidth:520 }}>
            <h4 style={{ marginTop:0 }}>{T.weapons}</h4>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(0,1fr))", gap:8, maxHeight:360, overflow:"auto" }}>
              {Array.from(new Set(weaponPoolNow)).map(w=>(
                <label key={w} style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input type="checkbox" checked={tempWeapons.has(w)} onChange={(e)=>{
                    const n=new Set(tempWeapons); e.target.checked?n.add(w):n.delete(w); setTempWeapons(n);
                  }}/>
                  <span>{w}</span>
                </label>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
              <button style={btnSecondary} onClick={()=>setShowWeaponPicker(false)}>{T.cancel}</button>
              <button style={btn} onClick={()=>{ setWeaponsKO(Array.from(tempWeapons)); setShowWeaponPicker(false); }}>{T.apply}</button>
            </div>
          </div>
        </div>
      )}

      {/* 기술 픽커 */}
      {showSkillPicker && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", padding:16, borderRadius:12, minWidth:360, maxWidth:520 }}>
            <h4 style={{ marginTop:0 }}>{T.skills}</h4>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(0,1fr))", gap:8, maxHeight:360, overflow:"auto" }}>
              {allSkills.map(s=>(
                <label key={s} style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input type="checkbox" checked={tempSkills.has(s)} onChange={(e)=>{
                    const n=new Set(tempSkills); e.target.checked?n.add(s):n.delete(s); setTempSkills(n);
                  }}/>
                  <span>{skillLabel(s)}</span>
                </label>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
              <button style={btnSecondary} onClick={()=>setShowSkillPicker(false)}>{T.cancel}</button>
              <button style={btn} onClick={()=>{ setSkills(Array.from(tempSkills)); setShowSkillPicker(false); }}>{T.apply}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
