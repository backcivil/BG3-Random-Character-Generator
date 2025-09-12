import React, { useEffect, useMemo, useState } from "react";

/** BG3 랜덤 생성기 · 단일파일 + 우측 패널
 * - 초기 진입 시 결과 비표시(사용자 조작 시 표시)
 * - 수동 선택 & 고정(락): 종족/클래스/출신/무기/기술
 * - 기술: 배경 2개 제외 후 클래스 기술 풀에서 정확히 N개 랜덤
 * - “(이 중 n개 선택)” 문구 제거 → 실제 리스트를 보여주고 개별 제외 가능
 * - 몽크일 때만 무기풀에 "비무장 공격" 포함
 * - 클래스별 특성(구 성장 추천기): 클래스/서브클래스/레벨별 선택지 랜덤, 주문 랜덤(최대 주문 레벨까지 누적 풀), ‘배울 주문 수’는 주문에만 적용
 * - [제외] 즉시 재추천 + 제외 리스트 표시(주문/특성/재주/기술/무기)
 * - 무기/기술 수동 입력 제거 → 버튼으로 목록 선택
 * - 승자 정하기: 공백/쉼표 파싱, 중복 없는 1d20, 입력칸 넓힘
 */

// ============ 유틸 ============
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

const uniqueSampleN = <T,>(arr: readonly T[], n: number) => {
  // n개 유니크 샘플
  const set = new Set<T>();
  const a = shuffle(arr);
  for (const x of a) {
    set.add(x);
    if (set.size >= n) break;
  }
  return [...set];
};

type Lang = "ko" | "en";

// ============ 다국어 라벨 ============
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
    rollDice: "주사위 굴리기",
    vsTitle: "승자 정하기",
    vsPH: "공백 혹은 쉼표로 구분 (예: 레드 유히 함마김 활잽이)",
    vsRoll: "굴리기 (1d20)",
    winner: "승자",
    manualPanel: "수동 선택 & 고정",
    locks: "고정",
    growth: "클래스별 특성",
    classPick: "클래스",
    subPick: "서브클래스",
    levelPick: "레벨",
    howMany: "배울 주문 수",
    suggest: "랜덤 추천",
    excludeList: "제외 목록",
    openPicker: "목록에서 선택",
    apply: "적용",
    cancel: "취소",
    excludedNow: "제외했습니다. 다시 추천합니다.",
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
    vsPH: "Split by spaces or commas (e.g., Red Yuhi HammerKim Archer)",
    vsRoll: "Roll (1d20)",
    winner: "Winner",
    manualPanel: "Manual Picks & Locks",
    locks: "Lock",
    growth: "Level-based Picks",
    classPick: "Class",
    subPick: "Subclass",
    levelPick: "Level",
    howMany: "Spells to learn",
    suggest: "Suggest",
    excludeList: "Excluded",
    openPicker: "Open list",
    apply: "Apply",
    cancel: "Cancel",
    excludedNow: "Excluded. Re-rolled.",
  },
} as const;

const ABILS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
type Abil = (typeof ABILS)[number];
const abilKo: Record<Abil, string> = { STR: "힘", DEX: "민첩", CON: "건강", INT: "지능", WIS: "지혜", CHA: "매력" };

// ============ 데이터: 종족/클래스 ============
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

// ============ 배경/스킬 ============
const BACK_KO = ["복사", "사기꾼", "범죄자", "연예인", "시골 영웅", "길드 장인", "귀족", "이방인", "현자", "군인", "부랑아"] as const;
type Background = (typeof BACK_KO)[number] | "-";

const BACK_EN: Record<(typeof BACK_KO)[number], string> = {
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

const BG_SKILLS: Record<Exclude<Background, "-">, [keyof typeof SK.KO, keyof typeof SK.KO]> = {
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

const CLASS_SK_CHOICE: Record<string, { n: number; list: (keyof typeof SK.KO)[] }> = {
  바바리안: { n: 2, list: ["Animal", "Athletics", "Intimidation", "Nature", "Perception", "Survival"] },
  바드: { n: 3, list: ["Deception", "Performance", "Persuasion", "Sleight", "Intimidation", "Acrobatics", "Insight"] },
  클레릭: { n: 2, list: ["History", "Insight", "Medicine", "Persuasion", "Religion"] },
  드루이드: { n: 2, list: ["Animal", "Insight", "Medicine", "Nature", "Perception", "Survival"] },
  파이터: { n: 2, list: ["Acrobatics", "Animal", "Athletics", "History", "Insight", "Intimidation", "Perception", "Survival"] },
  몽크: { n: 2, list: ["Acrobatics", "Athletics", "Insight", "History", "Religion", "Stealth"] },
  팔라딘: { n: 2, list: ["Athletics", "Insight", "Intimidation", "Medicine", "Persuasion", "Religion"] },
  레인저: { n: 3, list: ["Animal", "Athletics", "Insight", "Investigation", "Nature", "Perception", "Stealth", "Survival"] },
  로그: { n: 4, list: ["Acrobatics", "Athletics", "Deception", "Insight", "Intimidation", "Investigation", "Perception", "Performance", "Persuasion", "Sleight", "Stealth"] },
  소서러: { n: 2, list: ["Arcana", "Deception", "Insight", "Intimidation", "Persuasion", "Religion"] },
  워락: { n: 2, list: ["Arcana", "Deception", "History", "Intimidation", "Investigation", "Nature", "Religion"] },
  위저드: { n: 2, list: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"] },
};

// ============ 무기 ============
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
const SHIELD_EN = "Shield";

// 종족/클래스 숙련
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
  몽크: Object.values(SIMPLE_KO).concat("소검"), // + 비무장 공격(아래 compute에서 추가)
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

// ============ 포인트바이 ============
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

// ============ Dice ============
function parseDice(expr: string): { n:number; m:number; mod:number } | null {
  const t=expr.trim().replace(/\s+/g,''); const m=t.match(/^(\d+)[dD](\d+)([+-]\d+)?$/); if(!m) return null;
  const n=Math.max(1,parseInt(m[1],10)); const sides=Math.max(2,parseInt(m[2],10)); const mod=m[3]?parseInt(m[3],10):0;
  return { n, m:sides, mod };
}
function rollNdM(n:number,m:number){ return Array.from({length:n},()=>1+rand(m)); }

// ==================== 성장 추천(핵심 타입) ====================
type GrowthKey =
  | "전투 방식"
  | "전투 기법"
  | "바드 통달"
  | "마법 비밀"
  | "바드 스타일"
  | "워락 영창"
  | "소서러 변형"
  | "소마법"
  | "주문"
  | "추가 주문"
  | "비전 사격"
  | "동물 무리"
  | "통달 기술"
  | "신앙 선택"
  | "자연의 시종"
  | "선호 적"
  | "타고난 탐험가"
  | "사냥감"
  | "방어적 전술";

// 주문 레벨 상한 헬퍼
const FULL_CASTER_MAX = (lvl: number) => Math.min(6, Math.floor((lvl + 1) / 2));  // Bard/Cleric/Druid/Sorcerer/Wizard
const HALF_CASTER_MAX = (lvl: number) => Math.min(4, Math.floor((lvl + 1) / 3));  // Paladin/Ranger
const WARLOCK_MAX     = (lvl: number) => Math.min(5, Math.floor((lvl + 1) / 2));
// ============ 성장 추천 DB (주요 클래스) ============
const GROWTH_DB: Record<
  string,
  {
    open: (level: number, subclass?: string) => Partial<Record<GrowthKey, string[]>>;
    maxSpellLevel?: (lvl: number) => number;
    spells?: Record<number, string[]>; // 0=소마법
  }
> = {
  Barbarian: {
    open: (lv, sub) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (sub === "야생의 심장") {
        if (lv === 3) o["동물 무리"] = ["곰의 심장","독수리의 심장","엘크의 심장","호랑이의 심장","늑대의 심장"];
        if (lv === 6 || lv === 10) o["동물 무리"] = ["곰","침팬지","악어","독수리","엘크","벌꿀오소리","말","호랑이","늑대","울버린"];
      }
      return o;
    },
  },

  Bard: {
    open: (lv, sub) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 3) o["바드 통달"] = Object.keys(SK.KO) as any; // 실제 기술 목록
      if (sub === "전승학파") {
        if (lv === 3) o["통달 기술"] = Object.keys(SK.KO) as any; // 숙련 3
        if (lv === 6) o["마법 비밀"] = ["다른 클래스 주문 선택"];
      }
      if (sub === "검술학파" && lv === 3) o["바드 스타일"] = ["결투술","쌍수 전투"];
      return o;
    },
    maxSpellLevel: FULL_CASTER_MAX,
    spells: {
      0: ["신랄한 조롱","도검 결계","마법사의 손","진실의 일격","친구","춤추는 빛","빛","하급 환영"],
      1: ["동물 교감","액운","인간형 매혹","상처 치료","변장","불협화음의 속삭임","요정불","깃털 낙하","치유의 단어","영웅심","활보","수면","동물과 대화","타샤의 끔찍한 웃음","천둥파"],
      2: ["실명","평정심","단검 구름","광기의 왕관","생각 탐지","능력 강화","노예화","금속 가열","인간형 포박","투명","노크","하급 회복","환영력","투명체 감지","파쇄","침묵"],
      3: ["저주 부여","공포","죽은 척","결계 문양","최면 문양","식물 성장","망자와 대화","악취 구름"],
      4: ["혼란","차원문","자유 이동","중급 투명","변신"],
      5: ["인간형 지배","상급 회복","괴물 포박","다중 상처 치료","이차원인 속박","외견"],
      6: ["깨무는 눈길","오토의 참을 수 없는 춤"],
    },
  },

  Cleric: {
    open: (lv, sub) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 1) o["신앙 선택"] = ["셀루네","바하무트","템퍼스","티르","헬름","일메이터","미스트라","오그마","켈렘보어","모라딘","코렐론 라레시안","갈 글리터골드","욘달라","롤스","그럼쉬","티아마트","에일리스트레이","라샌더","탈로스","타이모라","미엘리키","블라키스(기스양키)","라더궈(드웨가)"];
      if (sub === "지식 권역" && lv === 1) o["통달 기술"] = Object.keys(SK.KO) as any; // 2개 통달
      if (sub === "자연 권역" && lv === 1) o["자연의 시종"] = ["드루이드 소마법 1개 + (자연/동물 조련/생존) 숙련"];
      if (sub === "죽음 권역" && lv === 1) o["소마법"] = ["뼛속 냉기","폭발하는 힘","망자의 종소리"];
      return o;
    },
    maxSpellLevel: FULL_CASTER_MAX,
    spells: {
      0: ["기적술","신성한 불길","인도","저항","빛","도검 결계","불꽃 생성","폭발하는 힘","망자의 종소리"],
      1: ["신앙의 방패","선악 보호","성역","액운","명령","축복","상처 치료","치유의 단어","유도 화살","상처 유발","물 생성 또는 제거"],
      2: ["지원","하급 회복","수호의 결속","독 보호","평정심","인간형 포박","치유의 기도","영적 무기","침묵","실명","능력 강화"],
      3: ["희망의 등불","에너지 보호","저주 해제","결계 문양","영혼 수호자","햇빛","다중 치유의 단어","망자 조종","생환","망자와 대화","죽은 척","저주 부여"],
      4: ["추방","자유 이동","죽음 방비","믿음의 수호자"],
      5: ["선악 해제","이차원인 속박","상급 회복","곤충 떼","화염 일격","다중 상처 치료","감염"],
      6: ["영웅의 연회","이차원인 아군","검 방벽","치유","언데드 생성","해악"],
    },
  },

  Druid: {
    open: (_lv, _sub) => ({}),
    maxSpellLevel: FULL_CASTER_MAX,
    spells: {
      0: ["인도","독 분사","불꽃 생성","저항","마법 곤봉","가시 채찍"],
      1: ["얼음 칼","휘감기","안개구름","동물과 대화","동물 교감","인간형 매혹","천둥파","치유의 단어","상처 치료","요정불","도약 강화","활보","맛있는 열매","물 생성 또는 제거"],
      2: ["하급 회복","독 보호","신출귀몰","화염 구체","인간형 포박","화염검","돌풍","달빛","나무껍질 피부","가시밭","능력 강화","금속 가열","암시야"],
      3: ["에너지 보호","낙뢰 소환","진눈깨비 폭풍","햇빛","죽은 척","식물 성장"],
      4: ["자유 이동","바위 피부","하급 정령 소환","숲의 존재 소환","포박 덩굴","혼란","야수 지배","얼음 폭풍","화염 벽","역병","변신"],
      5: ["상급 회복","이차원인 속박","정령 소환","곤충 떼","다중 상처 치료","바위의 벽","감염"],
      6: ["영웅의 연회","가시의 벽","치유","햇살","바람 걸음"],
    },
  },

  Fighter: {
    open: (lv, sub) => {
      const style = ["궁술","방어술","결투술","대형 무기 전투","엄호술","쌍수 전투"];
      const maneuvers = ["사령관의 일격","무장 해제 공격","교란의 일격","날렵한 발놀림","속임수 공격","도발 공격","정밀 공격","밀치기 공격","고양","응수","휩쓸기","다리 걸기 공격"];
      const arcaneShots = ["비전 사격: 추방 화살","비전 사격: 현혹 화살","비전 사격: 폭발 화살","비전 사격: 약화 화살","비전 사격: 속박 화살","비전 사격: 추적 화살","비전 사격: 그림자 화살","비전 사격: 관통 화살"];
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 1) o["전투 방식"] = style;
      if (sub === "전투의 대가") {
        if (lv === 3) o["전투 기법"] = maneuvers;  // 3개
        if (lv === 7) o["전투 기법"] = maneuvers;  // 2개
        if (lv === 10) o["전투 기법"] = maneuvers; // 2개
      }
      if (sub === "투사" && lv === 10) o["전투 방식"] = style;
      if (sub === "비전 궁수") {
        if (lv === 3) { o["소마법"] = ["인도","빛","진실의 일격"]; o["비전 사격"] = arcaneShots; } // 소마법 1, 사격 3
        if (lv === 7) o["비전 사격"] = arcaneShots; // 1
        if (lv === 10) o["비전 사격"] = arcaneShots; // 1
      }
      if (sub === "비술 기사") {
        if (lv === 3) o["소마법"] = ["폭음의 검","폭발하는 힘","망자의 종소리"]; // 패치8 소마법
        if (lv >= 8) o["주문"] = ["그림자 검"]; // 2레벨 주문 선택 풀에 포함
      }
      return o;
    },
  },

  Paladin: {
    open: (lv, _sub) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 2) o["전투 방식"] = ["방어술","결투술","대형 무기 전투","엄호술"];
      return o;
    },
    maxSpellLevel: HALF_CASTER_MAX,
    spells: {
      1: ["선악 보호","신앙의 방패","명령","강제 결투","축복","영웅심","상처 치료","작열의 강타","천둥 강타","신성한 은총","분노의 강타"],
      2: ["지원","하급 회복","독 보호","낙인 강타","마법 무기"],
      3: ["저주 해제","활력의 감시자","성전사의 망토","햇빛","실명 강타","생환","원소 무기"],
    },
  },

  Ranger: {
    open: (lv, sub) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 1) {
        o["선호 적"] = ["현상금 사냥꾼","장막의 수호자","마법사 파괴자","레인저 나이트","성스러운 추적자"];
        o["타고난 탐험가"] = ["야수 조련사","도시 추적자","황무지 방랑자:냉기","황무지 방랑자:화염","황무지 방랑자:독"];
      }
      if (lv === 2) o["전투 방식"] = ["궁술","방어술","결투술","쌍수 전투"];
      if (sub === "사냥꾼") {
        if (lv === 3) o["사냥감"] = ["강적 학살자","거인 사냥꾼","무리 파괴자"];
        if (lv === 7) o["방어적 전술"] = ["무리 탈출","강철의 의지","연속 공격 방어"];
      }
      if (sub === "무리지기" && lv === 3) o["동물 무리"] = ["꿀벌 군단","해파리 떼","나방 쇄도"]; // 레벨업 교체는 UI 측 설명으로 처리
      if (lv === 6 || lv === 10) { o["선호 적"] = o["선호 적"] ?? ["현상금 사냥꾼","장막의 수호자","마법사 파괴자","레인저 나이트","성스러운 추적자"]; o["타고난 탐험가"] = ["야수 조련사","도시 추적자","황무지 방랑자:냉기","황무지 방랑자:화염","황무지 방랑자:독"]; }
      return o;
    },
    maxSpellLevel: HALF_CASTER_MAX,
    spells: {
      1: ["동물 교감","상처 치료","속박의 일격","안개구름","맛있는 열매","가시 세례","사냥꾼의 표식","도약 강화","활보","동물과 대화"],
      2: ["나무껍질 피부","암시야","하급 회복","신출귀몰","독 보호","침묵","가시밭"],
      3: ["포화 소환","햇빛","번개 화살","식물 성장","에너지 보호"],
    },
  },

  Rogue: {
    open: (lv, sub) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 1) o["바드 통달"] = Object.keys(SK.KO) as any; // 통달 기술 2
      if (sub === "비전 괴도") {
        if (lv === 3) o["추가 주문"] = ["비전 확장(1레벨)"];
        if (lv >= 7) o["주문"] = ["2레벨 주문(확장 포함)"];
      }
      return o;
    },
  },

  Sorcerer: {
    open: (lv, _sub) => {
      const meta2 = ["정밀 주문","원격 주문","연장 주문","이중 주문"];
      const meta3 = ["증폭 주문","신속 주문","은밀 주문"];
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 2) o["소서러 변형"] = meta2;
      if (lv === 3 || lv === 10) o["소서러 변형"] = meta3;
      return o;
    },
    maxSpellLevel: FULL_CASTER_MAX,
    spells: {
      0: ["도검 결계","산성 거품","마법사의 손","독 분사","진실의 일격","친구","춤추는 빛","화염살","빛","서리 광선","전격의 손아귀","하급 환영","뼛속 냉기","폭음의 검"],
      1: ["불타는 손길","인간형 매혹","오색 보주","오색 빛보라","변장","신속 후퇴","거짓 목숨","깃털 낙하","안개구름","얼음 칼","도약 강화","마법사의 갑옷","마력탄","독 광선","방어막","수면","천둥파","마녀의 화살"],
      2: ["실명","잔상","단검 구름","광기의 왕관","어둠","암시야","생각 탐지","능력 강화","확대/축소","돌풍","인간형 포박","투명","노크","거울 분신","안개 걸음","환영력","작열 광선","투명체 감지","파쇄","거미줄","그림자 검"],
      3: ["점멸","주문 방해","햇빛","공포","화염구","비행 부여","기체 형태","가속","최면 문양","번개 줄기","에너지 보호","진눈깨비 폭풍","둔화","악취 구름"],
      4: ["추방","역병","혼란","차원문","야수 지배","상급 투명","얼음 폭풍","변신","바위 피부","화염 벽"],
      5: ["죽음 구름","냉기 분사","인간형 지배","괴물 포박","곤충 떼","외견","염력","바위의 벽"],
      6: ["비전 관문","연쇄 번개","죽음의 원","분해","깨무는 눈길","무적의 구체","햇살"],
    },
  },

  Warlock: {
    open: (lv, sub) => {
      const inv = ["고뇌의 파동","그림자 갑옷","야수의 언어","교언영색","악마의 눈","마족의 활력","수많은 얼굴의 가면","그림자 동행","격퇴의 파동","다섯 숙명의 도둑","정신의 수렁","불길한 징조","고대 비밀의 서","공포의 단어","살점 조각가","혼돈의 하수인","초차원 도약","망자의 속삭임","생명을 마시는 자"];
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 2) o["워락 영창"] = inv;
      if (lv === 5 || lv === 7 || lv === 9 || lv === 12) o["워락 영창"] = inv;
      if (sub === "주술 칼날" && lv === 7) o["주문"] = ["충격의 강타(4레벨)"];
      return o;
    },
    maxSpellLevel: WARLOCK_MAX,
    spells: {
      0: ["도검 결계","뼛속 냉기","섬뜩한 파동","친구","마법사의 손","하급 환영","독 분사","진실의 일격","폭음의 검"],
      1: ["아거티스의 갑옷","하다르의 팔","인간형 매혹","신속 후퇴","지옥의 질책","주술","선악 보호","마녀의 화살"],
      2: ["단검 구름","광기의 왕관","어둠","노예화","인간형 포박","투명","거울 분신","안개 걸음","약화 광선","파쇄"],
      3: ["주문 방해","공포","비행 부여","기체 형태","하다르의 굶주림","최면 문양","저주 해제","흡혈의 손길"],
      4: ["추방","역병","차원문"],
      5: ["괴물 포박"],
    },
  },

  Wizard: {
    open: (_lv, _sub) => ({}),
    maxSpellLevel: FULL_CASTER_MAX,
    spells: {
      0: ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","마법사의 손","하급 환영","진실의 일격","폭음의 검"],
      1: ["불타는 손길","인간형 매혹","오색 보주","오색 빛보라","변장","신속 후퇴","거짓 목숨","깃털 낙하","소환수 찾기","안개구름","기름칠","얼음 칼","도약 강화","활보","마법사의 갑옷","마력탄","선악 보호","독 광선","방어막","수면","타샤의 끔찍한 웃음","천둥파","마녀의 화살"],
      2: ["비전 자물쇠","실명","잔상","단검 구름","광기의 왕관","어둠","암시야","생각 탐지","확대/축소","화염 구체","돌풍","인간형 포박","투명","노크","마법 무기","멜프의 산성 화살","거울 분신","안개 걸음","환영력","약화 광선","작열 광선","투명체 감지","파쇄","거미줄","그림자 검"],
      3: ["망자 조종","저주 부여","점멸","주문 방해","공포","죽은 척","화염구","비행 부여","기체 형태","결계 문양","가속","최면 문양","번개 줄기","에너지 보호","저주 해제","진눈깨비 폭풍","둔화","악취 구름","흡혈의 손길"],
      4: ["추방","역병","혼란","하급 정령 소환","차원문","에바드의 검은 촉수","화염 방패","상급 투명","얼음 폭풍","오틸루크의 탄성 구체","환영 살해자","변신","바위 피부","화염 벽"],
      5: ["죽음 구름","냉기 분사","정령 소환","인간형 지배","괴물 포박","이차원인 속박","외견","염력","바위의 벽"],
      6: ["비전 관문","연쇄 번개","죽음의 원","언데드 생성","분해","깨무는 눈길","육신 석화","무적의 구체","오틸루크의 빙결 구체","오토의 참을 수 없는 춤","햇살","얼음의 벽"],
    },
  },
};

// ============ 재주(Feats) 메타 ============
type FeatPick = { name: string; detail: string; picks?: string[] };

const ALL_WEAPON_KO = Object.values(WEAPON_KO); // 방패 제외용 별도 처리
const ALL_SKILL_KEYS = Object.keys(SK.KO) as (keyof typeof SK.KO)[];

function rollFeatDetail(featName: string, excluded: Set<string>, lang: Lang): FeatPick {
  
  const abilName = (a: Abil) => (lang === "ko" ? abilKo[a] : a);
  

  const nonShieldWeapons = ALL_WEAPON_KO.filter((w) => w !== SHIELD_KO);

  const rerollUntil = (pool: string[], n = 1) =>
    uniqueSampleN(
      pool.filter((x) => !excluded.has(x)),
      n
    );

  switch (featName) {
    case "능력 향상": {
      const [a1, a2] = uniqueSampleN(ABILS, 2);
      return { name: "능력 향상", detail: `${abilName(a1)} +1, ${abilName(a2)} +1` };
    }
    case "운동선수": {
      const a = choice(["STR", "DEX"] as Abil[]);
      return { name: "운동선수", detail: `${abilName(a)} 선택` };
    }
    case "원소 숙련": {
      const el = choice(["산성","냉기","화염","번개","천둥"]);
      return { name: "원소 숙련", detail: `원소 숙련: ${el}` };
    }
    case "경갑 무장": {
      const a = choice(["STR", "DEX"] as Abil[]);
      return { name: "경갑 무장", detail: `${abilName(a)} 선택` };
    }
    case "평갑의 달인": {
      const a = choice(["STR", "DEX"] as Abil[]);
      return { name: "평갑의 달인", detail: `${abilName(a)} 선택` };
    }
    case "저항력": {
      const a = choice(ABILS);
      return { name: "저항력", detail: `저항력: ${abilName(a)}` };
    }
    case "의식 시전자": {
      const picks = rerollUntil(["망자와 대화","소환수 찾기","활보","도약 강화","변장","동물과 대화"], 2);
      return { name: "의식 시전자", detail: `선택: ${picks.join(", ")}`, picks };
    }
    case "숙련가": {
      const picks = rerollUntil(ALL_SKILL_KEYS.map((k) => SK.KO[k]), 3);
      return { name: "숙련가", detail: `기술 3 숙련: ${picks.join(", ")}`, picks };
    }
    case "주문 저격수": {
      const c = choice(["뼛속 냉기","섬뜩한 파동","화염살","서리 광선","전격의 손아귀","가시 채찍"]);
      return { name: "주문 저격수", detail: `소마법: ${c}` };
    }
    case "술집 싸움꾼": {
      const a = choice(["STR","CON"] as Abil[]);
      return { name: "술집 싸움꾼", detail: `${abilName(a)} 선택` };
    }
    case "무예 숙련": {
      const maneuvers = ["사령관의 일격","무장 해제 공격","교란의 일격","날렵한 발놀림","속임수 공격","도발 공격","정밀 공격","밀치기 공격","고양","응수","휩쓸기","다리 걸기 공격"];
      const picks = rerollUntil(maneuvers, 2);
      return { name: "무예 숙련", detail: `전투 기법 2개: ${picks.join(", ")}`, picks };
    }
    case "마법 입문: 바드":
    case "마법 입문: 클레릭":
    case "마법 입문: 드루이드":
    case "마법 입문: 소서러":
    case "마법 입문: 워락":
    case "마법 입문: 위자드": {
      const klass = featName.split(": ")[1] as keyof typeof GROWTH_DB;
      const rule = GROWTH_DB[klass];
      const cantrips = rule?.spells?.[0] ?? [];
      const lvl1 = rule?.spells?.[1] ?? [];
      const c2 = rerollUntil(cantrips, 2);
      const s1 = rerollUntil(lvl1, 1);
      return { name: featName, detail: `소마법 2: ${c2.join(", ")} / 1레벨 주문: ${s1[0]}`, picks: [...c2, ...s1] };
    }
    case "무기의 달인": {
      const a = choice(["STR","DEX"] as Abil[]);
      const weapons = rerollUntil(nonShieldWeapons, 4);
      return { name: "무기의 달인", detail: `${abilKo[a]} 선택 + 무기 4개 숙련: ${weapons.join(", ")}`, picks: weapons };
    }
    default:
      return { name: featName, detail: "" };
  }
}

const BASE_FEATS = [
  "능력 향상","배우","경계","운동선수","돌격자","쇠뇌 전문가","방어적인 결투가","쌍수 전문가","던전 탐구자","불굴",
  "원소 숙련","대형 무기의 달인","중갑 무장","중갑의 달인","경갑 무장","행운","마법사 슬레이어",
  "마법 입문: 바드","마법 입문: 클레릭","마법 입문: 드루이드","마법 입문: 소서러","마법 입문: 워락","마법 입문: 위자드",
  "무예 숙련","평갑의 달인","기동력","적당히 무장함","공연가","장병기의 달인","저항력","의식 시전자","맹렬한 공격자","파수꾼","명사수","방패의 달인","숙련가","주문 저격수","술집 싸움꾼","강골","전쟁 시전자","무기의 달인"
];

// ============ App ============
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
  const [skills, setSkills] = useState<(keyof typeof SK.KO)[]>([]);
  const [feat, setFeat] = useState<FeatPick | null>(null);

  // 수동 선택 & 락
  const [lockRace, setLockRace] = useState(false);
  const [lockClass, setLockClass] = useState(false);
  const [lockBG, setLockBG] = useState(false);
  const [lockWeapons, setLockWeapons] = useState(false);
  const [lockSkills, setLockSkills] = useState(false);

  // Picker 토글
  const [showWeaponPicker, setShowWeaponPicker] = useState(false);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [tempWeaponSel, setTempWeaponSel] = useState<string[]>([]);
  const [tempSkillSel, setTempSkillSel] = useState<(keyof typeof SK.KO)[]>([]);

  // Dice
  const [diceExpr, setDiceExpr] = useState<string>("1d20");
  const [diceDetail, setDiceDetail] = useState<string>("");

  // Versus
  const [names, setNames] = useState<string>("");
  const [vsLines, setVsLines] = useState<string[]>([]);
  const [vsWinner, setVsWinner] = useState<string>("");

  // 클래스별 특성
  const [growClass, setGrowClass] = useState<keyof typeof CLASSES | "-">("-");
  const [growSub, setGrowSub] = useState<string>("-");
  const [growLevel, setGrowLevel] = useState<number>(3);
  const [growCount, setGrowCount] = useState<number>(1); // 주문만 적용
  type Sugg = { key: string; value: string };
  const [growResult, setGrowResult] = useState<Sugg[]>([]);

  // 제외 리스트
  const [excludedFeatures, setExcludedFeatures] = useState<string[]>([]);
  const [excludedSpells, setExcludedSpells] = useState<string[]>([]);
  const [excludedFeats, setExcludedFeats] = useState<string[]>([]);
  const [excludedSkills, setExcludedSkills] = useState<string[]>([]);
  const [excludedWeapons, setExcludedWeapons] = useState<string[]>([]);

  // 초기 자동 롤 제거
  useEffect(() => { /* no auto */ }, []);

  // ========== 계산 유틸 ==========
  function computeWeapons(raceKo: string, classKo: string, subclass?: string): string[] {
    const racePool = RACE_WEAP_KO[raceKo] || [];
    let classPool = CLASS_WEAP_KO[classKo] || [];
    // 몽크: 비무장
    let pool = Array.from(new Set([...racePool, ...classPool]));
    if (classKo === "몽크") pool = Array.from(new Set([...pool, "비무장 공격"]));

    // 방패 숙련
    const hasShield = (raceKo && RACE_SHIELD.has(raceKo)) || (classKo && CLASS_SHIELD.has(classKo));
    if (hasShield && !pool.includes(SHIELD_KO)) pool.push(SHIELD_KO);

    // 특별 숙련 (요청사항)
    if (classKo === "클레릭" && ["폭풍 권역","전쟁 권역","죽음 권역"].includes(subclass || "")) {
      pool = Array.from(new Set([...pool, ...Object.values(MARTIAL_KO)]));
    }
    if (classKo === "위저드" && subclass === "칼날 노래") {
      const extra = ["단검","장검","레이피어","협도","소검","낫"];
      pool = Array.from(new Set([...pool, ...extra]));
    }

    // 제외 리스트 반영
    pool = pool.filter((w) => !excludedWeapons.includes(w));

    if (pool.length === 0) return randomAny2KO();
    const pickN = pool.length <= 8 ? 1 : 2;
    return shuffle(pool).slice(0, Math.min(pickN, pool.length));
  }

  function computeClassSkills(classKo: string, bgSel: Background): (keyof typeof SK.KO)[] {
    if (bgSel === "-") return [];
    const cfg = CLASS_SK_CHOICE[classKo];
    if (!cfg) return [];
    const [bg1, bg2] = BG_SKILLS[bgSel];
    const pool = cfg.list.filter((s) => s !== bg1 && s !== bg2 && !excludedSkills.includes(SK.KO[s]));
    return sampleN(pool, cfg.n);
  }

  function randomAny2KO(): string[] {
    const picks = shuffle(ALL_WEAPONS_EN).slice(0, 2);
    return picks.map((w) => WEAPON_KO[w]);
  }
  // ========== 롤러 ==========
  function rollRace() {
    if (lockRace) return;
    const keys = Object.keys(RACES) as (keyof typeof RACES)[];
    const r = choice(keys);
    setRaceKey(r);
    const subs = RACES[r].subs;
    setSubraceKo(subs ? choice(subs) : "-");
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
    const classKo = classKey === "-" ? "" : CLASSES[classKey].ko;
    const picks = computeWeapons(raceKo, classKo, subclassKo);
    setWeaponsKO(picks);
  }
  function rollAny2Weapons() {
    if (lockWeapons) return;
    setWeaponsKO(randomAny2KO());
  }
  function rollSkills() {
    if (lockSkills) return;
    const clsKo = classKey === "-" ? "" : CLASSES[classKey].ko;
    const picks = computeClassSkills(clsKo, bg);
    setSkills(picks);
  }

  // 재주
  function rollFeat() {
    const pool = BASE_FEATS.filter((f) => !excludedFeats.includes(f));
    if (pool.length === 0) { setFeat({ name:"(재주 없음)", detail:"" }); return; }
    const picked = choice(pool);
    const detail = rollFeatDetail(picked, new Set(excludedFeats), lang);
    setFeat(detail);
  }
  function excludeFeat(name: string) {
    setExcludedFeats((prev) => Array.from(new Set([...prev, name])));
    // 즉시 재추천
    setTimeout(rollFeat, 0);
  }

  // Dice
  function handleRollDice() {
    const p = parseDice(diceExpr);
    if(!p){ setDiceDetail("형식 오류"); return; }
    const rolls = rollNdM(p.n, p.m);
    const modStr = p.mod ? (p.mod>0?`+${p.mod}`:`${p.mod}`) : "";
    setDiceDetail(`${p.n}d${p.m}${modStr} → [ ${rolls.join(", ")} ]`);
  }

  // Versus (중복 없는 1d20)
  function handleVersus() {
    const list = names.split(/[, \n]+/).map(s=>s.trim()).filter(Boolean);
    if(list.length===0){ setVsLines(["이름을 입력하세요"]); setVsWinner(""); return; }
    const cap = 20;
    const uniq = list.slice(0, cap);
    const pool = Array.from({length:20}, (_,i)=>i+1);
    const rolls: number[] = [];
    for (let i=0;i<uniq.length;i++){
      const idx = rand(pool.length);
      const v = pool[idx];
      pool.splice(idx,1);
      rolls.push(v);
    }
    // 20명 초과분은 타이브레이커로 추가 굴림
    for (let i=cap;i<list.length;i++){
      let r = 1+rand(20);
      // 타이브레이커: 중복이면 다시
      while (rolls.includes(r)) r = 1+rand(20);
      rolls.push(r);
    }

    const results = list.map((name, i)=>({ name, roll: rolls[i] ?? (1+rand(20)) }));
    const max = Math.max(...results.map(r=>r.roll));
    const winners = results.filter(r=>r.roll===max).map(r=>r.name);
    setVsLines(results.map(r=>`${r.name}: ${r.roll}`));
    setVsWinner(winners.join(", "));
  }

  // ===== 클래스별 특성 추천 =====
  function doSuggestGrowth() {
    if (growClass === "-") { setGrowResult([{ key:"정보", value:"클래스를 먼저 선택" }]); return; }
    const rule = GROWTH_DB[growClass];
    if (!rule) { setGrowResult([{ key:"정보", value:"아직 이 클래스는 준비중" }]); return; }
    const opens = rule.open(growLevel, growSub);
    const lines: Sugg[] = [];

    // 개별 키에 대해 추천 수 규칙
    const perKeyPickCount = (key: string) => {
      if (key === "전투 기법") {
        if (growLevel === 3) return 3;
        if (growLevel === 7) return 2;
        if (growLevel === 10) return 2;
      }
      if (key === "비전 사격") {
        if (growLevel === 3) return 3;
        if (growLevel === 7) return 1;
        if (growLevel === 10) return 1;
      }
      if (key === "소마법") return 1;
      if (key === "바드 통달") return 2; // 바드 3레벨 통달 2개
      if (key === "통달 기술") return 3; // 전승 3개
      // 기본 1개
      return 1;
    };

    // 특성/기술/사격/기법 등
    for (const [key, pool] of Object.entries(opens)) {
      if (!pool || pool.length === 0) continue;
      // 제외 리스트 반영
      const excludedSet = new Set(excludedFeatures);
      const filtered = pool.filter((x) => !excludedSet.has(x));
      const isSkillKey = key === "바드 통달" || key === "통달 기술";
      const picks = uniqueSampleN(filtered, perKeyPickCount(key));
      picks.forEach((p) => lines.push({ key, value: p }));

      // 바드 통달/통달 기술은 실제 기술 리스트에서 뽑도록 이미 pool을 기술 리스트로 세팅해둠
      if (isSkillKey && picks.length === 0) {
        // 예외: 기술이 전부 제외된 경우 한 줄로 안내
        lines.push({ key, value: "선택 가능한 기술이 없습니다(제외 해제 필요)" });
      }
    }

    // 주문 추천 (최대 주문 레벨까지 누적 풀)
    if (rule.maxSpellLevel && rule.spells) {
      const maxL = rule.maxSpellLevel(growLevel);
      const all: string[] = [];
      for (let lv=0; lv<=maxL; lv++) if (rule.spells[lv]?.length) all.push(...rule.spells[lv]!);
      const filtered = all.filter((s) => !excludedSpells.includes(s));
      const spellCount = Math.max(0, growCount); // 주문에만 적용
      sampleN(filtered, spellCount).forEach((s)=>lines.push({ key:"주문", value:s }));
    }

    setGrowResult(lines.length ? lines : [{ key:"정보", value:"추천 항목 없음" }]);
  }

  // 제외 & 즉시 재추천
  function excludeGrowthItem(item: Sugg) {
    if (item.key === "주문" || item.key === "소마법" || item.key === "추가 주문") {
      setExcludedSpells((prev)=> Array.from(new Set([...prev, item.value])));
    } else if (item.key === "바드 통달" || item.key === "통달 기술" || item.key === "전투 기법" || item.key === "비전 사격" || item.key === "전투 방식" || item.key === "동물 무리" || item.key === "사냥감" || item.key === "방어적 전술" || item.key === "신앙 선택" || item.key === "자연의 시종" || item.key === "선호 적" || item.key === "타고난 탐험가") {
      setExcludedFeatures((prev)=> Array.from(new Set([...prev, item.value])));
    }
    setTimeout(doSuggestGrowth, 0);
  }

  // 라벨 헬퍼
  const T = L[lang];
  const abilLabel = (k: Abil) => (lang === "ko" ? abilKo[k] : (k as string));
  const bgLabel = (b: Background) => (b === "-" ? "" : (lang === "ko" ? b : BACK_EN[b]));
  const weaponsOut = useMemo(()=>{
    if (lang==="ko") return weaponsKO;
    const mapEN: Record<string,string> = {};
    for (const en of ALL_WEAPONS_EN) mapEN[WEAPON_KO[en]] = en;
    return weaponsKO.map(w => w===SHIELD_KO ? SHIELD_EN : (mapEN[w] ?? w));
  },[lang,weaponsKO]);

  const raceOut  = raceKey  === "-" ? "" : (lang === "ko" ? RACES[raceKey].ko  : String(raceKey));
  const classOut = classKey === "-" ? "" : (lang === "ko" ? CLASSES[classKey].ko : String(classKey));
  const skillsOut = skills.map((s) => (lang === "ko" ? SK.KO[s] : SK.EN[s]));

  const raceOptions = Object.keys(RACES) as (keyof typeof RACES)[];
  const classOptions = Object.keys(CLASSES) as (keyof typeof CLASSES)[];

  // ====== 하이 엘프 특례(위저드 소마법 1) 표시용 헬퍼 ======
  const isHighElf = raceKey !== "-" && (subraceKo === "하이 엘프" || subraceKo === "하이 하프 엘프");

  // ====== 렌더 ======
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
                <div>{weaponsOut.join(", ")}</div>

                <div style={{ color:"#6b7280" }}>{T.skills}</div>
                <div>{skillsOut.join(", ")}</div>
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
                <button onClick={()=>{
                  if (!lockRace) rollRace();
                  if (!lockClass) rollClass();
                  if (!lockBG) rollBackground();
                  rollStats();
                  setTimeout(()=>{ if(!lockWeapons) rollWeapons(); if(!lockSkills) rollSkills(); },0);
                }} style={btnPrimary}>{T.rollAll}</button>
                <button onClick={()=>{rollRace(); setTimeout(rollWeapons,0);}} style={btn}>{T.onlyRace}</button>
                <button onClick={()=>{rollClass(); setTimeout(()=>{rollWeapons(); rollSkills();},0);}} style={btn}>{T.onlyClass}</button>
                <button onClick={()=>{rollBackground(); setTimeout(rollSkills,0);}} style={btn}>{T.onlyBG}</button>
                <button onClick={rollStats} style={btn}>{T.rollStats}</button>
                <button onClick={rollWeapons} style={btn}>{T.rerollWeapons}</button>
                <button onClick={rollAny2Weapons} style={btn}>{T.any2Weapons}</button>
                <button onClick={rollSkills} style={btn}>{T.rollSkills}</button>
              </div>

              {/* 하이 엘프 특례 안내 */}
              {isHighElf && (
                <div style={{ marginTop:8, fontSize:13, color:"#374151" }}>
                  하이 엘프(또는 하이 하프 엘프)는 위저드 소마법 1개를 추가로 배웁니다. 클래스별 특성에서 주문 추천 시 반영됩니다.
                </div>
              )}
            </section>

            {/* 재주 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginTop:16 }}>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 12px" }}>{T.featSection}</h2>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <button onClick={rollFeat} style={btn}>{T.rollFeat}</button>
                {feat && (
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    <div style={{ fontWeight:800 }}>{feat.name}</div>
                    {feat.detail && <div>{feat.detail}</div>}
                    <div>
                      <button onClick={()=>excludeFeat(feat.name)} style={btnSmall}>제외하고 다시</button>
                    </div>
                  </div>
                )}
              </div>

              {/* 재주 제외 리스트 */}
              {excludedFeats.length>0 && (
                <div style={{ marginTop:10 }}>
                  <div style={{ fontSize:13, color:"#6b7280", marginBottom:6 }}>{T.excludeList} (재주)</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {excludedFeats.map((x)=><span key={x} style={pill}>{x}</span>)}
                  </div>
                </div>
              )}
            </section>

            {/* 주사위 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginTop:16 }}>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 12px" }}>{T.diceTitle}</h2>
              <div style={{ display:"flex", gap:8, alignItems:"center", width:"100%" }}>
                <input value={diceExpr} onChange={(e)=>setDiceExpr(e.target.value)} placeholder={T.dicePH} style={{...input, flex:1}}/>
                <button onClick={handleRollDice} style={btn}>{T.rollDice}</button>
              </div>
              {diceDetail && <div style={{ marginTop:8, color:"#374151" }}>{diceDetail}</div>}
            </section>

            {/* 승자 정하기 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginTop:16, marginBottom:24 }}>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 12px" }}>{T.vsTitle}</h2>
              <div style={{ display:"flex", gap:8, alignItems:"center", width:"100%" }}>
                <input value={names} onChange={(e)=>setNames(e.target.value)} placeholder={T.vsPH} style={{...input, flex:1}}/>
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
                <label style={{...smallLabel, alignSelf:"flex-start"}}>{L[lang].locks}</label>
                <input type="checkbox" checked={lockRace} onChange={e=>setLockRace(e.target.checked)} style={{ alignSelf:"flex-start" }}/>
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
                <label style={{...smallLabel, alignSelf:"flex-start"}}>{L[lang].locks}</label>
                <input type="checkbox" checked={lockClass} onChange={e=>setLockClass(e.target.checked)} style={{ alignSelf:"flex-start" }}/>
              </div>

              {/* 출신 */}
              <div style={row}>
                <label style={label}>{T.background}</label>
                <select value={bg} onChange={(e:any)=>setBg(e.target.value as Background)} style={select}>
                  <option value="-">-</option>
                  {BACK_KO.map(b=><option key={b} value={b}>{lang==="ko"?b:BACK_EN[b]}</option>)}
                </select>
                <label style={{...smallLabel, alignSelf:"flex-start"}}>{L[lang].locks}</label>
                <input type="checkbox" checked={lockBG} onChange={e=>setLockBG(e.target.checked)} style={{ alignSelf:"flex-start" }}/>
              </div>

              {/* 무기 선택 + 락 */}
              <div style={row}>
                <label style={label}>{T.weapons}</label>
                <button onClick={()=>{ setTempWeaponSel(weaponsKO); setShowWeaponPicker(true); }} style={btn}>{T.openPicker}</button>
                <label style={{...smallLabel, alignSelf:"flex-start"}}>{L[lang].locks}</label>
                <input type="checkbox" checked={lockWeapons} onChange={e=>setLockWeapons(e.target.checked)} style={{ alignSelf:"flex-start" }}/>
              </div>
              {showWeaponPicker && (
                <div style={pickerBox}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(160px, 1fr))", gap:6, maxHeight:260, overflow:"auto" }}>
                    {ALL_WEAPON_KO.map(w=>(
                      <label key={w} style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <input type="checkbox" checked={tempWeaponSel.includes(w)} onChange={(e)=>{
                          setTempWeaponSel(prev => e.target.checked ? [...prev, w] : prev.filter(x=>x!==w));
                        }}/>
                        <span>{w}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:8 }}>
                    <button onClick={()=>{ setWeaponsKO(tempWeaponSel); setShowWeaponPicker(false); }} style={btn}>{T.apply}</button>
                    <button onClick={()=>setShowWeaponPicker(false)} style={btnSecondary}>{T.cancel}</button>
                    <button onClick={()=>{
                      // 현재 무기를 제외 리스트에 넣고 재추천에 반영
                      setExcludedWeapons(prev => Array.from(new Set([...prev, ...weaponsKO])));
                      setShowWeaponPicker(false);
                    }} style={btnSmall}>현재 무기 제외</button>
                  </div>
                  {excludedWeapons.length>0 && (
                    <div style={{ marginTop:8, fontSize:12, color:"#6b7280" }}>
                      {T.excludeList} (무기): {excludedWeapons.join(", ")}
                    </div>
                  )}
                </div>
              )}

              {/* 기술 선택 + 락 */}
              <div style={row}>
                <label style={label}>{T.skills}</label>
                <button onClick={()=>{ setTempSkillSel(skills); setShowSkillPicker(true); }} style={btn}>{T.openPicker}</button>
                <label style={{...smallLabel, alignSelf:"flex-start"}}>{L[lang].locks}</label>
                <input type="checkbox" checked={lockSkills} onChange={e=>setLockSkills(e.target.checked)} style={{ alignSelf:"flex-start" }}/>
              </div>
              {showSkillPicker && (
                <div style={pickerBox}>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(160px, 1fr))", gap:6, maxHeight:260, overflow:"auto" }}>
                    {ALL_SKILL_KEYS.map(k=>(
                      <label key={k} style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <input type="checkbox" checked={tempSkillSel.includes(k)} onChange={(e)=>{
                          setTempSkillSel(prev => e.target.checked ? [...prev, k] : prev.filter(x=>x!==k));
                        }}/>
                        <span>{lang==="ko"?SK.KO[k]:SK.EN[k]}</span>
                      </label>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:8 }}>
                    <button onClick={()=>{ setSkills(tempSkillSel); setShowSkillPicker(false); }} style={btn}>{T.apply}</button>
                    <button onClick={()=>setShowSkillPicker(false)} style={btnSecondary}>{T.cancel}</button>
                    <button onClick={()=>{
                      setExcludedSkills(prev => Array.from(new Set([...prev, ...skills.map(s=>SK.KO[s])])));
                      setShowSkillPicker(false);
                    }} style={btnSmall}>현재 기술 제외</button>
                  </div>
                  {excludedSkills.length>0 && (
                    <div style={{ marginTop:8, fontSize:12, color:"#6b7280" }}>
                      {T.excludeList} (기술): {excludedSkills.join(", ")}
                    </div>
                  )}
                </div>
              )}
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
                  <input type="number" min={1} max={12} value={growLevel} onChange={(e)=>setGrowLevel(parseInt(e.target.value||"1",10))} style={{...input, width:110}}/>
                </div>
                <div style={row}>
                  <label style={label}>{T.howMany}</label>
                  <input type="number" min={0} max={5} value={growCount} onChange={(e)=>setGrowCount(parseInt(e.target.value||"0",10))} style={{...input, width:110}}/>
                </div>
                <div>
                  <button onClick={doSuggestGrowth} style={btn}>{T.suggest}</button>
                </div>

                {/* 추천 결과 + 제외 버튼 */}
                {growResult.length>0 && (
                  <div style={{ marginTop:8 }}>
                    {growResult.map((g,i)=>(
                      <div key={`${g.key}-${g.value}-${i}`} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span>• <b>{g.key}</b>: {g.value}</span>
                        <button onClick={()=>excludeGrowthItem(g)} style={btnTiny}>제외</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 제외 리스트 */}
                {(excludedSpells.length>0 || excludedFeatures.length>0) && (
                  <div style={{ marginTop:10 }}>
                    {excludedSpells.length>0 && (
                      <>
                        <div style={{ fontSize:13, color:"#6b7280", marginBottom:6 }}>{T.excludeList} (주문)</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                          {excludedSpells.map((x)=><span key={`sp-${x}`} style={pill}>{x}</span>)}
                        </div>
                      </>
                    )}
                    {excludedFeatures.length>0 && (
                      <>
                        <div style={{ fontSize:13, color:"#6b7280", marginBottom:6 }}>{T.excludeList} (특성)</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {excludedFeatures.map((x)=><span key={`ft-${x}`} style={pill}>{x}</span>)}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------- 스타일 --------
const row: React.CSSProperties = { display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" };
const label: React.CSSProperties = { width:90, color:"#374151" };
const smallLabel: React.CSSProperties = { color:"#6b7280", marginLeft:8 };
const select: React.CSSProperties = { padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, minWidth:160 };

const btnBase: React.CSSProperties = { padding:"10px 14px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer" };
const btn: React.CSSProperties = { ...btnBase };
const btnPrimary: React.CSSProperties = { ...btnBase, background:"#111827", color:"#fff", borderColor:"#111827" };
const btnSecondary: React.CSSProperties = { ...btnBase, background:"#f3f4f6" };
const btnSmall: React.CSSProperties = { ...btnBase, padding:"6px 10px", fontSize:13 };
const btnTiny: React.CSSProperties = { ...btnBase, padding:"4px 8px", fontSize:12 };
const input: React.CSSProperties = { padding:"12px 12px", border:"1px solid #e5e7eb", borderRadius:10, minWidth:260 };
const badge: React.CSSProperties = { display:"inline-block", padding:"0 6px", fontSize:12, borderRadius:999, background:"#111827", color:"#fff", lineHeight:"18px", height:18, margin:"0 2px" };
const pill: React.CSSProperties = { padding:"4px 8px", background:"#f3f4f6", borderRadius:999, fontSize:12, border:"1px solid #e5e7eb" };
const pickerBox: React.CSSProperties = { border:"1px solid #e5e7eb", borderRadius:10, padding:12, marginTop:8, background:"#fafafa" };
