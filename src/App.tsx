import React, { useEffect, useMemo, useState } from "react";

/** BG3 랜덤 생성기 · 단일파일 + 우측 패널 (최종 통합본)
 * - 초기 진입 시 결과 비표시(사용자 조작 시 표시)
 * - 수동 선택 & 고정(락): 종족/클래스/출신/무기/기술
 * - 기술: 배경 2개 제외 후 클래스 기술 풀에서 정확히 N개 랜덤
 * - 몽크일 때만 무기풀에 "비무장 공격" 포함
 * - 성장 추천기 → 클래스별 특성
 * - 클래스/서브클래스/레벨별 선택지 랜덤, 주문 랜덤(최대 주문 레벨까지 누적 풀), 개수 입력
 * - 특성/재주에 제외 버튼 추가
 * - 패치8 신규 주문, 워락 확장 주문 리스트 반영
 */

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
    vsPH: "이름들을 공백 혹은 쉼표로 구분 (예: 레드 유히 함마김 활잽이)",
    vsRoll: "굴리기 (1d20)",
    winner: "승자",
    manualPanel: "수동 선택 & 고정",
    locks: "고정",
    growth: "클래스별 특성",
    classPick: "클래스 선택",
    subPick: "서브클래스 선택",
    levelPick: "레벨",
    howMany: "배울 주문 수",
    suggest: "랜덤 추천",
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
    vsPH: "Space or comma-separated names (e.g., Red Yuhi HammerKim Archer)",
    vsRoll: "Roll (1d20)",
    winner: "Winner",
    manualPanel: "Manual Picks & Locks",
    locks: "Lock",
    growth: "Class Features",
    classPick: "Class",
    subPick: "Subclass",
    levelPick: "Level",
    howMany: "Spells to Learn",
    suggest: "Suggest",
  },
} as const;

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

// 배경별 고정 스킬
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

// 클래스별 선택 스킬
const CLASS_SK_CHOICE: Record<string, { n: number; list: (keyof typeof SK.KO)[] }> = {
  바바리안: { n: 2, list: ["Animal","Athletics","Intimidation","Nature","Perception","Survival"] },
  바드: { n: 3, list: ["Deception","Performance","Persuasion","Sleight","Intimidation","Acrobatics","Insight"] },
  클레릭: { n: 2, list: ["History","Insight","Medicine","Persuasion","Religion"] },
  드루이드: { n: 2, list: ["Animal","Insight","Medicine","Nature","Perception","Survival"] },
  파이터: { n: 2, list: ["Acrobatics","Animal","Athletics","History","Insight","Intimidation","Perception","Survival"] },
  몽크: { n: 2, list: ["Acrobatics","Athletics","Insight","History","Religion","Stealth"] },
  팔라딘: { n: 2, list: ["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"] },
  레인저: { n: 3, list: ["Animal","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"] },
  로그: { n: 4, list: ["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Performance","Persuasion","Sleight","Stealth"] },
  소서러: { n: 2, list: ["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"] },
  워락: { n: 2, list: ["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"] },
  위저드: { n: 2, list: ["Arcana","History","Insight","Investigation","Medicine","Religion"] },
};

// ============ 무기 ============
const SIMPLE = ["Club","Dagger","Greatclub","Handaxe","Javelin","Light Crossbow","Light Hammer","Mace","Quarterstaff","Shortbow","Sickle","Spear"] as const;
const SIMPLE_KO: Record<(typeof SIMPLE)[number], string> = {
  Club:"곤봉",Dagger:"단검",Greatclub:"대형 곤봉",Handaxe:"손도끼",Javelin:"투창",
  "Light Crossbow":"경쇠뇌","Light Hammer":"경량 망치",Mace:"철퇴",Quarterstaff:"육척봉",
  Shortbow:"단궁",Sickle:"낫",Spear:"창"
};
const MARTIAL = ["Battleaxe","Flail","Scimitar","Greataxe","Greatsword","Halberd","Hand Crossbow","Heavy Crossbow","Longbow","Longsword","Maul","Morningstar","Pike","Rapier","Glaive","Shortsword","Trident","Warhammer","War Pick"] as const;
const MARTIAL_KO: Record<(typeof MARTIAL)[number], string> = {
  Battleaxe:"전투 도끼",Flail:"도리깨",Scimitar:"협도",Greataxe:"대형 도끼",Greatsword:"대검",
  Halberd:"미늘창","Hand Crossbow":"손 쇠뇌","Heavy Crossbow":"중쇠뇌",Longbow:"장궁",Longsword:"장검",
  Maul:"대형 망치",Morningstar:"모닝스타",Pike:"장창",Rapier:"레이피어",Glaive:"언월도",
  Shortsword:"소검",Trident:"삼지창",Warhammer:"전쟁 망치","War Pick":"전쟁 곡괭이"
};
const ALL_WEAPONS_EN=[...SIMPLE,...MARTIAL] as const;
const WEAPON_KO: Record<(typeof ALL_WEAPONS_EN)[number], string>={...SIMPLE_KO,...MARTIAL_KO};
const SHIELD_KO="방패"; const SHIELD_EN="Shield";
// ============ 포인트바이 ============
function rollPointBuyRaw(): Record<Abil, number> {
  const vals = [8, 8, 8, 8, 8, 8];
  let budget = 27;
  const cost = (v: number) => (v >= 13 ? 2 : 1);
  let guard = 2000;
  while (budget > 0 && guard-- > 0) {
    const i = rand(6);
    const cur = vals[i];
    if (cur >= 15) continue;
    const c = cost(cur);
    if (budget < c) {
      const any = vals.some(
        (v) => (v < 13 && budget >= 1) || (v >= 13 && v < 15 && budget >= 2)
      );
      if (!any) break;
      continue;
    }
    vals[i] += 1;
    budget -= c;
  }
  return { STR: vals[0], DEX: vals[1], CON: vals[2], INT: vals[3], WIS: vals[4], CHA: vals[5] };
}
type PBResult = { base: Record<Abil, number>; bonus2: Abil; bonus1: Abil; final: Record<Abil, number> };
function rollPointBuyWithBonuses(): PBResult {
  const base = rollPointBuyRaw();
  let b2 = ABILS[rand(6)];
  let b1 = ABILS[rand(6)];
  while (b1 === b2) b1 = ABILS[rand(6)];
  const final = { ...base };
  final[b2] = Math.min(17, final[b2] + 2);
  final[b1] = Math.min(17, final[b1] + 1);
  return { base, bonus2: b2, bonus1: b1, final };
}

// ============ Dice ============
function parseDice(expr: string): { n: number; m: number; mod: number } | null {
  const t = expr.trim().replace(/\s+/g, "");
  const m = t.match(/^(\d+)[dD](\d+)([+-]\d+)?$/);
  if (!m) return null;
  const n = Math.max(1, parseInt(m[1], 10));
  const sides = Math.max(2, parseInt(m[2], 10));
  const mod = m[3] ? parseInt(m[3], 10) : 0;
  return { n, m: sides, mod };
}
function rollNdM(n: number, m: number) {
  return Array.from({ length: n }, () => 1 + rand(m));
}

// ============ 종족/클래스별 무기 숙련 추가 규칙 ============
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
const CLASS_SHIELD = new Set(["파이터", "팔라딘", "클레릭", "레인저", "바바리안", "드루이드"]);

// ============ 성장 추천기(간단 코어 + 패치8) ============
type GrowthKey = "전투 방식" | "전투 기법" | "바드 통달" | "마법 비밀" | "바드 스타일" | "워락 영창" | "소서러 변형" | "주문" | "추가 주문" | "소마법" | "비전 사격" | "동물 무리";
const GROWTH_DB: Record<
  string,
  {
    open: (level: number, subclass?: string) => Partial<Record<GrowthKey, string[]>>;
    maxSpellLevel?: (lvl: number) => number;
    spells?: Record<number, string[]>;
  }
> = {
  Fighter: {
    open: (lv, sub) => {
      const style = ["궁술", "방어술", "결투술", "대형 무기 전투", "엄호술", "쌍수 전투"];
      const maneuvers = [
        "사령관의 일격",
        "무장 해제 공격",
        "교란의 일격",
        "날렵한 발놀림",
        "속임수 공격",
        "도발 공격",
        "정밀 공격",
        "휩쓸기",
        "응수",
        "밀치기 공격",
        "다리 걸기 공격",
      ];
      const arcaneShots = [
        "비전 사격: 추방 화살",
        "비전 사격: 현혹 화살",
        "비전 사격: 폭발 화살",
        "비전 사격: 약화 화살",
        "비전 사격: 속박 화살",
        "비전 사격: 추적 화살",
        "비전 사격: 그림자 화살",
        "비전 사격: 관통 화살",
      ];
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 1) o["전투 방식"] = style;

      if (sub === "전투의 대가") {
        if (lv === 3) o["전투 기법"] = maneuvers; // 3개
        if (lv === 7) o["전투 기법"] = maneuvers; // 2개
        if (lv === 10) o["전투 기법"] = maneuvers; // 2개
      }
      if (sub === "비전 궁수") {
        if (lv === 3) {
          o["소마법"] = ["인도", "빛", "진실의 일격"]; // 택1
          o["비전 사격"] = arcaneShots; // 3개
        }
        if (lv === 7) o["비전 사격"] = arcaneShots; // 1개
        if (lv === 10) o["비전 사격"] = arcaneShots; // 1개
      }
      if (sub === "투사" && lv === 10) o["전투 방식"] = style;
      if (sub === "비술 기사") {
        if (lv === 3) o["소마법"] = ["폭음의 검", "폭발하는 힘", "망자의 종소리"];
        if (lv >= 8) o["주문"] = ["그림자 검"]; // 2레벨
      }
      return o;
    },
  },
  Bard: {
    open: (lv, sub) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 3) o["바드 통달"] = ["기술 통달 대상(아무 기술 2)"];
      if (sub === "전승학파") {
        if (lv === 3) o["바드 통달"] = ["기술 숙련(아무 기술 3)"];
        if (lv === 6) o["마법 비밀"] = ["다른 클래스 주문(선택)"];
      }
      if (sub === "검술학파" && lv === 3) o["바드 스타일"] = ["결투술", "쌍수 전투"];
      return o;
    },
    maxSpellLevel: (lvl) => Math.min(6, Math.floor((lvl + 1) / 2)),
    spells: {
      0: ["신랄한 조롱", "도검 결계", "마법사의 손", "친구", "빛", "하급 환영", "폭음의 검"],
      1: ["상처 치료", "불협화음의 속삭임", "요정불"],
    },
  },
  Rogue: {
    open: (lv, sub) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (sub === "비전 괴도") {
        if (lv === 3) o["소마법"] = ["폭음의 검", "폭발하는 힘", "망자의 종소리"];
        if (lv >= 7) o["주문"] = ["그림자 검"]; // 2레벨
      }
      return o;
    },
  },
  Cleric: {
    open: (lv, sub) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (sub === "죽음 권역" && lv === 1) o["소마법"] = ["뼛속 냉기", "폭발하는 힘", "망자의 종소리"]; // 택1
      return o;
    },
  },
  Ranger: {
    open: (lv, sub) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (sub === "무리지기" && lv === 3) o["동물 무리"] = ["꿀벌 군단", "해파리 떼", "나방 쇄도"];
      return o;
    },
  },
  Warlock: {
    open: (lv, sub) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 2) o["워락 영창"] = ["고뇌의 파동", "야수의 언어", "그림자 갑옷"];
      // Expanded list (간단 통합)
      if (lv >= 1) o["추가 주문"] = ["쉴드", "분노의 강타"];
      if (lv >= 3) o["추가 주문"] = (o["추가 주문"] || []).concat(["흐림", "낙인 강타"]);
      if (lv >= 5) o["추가 주문"] = (o["추가 주문"] || []).concat(["섬광", "원소 무기"]);
      if (lv >= 7) {
        o["추가 주문"] = (o["추가 주문"] || []).concat(["환영 살인자", "야수 지배", "상급 투명"]);
        if (sub === "주술 칼날") o["추가 주문"] = (o["추가 주문"] || []).concat(["충격의 강타"]);
      }
      if (lv >= 9) o["추가 주문"] = (o["추가 주문"] || []).concat(["추방의 강타", "혹한의 원뿔"]);
      return o;
    },
    maxSpellLevel: (lvl) => Math.min(5, Math.floor((lvl + 1) / 2)),
    spells: {
      0: ["도검 결계", "뼛속 냉기", "섬뜩한 파동", "망자의 종소리", "폭음의 검"],
      1: ["주술", "마녀의 화살", "신속 후퇴"],
      2: ["그림자 검"],
    },
  },
  Sorcerer: {
    open: (lv) => {
      const o: Partial<Record<GrowthKey, string[]>> = {};
      if (lv === 2) o["소서러 변형"] = ["정밀 주문", "원격 주문", "연장 주문"];
      return o;
    },
    maxSpellLevel: (lvl) => Math.min(6, Math.floor((lvl + 1) / 2)),
    spells: {
      0: ["도검 결계", "산성 거품", "마법사의 손", "폭발하는 힘", "폭음의 검"],
      1: ["화염살", "마법사의 갑옷"],
      2: ["그림자 검"],
    },
  },
  Wizard: {
open: (_lv, _sub) => {
  const o: Partial<Record<GrowthKey, string[]>> = {};
  return o;
},

    maxSpellLevel: (lvl) => Math.min(6, Math.floor((lvl + 1) / 2)),
    spells: {
      0: ["마법사의 손", "하급 환영", "폭발하는 힘", "망자의 종소리", "폭음의 검"],
      1: ["마법사의 갑옷"],
      2: ["그림자 검"],
    },
  },
};

// ============ 재주(Feat) 로직 ============
type FeatOption = { name: string; detail?: string };
const FEATS: Record<string, () => FeatOption> = {
  "능력 향상": () => {
    const picks = sampleN(ABILS, 2);
    const mapKo: Record<string, string> = { STR: "힘", DEX: "민첩", CON: "건강", INT: "지능", WIS: "지혜", CHA: "매력" };
    return { name: "능력 향상", detail: `${mapKo[picks[0]]}, ${mapKo[picks[1]]}` };
  },
  "운동선수": () => ({ name: "운동선수", detail: choice(["힘", "민첩"]) }),
  "원소 숙련": () => ({ name: "원소 숙련", detail: choice(["산성", "냉기", "화염", "번개", "천둥"]) }),
  "경갑 무장": () => ({ name: "경갑 무장", detail: choice(["힘", "민첩"]) }),
  "평갑 무장": () => ({ name: "평갑 무장", detail: choice(["힘", "민첩"]) }),
  "저항력": () => ({ name: "저항력", detail: choice(["힘", "민첩", "건강", "지능", "지혜", "매력"]) }),
  "술집 싸움꾼": () => ({ name: "술집 싸움꾼", detail: choice(["힘", "건강"]) }),
  "무기의 달인": () => {
    const abil = choice(["힘", "민첩"]);
    const weaps = sampleN(Object.values(WEAPON_KO), 4);
    return { name: "무기의 달인", detail: `${abil} + ${weaps.join(", ")}` };
  },
  "의식 시전자": () => {
    const spells = ["망자와 대화", "소환수 찾기", "활보", "도약 강화", "변장", "동물과 대화"];
    return { name: "의식 시전자", detail: sampleN(spells, 2).join(", ") };
  },
  "숙련가": () => {
    const picks = sampleN(Object.values(SK.KO), 3);
    return { name: "숙련가", detail: picks.join(", ") };
  },
  "주문 저격수": () => ({ name: "주문 저격수", detail: choice(["뼛속 냉기", "섬뜩한 파동", "화염살", "서리 광선", "전격의 손아귀", "가시 채찍"]) }),
  "행운": () => ({ name: "행운" }),
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
  const [skills, setSkills] = useState<(keyof typeof SK.KO)[]>([]);
  const [feat, setFeat] = useState<string>("");

  // 수동 선택 & 락
  const [lockRace, setLockRace] = useState(false);
  const [lockClass, setLockClass] = useState(false);
  const [lockBG, setLockBG] = useState(false);
  const [lockWeapons, setLockWeapons] = useState(false);
  const [lockSkills, setLockSkills] = useState(false);

  // 제외 리스트
  const [excludedFeatures, setExcludedFeatures] = useState<string[]>([]);
  const [excludedFeats, setExcludedFeats] = useState<string[]>([]);

  // Dice
  const [diceExpr, setDiceExpr] = useState<string>("1d20");
  const [diceDetail, setDiceDetail] = useState<string>("");

  // Versus
  const [names, setNames] = useState<string>("");
  const [vsLines, setVsLines] = useState<string[]>([]);
  const [vsWinner, setVsWinner] = useState<string>("");

  // 성장 추천기
  const [growClass, setGrowClass] = useState<keyof typeof CLASSES | "-">("-");
  const [growSub, setGrowSub] = useState<string>("-");
  const [growLevel, setGrowLevel] = useState<number>(3);
  const [growCount, setGrowCount] = useState<number>(2);
  const [growResult, setGrowResult] = useState<string[]>([]);

  // 초기 자동 롤 제거
  useEffect(() => { /* no auto */ }, []);

  // 라벨
  const T = L[lang];
  const abilLabel = (k: Abil) => (lang === "ko" ? abilKo[k] : (k as string));
  const bgLabel = (b: Background) => (b === "-" ? "" : (lang === "ko" ? b : BACK_EN[b]));

  // 무기 출력 다국어
  const weaponsOut = useMemo(() => {
    if (lang === "ko") return weaponsKO;
    const mapEN: Record<string, string> = {};
    for (const en of ALL_WEAPONS_EN) mapEN[WEAPON_KO[en]] = en;
    return weaponsKO.map((w) => (w === SHIELD_KO ? SHIELD_EN : mapEN[w] ?? w));
  }, [lang, weaponsKO]);

  const raceOut = raceKey === "-" ? "" : (lang === "ko" ? RACES[raceKey].ko : String(raceKey));
  const classOut = classKey === "-" ? "" : (lang === "ko" ? CLASSES[classKey].ko : String(classKey));
  const skillsOut = skills.map((s) => (lang === "ko" ? SK.KO[s] : SK.EN[s]));

  // ========== 계산 유틸 ==========
  function randomAny2KO(): string[] {
    const picks = shuffle(ALL_WEAPONS_EN).slice(0, 2);
    return picks.map((w) => WEAPON_KO[w]);
  }

  function computeWeapons(raceKo: string, classKo: string, subclassKoLocal?: string): string[] {
    const racePool = RACE_WEAP_KO[raceKo] || [];
    let classPool = CLASS_WEAP_KO[classKo] || [];

    // 특수: Cleric 도메인(폭풍/전쟁/죽음) → 군용무기 포함
    if (classKo === "클레릭" && ["폭풍 권역", "전쟁 권역", "죽음 권역"].includes(subclassKoLocal || "")) {
      classPool = Array.from(new Set(classPool.concat(Object.values(MARTIAL_KO))));
    }
    // 특수: Wizard 칼날 노래
    if (classKo === "위저드" && subclassKoLocal === "칼날 노래") {
      classPool = Array.from(
        new Set(classPool.concat(["단검", "장검", "레이피어", "협도", "소검", "낫"]))
      );
    }

    let pool = Array.from(new Set([...racePool, ...classPool]));
    if (classKo === "몽크") pool = Array.from(new Set([...pool, "비무장 공격"]));

    const hasShield = (raceKo && RACE_SHIELD.has(raceKo)) || (classKo && CLASS_SHIELD.has(classKo));
    if (hasShield && !pool.includes(SHIELD_KO)) pool.push(SHIELD_KO);

    if (pool.length === 0) return randomAny2KO();
    const pickN = pool.length <= 8 ? 1 : 2;
    return shuffle(pool).slice(0, Math.min(pickN, pool.length));
  }

  function computeClassSkills(classKo: string, bgSel: Background): (keyof typeof SK.KO)[] {
    if (bgSel === "-") return [];
    const cfg = CLASS_SK_CHOICE[classKo];
    if (!cfg) return [];
    const [bg1, bg2] = BG_SKILLS[bgSel];
    const pool = cfg.list.filter((s) => s !== bg1 && s !== bg2);
    return sampleN(pool, cfg.n);
  }

  // ========== 롤러 ==========
  function rollRace() {
    if (lockRace) return;
    const keys = Object.keys(RACES) as (keyof typeof RACES)[];
    const r = choice(keys);
    setRaceKey(r);
    const subs = RACES[r].subs;
    const pickedSub = subs ? choice(subs) : "-";
    setSubraceKo(pickedSub);

    // 하이 엘프 / 하이 하프 엘프 → 위저드 소마법 1개 추가 표시
    if (pickedSub === "하이 엘프" || pickedSub === "하이 하프 엘프") {
      const wizCantrips = GROWTH_DB.Wizard.spells?.[0] ?? [];
      if (wizCantrips.length) {
        const pick = choice(wizCantrips.filter(s => !excludedFeatures.includes(s)));
        setGrowResult((prev) => [...prev, `추가 소마법(종족): ${pick}`]);
      }
    }
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
    setPbBonus2(bonus2);
    setPbBonus1(bonus1);
    setStats(final);
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
    const keys = Object.keys(FEATS).filter((f) => !excludedFeats.includes(f));
    if (keys.length === 0) {
      setFeat("재주 없음");
      return;
    }
    const k = choice(keys);
    const res = FEATS[k]();
    setFeat(res.name + (res.detail ? ` (${res.detail})` : ""));
  }

  // Dice
  function handleRollDice() {
    const p = parseDice(diceExpr);
    if (!p) {
      setDiceDetail("형식 오류");
      return;
    }
    const rolls = rollNdM(p.n, p.m);
    const modStr = p.mod ? (p.mod > 0 ? `+${p.mod}` : `${p.mod}`) : "";
    setDiceDetail(`${p.n}d${p.m}${modStr} → [ ${rolls.join(", ")} ]`);
  }

  // Versus: 공백/쉼표 구분 + 유니크 주사위
  function handleVersus() {
    const list = names.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) {
      setVsLines(["이름을 입력하세요"]);
      setVsWinner("");
      return;
    }
    const used = new Set<number>();
    const results: { name: string; roll: number }[] = [];
    for (const n of list) {
      let roll: number;
      let guard = 100;
      do {
        roll = 1 + rand(20);
        guard--;
      } while (used.has(roll) && guard > 0);
      used.add(roll);
      results.push({ name: n, roll });
    }
    const max = Math.max(...results.map((r) => r.roll));
    const winners = results.filter((r) => r.roll === max).map((r) => r.name);
    setVsLines(results.map((r) => `${r.name}: ${r.roll}`));
    setVsWinner(winners.join(", "));
  }

  // 성장 추천기
  function doSuggestGrowth() {
    if (growClass === "-") {
      setGrowResult(["클래스를 먼저 선택"]);
      return;
    }
    const rule = GROWTH_DB[growClass];
    if (!rule) {
      setGrowResult(["아직 이 클래스는 준비중"]);
      return;
    }
    const opens = rule.open(growLevel, growSub);
    const lines: string[] = [];

    // 레벨별 고정 선택 수 처리 (전투의 대가/비전궁수 등)
    Object.entries(opens).forEach(([key, pool]) => {
      if (!pool || pool.length === 0) return;
      const filtered = pool.filter((p) => !excludedFeatures.includes(p));
      if (filtered.length === 0) return;

      // 주문이 아닌 선택지는 고정 규칙 처리
      if (key === "전투 기법" && CLASSES[growClass]?.ko === "파이터" && growSub === "전투의 대가") {
        const count = growLevel === 3 ? 3 : growLevel === 7 ? 2 : growLevel === 10 ? 2 : 1;
        sampleN(filtered, count).forEach((p) => lines.push(`${key}: ${p}`));
      } else if (key === "비전 사격" && CLASSES[growClass]?.ko === "파이터" && growSub === "비전 궁수") {
        const count = growLevel === 3 ? 3 : 1; // 3레벨 3개, 7/10은 1개
        sampleN(filtered, count).forEach((p) => lines.push(`${key}: ${p}`));
      } else if (key === "소마법" && CLASSES[growClass]?.ko === "파이터" && growSub === "비전 궁수" && growLevel === 3) {
        // 3레벨 소마법 택1
        sampleN(filtered, 1).forEach((p) => lines.push(`${key}: ${p}`));
      } else if (key === "동물 무리" && CLASSES[growClass]?.ko === "레인저" && growSub === "무리지기" && growLevel >= 3) {
        sampleN(filtered, 1).forEach((p) => lines.push(`${key}: ${p}`));
      } else if (key === "소마법" && CLASSES[growClass]?.ko === "클레릭" && growSub === "죽음 권역" && growLevel === 1) {
        sampleN(filtered, 1).forEach((p) => lines.push(`${key}: ${p}`));
      } else {
        // 일반 선택지
        sampleN(filtered, Math.max(1, Math.min(3, growCount))).forEach((p) => lines.push(`${key}: ${p}`));
      }
    });

    // 주문 추천 (최대 주문 레벨까지 누적 풀) — "배울 주문 수"는 주문에만 적용
    if (rule.maxSpellLevel && rule.spells) {
      const maxL = rule.maxSpellLevel(growLevel);
      const all: string[] = [];
      for (let lv = 0; lv <= maxL; lv++) if (rule.spells[lv]?.length) all.push(...rule.spells[lv]!);
      const filtered = all.filter((s) => !excludedFeatures.includes(s));
      if (filtered.length) sampleN(filtered, Math.max(1, growCount)).forEach((s) => lines.push(`주문: ${s}`));
    }
    setGrowResult(lines.length ? lines : ["추천 항목 없음"]);
  }

  // ---------- UI ----------
  const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" };
  const label: React.CSSProperties = { width: 90, color: "#374151" };
  const smallLabel: React.CSSProperties = { color: "#6b7280" };
  const select: React.CSSProperties = { padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 10, minWidth: 160 };
  const btnBase: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" };
  const btn: React.CSSProperties = { ...btnBase };
  const btnPrimary: React.CSSProperties = { ...btnBase, background: "#111827", color: "#fff", borderColor: "#111827" };
  const btnSecondary: React.CSSProperties = { ...btnBase, background: "#f3f4f6" };
  const input: React.CSSProperties = { padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 10, minWidth: 260 };
  const badge: React.CSSProperties = { display: "inline-block", padding: "0 6px", fontSize: 12, borderRadius: 999, background: "#111827", color: "#fff", lineHeight: "18px", height: 18, margin: "0 2px" };

  const raceOptions = Object.keys(RACES) as (keyof typeof RACES)[];
  const classOptions = Object.keys(CLASSES) as (keyof typeof CLASSES)[];

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start", background: "#fff" }}>
      <div style={{ width: "min(1200px, 96%)", margin: "24px auto", fontFamily: "ui-sans-serif, system-ui" }}>
        <header style={{ textAlign: "center", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ width: 120 }} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{T.title}</h1>
            <p style={{ color: "#6b7280", margin: "6px 0 0" }}>{T.sub}</p>
          </div>
          <div style={{ width: 120, textAlign: "right" }}>
            <button onClick={() => setLang(lang === "ko" ? "en" : "ko")} style={btnSecondary}>{T.langBtn}</button>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16 }}>
          {/* 좌측 */}
          <div>
            {/* 결과 */}
            <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>{T.result}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 8 }}>
                <div style={{ color: "#6b7280" }}>{T.race}</div>
                <div>{raceOut}{subraceKo !== "-" ? ` / ${subraceKo}` : ""}</div>

                <div style={{ color: "#6b7280" }}>{T.klass}</div>
                <div>{classOut}{subclassKo !== "-" ? ` / ${subclassKo}` : ""}</div>

                <div style={{ color: "#6b7280" }}>{T.background}</div>
                <div>{bgLabel(bg)}</div>

                <div style={{ color: "#6b7280" }}>{T.weapons}</div>
                <div>{weaponsOut.join(", ")}</div>

                <div style={{ color: "#6b7280" }}>{T.skills}</div>
                <div>{skillsOut.join(", ")}</div>
              </div>

              {/* 능력치 */}
              <div style={{ marginTop: 12 }}>
                <h3 style={{ fontWeight: 700, margin: "0 0 6px" }}>{T.abilities}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, textAlign: "center" }}>
                  {ABILS.map((k) => (
                    <div key={k} style={{ border: "1px solid #f1f5f9", borderRadius: 10, padding: "8px 6px" }}>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{abilLabel(k)}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{stats[k]}</div>
                      <div style={{ height: 18, marginTop: 4 }}>
                        {pbBonus2 === k && <span style={badge}>+2</span>}
                        {pbBonus1 === k && <span style={{ ...badge, background: "#e5e7eb", color: "#111827" }}>+1</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 조작 */}
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                <button onClick={() => {
                  if (!lockRace) rollRace();
                  if (!lockClass) rollClass();
                  if (!lockBG) rollBackground();
                  rollStats();
                  setTimeout(() => { if (!lockWeapons) rollWeapons(); if (!lockSkills) rollSkills(); }, 0);
                }} style={btnPrimary}>{T.rollAll}</button>

                <button onClick={() => { rollRace(); setTimeout(rollWeapons, 0); }} style={btn}>{T.onlyRace}</button>
                <button onClick={() => { rollClass(); setTimeout(() => { rollWeapons(); rollSkills(); }, 0); }} style={btn}>{T.onlyClass}</button>
                <button onClick={() => { rollBackground(); setTimeout(rollSkills, 0); }} style={btn}>{T.onlyBG}</button>
                <button onClick={rollStats} style={btn}>{T.rollStats}</button>
                <button onClick={rollWeapons} style={btn}>{T.rerollWeapons}</button>
                <button onClick={rollAny2Weapons} style={btn}>{T.any2Weapons}</button>
                <button onClick={rollSkills} style={btn}>{T.rollSkills}</button>
              </div>
            </section>

            {/* 재주 */}
            <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginTop: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>{T.featSection}</h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={rollFeat} style={btn}>{T.rollFeat}</button>
                {feat && (
                  <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    {feat}
                    <button onClick={() => setExcludedFeats((prev) => [...prev, feat.split(" ")[0]])} style={{ ...btn, padding: "2px 6px", fontSize: 12 }}>
                      제외
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 주사위 */}
            <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginTop: 16 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>{T.diceTitle}</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <input value={diceExpr} onChange={(e) => setDiceExpr(e.target.value)} placeholder={T.dicePH} style={input} />
                <button onClick={handleRollDice} style={btn}>{T.rollDice}</button>
              </div>
              {diceDetail && <div style={{ marginTop: 8, color: "#374151" }}>{diceDetail}</div>}
            </section>

            {/* 승자 정하기 */}
            <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginTop: 16, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>{T.vsTitle}</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <input value={names} onChange={(e) => setNames(e.target.value)} placeholder={T.vsPH} style={input} />
                <button onClick={handleVersus} style={btn}>{T.vsRoll}</button>
              </div>
              {vsLines.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  {vsLines.map((l, i) => <div key={i}>{l}</div>)}
                  {vsWinner && <div style={{ marginTop: 6, fontWeight: 800 }}>{T.winner}: {vsWinner}</div>}
                </div>
              )}
            </section>
          </div>

          {/* 우측 패널 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 수동 선택 & 고정 */}
            <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>{T.manualPanel}</h3>

              {/* 종족 */}
              <div style={row}>
                <label style={label}>{T.race}</label>
                <select
                  value={raceKey}
                  onChange={(e: any) => {
                    const k = e.target.value as keyof typeof RACES | "-";
                    setRaceKey(k);
                    const sub = k === "-" ? "-" : (RACES[k].subs?.[0] ?? "-");
                    setSubraceKo(sub);
                  }}
                  style={select}
                >
                  <option value="-">-</option>
                  {raceOptions.map((k) => <option key={k} value={k}>{lang === "ko" ? RACES[k].ko : k}</option>)}
                </select>
                <select disabled={raceKey === "-" || !(RACES[raceKey].subs?.length)} value={subraceKo} onChange={(e) => setSubraceKo(e.target.value)} style={select}>
                  {(raceKey === "-" || !RACES[raceKey].subs)
                    ? <option value="-">-</option>
                    : RACES[raceKey].subs!.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <label style={smallLabel}>{L[lang].locks}</label>
                  <input type="checkbox" checked={lockRace} onChange={(e) => setLockRace(e.target.checked)} />
                </div>
              </div>

              {/* 클래스 */}
              <div style={row}>
                <label style={label}>{T.klass}</label>
                <select
                  value={classKey}
                  onChange={(e: any) => {
                    const k = e.target.value as keyof typeof CLASSES | "-";
                    setClassKey(k);
                    setSubclassKo(k === "-" ? "-" : CLASSES[k].subclasses[0]);
                  }}
                  style={select}
                >
                  <option value="-">-</option>
                  {classOptions.map((k) => <option key={k} value={k}>{lang === "ko" ? CLASSES[k].ko : k}</option>)}
                </select>
                <select disabled={classKey === "-"} value={subclassKo} onChange={(e) => setSubclassKo(e.target.value)} style={select}>
                  {classKey === "-"
                    ? <option value="-">-</option>
                    : CLASSES[classKey].subclasses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <label style={smallLabel}>{L[lang].locks}</label>
                  <input type="checkbox" checked={lockClass} onChange={(e) => setLockClass(e.target.checked)} />
                </div>
              </div>

              {/* 출신 */}
              <div style={row}>
                <label style={label}>{T.background}</label>
                <select value={bg} onChange={(e: any) => setBg(e.target.value as Background)} style={select}>
                  <option value="-">-</option>
                  {BACK_KO.map((b) => <option key={b} value={b}>{lang === "ko" ? b : BACK_EN[b]}</option>)}
                </select>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <label style={smallLabel}>{L[lang].locks}</label>
                  <input type="checkbox" checked={lockBG} onChange={(e) => setLockBG(e.target.checked)} />
                </div>
              </div>

              {/* 무기 수동 */}
              <div style={row}>
                <label style={label}>{T.weapons}</label>
                <input
                  value={weaponsKO.join(", ")}
                  onChange={(e) => setWeaponsKO(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                  placeholder="예: 장검, 방패"
                  style={{ ...input, minWidth: 0, flex: 1 }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <label style={smallLabel}>{L[lang].locks}</label>
                  <input type="checkbox" checked={lockWeapons} onChange={(e) => setLockWeapons(e.target.checked)} />
                </div>
              </div>

              {/* 기술 수동 */}
              <div style={row}>
                <label style={label}>{T.skills}</label>
                <input
                  value={skillsOut.join(", ")}
                  onChange={(e) => {
                    const names = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                    const rev: Record<string, keyof typeof SK.KO> = {};
                    (Object.keys(SK.KO) as (keyof typeof SK.KO)[]).forEach((k) => (rev[SK.KO[k]] = k));
                    const toKeys = names
                      .map((n) => rev[n] ?? (Object.keys(SK.EN) as (keyof typeof SK.EN)[]).find((k) => SK.EN[k] === n))
                      .filter(Boolean) as (keyof typeof SK.KO)[];
                    setSkills(toKeys);
                  }}
                  placeholder="예: 운동, 포착"
                  style={{ ...input, minWidth: 0, flex: 1 }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <label style={smallLabel}>{L[lang].locks}</label>
                  <input type="checkbox" checked={lockSkills} onChange={(e) => setLockSkills(e.target.checked)} />
                </div>
              </div>
            </section>

            {/* 클래스별 특성 */}
            <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>{T.growth}</h3>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={row}>
                  <label style={label}>{T.classPick}</label>
                  <select value={growClass} onChange={(e: any) => { const v = e.target.value as keyof typeof CLASSES | "-"; setGrowClass(v); setGrowSub("-"); }} style={select}>
                    <option value="-">-</option>
                    {classOptions.map((k) => <option key={k} value={k}>{lang === "ko" ? CLASSES[k].ko : k}</option>)}
                  </select>
                </div>
                <div style={row}>
                  <label style={label}>{T.subPick}</label>
                  <select value={growSub} onChange={(e) => setGrowSub(e.target.value)} style={select} disabled={growClass === "-"}>
                    {growClass === "-" ? <option value="-">-</option> : ["-"].concat(CLASSES[growClass].subclasses).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={row}>
                  <label style={label}>{T.levelPick}</label>
                  <input type="number" min={1} max={12} value={growLevel} onChange={(e) => setGrowLevel(parseInt(e.target.value || "1", 10))} style={{ ...input, width: 90 }} />
                </div>
                <div style={row}>
                  <label style={label}>{T.howMany}</label>
                  <input type="number" min={1} max={5} value={growCount} onChange={(e) => setGrowCount(parseInt(e.target.value || "1", 10))} style={{ ...input, width: 90 }} />
                </div>
                <div>
                  <button onClick={doSuggestGrowth} style={btn}>{L[lang].suggest}</button>
                </div>
                {growResult.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {growResult.map((g, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>• {g}</span>
                        <button
                          onClick={() => setExcludedFeatures((prev) => [...prev, g.replace(/^.*: /, "")])}
                          style={{ ...btn, padding: "2px 6px", fontSize: 12 }}
                        >
                          제외
                        </button>
                      </div>
                    ))}
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
