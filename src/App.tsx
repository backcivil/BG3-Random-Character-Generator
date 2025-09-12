import React, { useMemo, useState } from "react";

/** BG3 랜덤 생성기 · 단일파일 + 우측 패널 (개선판)
 * - 한/영 라벨 토글 (기술/라벨 현지화)
 * - 승자 정하기: 공백/쉼표 구분 + 중복 눈금 재굴림
 * - 클래스별 특성(구 성장 추천기): 주문은 “배울 주문 수”만 적용, 기법/옵션은 레벨별 디폴트 수량 유지
 * - 파이터(전투의 대가) 3/7/10 레벨 기법 수량 고정
 * - 클레릭(폭풍/전쟁/죽음) 1레벨 군용무기 포함, 위저드(칼날 노래) 추가 무기 숙련 포함
 * - 무기·기술 수동 입력 제거 → 선택 팝업(픽커)
 * - 바드 3레벨 통달: 실제 ‘기술 목록’(한/영)에서 2개 표시/제외 지원
 * - 비전 괴도/비술 기사: ‘확장 주문’(위자드 주문) 레벨/타이밍 반영
 * - 마법 입문: 선택 클래스 주문풀에서 소마법 2 + 1레벨 주문 1 랜덤
 * - “제외”는 부분 항목 단위(예: 숙련가=기술1개씩, 마법 입문=각 주문/소마법 단위)로 즉시 재굴림·토글 복원
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
const uniqueSampleN = <T,>(arr: readonly T[], n: number) => {
  const pool = [...new Set(arr)];
  return shuffle(pool).slice(0, Math.max(0, Math.min(n, pool.length)));
};
const sampleN = uniqueSampleN;
const without = <T,>(arr: readonly T[], remove: Set<T> | T[]) => {
  const bad = Array.isArray(remove) ? new Set(remove) : remove;
  return arr.filter((x) => !bad.has(x));
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
    pickerWeaponsTitle: "무기 선택",
    pickerSkillsTitle: "기술 선택",
    apply: "적용",
    cancel: "취소",
    exclude: "제외",
    excludedList: "제외 목록",
    unexcludeHint: "눌러서 제외 해제",
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
    vsPH: "Space or commas (e.g., Red Yuhi HammerKim Archer)",
    vsRoll: "Roll (1d20)",
    winner: "Winner",
    manualPanel: "Manual Picks & Locks",
    locks: "Lock",
    growth: "Class Features",
    classPick: "Class",
    subPick: "Subclass",
    levelPick: "Level",
    howMany: "Spells to Suggest",
    suggest: "Suggest",
    pickerWeaponsTitle: "Pick Weapons",
    pickerSkillsTitle: "Pick Skills",
    apply: "Apply",
    cancel: "Cancel",
    exclude: "Exclude",
    excludedList: "Excluded",
    unexcludeHint: "Click to un-exclude",
  },
} as const;

// ============ 능력치 ============
const ABILS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
type Abil = (typeof ABILS)[number];
const abilKo: Record<Abil, string> = { STR: "힘", DEX: "민첩", CON: "건강", INT: "지능", WIS: "지혜", CHA: "매력" };

// ============ 종족/클래스 ============
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

// ============ 배경/스킬 ============
const BACK_KO = ["복사", "사기꾼", "범죄자", "연예인", "시골 영웅", "길드 장인", "귀족", "이방인", "현자", "군인", "부랑아"] as const;
type Background = (typeof BACK_KO)[number] | "-";

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

// 배경 고정 스킬
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

// 클래스 선택 스킬 (배경 2개 제외 후 뽑을 풀)
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
  위저드: { n: 2, list: ["Arcana", "History", "Insight", "Investigation", "Medicine", "Religion"] },
};

// ============ 무기 ============
const SIMPLE = ["Club","Dagger","Greatclub","Handaxe","Javelin","Light Crossbow","Light Hammer","Mace","Quarterstaff","Shortbow","Sickle","Spear"] as const;
const SIMPLE_KO: Record<(typeof SIMPLE)[number], string> = {
  Club: "곤봉", Dagger: "단검", Greatclub: "대형 곤봉", Handaxe: "손도끼", Javelin: "투창",
  "Light Crossbow": "경쇠뇌", "Light Hammer": "경량 망치", Mace: "철퇴", Quarterstaff: "육척봉",
  Shortbow: "단궁", Sickle: "낫", Spear: "창"
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
const ALL_WEAPON_KO = Object.values(WEAPON_KO);
const SHIELD_KO = "방패";
const SHIELD_EN = "Shield";

// 종족/클래스 숙련(기본)
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
  드루이드: ["곤봉","낫","단검","언월도","육척봉","투창","창","철퇴"],
  몽크: Object.values(SIMPLE_KO).concat("소검"),
  바드: Object.values(SIMPLE_KO).concat(["레이피어","소검","장검","손 쇠뇌"]),
  로그: Object.values(SIMPLE_KO).concat(["레이피어","소검","장검","손 쇠뇌"]),
  소서러: ["단검","육척봉","경쇠뇌"],
  위저드: ["단검","육척봉","경쇠뇌"],
  워락: Object.values(SIMPLE_KO),
  클레릭: Object.values(SIMPLE_KO),
  레인저: Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  바바리안: Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  팔라딘: Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  파이터: Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
};
const CLASS_SHIELD = new Set(["파이터","팔라딘","클레릭","레인저","바바리안","드루이드"]);

// 서브클래스/권역/전문화로 인한 추가 무기 숙련
const SUBCLASS_EXTRA_WEAPONS: Record<string, string[]> = {
  // Wizard Bladesinger (칼날 노래)
  "위저드:칼날 노래": ["단검","장검","레이피어","협도","소검","낫"],
  // Cleric domains: martial at level 1
  "클레릭:폭풍 권역": Object.values(MARTIAL_KO),
  "클레릭:전쟁 권역": Object.values(MARTIAL_KO),
  "클레릭:죽음 권역": Object.values(MARTIAL_KO),
};

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

// ============ 주문 풀(핵심 + 패치8 추가) ============
type SpellPools = {
  cantrips?: string[];
  level1?: string[];
  level2?: string[];
  level3?: string[];
  level4?: string[];
  level5?: string[];
  level6?: string[];
};
// 공용 함수: 클래스 주문풀 조회 (한국어 문자열 사용)
function getClassSpellPools(classKo: string): SpellPools {
  // (요청된 주요 클래스/서브셋 위주로 구성, 필요시 확장 가능)
  const K: Record<string, SpellPools> = {
    바드: {
      cantrips: ["신랄한 조롱","도검 결계","마법사의 손","진실의 일격","친구","춤추는 빛","빛","하급 환영"],
      level1: ["동물 교감","액운","인간형 매혹","상처 치료","변장","불협화음의 속삭임","요정불","깃털 낙하","치유의 단어","영웅심","활보","수면","동물과 대화","타샤의 끔찍한 웃음","천둥파"],
      level2: ["실명","평정심","단검 구름","광기의 왕관","생각 탐지","능력 강화","노예화","금속 가열","인간형 포박","투명","노크","하급 회복","환영력","투명체 감지","파쇄","침묵"],
      level3: ["저주 부여","공포","죽은 척","결계 문양","최면 문양","식물 성장","망자와 대화","악취 구름"],
      level4: ["혼란","차원문","자유 이동","중급 투명","변신"],
      level5: ["인간형 지배","상급 회복","괴물 포박","다중 상처 치료","이차원인 속박","외견"],
      level6: ["깨무는 눈길","오토의 참을 수 없는 춤"],
    },
    클레릭: {
      cantrips: ["기적술","신성한 불길","인도","저항","빛","도검 결계","불꽃 생성","망자의 종소리" /* 패치8 */],
      level1: ["신앙의 방패","선악 보호","성역","액운","명령","축복","상처 치료","치유의 단어","유도 화살","상처 유발","물 생성 또는 제거"],
      level2: ["지원","하급 회복","수호의 결속","독 보호","평정심","인간형 포박","치유의 기도","영적 무기","침묵","실명","능력 강화"],
      level3: ["희망의 등불","에너지 보호","저주 해제","결계 문양","영혼 수호자","햇빛","다중 치유의 단어","망자 조종","생환","망자와 대화","죽은 척","저주 부여"],
      level4: ["추방","자유 이동","죽음 방비","믿음의 수호자"],
      level5: ["선악 해제","이차원인 속박","상급 회복","곤충 떼","화염 일격","다중 상처 치료","감염"],
      level6: ["영웅의 연회","이차원인 아군","검 방벽","치유","언데드 생성","해악"],
    },
    드루이드: {
      cantrips: ["인도","독 분사","불꽃 생성","저항","마법 곤봉","가시 채찍"],
      level1: ["얼음 칼","휘감기","안개구름","동물과 대화","동물 교감","인간형 매혹","천둥파","치유의 단어","상처 치료","요정불","도약 강화","활보","맛있는 열매","물 생성 또는 제거"],
      level2: ["하급 회복","독 보호","신출귀몰","화염 구체","인간형 포박","화염검","돌풍","달빛","나무껍질 피부","가시밭","능력 강화","금속 가열","암시야"],
      level3: ["에너지 보호","낙뢰 소환","진눈깨비 폭풍","햇빛","죽은 척","식물 성장"],
      level4: ["자유 이동","바위 피부","하급 정령 소환","숲의 존재 소환","포박 덩굴","혼란","야수 지배","얼음 폭풍","화염 벽","역병","변신"],
      level5: ["상급 회복","이차원인 속박","정령 소환","곤충 떼","다중 상처 치료","바위의 벽","감염"],
      level6: ["영웅의 연회","가시의 벽","치유","햇살","바람 걸음"],
    },
    소서러: {
      cantrips: ["도검 결계","산성 거품","마법사의 손","독 분사","진실의 일격","친구","춤추는 빛","화염살","빛","서리 광선","전격의 손아귀","하급 환영","뼛속 냉기","폭음의 검" /* 패치8 */, "폭발하는 힘" /* 패치8 */],
      level1: ["불타는 손길","인간형 매혹","오색 보주","오색 빛보라","변장","신속 후퇴","거짓 목숨","깃털 낙하","안개구름","얼음 칼","도약 강화","마법사의 갑옷","마력탄","독 광선","방어막","수면","천둥파","마녀의 화살"],
      level2: ["실명","잔상","단검 구름","광기의 왕관","어둠","암시야","생각 탐지","능력 강화","확대/축소","돌풍","인간형 포박","투명","노크","거울 분신","안개 걸음","환영력","작열 광선","투명체 감지","파쇄","거미줄","그림자 검" /* 2레벨 패치8 */],
      level3: ["점멸","주문 방해","햇빛","공포","화염구","비행 부여","기체 형태","가속","최면 문양","번개 줄기","에너지 보호","진눈깨비 폭풍","둔화","악취 구름"],
      level4: ["추방","역병","혼란","차원문","야수 지배","상급 투명","얼음 폭풍","변신","바위 피부","화염 벽"],
      level5: ["죽음 구름","냉기 분사","인간형 지배","괴물 포박","곤충 떼","외견","염력","바위의 벽"],
      level6: ["비전 관문","연쇄 번개","죽음의 원","분해","깨무는 눈길","무적의 구체","햇살"],
    },
    워락: {
      cantrips: ["도검 결계","뼛속 냉기","섬뜩한 파동","친구","마법사의 손","하급 환영","독 분사","진실의 일격","폭음의 검" /* 패치8 */, "망자의 종소리" /* 패치8 */],
      level1: ["아거티스의 갑옷","하다르의 팔","인간형 매혹","신속 후퇴","지옥의 질책","주술","선악 보호","마녀의 화살"],
      level2: ["단검 구름","광기의 왕관","어둠","노예화","인간형 포박","투명","거울 분신","안개 걸음","약화 광선","파쇄"],
      level3: ["주문 방해","공포","비행 부여","기체 형태","하다르의 굶주림","최면 문양","저주 해제","흡혈의 손길"],
      level4: ["추방","역병","차원문","충격의 강타" /* 주술칼날 7레벨 특성화 4레벨 주문 */],
      level5: ["괴물 포박"],
    },
    위저드: {
      cantrips: ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","마법사의 손","하급 환영","진실의 일격","폭음의 검" /* 패치8 */, "망자의 종소리" /* 패치8 */, "폭발하는 힘" /* 패치8 */],
      level1: ["불타는 손길","인간형 매혹","오색 보주","오색 빛보라","변장","신속 후퇴","거짓 목숨","깃털 낙하","소환수 찾기","안개구름","기름칠","얼음 칼","도약 강화","활보","마법사의 갑옷","마력탄","선악 보호","독 광선","방어막","수면","타샤의 끔찍한 웃음","천둥파","마녀의 화살"],
      level2: ["비전 자물쇠","실명","잔상","단검 구름","광기의 왕관","어둠","암시야","생각 탐지","확대/축소","화염 구체","돌풍","인간형 포박","투명","노크","마법 무기","멜프의 산성 화살","거울 분신","안개 걸음","환영력","약화 광선","작열 광선","투명체 감지","파쇄","거미줄","그림자 검" /* 2레벨 패치8 */],
      level3: ["망자 조종","저주 부여","점멸","주문 방해","공포","죽은 척","화염구","비행 부여","기체 형태","결계 문양","가속","최면 문양","번개 줄기","에너지 보호","저주 해제","진눈깨비 폭풍","둔화","악취 구름","흡혈의 손길"],
      level4: ["추방","역병","혼란","하급 정령 소환","차원문","에바드의 검은 촉수","화염 방패","상급 투명","얼음 폭풍","오틸루크의 탄성 구체","환영 살해자","변신","바위 피부","화염 벽"],
      level5: ["죽음 구름","냉기 분사","정령 소환","인간형 지배","괴물 포박","이차원인 속박","외견","염력","바위의 벽"],
      level6: ["비전 관문","연쇄 번개","죽음의 원","언데드 생성","분해","깨무는 눈길","육신 석화","무적의 구체","오틸루크의 빙결 구체","오토의 참을 수 없는 춤","햇살","얼음의 벽"],
    },
  };
  return K[classKo] || {};
}

// 비전 괴도/비술 기사 전용 주문풀 + 위자드 확장
const AT_POOLS: SpellPools = {
  cantrips: ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","하급 환영","진실의 일격"],
  level1: ["인간형 매혹","오색 빛보라","변장","타샤의 끔찍한 웃음","수면"],
  level2: ["잔상","광기의 왕관","인간형 포박","투명","거울 분신","환영력"],
};
const EK_POOLS: SpellPools = {
  cantrips: ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","마법사의 손","하급 환영","진실의 일격"],
  level1: ["불타는 손길","오색 보주","마력탄","마법사의 갑옷","선악 보호","방어막","천둥파","마녀의 화살"],
  level2: ["멜프의 산성 화살","비전 자물쇠","어둠","돌풍","작열 광선","파쇄"],
};
// 위자드 확장(1레벨/2레벨)
const WIZ_EX1 = getClassSpellPools("위저드").level1 ?? [];
const WIZ_EX2 = getClassSpellPools("위저드").level2 ?? [];
// ============ 클래스별 특성 데이터/로직 ============
type GrowthKey =
  | "전투 방식"
  | "전투 기법"
  | "바드 통달"
  | "마법 비밀"
  | "바드 스타일"
  | "야수의 심장"
  | "야수의 상"
  | "워락 영창"
  | "소서러 변형"
  | "주문"
  | "확장 주문(AT 1레벨)"
  | "확장 주문(AT 2레벨)"
  | "확장 주문(EK 1레벨)"
  | "확장 주문(EK 2레벨)"
  | "비전 사격"
  | "무리지기 영감";

type OpenResult = Partial<Record<GrowthKey, string[]>>;

const FIGHTER_STYLES = ["궁술","방어술","결투술","대형 무기 전투","엄호술","쌍수 전투"];
const FIGHTER_MAN = ["사령관의 일격","무장 해제 공격","교란의 일격","날렵한 발놀림","속임수 공격","도발 공격","전투 기법 공격","위협 공격","정밀 공격","밀치기 공격","고양","응수","휩쓸기","다리 걸기 공격"];
const ARCANE_SHOTS = [
  "비전 사격: 추방 화살","비전 사격: 현혹 화살","비전 사격: 폭발 화살","비전 사격: 약화 화살",
  "비전 사격: 속박 화살","비전 사격: 추적 화살","비전 사격: 그림자 화살","비전 사격: 관통 화살"
];
const SWARMKEEPER_CHOICES = ["꿀벌 군단","해파리 떼","나방 쇄도"];

const GROWTH_DB: Record<string, {
  open: (level:number, subclass?:string)=>OpenResult;
  maxSpellLevel?: (lvl:number)=>number;
  spells?: SpellPools;
}> = {
  Fighter: {
    open: (lv, sub) => {
      const o: OpenResult = {};
      if(lv===1) o["전투 방식"]=FIGHTER_STYLES;
      if(sub==="전투의 대가"){
        if(lv===3) o["전투 기법"]=FIGHTER_MAN;
        if(lv===7) o["전투 기법"]=FIGHTER_MAN;
        if(lv===10) o["전투 기법"]=FIGHTER_MAN;
      }
      if(sub==="투사" && lv===10) o["전투 방식"]=FIGHTER_STYLES;
      if(sub==="비전 궁수"){
        if(lv===3) o["비전 사격"]=ARCANE_SHOTS;
        if(lv===7) o["비전 사격"]=ARCANE_SHOTS;
        if(lv===10) o["비전 사격"]=ARCANE_SHOTS;
      }
      if(sub==="비술 기사"){
        if(lv===3) o["확장 주문(EK 1레벨)"]=WIZ_EX1;
        if(lv>=8) o["확장 주문(EK 2레벨)"]=WIZ_EX2;
      }
      return o;
    },
    // EK 기본 주문 풀
    spells: EK_POOLS,
    maxSpellLevel: (lvl)=> (lvl>=8?2 : (lvl>=3?1:0)),
  },
  Bard: {
    open: (lv, sub) => {
      const o: OpenResult = {};
      if(lv===3) o["바드 통달"]=Object.keys(SK.KO) as unknown as string[]; // 실제 기술 목록(현지화 적용은 렌더에서)
      if(sub==="전승학파"){
        if(lv===3) o["바드 통달"]=Object.keys(SK.KO) as unknown as string[];
        if(lv===6) o["마법 비밀"]=["다른 클래스 주문(선택)"];
      }
      if(sub==="검술학파" && lv===3) o["바드 스타일"]=["결투술","쌍수 전투"];
      return o;
    },
    maxSpellLevel: (lvl)=> Math.min(6, Math.floor((lvl+1)/2)),
    spells: getClassSpellPools("바드"),
  },
  Barbarian: {
    open: (lv, sub) => {
      const o: OpenResult = {};
      if(sub==="야생의 심장"){
        if(lv===3) o["야수의 심장"]=["곰의 심장","독수리의 심장","엘크의 심장","호랑이의 심장","늑대의 심장"];
        if(lv===6 || lv===10) o["야수의 상"]=["곰","침팬지","악어","독수리","엘크","벌꿀오소리","말","호랑이","늑대","울버린"];
      }
      return o;
    },
  },
  Rogue: {
    open: (lv, sub) => {
      const o: OpenResult = {};
      if(sub==="비전 괴도"){
        if(lv===3) o["확장 주문(AT 1레벨)"]=WIZ_EX1;
        if(lv>=7) o["확장 주문(AT 2레벨)"]=WIZ_EX2; // 7레벨부터 교체로 2레벨 가능, 8레벨에 정식 습득
      }
      return o;
    },
    spells: AT_POOLS,
    maxSpellLevel: (lvl)=> (lvl>=8?2 : (lvl>=3?1:0)),
  },
  Warlock: {
    open: (lv) => {
      const inv = ["고뇌의 파동","그림자 갑옷","야수의 언어","교언영색","악마의 눈","마족의 활력","수많은 얼굴의 가면","그림자 동행","격퇴의 파동","다섯 숙명의 도둑","정신의 수렁","불길한 징조","고대 비밀의 서","공포의 단어","살점 조각가","혼돈의 하수인","초차원 도약","망자의 속삭임","생명을 마시는 자"];
      const o: OpenResult = {};
      if(lv===2) o["워락 영창"]=inv;
      if(lv===5) o["워락 영창"]=inv;
      if(lv===7) o["워락 영창"]=inv;
      if(lv===9) o["워락 영창"]=inv;
      if(lv===12) o["워락 영창"]=inv;
      return o;
    },
    spells: getClassSpellPools("워락"),
    maxSpellLevel: (lvl)=> Math.min(5, Math.floor((lvl+1)/2)),
  },
  Sorcerer: {
    open: (lv) => {
      const meta2 = ["정밀 주문","원격 주문","연장 주문","이중 주문"];
      const meta3 = ["증폭 주문","신속 주문","은밀 주문"];
      const o: OpenResult = {};
      if(lv===2) o["소서러 변형"]=meta2;
      if(lv===3) o["소서러 변형"]=meta3;
      if(lv===10) o["소서러 변형"]=meta3;
      return o;
    },
    spells: getClassSpellPools("소서러"),
    maxSpellLevel: (lvl)=> Math.min(6, Math.floor((lvl+1)/2)),
  },
  Cleric: {
    open: (_lv, _sub) => ({}),
    spells: getClassSpellPools("클레릭"),
    maxSpellLevel: (lvl)=> Math.min(6, Math.floor((lvl+1)/2)),
  },
  Druid: {
    open: (_lv, _sub) => ({}),
    spells: getClassSpellPools("드루이드"),
    maxSpellLevel: (lvl)=> Math.min(6, Math.floor((lvl+1)/2)),
  },
  Wizard: {
    open: (_lv, _sub) => ({}),
    spells: getClassSpellPools("위저드"),
    maxSpellLevel: (lvl)=> 6,
  },
  Ranger: {
    open: (lv, sub) => {
      const o: OpenResult = {};
      if(sub==="무리지기" && lv===3) o["무리지기 영감"]=SWARMKEEPER_CHOICES;
      return o;
    },
    // 레인저 주문 풀(간단)
    spells: {
      level1: ["동물 교감","상처 치료","속박의 일격","안개구름","맛있는 열매","가시 세례","사냥꾼의 표식","도약 강화","활보","동물과 대화"],
      level2: ["나무껍질 피부","암시야","하급 회복","신출귀몰","독 보호","침묵","가시밭"],
      level3: ["포화 소환","햇빛","번개 화살","식물 성장","에너지 보호"],
    },
    maxSpellLevel: (lvl)=> (lvl>=9?3:(lvl>=5?2:(lvl>=2?1:0))),
  },
  Paladin: {
    open: (lv) => {
      const o: OpenResult = {};
      if(lv===2) o["전투 방식"]=["방어술","결투술","대형 무기 전투","엄호술"];
      return o;
    },
    spells: {
      level1: ["선악 보호","신앙의 방패","명령","강제 결투","축복","영웅심","상처 치료","작열의 강타","천둥 강타","신성한 은총","분노의 강타"],
      level2: ["지원","하급 회복","독 보호","낙인 강타","마법 무기"],
      level3: ["저주 해제","활력의 감시자","성전사의 망토","햇빛","실명 강타","생환","원소 무기"],
    },
    maxSpellLevel: (lvl)=> (lvl>=9?3:(lvl>=5?2:(lvl>=2?1:0))),
  },
};

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
  const [skills, setSkills] = useState<SkillKey[]>([]);
  const [featName, setFeatName] = useState<string>("");
  const [featDetails, setFeatDetails] = useState<string[]>([]);
  const [featExcluded, setFeatExcluded] = useState<Set<string>>(new Set());

  // 선택 팝업
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

  // 라벨 헬퍼
  const T = L[lang];
  const abilLabel = (k: Abil) => (lang === "ko" ? abilKo[k] : (k as string));
  const skillLabel = (s: SkillKey) => (lang === "ko" ? SK.KO[s] : SK.EN[s]);

  // 출력 라벨
  const raceOut  = raceKey  === "-" ? "" : (lang === "ko" ? RACES[raceKey].ko  : String(raceKey));
  const classOut = classKey === "-" ? "" : (lang === "ko" ? CLASSES[classKey].ko : String(classKey));

  // ========== 계산 유틸 ==========
  function computeWeapons(raceKo: string, classKo: string, subclass?: string): string[] {
    const racePool = RACE_WEAP_KO[raceKo] || [];
    const classPool = CLASS_WEAP_KO[classKo] || [];
    let pool = Array.from(new Set([...racePool, ...classPool]));

    // 몽크일 때 비무장 공격 추가
    if (classKo === "몽크") pool = Array.from(new Set([...pool, "비무장 공격"]));

    // 방패
    const hasShield = (raceKo && RACE_SHIELD.has(raceKo)) || (classKo && CLASS_SHIELD.has(classKo));
    if (hasShield && !pool.includes(SHIELD_KO)) pool.push(SHIELD_KO);

    // 서브클래스/권역 추가
    if (classKo && subclass) {
      const key = `${classKo}:${subclass}`;
      if (SUBCLASS_EXTRA_WEAPONS[key]) {
        pool = Array.from(new Set([...pool, ...SUBCLASS_EXTRA_WEAPONS[key]]));
      }
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
  function randomAny2KO(): string[] {
    const picks = shuffle(ALL_WEAPONS_EN).slice(0, 2);
    return picks.map((w) => WEAPON_KO[w]);
  }

  // ========== 롤러 ==========
  function rollRace() {
    const keys = Object.keys(RACES) as (keyof typeof RACES)[];
    const r = choice(keys);
    setRaceKey(r);
    const subs = RACES[r].subs;
    setSubraceKo(subs ? choice(subs) : "-");
  }
  function rollClass() {
    const keys = Object.keys(CLASSES) as (keyof typeof CLASSES)[];
    const k = choice(keys);
    setClassKey(k);
    setSubclassKo(choice(CLASSES[k].subclasses));
  }
  function rollBackground() {
    setBg(choice(BACK_KO));
  }
  function rollStats() {
    const { bonus2, bonus1, final } = rollPointBuyWithBonuses();
    setPbBonus2(bonus2); setPbBonus1(bonus1); setStats(final);
  }
  function rollWeapons() {
    const raceKo = raceKey === "-" ? "" : RACES[raceKey].ko;
    const classKo = classKey === "-" ? "" : CLASSES[classKey].ko;
    const picks = computeWeapons(raceKo, classKo, subclassKo);
    setWeaponsKO(picks);
  }
  function rollAny2Weapons() {
    setWeaponsKO(randomAny2KO());
  }
  function rollSkills() {
    const clsKo = classKey === "-" ? "" : CLASSES[classKey].ko;
    const picks = computeClassSkills(clsKo, bg);
    setSkills(picks);
  }

  // Dice
  function handleRollDice() {
    const p = parseDice(diceExpr);
    if(!p){ setDiceDetail("형식 오류"); return; }
    const rolls: number[] = [];
    const used = new Set<number>();
    while(rolls.length < p.n){
      const v = 1 + rand(p.m);
      if(used.has(v)) continue; // 중복 눈금 방지
      used.add(v);
      rolls.push(v);
    }
    const modStr = p.mod ? (p.mod>0?`+${p.mod}`:`${p.mod}`) : "";
    setDiceDetail(`${p.n}d${p.m}${modStr} → [ ${rolls.join(", ")} ]`);
  }

  // Versus (공백/쉼표 구분 + 눈금 중복시 재굴림)
  function handleVersus() {
    const list = names.split(/[\s,]+/).map(s=>s.trim()).filter(Boolean);
    if(list.length===0){ setVsLines(["이름을 입력하세요"]); setVsWinner(""); return; }
    const used = new Set<number>();
    const results = list.map(n=>{
      let v = 1 + rand(20);
      while(used.has(v)) v = 1 + rand(20);
      used.add(v);
      return { name:n, roll: v };
    });
    const max = Math.max(...results.map(r=>r.roll));
    const winners = results.filter(r=>r.roll===max).map(r=>r.name);
    setVsLines(results.map(r=>`${r.name}: ${r.roll}`));
    setVsWinner(winners.join(", "));
  }

  // ========== 무기/기술 선택 팝업 ==========
  const allWeaponsKo = ALL_WEAPON_KO.concat(SHIELD_KO);
  const allSkills = Object.keys(SK.KO) as SkillKey[];

  function openWeaponPicker(){
    const cur = new Set(weaponsKO);
    setTempWeapons(cur);
    setShowWeaponPicker(true);
  }
  function openSkillPicker(){
    const cur = new Set(skills);
    setTempSkills(cur);
    setShowSkillPicker(true);
  }
  function applyWeaponPicker(){
    setWeaponsKO([...tempWeapons]);
    setShowWeaponPicker(false);
  }
  function applySkillPicker(){
    setSkills([...tempSkills]);
    setShowSkillPicker(false);
  }

  // ========== 클래스별 특성(성장) ==========
  function doSuggestGrowth() {
    if (growClass === "-") { setGrowResult(["클래스를 먼저 선택"]); return; }
    const rule = GROWTH_DB[growClass];
    if (!rule) { setGrowResult(["아직 이 클래스는 준비중"]); return; }
    const opens = rule.open(growLevel, growSub);
    const lines: string[] = [];

    // 1) 레벨별 고정 수량 옵션(전투 기법/비전 사격 등): “제외” 적용
    const pushWithExclude = (key: GrowthKey, pool: string[], count: number) => {
      const filtered = pool.filter(x => !growExcluded.has(x));
      uniqueSampleN(filtered, count).forEach(p => lines.push(`${key}: ${p}`));
    };

    // 파이터 전투의 대가: 3레벨 3개, 7레벨 2개, 10레벨 2개 (주문 수와 무관)
    if (growClass==="Fighter" && growSub==="전투의 대가") {
      if (growLevel===3) pushWithExclude("전투 기법", FIGHTER_MAN, 3);
      if (growLevel===7) pushWithExclude("전투 기법", FIGHTER_MAN, 2);
      if (growLevel===10) pushWithExclude("전투 기법", FIGHTER_MAN, 2);
    }

    // 비전 궁수: 3레벨 3개, 7레벨 1개, 10레벨 1개
    if (growClass==="Fighter" && growSub==="비전 궁수") {
      if (growLevel===3) pushWithExclude("비전 사격", ARCANE_SHOTS, 3);
      if (growLevel===7) pushWithExclude("비전 사격", ARCANE_SHOTS, 1);
      if (growLevel===10) pushWithExclude("비전 사격", ARCANE_SHOTS, 1);
    }

    // 바드 3레벨 통달: 실제 기술 2개(현지화 표시)
    if (growClass==="Bard" && growLevel===3) {
      const poolKeys = (Object.keys(SK.KO) as SkillKey[]).filter(x => !growExcluded.has(SK.KO[x]) && !growExcluded.has(SK.EN[x]));
      uniqueSampleN(poolKeys, 2).forEach(k => lines.push(`바드 통달: ${skillLabel(k)}`));
    }

    // 무리지기 3레벨 선택
    if (growClass==="Ranger" && growSub==="무리지기" && growLevel===3) {
      pushWithExclude("무리지기 영감", SWARMKEEPER_CHOICES, 1);
    }

    // 2) 주문 추천: “배울 주문 수”만 적용 (최대 주문 레벨까지 누적 풀)
    if (rule.maxSpellLevel && rule.spells) {
      const maxL = rule.maxSpellLevel(growLevel);
      const all: string[] = [];
      if (rule.spells.cantrips?.length) all.push(...rule.spells.cantrips!);
      if (maxL>=1 && rule.spells.level1) all.push(...rule.spells.level1);
      if (maxL>=2 && rule.spells.level2) all.push(...rule.spells.level2);
      if (maxL>=3 && rule.spells.level3) all.push(...rule.spells.level3);
      if (maxL>=4 && rule.spells.level4) all.push(...rule.spells.level4);
      if (maxL>=5 && rule.spells.level5) all.push(...rule.spells.level5);
      if (maxL>=6 && rule.spells.level6) all.push(...rule.spells.level6);

      // 비전 괴도/비술 기사 확장 주문 포함
      if (growClass==="Rogue" && growSub==="비전 괴도") {
        if (growLevel>=3) all.push(...WIZ_EX1);
        if (growLevel>=7) all.push(...WIZ_EX2);
      }
      if (growClass==="Fighter" && growSub==="비술 기사") {
        if (growLevel>=3) all.push(...WIZ_EX1);
        if (growLevel>=8) all.push(...WIZ_EX2);
      }

      const filtered = all.filter(x => !growExcluded.has(x));
      uniqueSampleN(filtered, Math.max(0, growSpellCount)).forEach(s=>lines.push(`주문: ${s}`));
    }

    // 3) open()이 제공한 개별 키(기본적으로 표시는 1개씩)
    Object.entries(opens).forEach(([key, pool])=>{
      if(!pool || pool.length===0) return;
      // 위 특례(전투 기법/비전 사격/바드 통달)는 이미 처리했으므로, 나머지 키는 1개만
      if (key==="전투 기법" || key==="비전 사격" || key==="바드 통달") return;
      const filtered = pool.filter(x => !growExcluded.has(x));
      const pick = uniqueSampleN(filtered, 1);
      pick.forEach(p => lines.push(`${key}: ${p}`));
    });

    setGrowResult(lines.length ? lines : ["추천 항목 없음"]);
  }

  function toggleExcludeGrow(item: string) {
    const next = new Set(growExcluded);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setGrowExcluded(next);
    // 즉시 재추천
    doSuggestGrowth();
  }

  // ===== 재주 =====
  const FEATS_BASE = [
    "능력 향상","배우","경계","운동선수","돌격자","쇠뇌 전문가","방어적인 결투가","쌍수 전문가","던전 탐구자","불굴",
    "원소 숙련","대형 무기의 달인","중갑 무장","중갑의 달인","경갑 무장","행운","마법사 슬레이어",
    "마법 입문: 바드","마법 입문: 클레릭","마법 입문: 드루이드","마법 입문: 소서러","마법 입문: 워락","마법 입문: 위자드",
    "무예 숙련","평갑의 달인","기동력","적당히 무장함","공연가","장병기의 달인","저항력","의식 시전자",
    "맹렬한 공격자","파수꾼","명사수","방패의 달인","숙련가","주문 저격수","술집 싸움꾼","강골","전쟁 시전자","무기의 달인"
  ] as const;

  function rollFeat() {
    const f = choice(FEATS_BASE as unknown as string[]);
    setFeatName(f);
    setFeatExcluded(new Set());
    const details = rollFeatDetail(f);
    setFeatDetails(details);
  }

  function rollFeatDetail(name: string): string[] {
    const abilName = (a: Abil) => (lang === "ko" ? abilKo[a] : a);
    const classKo = classKey === "-" ? "" : CLASSES[classKey].ko;

    // 공용: 기술 풀
    const skillPool = Object.keys(SK.KO) as SkillKey[];

    const rerollFrom = (pool: string[], n: number, excluded: Set<string>) =>
      uniqueSampleN(pool.filter(p => !excluded.has(p)), n);

    // 마법 입문 보조
    const miSelect = (klassKo: string) => {
      const pools = getClassSpellPools(klassKo);
      const can = rerollFrom(pools.cantrips ?? [], 2, featExcluded);
      const l1 = rerollFrom(pools.level1 ?? [], 1, featExcluded);
      return [...can.map(c=>`소마법: ${c}`), ...l1.map(s=>`1레벨 주문: ${s}`)];
    };

    // 무예 숙련 → 전투 기법 2
    const martialAdepts = () => rerollFrom(FIGHTER_MAN, 2, featExcluded).map(m => `전투 기법: ${m}`);

    // 숙련가 → 기술 3
    const skilled3 = () => {
      const pool = skillPool.map(skillLabel);
      return rerollFrom(pool, 3, featExcluded);
    };

    // 무기의 달인 → 근력/민첩 택1 + 무기 4종 숙련(전체풀 4개)
    const weaponMaster = () => {
      const abil = choice(["근력","민첩"]);
      const weaps = rerollFrom(ALL_WEAPON_KO, 4, featExcluded);
      return [`능력치: ${abil}`, ...weaps.map(w=>`무기 숙련: ${w}`)];
    };

    switch (name) {
      case "능력 향상": {
        const pick = uniqueSampleN(ABILS, 2).map(abilName);
        return [`능력 +1: ${pick[0]}`, `능력 +1: ${pick[1]}`];
      }
      case "운동선수": {
        const a = choice(["근력","민첩"]);
        return [`선택: ${a}`];
      }
      case "원소 숙련": {
        const e = choice(["산성","냉기","화염","번개","천둥"]);
        return [`원소 숙련: ${e}`];
      }
      case "경갑 무장": {
        const a = choice(["근력","민첩"]);
        return [`능력치: ${a}`];
      }
      case "마법 입문: 바드": return miSelect("바드");
      case "마법 입문: 클레릭": return miSelect("클레릭");
      case "마법 입문: 드루이드": return miSelect("드루이드");
      case "마법 입문: 소서러": return miSelect("소서러");
      case "마법 입문: 워락": return miSelect("워락");
      case "마법 입문: 위자드": return miSelect("위저드");

      case "무예 숙련": return martialAdepts();
      case "저항력": {
        const a = choice(["근력","민첩","건강","지능","지혜","매력"]);
        return [`저항력: ${a}`];
      }
      case "의식 시전자": {
        const pool = ["망자와 대화","소환수 찾기","활보","도약 강화","변장","동물과 대화"];
        return rerollFrom(pool, 2, featExcluded).map(x => `의식 주문: ${x}`);
      }
      case "숙련가": return skilled3();
      case "주문 저격수": {
        const pool = ["뼛속 냉기","섬뜩한 파동","화염살","서리 광선","전격의 손아귀","가시 채찍"];
        const pick = rerollFrom(pool, 1, featExcluded);
        return pick.length? [`선택: ${pick[0]}`] : [];
      }
      case "술집 싸움꾼": {
        const a = choice(["근력","건강"]);
        return [`능력치: ${a}`];
      }
      case "무기의 달인": return weaponMaster();
      default:
        return []; // 선택사항 없는 재주는 상세 없음(이름만 표시)
    }
  }

  function excludeFeatItem(item: string) {
    const next = new Set(featExcluded);
    if (next.has(item)) return;
    next.add(item);
    setFeatExcluded(next);

    // 즉시 재굴림(해당 항목만 대체)
    const name = featName;
    if (!name) return;

    let nextDetails = featDetails.filter(d => d !== item);
    const addOne = (prefix: string, pool: string[]) => {
      const filtered = pool.filter(p => !next.has(p) && !nextDetails.includes(`${prefix}: ${p}`));
      if (filtered.length) nextDetails = nextDetails.concat([`${prefix}: ${choice(filtered)}`]);
    };

    switch (name) {
      case "능력 향상": {
        // 둘 다 능력치 라인 → 아무 능력치로
        const remain = ABILS.map(a => (lang==="ko"?abilKo[a]:a)).filter(v => !next.has(String(v)));
        if (remain.length && nextDetails.length<2) nextDetails.push(`능력 +1: ${choice(remain)}`);
        break;
      }
      case "무예 숙련": addOne("전투 기법", FIGHTER_MAN); break;
      case "숙련가": {
        const pool = (Object.keys(SK.KO) as SkillKey[]).map(skillLabel);
        const filtered = pool.filter(p=>!next.has(p) && !nextDetails.includes(p));
        if (filtered.length) nextDetails.push(choice(filtered));
        break;
      }
      case "의식 시전자": addOne("의식 주문", ["망자와 대화","소환수 찾기","활보","도약 강화","변장","동물과 대화"]); break;
      case "주문 저격수": addOne("선택", ["뼛속 냉기","섬뜩한 파동","화염살","서리 광선","전격의 손아귀","가시 채찍"]); break;
      case "경갑 무장": case "운동선수": case "술집 싸움꾼": {
        // 능력치 라인 재선정
        const pick = name==="술집 싸움꾼" ? ["근력","건강"] : ["근력","민첩"];
        const cand = pick.filter(p=>!next.has(p));
        if (cand.length) nextDetails.push(`능력치: ${choice(cand)}`);
        break;
      }
      case "원소 숙련": addOne("원소 숙련", ["산성","냉기","화염","번개","천둥"]); break;
      case "무기의 달인": {
        // 능력치/무기 숙련 대체
        if (item.startsWith("능력치")) {
          const cand = ["근력","민첩"].filter(p=>!next.has(p));
          if (cand.length) nextDetails.push(`능력치: ${choice(cand)}`);
        } else if (item.startsWith("무기 숙련: ")) {
          const w = ALL_WEAPON_KO.filter(x => !next.has(x) && !nextDetails.includes(`무기 숙련: ${x}`));
          if (w.length) nextDetails.push(`무기 숙련: ${choice(w)}`);
        }
        break;
      }
      case "마법 입문: 바드": case "마법 입문: 클레릭": case "마법 입문: 드루이드":
      case "마법 입문: 소서러": case "마법 입문: 워락": case "마법 입문: 위자드": {
        const klassKo = name.split(":")[1].trim();
        const pools = getClassSpellPools(klassKo);
        const isCan = item.startsWith("소마법:");
        const p = isCan ? (pools.cantrips ?? []) : (pools.level1 ?? []);
        const prefix = isCan ? "소마법" : "1레벨 주문";
        const filtered = p.filter(x => !next.has(x) && !nextDetails.includes(`${prefix}: ${x}`));
        if (filtered.length) nextDetails.push(`${prefix}: ${choice(filtered)}`);
        break;
      }
      default: break;
    }

    setFeatDetails(nextDetails);
  }

  function unexcludeFeatItem(item: string) {
    const next = new Set(featExcluded);
    next.delete(item);
    setFeatExcluded(next);
  }
  // -------- 스타일 --------
  const row: React.CSSProperties = { display:"flex", alignItems:"center", gap:8, marginBottom:8, flexWrap:"wrap" };
  const label: React.CSSProperties = { width:90, color:"#374151" };
  const smallLabel: React.CSSProperties = { color:"#6b7280", marginLeft:8, display:"flex", alignItems:"center" };
  const select: React.CSSProperties = { padding:"8px 10px", border:"1px solid #e5e7eb", borderRadius:10, minWidth:160 };

  const btnBase: React.CSSProperties = { padding:"10px 14px", borderRadius:10, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer" };
  const btn: React.CSSProperties = { ...btnBase };
  const btnPrimary: React.CSSProperties = { ...btnBase, background:"#111827", color:"#fff", borderColor:"#111827" };
  const btnSecondary: React.CSSProperties = { ...btnBase, background:"#f3f4f6" };
  const input: React.CSSProperties = { padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, minWidth:260 };
  const badge: React.CSSProperties = { display:"inline-block", padding:"0 6px", fontSize:12, borderRadius:999, background:"#111827", color:"#fff", lineHeight:"18px", height:18, margin:"0 2px" };

  // -------- 렌더 --------
  const raceOptions = Object.keys(RACES) as (keyof typeof RACES)[];
  const classOptions = Object.keys(CLASSES) as (keyof typeof CLASSES)[];

  const TSkill = (k: SkillKey) => skillLabel(k);

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

        {/* 2열 레이아웃 */}
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
                <div>{bg === "-" ? "" : (lang==="ko"?bg:({ ...SK.EN } as any)[bg] ?? bg)}</div>

                <div style={{ color:"#6b7280" }}>{T.weapons}</div>
                <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                  <span>{weaponsKO.join(", ")}</span>
                  <button style={btn} onClick={openWeaponPicker}>선택</button>
                </div>

                <div style={{ color:"#6b7280" }}>{T.skills}</div>
                <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                  <span>{skills.map(TSkill).join(", ")}</span>
                  <button style={btn} onClick={openSkillPicker}>선택</button>
                </div>
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
                <button onClick={()=>{rollRace(); rollClass(); rollBackground(); rollStats(); setTimeout(()=>{ rollWeapons(); rollSkills(); },0);}} style={btnPrimary}>{T.rollAll}</button>
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
                {featName && <div style={{ fontWeight:800 }}>{featName}</div>}
              </div>
              {featDetails.length>0 && (
                <div style={{ marginTop:10, display:"grid", gap:6 }}>
                  {featDetails.map((d,idx)=>(
                    <div key={idx} style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                      <div>{d}</div>
                      <button style={btn} onClick={()=>excludeFeatItem(d)}>{T.exclude}</button>
                    </div>
                  ))}
                </div>
              )}
              {featExcluded.size>0 && (
                <div style={{ marginTop:12 }}>
                  <div style={{ fontSize:12, color:"#6b7280", marginBottom:6 }}>{T.excludedList} <span style={{ color:"#9ca3af" }}>({T.unexcludeHint})</span></div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {[...featExcluded].map((x)=>(
                      <span key={x} onClick={()=>unexcludeFeatItem(x)} style={{ cursor:"pointer", padding:"4px 8px", border:"1px solid #e5e7eb", borderRadius:999 }}>{x}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 주사위 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginTop:16 }}>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 12px" }}>{T.diceTitle}</h2>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <input value={diceExpr} onChange={(e)=>setDiceExpr(e.target.value)} placeholder={T.dicePH} style={{...input, minWidth:420}}/>
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
              </div>

              {/* 출신 */}
              <div style={row}>
                <label style={label}>{T.background}</label>
                <select value={bg} onChange={(e:any)=>setBg(e.target.value as Background)} style={select}>
                  <option value="-">-</option>
                  {BACK_KO.map(b=><option key={b} value={b}>{lang==="ko"?b:b}</option>)}
                </select>
              </div>

              {/* 무기/기술 버튼 */}
              <div style={row}>
                <label style={label}>{T.weapons}</label>
                <button style={btn} onClick={openWeaponPicker}>목록 열기</button>
                <button style={btn} onClick={rollWeapons}>자동 선택</button>
              </div>

              <div style={row}>
                <label style={label}>{T.skills}</label>
                <button style={btn} onClick={openSkillPicker}>목록 열기</button>
                <button style={btn} onClick={rollSkills}>자동 선택</button>
              </div>
            </section>

            {/* 클래스별 특성 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16 }}>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 12px" }}>{T.growth}</h3>
              <div style={{ display:"grid", gap:8 }}>
                <div style={row}>
                  <label style={label}>{T.classPick}</label>
                  <select value={growClass} onChange={(e:any)=>{ const v=e.target.value as keyof typeof CLASSES | "-"; setGrowClass(v); setGrowSub("-"); setGrowExcluded(new Set()); setGrowResult([]); }} style={select}>
                    <option value="-">-</option>
                    {classOptions.map(k=><option key={k} value={k}>{lang==="ko"?CLASSES[k].ko:k}</option>)}
                  </select>
                </div>
                <div style={row}>
                  <label style={label}>{T.subPick}</label>
                  <select value={growSub} onChange={(e)=>{ setGrowSub(e.target.value); setGrowExcluded(new Set()); setGrowResult([]); }} style={select} disabled={growClass==="-"}>
                    {growClass==="-"? <option value="-">-</option> : ["-"].concat(CLASSES[growClass].subclasses).map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={row}>
                  <label style={label}>{T.levelPick}</label>
                  <input type="number" min={1} max={12} value={growLevel} onChange={(e)=>setGrowLevel(parseInt(e.target.value||"1",10))} style={{...input, width:120}}/>
                </div>
                <div style={row}>
                  <label style={label}>{T.howMany}</label>
                  <input type="number" min={0} max={5} value={growSpellCount} onChange={(e)=>setGrowSpellCount(parseInt(e.target.value||"0",10))} style={{...input, width:120}}/>
                </div>
                <div>
                  <button onClick={doSuggestGrowth} style={btn}>{T.suggest}</button>
                </div>

                {growResult.length>0 && (
                  <div style={{ marginTop:8, display:"grid", gap:6 }}>
                    {growResult.map((g,i)=>{
                      const name = g.replace(/^.*?:\s*/, "");
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                          <div>{g}</div>
                          <button style={btn} onClick={()=>toggleExcludeGrow(name)}>{T.exclude}</button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {growExcluded.size>0 && (
                  <div style={{ marginTop:12 }}>
                    <div style={{ fontSize:12, color:"#6b7280", marginBottom:6 }}>{T.excludedList} <span style={{ color:"#9ca3af" }}>({T.unexcludeHint})</span></div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {[...growExcluded].map((x)=>(
                        <span key={x} onClick={()=>toggleExcludeGrow(x)} style={{ cursor:"pointer", padding:"4px 8px", border:"1px solid #e5e7eb", borderRadius:999 }}>{x}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 무기 선택 팝업 */}
      {showWeaponPicker && (
        <div style={pickerOverlay}>
          <div style={pickerCard}>
            <h3 style={{ marginTop:0 }}>{T.pickerWeaponsTitle}</h3>
            <div style={{ maxHeight:360, overflow:"auto", paddingRight:6 }}>
              {allWeaponsKo.map(w=>(
                <label key={w} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0" }}>
                  <input type="checkbox" checked={tempWeapons.has(w)} onChange={(e)=>{ const next=new Set(tempWeapons); e.target.checked?next.add(w):next.delete(w); setTempWeapons(next); }}/>
                  <span>{w}</span>
                </label>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
              <button style={btn} onClick={()=>setShowWeaponPicker(false)}>{T.cancel}</button>
              <button style={btnPrimary} onClick={applyWeaponPicker}>{T.apply}</button>
            </div>
          </div>
        </div>
      )}

      {/* 기술 선택 팝업 */}
      {showSkillPicker && (
        <div style={pickerOverlay}>
          <div style={pickerCard}>
            <h3 style={{ marginTop:0 }}>{T.pickerSkillsTitle}</h3>
            <div style={{ maxHeight:360, overflow:"auto", paddingRight:6 }}>
              {allSkills.map(s=>(
                <label key={s} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0" }}>
                  <input type="checkbox" checked={tempSkills.has(s)} onChange={(e)=>{ const next=new Set(tempSkills); e.target.checked?next.add(s as SkillKey):next.delete(s as SkillKey); setTempSkills(next); }}/>
                  <span>{skillLabel(s)}</span>
                </label>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
              <button style={btn} onClick={()=>setShowSkillPicker(false)}>{T.cancel}</button>
              <button style={btnPrimary} onClick={applySkillPicker}>{T.apply}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- 픽커 스타일 ----------
const pickerOverlay: React.CSSProperties = {
  position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50
};
const pickerCard: React.CSSProperties = {
  width:480, background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:16, boxShadow:"0 10px 30px rgba(0,0,0,0.15)"
};

// ============ RACES (마지막에 선언: 타입 참조 위해) ============
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
