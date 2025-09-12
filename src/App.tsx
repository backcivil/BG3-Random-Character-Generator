import { useState } from "react";

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
    dicePH: "예: 1d4, 5d30, 3d6+2",
    rollDice: "굴리기",
    vsTitle: "승자 정하기",
    vsPH: "공백 혹은 쉼표로 구분 (레드 유히 함마김 활잽이)",
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
    clear: "취소(되돌리기)",
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
    dicePH: "e.g., 1d4, 5d30, 3d6+2",
    rollDice: "Roll",
    vsTitle: "Decide Winner",
    vsPH: "Whitespace or commas (Alex Bora Choi)",
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

// 서브클래스 추가 숙련(요청분 반영)
const SUBCLASS_EXTRA_WEAPONS: Record<string, string[]> = {
  // 클레릭 권역
  "클레릭:폭풍 권역": Object.values(MARTIAL_KO),
  "클레릭:전쟁 권역": Object.values(MARTIAL_KO),
  "클레릭:죽음 권역": Object.values(MARTIAL_KO),
  // 위저드 칼날 노래
  "위저드:칼날 노래": ["단검","장검","레이피어","협도","소검","낫"],
};

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

/** ========= 주문 테이블(요약 + Patch8 추가) ========= */
// 공통: Patch8 소마법/주문
const CANTRIP_PATCH8 = {
  "폭음의 검": true,   // Booming Blade
  "폭발하는 힘": true, // likely "Force Explosion" (가칭)
  "망자의 종소리": true, // Toll the Dead
};
const LV2_PATCH8 = {
  "그림자 검": true, // Shadow Blade (2레벨)
};

type GrowthKey = "전투
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
  const [featDetails, setFeatDetails] = useState<string[]>([]);
  const [featExcluded, setFeatExcluded] = useState<Set<string>>(new Set());

  // 선택 픽커
  const [showWeaponPicker, setShowWeaponPicker] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [tempWeapons, setTempWeapons] = useState<Set<string>>(new Set());
  const [tempSkills, setTempSkills] = useState<Set<SkillKey>>(new Set());

  // Dice
  const [diceExpr, setDiceExpr] = useState<string>("1d20");
  const [diceDetail, setDiceDetail] = useState<string>("");

  // Versus
  const [names, setNames] = useState<string>("");
  const [vsLines, setVsLines] = useState<string[]>([]);
  const [vsWinner, setVsWinner] = useState<string>("");

  // 클래스별 특성(성장)
  const [growClass, setGrowClass] = useState<keyof typeof CLASSES | "-">("-");
  const [growSub, setGrowSub] = useState<string>("-");
  const [growLevel, setGrowLevel] = useState<number>(3);
  const [growSpellCount, setGrowSpellCount] = useState<number>(1);
  const [growResult, setGrowResult] = useState<string[]>([]);
  const [growExcluded, setGrowExcluded] = useState<Set<string>>(new Set());

  // 락(고정)
  const [lockRace, setLockRace] = useState(false);
  const [lockClass, setLockClass] = useState(false);
  const [lockBG, setLockBG] = useState(false);
  const [lockWeapons, setLockWeapons] = useState(false);
  const [lockSkills, setLockSkills] = useState(false);

  // 라벨
  const T = L[lang];
  const abilLabel = (k: Abil) => (lang === "ko" ? abilKo[k] : (k as string));
  const skillLabel = (s: SkillKey) => (lang === "ko" ? SK.KO[s] : SK.EN[s]);

  const raceOut  = raceKey  === "-" ? "" : (lang === "ko" ? RACES[raceKey].ko  : String(raceKey));
  const classOut = classKey === "-" ? "" : (lang === "ko" ? CLASSES[classKey].ko : String(classKey));

  /** ===== 계산 유틸 ===== */
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
  function computeClassSkills(classKo: string, bgSel: Background): SkillKey[] {
    if (bgSel === "-") return [];
    const cfg = CLASS_SK_CHOICE[classKo];
    if (!cfg) return [];
    const [bg1, bg2] = BG_SKILLS[bgSel];
    const pool = cfg.list.filter((s) => s !== bg1 && s !== bg2);
    return sampleN(pool, cfg.n);
  }

  /** ===== 롤 ===== */
  function rollRace() {
    if (lockRace) return;
    const keys = Object.keys(RACES) as (keyof typeof RACES)[];
    const r = choice(keys);
    setRaceKey(r);
    setSubraceKo(RACES[r].subs ? choice(RACES[r].subs!) : "-");
  }
  function rollClass() {
    if (lockClass) return;
    const keys = Object.keys(CLASSES) as (keyof typeof CLASSES)[];
    const k = choice(keys);
    setClassKey(k);
    setSubclassKo(choice(CLASSES[k].subclasses));
  }
  function rollBackground() {
    if (lockBG) return;
    setBg(choice(BACK_KO));
  }
  function rollStats() {
    const { bonus2, bonus1, final } = rollPointBuyWithBonuses();
    setPbBonus2(bonus2); setPbBonus1(bonus1); setStats(final);
  }
  function rollWeapons() {
    if (lockWeapons) return;
    const raceKo = raceKey === "-" ? "" : RACES[raceKey].ko;
    const picks = computeWeapons(raceKo, classKey === "-" ? "" : CLASSES[classKey].ko, subclassKo);
    setWeaponsKO(picks);
  }
  function rollAny2Weapons() {
    if (lockWeapons) return;
    setWeaponsKO(randomAny2KO());
  }
  function rollSkills() {
    if (lockSkills) return;
    const classKo = classKey === "-" ? "" : CLASSES[classKey].ko;
    const picks = computeClassSkills(classKo, bg);
    setSkills(picks);
  }
  function rollAll() {
    if (!lockRace) { const rKeys = Object.keys(RACES) as (keyof typeof RACES)[]; const r = choice(rKeys); setRaceKey(r); setSubraceKo(RACES[r].subs ? choice(RACES[r].subs!) : "-"); }
    if (!lockClass) { const cKeys = Object.keys(CLASSES) as (keyof typeof CLASSES)[]; const k = choice(cKeys); setClassKey(k); setSubclassKo(choice(CLASSES[k].subclasses)); }
    if (!lockBG) setBg(choice(BACK_KO));
    rollStats();
    setTimeout(()=>{
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
                <button onClick={()=>{rollRace(); setTimeout(rollWeapons,0);}} style={btn}>{T.onlyRace}</button>
                <button onClick={()=>{rollClass(); setTimeout(()=>{rollWeapons(); rollSkills();},0);}} style={btn}>{T.onlyClass}</button>
                <button onClick={()=>{rollBackground(); setTimeout(rollSkills,0);}} style={btn}>{T.onlyBG}</button>
                <button onClick={rollStats} style={btn}>{T.rollStats}</button>
                <button onClick={rollWeapons} style={btn}>{T.rerollWeapons}</button>
                <button onClick={rollAny2Weapons} style={btn}>{T.any2Weapons}</button>
                <button onClick={rollSkills} style={btn}>{T.rollSkills}</button>
              </div>
            </section>

            {/* 재주 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginTop:16 }}>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 12px" }}>{T.featSection}</h2>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <button onClick={rollFeat} style={btn}>{T.rollFeat}</button>
                {featName && <div style={{ fontWeight:700 }}>{featName}</div>}
                {featDetails.length>0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                    {featDetails.map((d,i)=>(
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span>• {d}</span>
                        <button style={btnSecondary} onClick={()=>excludeFeatDetail(`feat:${featName}:${d}`)}>{T.exclude}</button>
                      </div>
                    ))}
                    {/* 제외 목록 토글 해제 */}
                    {Array.from(featExcluded).length>0 && (
                      <div style={{ marginTop:6 }}>
                        <div style={{ fontSize:12, color:"#6b7280", marginBottom:4 }}>{T.excluded}</div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          {Array.from(featExcluded).map(x=>(
                            <button key={x} style={btnSecondary} onClick={()=>unexcludeFeatDetail(x)}>{T.clear}: {x}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                <input value={names} onChange={(e)=>setNames(e.target.value)} placeholder={T.vsPH} style={{...input, minWidth:480}}/>
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

            {/* 클래스별 특성 */}
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
                {growResult.length>0 && (
                  <div style={{ marginTop:8 }}>
                    {growResult.map((g,i)=>
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span>• {g}</span>
                        {/* 제외 토글 */}
                        <button style={btnSecondary} onClick={()=>excludeGrowthItem(`${g.split(":")[0]}:${g.split(": ").slice(1).join(": ")}`)}>{T.exclude}</button>
                      </div>
                    )}
                    {Array.from(growExcluded).length>0 && (
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
          <div style={{ background:"#fff", padding:16, borderRadius:12, minWidth:360 }}>
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
          <div style={{ background:"#fff", padding:16, borderRadius:12, minWidth:360 }}>
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
