import type { Abil, Background } from "./types";

// ── i18n 라벨 ────────────────────────────────────────────────────────────────
export const L = {
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
    rerollWeapons: "Reroll Proficient",
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

// 능력치 라벨(KO)
export const abilKo: Record<Abil,string> = {
  STR:"힘", DEX:"민첩", CON:"건강", INT:"지능", WIS:"지혜", CHA:"매력"
};

// ── 클래스/종족 ─────────────────────────────────────────────────────────────
export const CLASSES: Record<string, { ko: string; subclasses: string[] }> = {
  Barbarian: { ko:"바바리안", subclasses:["야생의 심장","광전사","야생 마법","거인"] },
  Bard: { ko:"바드", subclasses:["전승학파","용맹학파","검술학파","요술학파"] },
  Cleric: { ko:"클레릭", subclasses:["생명 권역","빛 권역","기만 권역","지식 권역","자연 권역","폭풍 권역","전쟁 권역","죽음 권역"] },
  Druid: { ko:"드루이드", subclasses:["땅의 회합","달의 회합","포자의 회합","별의 회합"] },
  Fighter: { ko:"파이터", subclasses:["전투의 대가","비술 기사","투사","비전 궁수"] },
  Monk: { ko:"몽크", subclasses:["사원소의 길","열린 손의 길","그림자의 길","취권 달인의 길"] },
  Paladin: { ko:"팔라딘", subclasses:["헌신의 맹세","선조의 맹세","복수의 맹세","왕관의 맹세","맹세파기자"] },
  Ranger: { ko:"레인저", subclasses:["사냥꾼","야수 조련사","어둠 추적자","무리지기"] },
  Rogue: { ko:"로그", subclasses:["도둑","비전 괴도","암살자","칼잡이"] },
  Sorcerer: { ko:"소서러", subclasses:["용의 혈통","야생 마법","폭풍 술사","그림자 마법"] },
  Warlock: { ko:"워락", subclasses:["마족","고대의 지배자","대요정","주술 칼날"] },
  Wizard: { ko:"위저드", subclasses:["방호술","방출술","사령술","창조술","환혹술","예지술","환영술","변환술","칼날 노래"] },
};

export const RACES: Record<string, { ko: string; subs?: string[] }> = {
  Human: { ko:"인간" },
  Elf: { ko:"엘프", subs:["하이 엘프","우드 엘프"] },
  Tiefling: { ko:"티플링", subs:["아스모데우스 티플링","메피스토펠레스 티플링","자리엘 티플링"] },
  Drow: { ko:"드로우", subs:["롤쓰 스원 드로우","셀다린 드로우"] },
  Githyanki: { ko:"기스양키" },
  Dwarf: { ko:"드워프", subs:["골드 드워프","실드 드워프","드웨가"] },
  "Half-Elf": { ko:"하프엘프", subs:["하이 하프 엘프","우드 하프 엘프","드로우 하프 엘프"] },
  Halfling: { ko:"하플링", subs:["라이트풋 하플링","스트롱하트 하플링"] },
  Gnome: { ko:"노움", subs:["바위 노움","숲 노움","딥 노움"] },
  Dragonborn: { ko:"드래곤본", subs:["블랙","코퍼","블루","브론즈","브래스","레드","골드","그린","화이트","실버"] },
  "Half-Orc": { ko:"하프오크" },
};

// ── 배경/스킬 ───────────────────────────────────────────────────────────────
export const BACK_KO = ["복사","사기꾼","범죄자","연예인","시골 영웅","길드 장인","귀족","이방인","현자","군인","부랑아"] as const;

export const BACK_EN: Record<Exclude<Background,"-">, string> = {
  "복사":"Acolyte","사기꾼":"Charlatan","범죄자":"Criminal","연예인":"Entertainer","시골 영웅":"Folk Hero",
  "길드 장인":"Guild Artisan","귀족":"Noble","이방인":"Outlander","현자":"Sage","군인":"Soldier","부랑아":"Urchin"
};

export const SK = {
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
} as const;

export const BG_SKILLS: Record<Exclude<Background,"-">, [keyof typeof SK.KO, keyof typeof SK.KO]> = {
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

// 클래스별 선택 가능 스킬과 개수(배경 2개 제외 후 N개 추천)
export const CLASS_SK_CHOICE: Record<string, { n: number; list: (keyof typeof SK.KO)[] }> = {
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

// ── 무기(EN 원본 + KO 매핑) ────────────────────────────────────────────────
const SIMPLE = ["Club","Dagger","Greatclub","Handaxe","Javelin","Light Crossbow","Light Hammer","Mace","Quarterstaff","Shortbow","Sickle","Spear"] as const;
const SIMPLE_KO: Record<(typeof SIMPLE)[number], string> = {
  "Club":"곤봉","Dagger":"단검","Greatclub":"대형 곤봉","Handaxe":"손도끼","Javelin":"투창",
  "Light Crossbow":"경쇠뇌","Light Hammer":"경량 망치","Mace":"철퇴","Quarterstaff":"육척봉",
  "Shortbow":"단궁","Sickle":"낫","Spear":"창"
};

const MARTIAL = ["Battleaxe","Flail","Scimitar","Greataxe","Greatsword","Halberd","Hand Crossbow","Heavy Crossbow","Longbow","Longsword","Maul","Morningstar","Pike","Rapier","Glaive","Shortsword","Trident","Warhammer","War Pick"] as const;
const MARTIAL_KO: Record<(typeof MARTIAL)[number], string> = {
  "Battleaxe":"전투 도끼","Flail":"도리깨","Scimitar":"협도","Greataxe":"대형 도끼","Greatsword":"대검",
  "Halberd":"미늘창","Hand Crossbow":"손 쇠뇌","Heavy Crossbow":"중쇠뇌","Longbow":"장궁","Longsword":"장검",
  "Maul":"대형 망치","Morningstar":"모닝스타","Pike":"장창","Rapier":"레이피어","Glaive":"언월도",
  "Shortsword":"소검","Trident":"삼지창","Warhammer":"전쟁 망치","War Pick":"전쟁 곡괭이"
};

export const ALL_WEAPONS_EN = [...SIMPLE, ...MARTIAL] as const;
export const WEAPON_KO: Record<(typeof ALL_WEAPONS_EN)[number], string> = { ...SIMPLE_KO, ...MARTIAL_KO };
export const SHIELD_KO = "방패";

// ── 숙련 풀(한국어 명칭 기준) ─────────────────────────────────────────────
export const RACE_WEAP_KO: Record<string,string[]> = {
  "인간": ["언월도","미늘창","장창","창"],
  "하프엘프": ["언월도","미늘창","장창","창"],
  "엘프": ["단검","단궁","장검","장궁"],
  "드로우": ["레이피어","소검","손 쇠뇌"],
  "기스양키": ["대검","장검","소검"],
  "드워프": ["경량 망치","손도끼","전투 도끼","전쟁 망치"],
};
export const RACE_SHIELD = new Set(["인간","하프엘프"]);

export const CLASS_WEAP_KO: Record<string,string[]> = {
  "드루이드": ["곤봉","낫","단검","언월도","육척봉","투창","창","철퇴"],
  "몽크": Object.values(SIMPLE_KO).concat("소검"),
  "바드": Object.values(SIMPLE_KO).concat(["레이피어","소검","장검","손 쇠뇌"]),
  "로그": Object.values(SIMPLE_KO).concat(["레이피어","소검","장검","손 쇠뇌"]),
  "소서러": ["단검","육척봉","경쇠뇌"],
  "위저드": ["단검","육척봉","경쇠뇌"],
  "워락": Object.values(SIMPLE_KO),
  "클레릭": Object.values(SIMPLE_KO),
  "레인저": Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  "바바리안": Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  "팔라딘": Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  "파이터": Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
};
export const CLASS_SHIELD = new Set(["파이터","팔라딘","클레릭","레인저","바바리안","드루이드"]);
