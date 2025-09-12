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



type GrowthKey = "전투 방식" | "전투 기법" | "바드 통달" | "마법 비밀" | "바드 스타일" | "야수의 심장" | "야수의 상" | "워락 영창" | "소서러 변형" | "주문" | "비전 사격" | "하이엘프 소마법" | "확장 주문(위저드)";
type SpellDB = { maxSpellLevel?: (lv:number)=>number; spells?: Record<number, string[]>; open: (level:number, subclass?:string)=>Partial<Record<GrowthKey, string[]>>; };

const BM_MANEUVERS = ["사령관의 일격","무장 해제 공격","교란의 일격","날렵한 발놀림","속임수 공격","도발 공격","전투 기법 공격","위협 공격","정밀 공격","밀치기 공격","고양","응수","휩쓸기","다리 걸기 공격"];

const ELDRITCH_SHOTS = [
  "비전 사격: 추방 화살","비전 사격: 현혹 화살","비전 사격: 폭발 화살","비전 사격: 약화 화살",
  "비전 사격: 속박 화살","비전 사격: 추적 화살","비전 사격: 그림자 화살","비전 사격: 관통 화살"
];

const GROWTH_DB: Record<string, SpellDB> = {
  Fighter: {
    open: (lv, sub) => {   void sub;void lv;
      const style = ["궁술","방어술","결투술","대형 무기 전투","엄호술","쌍수 전투"];
      const o: Partial<Record<GrowthKey,string[]>> = {};
      if(lv===1) o["전투 방식"]=style;
      if(sub==="전투의 대가"){
        if(lv===3) o["전투 기법"]=BM_MANEUVERS;
        if(lv===7) o["전투 기법"]=BM_MANEUVERS;
        if(lv===10) o["전투 기법"]=BM_MANEUVERS;
      }
      if(sub==="투사" && lv===10) o["전투 방식"]=style;
      if(sub==="비전 궁수"){
        if(lv===3) { o["주문"]= ["인도","빛","진실의 일격"]; o["비전 사격"]=ELDRITCH_SHOTS; }
        if(lv===7) o["비전 사격"]=ELDRITCH_SHOTS;
        if(lv===10) o["비전 사격"]=ELDRITCH_SHOTS;
      }
      if(sub==="비술 기사"){
        if(lv===3) o["확장 주문(위저드)"]=["(1레벨 위저드 주문 택1)"];
        if(lv===8) o["확장 주문(위저드)"]=["(2레벨 위저드 주문 택1)"];
      }
      return o;
    },
    maxSpellLevel: (lv)=> Math.min(3, Math.floor((lv+1)/4)), // EK 주문 대략
    spells: {
      0: ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","마법사의 손","하급 환영","진실의 일격","폭음의 검"],
      1: ["불타는 손길","오색 보주","마력탄","마법사의 갑옷","선악 보호","방어막","천둥파","마녀의 화살"],
      2: ["멜프의 산성 화살","비전 자물쇠","어둠","돌풍","작열 광선","파쇄","그림자 검"],
    }
  },
  Rogue: {
    open: (lv, sub) => {   void sub;void lv;
      const o: Partial<Record<GrowthKey,string[]>> = {};
      if(sub==="비전 괴도"){
        if(lv===3) o["확장 주문(위저드)"]=["(1레벨 위저드 주문 택1)"];
        if(lv===8) o["확장 주문(위저드)"]=["(2레벨 위저드 주문 택1)"];
      }
      return o;
    },
    maxSpellLevel: (lv)=> (lv>=7?2: (lv>=3?1:0)),
    spells: {
      0: ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","하급 환영","진실의 일격","폭음의 검"],
      1: ["인간형 매혹","오색 빛보라","변장","타샤의 끔찍한 웃음","수면"],
      2: ["잔상","광기의 왕관","인간형 포박","투명","거울 분신","환영력","그림자 검"],
    }
  },
  Bard: {
    open: (lv, sub) => {   void sub;void lv;
      const o: Partial<Record<GrowthKey,string[]>> = {};
      if(lv===3) o["바드 통달"]=["(기술 2개 통달)"];
      if(sub==="전승학파"){
        if(lv===3) o["바드 통달"]=["(기술 숙련 3개)"];
        if(lv===6) o["마법 비밀"]=["(타 클래스 주문 선택)"];
      }
      if(sub==="검술학파" && lv===3) o["바드 스타일"]=["결투술","쌍수 전투"];
      return o;
    },
    maxSpellLevel: (lv)=> Math.min(6, Math.floor((lv+1)/2)),
    spells: {
      0: ["신랄한 조롱","도검 결계","마법사의 손","진실의 일격","친구","춤추는 빛","빛","하급 환영","폭발하는 힘"],
      1: ["동물 교감","액운","인간형 매혹","상처 치료","변장","불협화음의 속삭임","요정불","깃털 낙하","치유의 단어","영웅심","활보","수면","동물과 대화","타샤의 끔찍한 웃음","천둥파"],
      2: ["실명","평정심","단검 구름","광기의 왕관","생각 탐지","능력 강화","노예화","금속 가열","인간형 포박","투명","노크","하급 회복","환영력","투명체 감지","파쇄","침묵"],
      3: ["저주 부여","공포","죽은 척","결계 문양","최면 문양","식물 성장","망자와 대화","악취 구름"],
      4: ["혼란","차원문","자유 이동","중급 투명","변신"],
      5: ["인간형 지배","상급 회복","괴물 포박","다중 상처 치료","이차원인 속박","외견"],
      6: ["깨무는 눈길","오토의 참을 수 없는 춤"],
    }
  },
  Barbarian: {
    open: (lv, sub) => {   void sub;void lv;
      const o: Partial<Record<GrowthKey,string[]>> = {};
      if(sub==="야생의 심장"){
        if(lv===3) o["야수의 심장"]=["곰의 심장","독수리의 심장","엘크의 심장","호랑이의 심장","늑대의 심장"];
        if(lv===6 || lv===10) o["야수의 상"]=["곰","침팬지","악어","독수리","엘크","벌꿀오소리","말","호랑이","늑대","울버린"];
      }
      return o;
    }
  },
  Warlock: {
    open: (lv, sub) => {   void sub;void lv;
      const inv = ["고뇌의 파동","그림자 갑옷","야수의 언어","교언영색","악마의 눈","마족의 활력","수많은 얼굴의 가면","그림자 동행","격퇴의 파동","다섯 숙명의 도둑","정신의 수렁","불길한 징조","고대 비밀의 서","공포의 단어","살점 조각가","혼돈의 하수인","초차원 도약","망자의 속삭임","생명을 마시는 자"];
      const o: Partial<Record<GrowthKey,string[]>> = {};
      if(lv===2) o["워락 영창"]=inv;
      if(lv===5) o["워락 영창"]=inv;
      if(lv===7) o["워락 영창"]=inv;
      if(lv===9) o["워락 영창"]=inv;
      if(lv===12) o["워락 영창"]=inv;
      return o;
    },
    maxSpellLevel: (lv)=> Math.min(5, Math.floor((lv+1)/2)),
    spells: {
      0: ["도검 결계","뼛속 냉기","섬뜩한 파동","친구","마법사의 손","하급 환영","독 분사","진실의 일격","폭음의 검","망자의 종소리"],
      1: ["아거티스의 갑옷","하다르의 팔","인간형 매혹","신속 후퇴","지옥의 질책","주술","선악 보호","마녀의 화살"],
      2: ["단검 구름","광기의 왕관","어둠","노예화","인간형 포박","투명","거울 분신","안개 걸음","약화 광선","파쇄","그림자 검"],
      3: ["주문 방해","공포","비행 부여","기체 형태","하다르의 굶주림","최면 문양","저주 해제","흡혈의 손길"],
      4: ["추방","역병","차원문"],
      5: ["괴물 포박"],
    }
  },
  Sorcerer: {
    open: (lv) => {
      const meta2 = ["정밀 주문","원격 주문","연장 주문","이중 주문"];
      const meta3 = ["증폭 주문","신속 주문","은밀 주문"];
      const o: Partial<Record<GrowthKey,string[]>> = {};
      if(lv===2) o["소서러 변형"]=meta2;
      if(lv===3) o["소서러 변형"]=meta3;
      if(lv===10) o["소서러 변형"]=meta3;
      return o;
    },
    maxSpellLevel: (lv)=> Math.min(6, Math.floor((lv+1)/2)),
    spells: {
      0: ["도검 결계","산성 거품","마법사의 손","독 분사","진실의 일격","친구","춤추는 빛","화염살","빛","서리 광선","전격의 손아귀","하급 환영","뼛속 냉기","폭음의 검","폭발하는 힘"],
      1: ["불타는 손길","인간형 매혹","오색 보주","오색 빛보라","변장","신속 후퇴","거짓 목숨","깃털 낙하","안개구름","얼음 칼","도약 강화","마법사의 갑옷","마력탄","독 광선","방어막","수면","천둥파","마녀의 화살"],
      2: ["실명","잔상","단검 구름","광기의 왕관","어둠","암시야","생각 탐지","능력 강화","확대/축소","돌풍","인간형 포박","투명","노크","거울 분신","안개 걸음","환영력","작열 광선","투명체 감지","파쇄","거미줄","그림자 검"],
      3: ["점멸","주문 방해","햇빛","공포","화염구","비행 부여","기체 형태","가속","최면 문양","번개 줄기","에너지 보호","진눈깨비 폭풍","둔화","악취 구름"],
      4: ["추방","역병","혼란","차원문","야수 지배","상급 투명","얼음 폭풍","변신","바위 피부","화염 벽"],
      5: ["죽음 구름","냉기 분사","인간형 지배","괴물 포박","곤충 떼","외견","염력","바위의 벽"],
      6: ["비전 관문","연쇄 번개","죽음의 원","분해","깨무는 눈길","무적의 구체","햇살"],
    }
  },
  Wizard: {
    open: (lv, sub) => {   void sub;void lv;
      const o: Partial<Record<GrowthKey,string[]>> = {};
      if(sub==="칼날 노래" && lv===1) o["전투 방식"]=["(무기 숙련 추가 적용됨)"];
      return o;
    },
    maxSpellLevel: (lv)=> 6,
    spells: {
      0: ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","마법사의 손","하급 환영","진실의 일격","폭음의 검","망자의 종소리"],
      1: ["불타는 손길","인간형 매혹","오색 보주","오색 빛보라","변장","신속 후퇴","거짓 목숨","깃털 낙하","소환수 찾기","안개구름","기름칠","얼음 칼","도약 강화","활보","마법사의 갑옷","마력탄","선악 보호","독 광선","방어막","수면","타샤의 끔찍한 웃음","천둥파","마녀의 화살"],
      2: ["비전 자물쇠","실명","잔상","단검 구름","광기의 왕관","어둠","암시야","생각 탐지","확대/축소","화염 구체","돌풍","인간형 포박","투명","노크","마법 무기","멜프의 산성 화살","거울 분신","안개 걸음","환영력","약화 광선","작열 광선","투명체 감지","파쇄","거미줄","그림자 검"],
      3: ["망자 조종","저주 부여","점멸","주문 방해","공포","죽은 척","화염구","비행 부여","기체 형태","결계 문양","가속","최면 문양","번개 줄기","에너지 보호","저주 해제","진눈깨비 폭풍","둔화","악취 구름","흡혈의 손길"],
      4: ["추방","역병","혼란","하급 정령 소환","차원문","에바드의 검은 촉수","화염 방패","상급 투명","얼음 폭풍","오틸루크의 탄성 구체","환영 살해자","변신","바위 피부","화염 벽"],
      5: ["죽음 구름","냉기 분사","정령 소환","인간형 지배","괴물 포박","이차원인 속박","외견","염력","바위의 벽"],
      6: ["비전 관문","연쇄 번개","죽음의 원","언데드 생성","분해","깨무는 눈길","육신 석화","무적의 구체","오틸루크의 빙결 구체","오토의 참을 수 없는 춤","햇살","얼음의 벽"],
    }
  },
  Ranger: {
    open: (lv, sub) => {   void sub;void lv;
      const o: Partial<Record<GrowthKey,string[]>> = {};
      if(sub==="무리지기" && lv===3) o["주문"]=["꿀벌 군단","해파리 떼","나방 쇄도"];
      return o;
    },
    maxSpellLevel: (lv)=> (lv>=9?3: (lv>=5?2: (lv>=2?1:0))),
    spells: {
      1: ["동물 교감","상처 치료","속박의 일격","안개구름","맛있는 열매","가시 세례","사냥꾼의 표식","도약 강화","활보","동물과 대화"],
      2: ["나무껍질 피부","암시야","하급 회복","신출귀몰","독 보호","침묵","가시밭"],
      3: ["포화 소환","햇빛","번개 화살","식물 성장","에너지 보호"],
    }
  },
};
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
    setTimeout(()=>{ if(!lockWeapons) rollWeapons(); if(!lockSkills) rollSkills(); },0);
  }

  /** ===== Dice/Vs ===== */
  function handleRollDice() {
    const p = parseDice(diceExpr);
    if(!p){ setDiceDetail("형식 오류"); return; }
    const rolls = Array.from({length:p.n},()=>1+rand(p.m));
    const total = rolls.reduce((a,b)=>a+b,0) + p.mod;
    const modStr = p.mod ? (p.mod>0?`+${p.mod}`:`${p.mod}`) : "";
    setDiceDetail(`${p.n}d${p.m}${modStr} → [ ${rolls.join(", ")} ] = ${total}`);
  }
  function handleVersus() {
    const list = names.split(/[, \n]+/).map(s=>s.trim()).filter(Boolean);
    if(list.length===0){ setVsLines(["이름을 입력하세요"]); setVsWinner(""); return; }
    if(list.length>20){ setVsLines(["참가자가 20명을 초과했습니다 (1d20 고유치 불가)"]); setVsWinner(""); return; }
    const available = new Set(Array.from({length:20},(_,i)=>i+1));
    const picks: {name:string; roll:number}[] = [];
    for(const n of list){
      // 고유 값 배정: 충돌 시 재시도
      let r = 1+rand(20); let guard=200;
      while(!available.has(r) && guard-->0){ r = 1+rand(20); }
      if(!available.has(r)){
        // 남은 것 중 하나 할당
        const rest=[...available]; r=rest[rand(rest.length)];
      }
      available.delete(r);
      picks.push({name:n, roll:r});
    }
    const max = Math.max(...picks.map(p=>p.roll));
    const winners = picks.filter(p=>p.roll===max).map(p=>p.name);
    setVsLines(picks.map(p=>`${p.name}: ${p.roll}`));
    setVsWinner(winners.join(", "));
  }

  /** ===== 클래스별 특성 추천 ===== */
  function doSuggestGrowth() {
    if (growClass === "-") { setGrowResult([lang==="ko"?"클래스를 먼저 선택":"Pick class first"]); return; }
    const rule = GROWTH_DB[growClass];
    if (!rule) { setGrowResult([lang==="ko"?"아직 이 클래스는 준비중":"Not supported yet"]); return; }
    const opens = rule.open(growLevel, growSub);
    const lines: string[] = [];

    // 1) 비주문 선택지: 전투 기법/비전 사격/바드 스타일 등
    // - 전투의 대가 디폴트: 3레벨 3개, 7레벨 2개, 10레벨 2개
    const exclude = growExcluded;
    for (const [k, pool] of Object.entries(opens)) {
      if (!pool || pool.length===0) continue;
      const filtered = pool.filter(x=>!exclude.has(`${k}:${x}`));
      if (k==="전투 기법") {
        const want = (growLevel===3?3:(growLevel===7?2:(growLevel===10?2:1)));
        sampleN(filtered, want).forEach(p => lines.push(`${k}: ${p}`));
        continue;
      }
      if (k==="비전 사격") {
        const want = (growLevel===3?3:(growLevel===7?1:(growLevel===10?1:1)));
        sampleN(filtered, want).forEach(p => lines.push(`${k}: ${p}`));
        continue;
      }
      if (k==="바드 통달") {
        // 실제 기술명을 바로 표시(한/영)
        const classKo = CLASSES[growClass].ko;
        const n = classKo==="바드" ? 2 : 0;
        if (n>0) {
          const allSkills = Object.keys(SK.KO) as SkillKey[];
          // 통달 후보에서 제외 리스트 반영
          const cand = allSkills.filter(s=>!exclude.has(`바드 통달:${s}`));
          sampleN(cand, 2).forEach(s => lines.push(`${k}: ${skillLabel(s)}`));
        } else {
          lines.push(...sampleN(filtered, 1).map(p=>`${k}: ${p}`));
        }
        continue;
      }
      // 일반 항목
      sampleN(filtered, 1).forEach(p => lines.push(`${k}: ${p}`));
    }

    // 2) 주문 추천(배울 주문 수만큼) — 최대 주문 레벨까지 누적 풀
    if (rule.maxSpellLevel && rule.spells) {
      const maxL = rule.maxSpellLevel(growLevel);
      const spellsAll: string[] = [];
      for (let lv=0; lv<=maxL; lv++) if (rule.spells[lv]?.length) spellsAll.push(...rule.spells[lv]!);
      // 하이 엘프/하이 하프 엘프: 위저드 소마법 1개
      if (raceKey!=="-" && (subraceKo==="하이 엘프" || subraceKo==="하이 하프 엘프") && GROWTH_DB.Wizard?.spells?.[0]) {
        const wiz0 = (GROWTH_DB.Wizard.spells[0]!).filter(n=>!exclude.has(`하이엘프 소마법:${n}`));
        if (wiz0.length) lines.push(`${lang==="ko"?"하이엘프 소마법":"High Elf Cantrip"}: ${choice(wiz0)}`);
      }
      // 제외 리스트 반영
      const filtered = spellsAll.filter(s=>!exclude.has(`주문:${s}`));
      const want = Math.max(0, growSpellCount|0);
      sampleN(filtered, want).forEach(s=>lines.push(`주문: ${s}`));
    }

    setGrowResult(lines.length ? lines : [lang==="ko"?"추천 항목 없음":"No suggestions"]);
  }

  /** ===== 재주(간단 랜덤 + 세부옵션/제외 토글) ===== */
  const FEATS = [
    "능력 향상","운동선수","원소 숙련","경갑 무장","마법 입문","무예 숙련","평갑의 달인","저항력","의식 시전자","숙련가","주문 저격수","술집 싸움꾼","무기의 달인",
    // 기타 일반 재주도 포함 가능 — 여기선 대표 위주
  ] as const;

  function rollFeat() {
    const name = choice(FEATS);
    const details: string[] = [];
    // 세부 규칙 반영(요약)
    if(name==="능력 향상"){
      const a = choice(ABILS); let b = choice(ABILS); while(b===a) b = choice(ABILS);
      details.push(`${abilLabel(a)} +1`, `${abilLabel(b)} +1`);
    } else if(name==="운동선수"){
      details.push(`${lang==="ko"?"근력/민첩 중 택1":"Pick STR or DEX"}`);
    } else if(name==="원소 숙련"){
      details.push("산성/냉기/화염/번개/천둥 중 택1");
    } else if(name==="경갑 무장" || name==="평갑의 달인" || name==="술집 싸움꾼"){
      details.push(`${lang==="ko"?"근력/민첩 중 택1":"Pick STR or DEX"}`);
    } else if(name==="마법 입문"){
      // 클래스 선택 → 해당 클래스 소마법2 + 1레벨 주문1
      const classes = ["바드","클레릭","드루이드","소서러","워락","위저드"];
      const pick = choice(classes);
      details.push(`${pick}: ${lang==="ko"?"소마법 2개 + 1레벨 주문 1개":"2 cantrips + 1 level-1 spell"}`);
    } else if(name==="무예 숙련"){
      details.push("전투의 대가 전투 기법 2개");
    } else if(name==="저항력"){
      details.push("근력/민첩/건강/지능/지혜/매력 중 택1");
    } else if(name==="의식 시전자"){
      details.push("망자와 대화/소환수 찾기/활보/도약 강화/변장/동물과 대화 중 택2");
    } else if(name==="숙련가"){
      details.push(`${lang==="ko"?"기술 3개 숙련":"Proficiency in 3 skills"}`);
    } else if(name==="주문 저격수"){
      details.push("뼛속 냉기/섬뜩한 파동/화염살/서리 광선/전격의 손아귀/가시 채찍 중 택1");
    } else if(name==="무기의 달인"){
      details.push(`${lang==="ko"?"근력/민첩 중 택1 + 무기 4종 숙련":"Pick STR/DEX + 4 weapon profs"}`);
    }
    setFeatName(name);
    setFeatDetails(details);
  }

  function excludeGrowthItem(tag: string){
    const n = new Set(growExcluded); n.add(tag); setGrowExcluded(n);
  }
  function unexcludeGrowthItem(tag: string){
    const n = new Set(growExcluded); n.delete(tag); setGrowExcluded(n);
  }
  function excludeFeatDetail(tag: string){
    const n = new Set(featExcluded); n.add(tag); setFeatExcluded(n);
  }
  function unexcludeFeatDetail(tag: string){
    const n = new Set(featExcluded); n.delete(tag); setFeatExcluded(n);
  }

  // 드롭다운 라벨
  const raceOptions = Object.keys(RACES) as (keyof typeof RACES)[];
  const classOptions = Object.keys(CLASSES) as (keyof typeof CLASSES)[];

  // 배경 라벨
  const bgLabel = (b: Background) => (b === "-" ? "" : (lang === "ko" ? b : BACK_EN[b]));

  // 무기/기술 픽커 후보(단순): 무기는 현재 종족/클래스 풀 기준, 기술은 전체
  const currentRaceKo = raceKey === "-" ? "" : RACES[raceKey].ko;
  const currentClassKo = classKey === "-" ? "" : CLASSES[classKey].ko;
  const weaponPoolNow = computeWeapons(currentRaceKo, currentClassKo, subclassKo);
  const allSkills = Object.keys(SK.KO) as SkillKey[];

  // 능력치 배지
  const badge: React.CSSProperties = { display:"inline-block", padding:"0 6px", fontSize:12, borderRadius:999, background:"#111827", color:"#fff", lineHeight:"18px", height:18, margin:"0 2px" };

  // 스타일 공통
  const row: React.CSSProperties = { display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" };
  const label: React.CSSProperties = { width:90, color:"#374151" };
  const select: React.CSSProperties = { padding:"8px 10px", border:"1px solid #e5e7eb", borderRadius:10, minWidth:160 };
  const btnBase: React.CSSProperties = { padding:"10px 14px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer" };
  const btn: React.CSSProperties = { ...btnBase };
  const btnPrimary: React.CSSProperties = { ...btnBase, background:"#111827", color:"#fff", borderColor:"#111827" };
  const btnSecondary: React.CSSProperties = { ...btnBase, background:"#f3f4f6" };
  const input: React.CSSProperties = { padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, minWidth:260 };

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

