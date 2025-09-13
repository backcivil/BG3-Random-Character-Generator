import { useState } from "react";

/** ========= 유틸 ========= */
const rand = (n: number) => Math.floor(Math.random() * n);
const choice = <T,>(arr: readonly T[]) => arr[rand(arr.length)];
const shuffle = <T,>(arr: readonly T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
};
const sampleN = <T,>(arr: readonly T[], n: number) => shuffle(arr).slice(0, Math.max(0, Math.min(n, arr.length)));

// ===== 주문 풀 유틸 (누적 풀/중복 방지) =====
function flattenPool(pool: Record<number, string[]>, exclude: Set<string>): string[] {
  const all = Object.keys(pool)
    .map((n) => Number(n))
    .filter((lv) => lv > 0)
    .flatMap((lv) => pool[lv] || []);
  return Array.from(new Set(all)).filter((s) => !exclude.has(s));
}
function pickUnique<T>(pool: readonly T[], n: number, already: Set<T>): T[] {
  const cand = pool.filter((x) => !already.has(x));
  const arr = shuffle(cand);
  const out: T[] = [];
  for (const x of arr) {
    if (out.length >= n) break;
    out.push(x);
    already.add(x);
  }
  return out;
}

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
    any2Weapons: "무기만(아무거나)",
    rollSkills: "기술 다시 뽑기",
    featSection: "재주",
    rollFeat: "재주 뽑기",
    langBtn: "English",
    str: "힘", dex: "민첩", con: "건강", int: "지능", wis: "지혜", cha: "매력",
    diceTitle: "주사위 굴리기",
    dicePH: "예: 1d4, 3d6+2",
    rollDice: "굴리기",
    vsTitle: "승자 정하기",
    vsPH: "공백 또는 쉼표로 구분 (레드 유히 함마김 활잽이)",
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
    str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
    diceTitle: "Dice Roller",
    dicePH: "e.g., 1d4, 3d6+2",
    rollDice: "Roll",
    vsTitle: "Decide Winner",
    vsPH: "Whitespace or commas",
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
    clear: "Undo",
  },
} as const;

/** ========= 능력치 ========= */
const ABILS = ["STR","DEX","CON","INT","WIS","CHA"] as const;
type Abil = (typeof ABILS)[number];
const abilKo: Record<Abil,string> = { STR:"힘", DEX:"민첩", CON:"건강", INT:"지능", WIS:"지혜", CHA:"매력" };

/** ========= 클래스/종족 ========= */
const CLASSES: Record<string, { ko: string; subclasses: string[] }> = {
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

const RACES: Record<string, { ko: string; subs?: string[] }> = {
  Human:{ko:"인간"},
  Elf:{ko:"엘프", subs:["하이 엘프","우드 엘프"]},
  Tiefling:{ko:"티플링", subs:["아스모데우스 티플링","메피스토펠레스 티플링","자리엘 티플링"]},
  Drow:{ko:"드로우", subs:["롤쓰 스원 드로우","셀다린 드로우"]},
  Githyanki:{ko:"기스양키"},
  Dwarf:{ko:"드워프", subs:["골드 드워프","실드 드워프","드웨가"]},
  "Half-Elf":{ko:"하프엘프", subs:["하이 하프 엘프","우드 하프 엘프","드로우 하프 엘프"]},
  Halfling:{ko:"하플링", subs:["라이트풋 하플링","스트롱하트 하플링"]},
  Gnome:{ko:"노움", subs:["바위 노움","숲 노움","딥 노움"]},
  Dragonborn:{ko:"드래곤본", subs:["블랙","코퍼","블루","브론즈","브래스","레드","골드","그린","화이트","실버"]},
  "Half-Orc":{ko:"하프오크"},
};

/** ========= 배경/스킬 ========= */
const BACK_KO = ["복사","사기꾼","범죄자","연예인","시골 영웅","길드 장인","귀족","이방인","현자","군인","부랑아"] as const;
type Background = (typeof BACK_KO)[number] | "-";
const BACK_EN: Record<Exclude<Background,"-">,string> = {
  복사:"Acolyte", 사기꾼:"Charlatan", 범죄자:"Criminal", 연예인:"Entertainer", "시골 영웅":"Folk Hero", "길드 장인":"Guild Artisan",
  귀족:"Noble", 이방인:"Outlander", 현자:"Sage", 군인:"Soldier", 부랑아:"Urchin"
};

const SK = {
  KO: { Athletics:"운동", Acrobatics:"곡예", Sleight:"손재주", Stealth:"은신", Arcana:"비전", History:"역사", Investigation:"조사",
        Nature:"자연", Religion:"종교", Animal:"동물 조련", Insight:"통찰", Medicine:"의학", Perception:"포착", Survival:"생존",
        Deception:"기만", Intimidation:"협박", Performance:"공연", Persuasion:"설득" },
  EN: { Athletics:"Athletics", Acrobatics:"Acrobatics", Sleight:"Sleight of Hand", Stealth:"Stealth", Arcana:"Arcana", History:"History", Investigation:"Investigation",
        Nature:"Nature", Religion:"Religion", Animal:"Animal Handling", Insight:"Insight", Medicine:"Medicine", Perception:"Perception", Survival:"Survival",
        Deception:"Deception", Intimidation:"Intimidation", Performance:"Performance", Persuasion:"Persuasion" },
};
type SkillKey = keyof typeof SK.KO;

const BG_SKILLS: Record<Exclude<Background,"-">,[SkillKey,SkillKey]> = {
  복사:["Insight","Religion"], 사기꾼:["Deception","Sleight"], 범죄자:["Deception","Stealth"], 연예인:["Acrobatics","Performance"],
  "시골 영웅":["Animal","Survival"], "길드 장인":["Insight","Persuasion"], 귀족:["History","Persuasion"], 이방인:["Athletics","Survival"],
  현자:["Arcana","History"], 군인:["Athletics","Intimidation"], 부랑아:["Sleight","Stealth"],
};

// 클래스 기본 기술 선택풀
const CLASS_SK_CHOICE: Record<string, { n: number; list: SkillKey[] }> = {
  바바리안:{n:2, list:["Animal","Athletics","Intimidation","Nature","Perception","Survival"]},
  바드:{n:3, list:["Deception","Performance","Persuasion","Sleight","Intimidation","Acrobatics","Insight"]},
  클레릭:{n:2, list:["History","Insight","Medicine","Persuasion","Religion"]},
  드루이드:{n:2, list:["Animal","Insight","Medicine","Nature","Perception","Survival"]},
  파이터:{n:2, list:["Acrobatics","Animal","Athletics","History","Insight","Intimidation","Perception","Survival"]},
  몽크:{n:2, list:["Acrobatics","Athletics","Insight","History","Religion","Stealth"]},
  팔라딘:{n:2, list:["Athletics","Insight","Intimidation","Medicine","Persuasion","Religion"]},
  레인저:{n:3, list:["Animal","Athletics","Insight","Investigation","Nature","Perception","Stealth","Survival"] as any},
  로그:{n:4, list:["Acrobatics","Athletics","Deception","Insight","Intimidation","Investigation","Perception","Performance","Persuasion","Sleight","Stealth"] as any},
  소서러:{n:2, list:["Arcana","Deception","Insight","Intimidation","Persuasion","Religion"]},
  워락:{n:2, list:["Arcana","Deception","History","Intimidation","Investigation","Nature","Religion"] as any},
  위저드:{n:2, list:["Arcana","History","Insight","Investigation","Medicine","Religion"] as any},
};

/** ========= 무기 ========= */
const SIMPLE = ["Club","Dagger","Greatclub","Handaxe","Javelin","Light Crossbow","Light Hammer","Mace","Quarterstaff","Shortbow","Sickle","Spear"] as const;
const SIMPLE_KO: Record<(typeof SIMPLE)[number],string> = {
  Club:"곤봉", Dagger:"단검", Greatclub:"대형 곤봉", Handaxe:"손도끼", Javelin:"투창", "Light Crossbow":"경쇠뇌",
  "Light Hammer":"경량 망치", Mace:"철퇴", Quarterstaff:"육척봉", Shortbow:"단궁", Sickle:"낫", Spear:"창",
};
const MARTIAL = ["Battleaxe","Flail","Scimitar","Greataxe","Greatsword","Halberd","Hand Crossbow","Heavy Crossbow","Longbow","Longsword","Maul","Morningstar","Pike","Rapier","Glaive","Shortsword","Trident","Warhammer","War Pick"] as const;
const MARTIAL_KO: Record<(typeof MARTIAL)[number],string> = {
  Battleaxe:"전투 도끼", Flail:"도리깨", Scimitar:"협도", Greataxe:"대형 도끼", Greatsword:"대검", Halberd:"미늘창",
  "Hand Crossbow":"손 쇠뇌", "Heavy Crossbow":"중쇠뇌", Longbow:"장궁", Longsword:"장검", Maul:"대형 망치", Morningstar:"모닝스타",
  Pike:"장창", Rapier:"레이피어", Glaive:"언월도", Shortsword:"소검", Trident:"삼지창", Warhammer:"전쟁 망치", "War Pick":"전쟁 곡괭이",
};
const ALL_WEAPONS_EN = [...SIMPLE, ...MARTIAL] as const;
const WEAPON_KO: Record<(typeof ALL_WEAPONS_EN)[number],string> = { ...SIMPLE_KO, ...MARTIAL_KO };
const SHIELD_KO = "방패";

const RACE_WEAP_KO: Record<string,string[]> = {
  인간:["언월도","미늘창","장창","창"],
  하프엘프:["언월도","미늘창","장창","창"],
  엘프:["단검","단궁","장검","장궁"],
  드로우:["레이피어","소검","손 쇠뇌"],
  기스양키:["대검","장검","소검"],
  드워프:["경량 망치","손도끼","전투 도끼","전쟁 망치"],
};
const RACE_SHIELD = new Set(["인간","하프엘프"]);
const CLASS_WEAP_KO: Record<string,string[]> = {
  드루이드:["곤봉","낫","단검","언월도","육척봉","투창","창","철퇴"],
  몽크:Object.values(SIMPLE_KO).concat("소검"),
  바드:Object.values(SIMPLE_KO).concat(["레이피어","소검","장검","손 쇠뇌"]),
  로그:Object.values(SIMPLE_KO).concat(["레이피어","소검","장검","손 쇠뇌"]),
  소서러:["단검","육척봉","경쇠뇌"],
  위저드:["단검","육척봉","경쇠뇌"],
  워락:Object.values(SIMPLE_KO),
  클레릭:Object.values(SIMPLE_KO),
  레인저:Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  바바리안:Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  팔라딘:Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
  파이터:Object.values(SIMPLE_KO).concat(Object.values(MARTIAL_KO)),
};
const CLASS_SHIELD = new Set(["파이터","팔라딘","클레릭","레인저","바바리안","드루이드"]);

// 서브클래스/권역 특수 무기 숙련
const SUBCLASS_EXTRA_WEAPONS: Record<string,string[]> = {
  "클레릭:폭풍 권역": Object.values(MARTIAL_KO),
  "클레릭:전쟁 권역": Object.values(MARTIAL_KO),
  "클레릭:죽음 권역": Object.values(MARTIAL_KO),
  "위저드:칼날 노래": ["단검","장검","레이피어","협도","소검","낫"],
};
// ====== 주문 풀(요약) : 패치8 포함 ======
const CANTRIPS_PATCH8 = ["폭음의 검","폭발하는 힘","망자의 종소리"];
const LV2_PATCH8 = ["그림자 검"];

// ====== 클래스별 주문 목록 ======
const BARD_SPELLS = {
  0: ["신랄한 조롱","도검 결계","마법사의 손","진실의 일격","친구","춤추는 빛","빛","하급 환영", ...CANTRIPS_PATCH8],
  1: ["동물 교감","액운","인간형 매혹","상처 치료","변장","불협화음의 속삭임","요정불","깃털 낙하","치유의 단어","영웅심","활보","수면","동물과 대화","타샤의 끔찍한 웃음","천둥파"],
  2: ["실명","평정심","단검 구름","광기의 왕관","생각 탐지","능력 강화","노예화","금속 가열","인간형 포박","투명","노크","하급 회복","환영력","투명체 감지","파쇄","침묵"],
  3: ["저주 부여","공포","죽은 척","결계 문양","최면 문양","식물 성장","망자와 대화","악취 구름"],
  4: ["혼란","차원문","자유 이동","중급 투명","변신"],
  5: ["인간형 지배","상급 회복","괴물 포박","다중 상처 치료","이차원인 속박","외견"],
  6: ["깨무는 눈길","오토의 참을 수 없는 춤"],
};
const CLERIC_SPELLS = {
  0: ["기적술","신성한 불길","인도","저항","빛","도검 결계","불꽃 생성"],
  1: ["신앙의 방패","선악 보호","성역","액운","명령","축복","상처 치료","치유의 단어","유도 화살","상처 유발","물 생성 또는 제거"],
  2: ["지원","하급 회복","수호의 결속","독 보호","평정심","인간형 포박","치유의 기도","영적 무기","침묵","실명","능력 강화"],
  3: ["희망의 등불","에너지 보호","저주 해제","결계 문양","영혼 수호자","햇빛","다중 치유의 단어","망자 조종","생환","망자와 대화","죽은 척","저주 부여"],
  4: ["추방","자유 이동","죽음 방비","믿음의 수호자"],
  5: ["선악 해제","이차원인 속박","상급 회복","곤충 떼","화염 일격","다중 상처 치료","감염"],
  6: ["영웅의 연회","이차원인 아군","검 방벽","치유","언데드 생성","해악"],
};
const DRUID_SPELLS = {
  0: ["인도","독 분사","불꽃 생성","저항","마법 곤봉","가시 채찍"],
  1: ["얼음 칼","휘감기","안개구름","동물과 대화","동물 교감","인간형 매혹","천둥파","치유의 단어","상처 치료","요정불","도약 강화","활보","맛있는 열매","물 생성 또는 제거"],
  2: ["하급 회복","독 보호","신출귀몰","화염 구체","인간형 포박","화염검","돌풍","달빛","나무껍질 피부","가시밭","능력 강화","금속 가열","암시야"],
  3: ["에너지 보호","낙뢰 소환","진눈깨비 폭풍","햇빛","죽은 척","식물 성장"],
  4: ["자유 이동","바위 피부","하급 정령 소환","숲의 존재 소환","포박 덩굴","혼란","야수 지배","얼음 폭풍","화염 벽","역병","변신"],
  5: ["상급 회복","이차원인 속박","정령 소환","곤충 떼","다중 상처 치료","바위의 벽","감염"],
  6: ["영웅의 연회","가시의 벽","치유","햇살","바람 걸음"],
};
const SORCERER_SPELLS = {
  0: ["도검 결계","산성 거품","마법사의 손","독 분사","진실의 일격","친구","춤추는 빛","화염살","빛","서리 광선","전격의 손아귀","하급 환영","뼛속 냉기", ...CANTRIPS_PATCH8],
  1: ["불타는 손길","인간형 매혹","오색 보주","오색 빛보라","변장","신속 후퇴","거짓 목숨","깃털 낙하","안개구름","얼음 칼","도약 강화","마법사의 갑옷","마력탄","독 광선","방어막","수면","천둥파","마녀의 화살"],
  2: ["실명","잔상","단검 구름","광기의 왕관","어둠","암시야","생각 탐지","능력 강화","확대/축소","돌풍","인간형 포박","투명","노크","거울 분신","안개 걸음","환영력","작열 광선","투명체 감지","파쇄","거미줄", ...LV2_PATCH8],
  3: ["점멸","주문 방해","햇빛","공포","화염구","비행 부여","기체 형태","가속","최면 문양","번개 줄기","에너지 보호","진눈깨비 폭풍","둔화","악취 구름"],
  4: ["추방","역병","혼란","차원문","야수 지배","상급 투명","얼음 폭풍","변신","바위 피부","화염 벽"],
  5: ["죽음 구름","냉기 분사","인간형 지배","괴물 포박","곤충 떼","외견","염력","바위의 벽"],
  6: ["비전 관문","연쇄 번개","죽음의 원","분해","깨무는 눈길","무적의 구체","햇살"],
};
const WARLOCK_BASE = {
  0: ["도검 결계","뼛속 냉기","섬뜩한 파동","친구","마법사의 손","하급 환영","독 분사","진실의 일격", ...CANTRIPS_PATCH8],
  1: ["아거티스의 갑옷","하다르의 팔","인간형 매혹","신속 후퇴","지옥의 질책","주술","선악 보호","마녀의 화살"],
  2: ["단검 구름","광기의 왕관","어둠","노예화","인간형 포박","투명","거울 분신","안개 걸음","약화 광선","파쇄", ...LV2_PATCH8],
  3: ["주문 방해","공포","비행 부여","기체 형태","하다르의 굶주림","최면 문양","저주 해제","흡혈의 손길"],
  4: ["추방","역병","차원문"],
  5: ["괴물 포박"],
};
// 워락 확장 주문(서브클래스) — 주술 칼날 업데이트 반영
const WARLOCK_EXP: Record<string, Record<number,string[]>> = {
  "마족": { 1:["불타는 손길","명령"], 3:["실명","작열 광선"], 5:["화염구","악취 구름"], 7:["화염 방패","화염 벽"], 9:["냉기 분사","화염 일격"] },
  "고대의 지배자": { 1:["불협화음의 속삭임","타샤의 끔찍한 웃음"], 3:["생각 탐지","환영력"], 5:["저주 부여","둔화"], 7:["야수 지배","에바드의 검은 촉수"], 9:["인간형 지배","염력"] },
  "대요정": { 1:["요정불","수면"], 3:["평정심","환영력"], 5:["점멸","식물 성장"], 7:["야수 지배","상급 투명"], 9:["인간형 지배","외견"] },
  // ★ 주술 칼날(업데이트)
  "주술 칼날": {
    1:["방어막","분노의 강타"],
    3:["잔상","낙인 강타"],
    5:["점멸","원소 무기"],
    7:["환영 살해자","충격의 강타","야수 지배","상급 투명"],
    9:["추방 강타","냉기 분사"],
  },
};
const WIZARD_SPELLS = {
  0: ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","마법사의 손","하급 환영","진실의 일격", ...CANTRIPS_PATCH8],
  1: ["불타는 손길","인간형 매혹","오색 보주","오색 빛보라","변장","신속 후퇴","거짓 목숨","깃털 낙하","소환수 찾기","안개구름","기름칠","얼음 칼","도약 강화","활보","마법사의 갑옷","마력탄","선악 보호","독 광선","방어막","수면","타샤의 끔찍한 웃음","천둥파","마녀의 화살"],
  2: ["비전 자물쇠","실명","잔상","단검 구름","광기의 왕관","어둠","암시야","생각 탐지","확대/축소","화염 구체","돌풍","인간형 포박","투명","노크","마법 무기","멜프의 산성 화살","거울 분신","안개 걸음","환영력","약화 광선","작열 광선","투명체 감지","파쇄","거미줄", ...LV2_PATCH8],
  3: ["망자 조종","저주 부여","점멸","주문 방해","공포","죽은 척","화염구","비행 부여","기체 형태","결계 문양","가속","최면 문양","번개 줄기","에너지 보호","저주 해제","진눈깨비 폭풍","둔화","악취 구름","흡혈의 손길"],
  4: ["추방","역병","혼란","하급 정령 소환","차원문","에바드의 검은 촉수","화염 방패","상급 투명","얼음 폭풍","오틸루크의 탄성 구체","환영 살해자","변신","바위 피부","화염 벽"],
  5: ["죽음 구름","냉기 분사","정령 소환","인간형 지배","괴물 포박","이차원인 속박","외견","염력","바위의 벽"],
  6: ["비전 관문","연쇄 번개","죽음의 원","언데드 생성","분해","깨무는 눈길","육신 석화","무적의 구체","오틸루크의 빙결 구체","오토의 참을 수 없는 춤","햇살","얼음의 벽"],
};
const RANGER_SPELLS = {
  1: ["동물 교감","상처 치료","속박의 일격","안개구름","맛있는 열매","가시 세례","사냥꾼의 표식","도약 강화","활보","동물과 대화"],
  2: ["나무껍질 피부","암시야","하급 회복","신출귀몰","독 보호","침묵","가시밭"],
  3: ["포화 소환","햇빛","번개 화살","식물 성장","에너지 보호"],
};
// ====== 팔라딘 주문 목록 ======
// ====== 팔라딘 주문 목록 ======
const PALADIN_SPELLS= {
  1: [
    "선악 보호","신앙의 방패","명령","강제 결투","축복","영웅심",
    "상처 치료","작열의 강타","천둥 강타","신성한 은총","분노의 강타",
  ],
  2: [
    "지원","하급 회복","독 보호","낙인 강타","마법 무기",
  ],
  3: [
    "저주 해제","활력의 감시자","성전사의 망토","햇빛","실명 강타","생환","원소 무기",
  ],
};


// 몽크 - 사원소의 길(특수 주문)
const MONK_FE_SPELLS = {
  3: [
    "산의 냉기","불 뱀의 송곳니","얼음 조형","폭풍의 손길",
    "서리의 검","네 천둥의 주먹","굳건한 대기의 주먹","강풍 영혼의 돌진","원소 균형의 구체","휩쓰는 재의 일격","물 채찍",
  ],
  6: ["북풍의 손아귀","불지옥의 포옹","정상의 징"],
  11:["불사조의 불꽃","안개 태세","바람 타기"],
};
// 파이터/로그 (AT/EK)
const EK_SPELLS = {
  0: ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","마법사의 손","하급 환영","진실의 일격", ...CANTRIPS_PATCH8],
  1: ["불타는 손길","오색 보주","마력탄","마법사의 갑옷","선악 보호","방어막","천둥파","마녀의 화살"],
  2: ["멜프의 산성 화살","비전 자물쇠","어둠","돌풍","작열 광선","파쇄", ...LV2_PATCH8],
};
const AT_SPELLS = {
  0: ["산성 거품","뼛속 냉기","화염살","독 분사","서리 광선","전격의 손아귀","도검 결계","친구","춤추는 빛","빛","하급 환영","진실의 일격", ...CANTRIPS_PATCH8],
  1: ["인간형 매혹","오색 빛보라","변장","타샤의 끔찍한 웃음","수면"],
  2: ["잔상","광기의 왕관","인간형 포박","투명","거울 분신","환영력", ...LV2_PATCH8],
};

// 비전 궁수 / 전투의 대가
const ELDRITCH_SHOTS = ["추방 화살","현혹 화살","폭발 화살","약화 화살","속박 화살","추적 화살","그림자 화살","관통 화살"];
const BM_MANEUVERS = ["사령관의 일격","무장 해제 공격","교란의 일격","날렵한 발놀림","속임수 공격","도발 공격","전투 기법 공격","위협 공격","정밀 공격","밀치기 공격","고양 응수","휩쓸기","다리 걸기 공격"];

/** ========= 바드: 마법 비밀 목록 ========= */
const BARD_SECRETS: Record<number, string[]> = {
  0: ["뼛속 냉기","섬뜩한 파동","화염살","서리 광선","신성한 불길"],
  1: ["아거티스의 갑옷","축복","오색 보주","명령","휘감기","거짓 목숨","유도 화살","지옥의 질책","주술","사냥꾼의 표식","얼음 칼","마력탄","성역","천둥 강타"],
  2: ["비전 자물쇠","잔상","어둠","암시야","안개 걸음","신출귀몰","약화 광선","작열 광선","가시밭","영적 무기","거미줄"],
  3: ["망자 조종","활력의 감시자","낙뢰 소환","주문 방해","성전사의 망토","햇빛","화염구","비행 부여","기체 형태","가속","하다르의 굶주림","번개 줄기","다중 치유의 단어","저주 해제","생환","진눈깨비 폭풍","둔화","영혼 수호자","흡혈의 손길"],
  4: ["추방","역병","죽음 방비","야수 지배","화염 방패","믿음의 수호자","얼음 폭풍","화염 벽"],
  5: ["추방 강타","냉기 분사","정령 소환","감염","바위의 벽"],
};

/** ========= 포인트바이 ========= */
function rollPointBuyRaw(): Record<Abil,number> {
  const vals=[8,8,8,8,8,8]; let budget=27; const cost=(v:number)=> (v>=13?2:1); let guard=3000;
  while(budget>0 && guard-- > 0){
    const i=rand(6); const cur=vals[i]; if(cur>=15) continue;
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

/** ========= 무기/기술 계산 ========= */
function randomAny2KO(): string[] {
  const picks = shuffle(ALL_WEAPONS_EN).slice(0, 2);
  return picks.map(w=>WEAPON_KO[w]);
}
function computeWeapons(raceKoLabel: string, classKoLabel: string, subclass?: string): string[] {
  const racePool = RACE_WEAP_KO[raceKoLabel] || [];
  const classPool = CLASS_WEAP_KO[classKoLabel] || [];
  let pool = Array.from(new Set([...racePool, ...classPool]));
  if (classKoLabel === "몽크") pool = Array.from(new Set([...pool, "비무장 공격"]));
  const hasShield = (raceKoLabel && RACE_SHIELD.has(raceKoLabel)) || (classKoLabel && CLASS_SHIELD.has(classKoLabel));
  if (hasShield && !pool.includes(SHIELD_KO)) pool.push(SHIELD_KO);
  if (classKoLabel && subclass) {
    const key = `${classKoLabel}:${subclass}`;
    if (SUBCLASS_EXTRA_WEAPONS[key]) pool = Array.from(new Set([...pool, ...SUBCLASS_EXTRA_WEAPONS[key]]));
  }
  if (pool.length === 0) return randomAny2KO();
  const pickN = pool.length <= 8 ? 1 : 2;
  return shuffle(pool).slice(0, Math.min(pickN, pool.length));
}
function computeClassSkills(classKo: string, bgSel: Background): SkillKey[] {
  if (bgSel === "-") return [];
  const cfg = CLASS_SK_CHOICE[classKo]; if (!cfg) return [];
  const [bg1, bg2] = BG_SKILLS[bgSel];
  const pool = cfg.list.filter((s) => s !== bg1 && s !== bg2);
  return sampleN(pool, cfg.n);
}
function bgLabel(bg: Background, lang: Lang="ko") {
  if (bg === "-") return "-";
  return lang === "ko" ? bg : BACK_EN[bg];
}

/** ========= 승자 정하기 ========= */
function uniqueRolls(names: string[]): { lines: string[]; winner: string } {
  const res: Record<string, number> = {};
  const used = new Set<number>();
  const lines: string[] = [];
  for (const n of names) {
    let roll = rand(20) + 1;
    let rerolls = 0;
    while (used.has(roll) && rerolls < 50) { roll = rand(20) + 1; rerolls++; }
    used.add(roll);
    res[n] = roll;
  }
  const sorted = Object.entries(res).sort((a,b)=>b[1]-a[1]);
  for (const [n, v] of sorted) lines.push(`${n}: ${v}`);
  return { lines, winner: sorted[0][0] };
}

/** ========= 성장 로직(주문·특성) ========= */
// 한 레벨에서 허용되는 주문 레벨 상한
function maxSpellLevelByClass(klass: string, level: number): number {
  switch (klass) {
    case "Bard":
    case "Cleric":
    case "Druid":
    case "Sorcerer":
    case "Warlock":
      return Math.min(5, Math.floor((level + 1) / 2));
    case "Wizard":
      return 6;
    case "Ranger":
      return level >= 9 ? 3 : level >= 5 ? 2 : level >= 2 ? 1 : 0;
    case "Ranger":
      return level >= 9 ? 3 : level >= 5 ? 2 : level >= 2 ? 1 : 0;
    // ★ Paladin: 5레벨에 2레벨 주문, 9레벨에 3레벨 주문
    case "Paladin":
      return level >= 9 ? 3 : level >= 5 ? 2 : 1;

    case "Fighter": // EK 전용
      return Math.min(3, Math.floor((level + 1) / 4));
    case "Rogue":  // AT 전용
      return level >= 7 ? 2 : level >= 3 ? 1 : 0;
    case "Monk":   // 사원소의 길: 특수 테이블
    default:
      return 0;
  }
}

// 사원소 몽크: 레벨 구간별 "알고 있는 주문 수"
function monkFEKnown(level: number): number {
  if (level <= 6) return 3;       // 3~6 : 3개
  if (level <= 9) return 4;       // 7~9 : 4개
  if (level <= 11) return 5;      // 10~11 : 5개
  return 6;                       // 12 : 6개
}

// 각 클래스의 "알고 있는 주문 수"(소마법 제외) — 교체 굴림에 사용
function knownSpellCount(klass: string, sub: string, level: number): number {
  if (klass === "Ranger") {
    if (level < 2) return 0;
    let c = 2; // 2레벨 2개, 이후 홀수 레벨마다 +1
    for (let lv = 3; lv <= level; lv++) if (lv % 2 === 1) c++;
    return c;
  }
  if (klass === "Bard") return 4 + (level - 1);
  if (klass === "Sorcerer") return 2 + (level - 1);
  if (klass === "Warlock") return 2 + (level - 1);
  if (klass === "Rogue" && sub === "비전 괴도") {
    const map: Record<number, number> = {3:3,4:4,5:4,6:4,7:5,8:6,9:6,10:7,11:8,12:8};
    return map[level] ?? 0;
  }
  if (klass === "Fighter" && sub === "비술 기사") {
    const map: Record<number, number> = {3:3,4:4,5:4,6:4,7:6,8:7,9:7,10:8,11:9,12:9};
    return map[level] ?? 0;
  }
  if (klass === "Monk" && sub === "사원소의 길") return monkFEKnown(level);
  return 0; // 준비형(Cleric/Druid/Wizard 등)은 교체 개념과 다름
}

// 캐릭터가 배울 수 있는 주문 풀(클래스/서브/레벨 기준)
function collectSpellPool(klass: string, sub: string, level: number): Record<number,string[]> {
  // AT/EK는 3레벨부터 주문 시작
  if ((klass==="Fighter" && sub==="비술 기사" && level<3) || (klass==="Rogue" && sub==="비전 괴도" && level<3)) {
    return {};
  }
  const upTo = (src: Record<number,string[]>, maxLv: number) => {
    const out: Record<number,string[]> = {};
    for (const k of Object.keys(src)) {
      const lv = Number(k);
      if (lv<=maxLv) out[lv]=src[lv];
    }
    return out;
  };
  if (klass==="Bard") return upTo(BARD_SPELLS, maxSpellLevelByClass(klass, level));
  if (klass==="Cleric") return upTo(CLERIC_SPELLS, maxSpellLevelByClass(klass, level));
  if (klass==="Druid") return upTo(DRUID_SPELLS, maxSpellLevelByClass(klass, level));
  if (klass==="Sorcerer") return upTo(SORCERER_SPELLS, maxSpellLevelByClass(klass, level));
  if (klass==="Warlock") {
    const base = upTo(WARLOCK_BASE, maxSpellLevelByClass(klass, level));
    const exp = WARLOCK_EXP[sub] || {};
    for (const k of Object.keys(exp)) {
      const gate = Number(k);
      if (level >= (gate===1?1:gate)) {
        for (const s of exp[gate]) {
          let sl = 4;
          if (WARLOCK_BASE[1]?.includes(s)) sl=1;
          else if (WARLOCK_BASE[2]?.includes(s)) sl=2;
          else if (WARLOCK_BASE[3]?.includes(s)) sl=3;
          else if (WARLOCK_BASE[4]?.includes(s)) sl=4;
          else if (WARLOCK_BASE[5]?.includes(s)) sl=5;
          base[sl] = Array.from(new Set([...(base[sl]||[]), s]));
        }
      }
    }
    return base;
  }
  if (klass==="Wizard") return upTo(WIZARD_SPELLS, maxSpellLevelByClass(klass, level));
  if (klass==="Ranger") return upTo(RANGER_SPELLS, maxSpellLevelByClass(klass, level));
  if (klass==="Paladin") return upTo(PALADIN_SPELLS, maxSpellLevelByClass(klass, level));
  if (klass==="Fighter" && sub==="비술 기사") return upTo(EK_SPELLS, maxSpellLevelByClass("Fighter", level));
  if (klass==="Rogue" && sub==="비전 괴도") return upTo(AT_SPELLS, maxSpellLevelByClass("Rogue", level));
  if (klass==="Monk" && sub==="사원소의 길") {
    const full: Record<number,string[]> = {};
    const add = (arr:string[]) => arr.forEach(s=>{
      const sl = 3;
      full[sl]=Array.from(new Set([...(full[sl]||[]), s]));
    });
    add(MONK_FE_SPELLS[3]);
    if (level>=6) add(MONK_FE_SPELLS[6]);
    if (level>=11) add(MONK_FE_SPELLS[11]);
    return full;
  }
  return {};
}
/** ========= 재주(Feats) ========= */
type FeatId =
  | "AbilityImprovements" | "Actor" | "Alert" | "Athlete" | "Charger" | "CrossbowExpert" | "DefensiveDuelist"
  | "DualWielder" | "DungeonDelver" | "Durable" | "ElementalAdept" | "GreatWeaponMaster" | "HeavilyArmoured"
  | "HeavyArmourMaster" | "LightlyArmoured" | "Lucky" | "MageSlayer"
  | "MagicInitiate:Bard" | "MagicInitiate:Cleric" | "MagicInitiate:Druid" | "MagicInitiate:Sorcerer" | "MagicInitiate:Warlock" | "MagicInitiate:Wizard"
  | "MartialAdept" | "MediumArmourMaster" | "Mobile" | "ModeratelyArmoured" | "Performer" | "PolearmMaster" | "Resilient"
  | "RitualCaster" | "SavageAttacker" | "Sentinel" | "Sharpshooter" | "ShieldMaster" | "Skilled" | "SpellSniper" | "TavernBrawler"
  | "Tough" | "WarCaster" | "WeaponMaster";

const FEATS_ALL: { id: FeatId; ko: string; en: string }[] = [
  {id:"AbilityImprovements", ko:"능력 향상", en:"Ability Improvements"},
  {id:"Actor", ko:"배우", en:"Actor"},
  {id:"Alert", ko:"경계", en:"Alert"},
  {id:"Athlete", ko:"운동선수", en:"Athlete"},
  {id:"Charger", ko:"돌격자", en:"Charger"},
  {id:"CrossbowExpert", ko:"쇠뇌 전문가", en:"Crossbow Expert"},
  {id:"DefensiveDuelist", ko:"방어적인 결투가", en:"Defensive Duelist"},
  {id:"DualWielder", ko:"쌍수 전문가", en:"Dual Wielder"},
  {id:"DungeonDelver", ko:"던전 탐구자", en:"Dungeon Delver"},
  {id:"Durable", ko:"불굴", en:"Durable"},
  {id:"ElementalAdept", ko:"원소 숙련", en:"Elemental Adept"},
  {id:"GreatWeaponMaster", ko:"대형 무기의 달인", en:"Great Weapon Master"},
  {id:"HeavilyArmoured", ko:"중갑 무장", en:"Heavily Armoured"},
  {id:"HeavyArmourMaster", ko:"중갑의 달인", en:"Heavy Armour Master"},
  {id:"LightlyArmoured", ko:"경갑 무장", en:"Lightly Armoured"},
  {id:"Lucky", ko:"행운", en:"Lucky"},
  {id:"MageSlayer", ko:"마법사 슬레이어", en:"Mage Slayer"},
  {id:"MagicInitiate:Bard", ko:"마법 입문: 바드", en:"Magic Initiate: Bard"},
  {id:"MagicInitiate:Cleric", ko:"마법 입문: 클레릭", en:"Magic Initiate: Cleric"},
  {id:"MagicInitiate:Druid", ko:"마법 입문: 드루이드", en:"Magic Initiate: Druid"},
  {id:"MagicInitiate:Sorcerer", ko:"마법 입문: 소서러", en:"Magic Initiate: Sorcerer"},
  {id:"MagicInitiate:Warlock", ko:"마법 입문: 워락", en:"Magic Initiate: Warlock"},
  {id:"MagicInitiate:Wizard", ko:"마법 입문: 위저드", en:"Magic Initiate: Wizard"},
  {id:"MartialAdept", ko:"무예 숙련", en:"Martial Adept"},
  {id:"MediumArmourMaster", ko:"평갑의 달인", en:"Medium Armour Master"},
  {id:"Mobile", ko:"기동력", en:"Mobile"},
  {id:"ModeratelyArmoured", ko:"적당히 무장함", en:"Moderately Armoured"},
  {id:"Performer", ko:"공연가", en:"Performer"},
  {id:"PolearmMaster", ko:"장병기의 달인", en:"Polearm Master"},
  {id:"Resilient", ko:"저항력", en:"Resilient"},
  {id:"RitualCaster", ko:"의식 시전자", en:"Ritual Caster"},
  {id:"SavageAttacker", ko:"맹렬한 공격자", en:"Savage Attacker"},
  {id:"Sentinel", ko:"파수꾼", en:"Sentinel"},
  {id:"Sharpshooter", ko:"명사수", en:"Sharpshooter"},
  {id:"ShieldMaster", ko:"방패의 달인", en:"Shield Master"},
  {id:"Skilled", ko:"숙련가", en:"Skilled"},
  {id:"SpellSniper", ko:"주문 저격수", en:"Spell Sniper"},
  {id:"TavernBrawler", ko:"술집 싸움꾼", en:"Tavern Brawler"},
  {id:"Tough", ko:"강골", en:"Tough"},
  {id:"WarCaster", ko:"전쟁 시전자", en:"War Caster"},
  {id:"WeaponMaster", ko:"무기의 달인", en:"Weapon Master"},
];

// 재주 옵션 생성기
// ===== 여기부터 featRollCore 교체 =====
function featRollCore(id: FeatId, lang: Lang, excluded: Set<string>): { name: string; lines: string[] } {
  const label = FEATS_ALL.find(f=>f.id===id)!;
  const name = lang==="ko"?label.ko:label.en;
  const lines: string[] = [];
  const abilKoMap: Record<string,string> = {STR:"힘",DEX:"민첩",CON:"건강",INT:"지능",WIS:"지혜",CHA:"매력"};

  // 헬퍼
  const skillDisp = (s: SkillKey) => lang==="ko" ? SK.KO[s] : SK.EN[s];

  switch(id){
    case "AbilityImprovements": {
      // 그대로 한 줄 (요청 대상 아님)
      const picks = sampleN(["STR","DEX","CON","INT","WIS","CHA"], 2);
      lines.push(`능력 +2: ${lang==="ko"?picks.map(a=>abilKoMap[a]).join(", "):picks.join(", ")}`);
      break;
    }

    // 능력 +1 계열 (단일 항목)
    case "Athlete":
    case "LightlyArmoured":
    case "HeavilyArmoured":
    case "MediumArmourMaster":
    case "ModeratelyArmoured":
    case "HeavyArmourMaster": {
      const pool = ["STR","DEX"].map(a=>lang==="ko"?abilKoMap[a]:a).filter(x=>!excluded.has(x));
      if (pool.length>0) lines.push(`능력 +1: ${choice(pool)}`);
      break;
    }

    case "ElementalAdept": {
      const elem = choice(["산성","냉기","화염","번개","천둥"].filter(x=>!excluded.has(x)));
      if (elem) lines.push(`원소 숙련: ${elem}`);
      break;
    }

    // 마법 입문: 각 아이템을 "한 줄씩" 넣는다 (소마법×2, 1레벨×1)
    case "MagicInitiate:Bard":
    case "MagicInitiate:Cleric":
    case "MagicInitiate:Druid":
    case "MagicInitiate:Sorcerer":
    case "MagicInitiate:Warlock":
    case "MagicInitiate:Wizard": {
      const base = id.split(":")[1];
      const pool = (base==="Bard"?BARD_SPELLS: base==="Cleric"?CLERIC_SPELLS: base==="Druid"?DRUID_SPELLS: base==="Sorcerer"?SORCERER_SPELLS: base==="Warlock"?WARLOCK_BASE: WIZARD_SPELLS);
      // 소마법 2개(개별 라인)
      const canPool = (pool[0]||[]).filter(x=>!excluded.has(x));
      const cantrips = sampleN(canPool, 2);
      for (const c of cantrips) lines.push(`소마법: ${c}`);
      // 1레벨 주문 1개(개별 라인)
      const l1Pool = (pool[1]||[]).filter(x=>!excluded.has(x));
      if (l1Pool.length>0) lines.push(`1레벨 주문: ${choice(l1Pool)}`);
      break;
    }

    // 무예 숙련: 2개를 개별 라인
    case "MartialAdept": {
      const avail = BM_MANEUVERS.filter(x=>!excluded.has(x));
      const one = choice(avail);
      const two = choice(avail.filter(x=>x!==one));
      if (one) lines.push(`전투 기법: ${one}`);
      if (two) lines.push(`전투 기법: ${two}`);
      break;
    }

    case "Resilient": {
      const one = choice(["근력","민첩","건강","지능","지혜","매력"].filter(x=>!excluded.has(x)));
      if (one) lines.push(`저항력: ${one}`);
      break;
    }

    // 의식 시전자: 2개를 개별 라인
    case "RitualCaster": {
      const arr = ["망자와 대화","소환수 찾기","활보","도약 강화","변장","동물과 대화"].filter(x=>!excluded.has(x));
      const picks = sampleN(arr, 2);
      for (const p of picks) lines.push(`의식 주문: ${p}`);
      break;
    }

    // 숙련가: 3개를 개별 라인
    case "Skilled": {
      const all = Object.keys(SK.KO) as SkillKey[];
      const pool = all.map(skillDisp).filter(x=>!excluded.has(x));
      const picks = sampleN(pool, 3);
      for (const p of picks) lines.push(`기술 숙련: ${p}`);
      break;
    }

    case "SpellSniper": {
      const can = ["뼛속 냉기","섬뜩한 파동","화염살","서리 광선","전격의 손아귀","가시 채찍"].filter(x=>!excluded.has(x));
      if (can.length>0) lines.push(`주문: ${choice(can)}`);
      break;
    }

    case "TavernBrawler": {
      const pool = ["STR","CON"].map(a=>lang==="ko"?abilKoMap[a]:a).filter(x=>!excluded.has(x));
      if (pool.length>0) lines.push(`능력 +1: ${choice(pool)}`);
      break;
    }

    // 무기 숙련가: 능력+1 (1개) + 무기 숙련 4개(개별 라인)
    case "WeaponMaster": {
      const abil = ["STR","DEX"].map(a=>lang==="ko"?abilKoMap[a]:a).filter(x=>!excluded.has(x));
      if (abil.length>0) lines.push(`능력 +1: ${choice(abil)}`);
      const all = Array.from(new Set(Object.values(WEAPON_KO)));
      const pool = all.filter(x=>!excluded.has(x));
      const picks = sampleN(pool, 4);
      for (const p of picks) lines.push(`무기 숙련: ${p}`);
      break;
    }

    default: {
      // 옵션 없는 재주는 그대로
      lines.push(lang==="ko" ? "특성 적용" : "Gain feat benefits");
    }
  }
  return { name, lines };
}
function rollFeatRandom(excluded: Set<string>, lang: Lang){
  const pick = choice(FEATS_ALL);
  const r = featRollCore(pick.id, lang, excluded);
  return { id: pick.id, name: r.name, lines: r.lines };
}
function rerollSameFeat(id: FeatId, excluded: Set<string>, lang: Lang){
  const r = featRollCore(id, lang, excluded);
  return { id, name: r.name, lines: r.lines };
}
// ===== 단일 항목만 재굴림 헬퍼 추가 =====
function rollSingleForFeat(
  id: FeatId,
  lang: Lang,
  excluded: Set<string>,
  kind: string,                  // "소마법" | "1레벨 주문" | "전투 기법" | "기술 숙련" | "의식 주문" | "무기 숙련" | "능력 +1"
  existingValues: Set<string>,   // 같은 kind의 이미 선택된 값들(중복 방지)
): string | null {
  const skillDisp = (s: SkillKey) => lang==="ko" ? SK.KO[s] : SK.EN[s];

  const getMI = (base: string) =>
    (base==="Bard"?BARD_SPELLS: base==="Cleric"?CLERIC_SPELLS: base==="Druid"?DRUID_SPELLS:
     base==="Sorcerer"?SORCERER_SPELLS: base==="Warlock"?WARLOCK_BASE: WIZARD_SPELLS);

  const pickOne = (arr: string[], label: string) => {
    const pool = arr.filter(x=>!excluded.has(x) && !existingValues.has(x));
    if (pool.length===0) return null;
    return `${label}: ${choice(pool)}`;
  };

  if (id.startsWith("MagicInitiate:")) {
    const base = id.split(":")[1];
    const src = getMI(base);
    if (kind.startsWith("소마법"))       return pickOne((src[0]||[]), "소마법");
    if (kind.startsWith("1레벨 주문"))   return pickOne((src[1]||[]), "1레벨 주문");
    return null;
  }

  if (id==="MartialAdept"   && kind.startsWith("전투 기법")) return pickOne(BM_MANEUVERS, "전투 기법");
  if (id==="RitualCaster"   && kind.startsWith("의식 주문")) return pickOne(["망자와 대화","소환수 찾기","활보","도약 강화","변장","동물과 대화"], "의식 주문");
  if (id==="Skilled"        && kind.startsWith("기술 숙련")) { 
    const all = Object.keys(SK.KO) as SkillKey[];
    return pickOne(all.map(skillDisp), "기술 숙련");
  }
  if (id==="WeaponMaster") {
    if (kind.startsWith("무기 숙련")) {
      const all = Array.from(new Set(Object.values(WEAPON_KO)));
      return pickOne(all, "무기 숙련");
    }
    if (kind.startsWith("능력 +1")) {
      const abilKoMap: Record<string,string> = {STR:"힘",DEX:"민첩",CON:"건강",INT:"지능",WIS:"지혜",CHA:"매력"};
      const pool = ["STR","DEX"].map(a=>lang==="ko"?abilKoMap[a]:a);
      return pickOne(pool, "능력 +1");
    }
  }
  if (
    (id==="Athlete" || id==="LightlyArmoured" || id==="HeavilyArmoured" ||
     id==="MediumArmourMaster" || id==="ModeratelyArmoured" || id==="HeavyArmourMaster" ||
     id==="TavernBrawler") && kind.startsWith("능력 +1")
  ) {
    const abilKoMap: Record<string,string> = {STR:"힘",DEX:"민첩",CON:"건강",INT:"지능",WIS:"지혜",CHA:"매력"};
    const base = (id==="TavernBrawler") ? ["STR","CON"] : ["STR","DEX"];
    const pool = base.map(a=>lang==="ko"?abilKoMap[a]:a);
    return pickOne(pool, "능력 +1");
  }
  return null;
}

// ===== 단일 항목만 재굴림 헬퍼 끝 =====


/** ========= 스타일 ========= */
const btn = { padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:10, background:"#f8fafc", cursor:"pointer" } as const;
const btnPrimary = { ...btn, background:"#111827", color:"#fff", borderColor:"#111827" } as const;
const btnSecondary = { ...btn, background:"#fff" } as const;
const input = { padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, minWidth:200 } as const;
const select = { padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:10, minWidth:160, maxWidth:220 } as const;
const row = { display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" } as const;
const label = { width:72, color:"#374151" } as const;
const badge = { display:"inline-block", padding:"2px 6px", borderRadius:999, background:"#111827", color:"#fff", fontSize:12, lineHeight:1 } as const;

/** ========= 성장 추천 본체 ========= */
function suggestGrowth(params: {
  klass: string; sub: string; level: number; count: number;
  subraceKo?: string;
  exclude: Set<string>;
}): string[] {
  const { klass, sub, level, count, subraceKo, exclude } = params;
  const out: string[] = [];
  const already = new Set<string>(); // 같은 레벨 한 번의 추천에서 중복 방지

  // Fighter
  if (klass==="Fighter") {
    if (level===1) out.push(`전투 방식: ${choice(["궁술","방어술","결투술","대형 무기 전투","엄호술","쌍수 전투"].filter(x=>!exclude.has(x)))}`);
    if (sub==="전투의 대가" && [3,7,10].includes(level)) out.push(`전투 기법: ${choice(BM_MANEUVERS.filter(x=>!exclude.has(x)))}`);
    if (sub==="투사" && level===10) out.push(`전투 방식: ${choice(["궁술","방어술","결투술","대형 무기 전투","엄호술","쌍수 전투"].filter(x=>!exclude.has(x)))}`);
    if (sub==="비전 궁수") {
      if (level===3) {
        out.push(`주문: ${choice(["인도","빛","진실의 일격"].filter(x=>!exclude.has(x)))}`);
        out.push(`비전 사격: ${choice(ELDRITCH_SHOTS.filter(x=>!exclude.has(x)))}`);
        out.push(`비전 사격: ${choice(ELDRITCH_SHOTS.filter(x=>!exclude.has(x)))}`);
        out.push(`비전 사격: ${choice(ELDRITCH_SHOTS.filter(x=>!exclude.has(x)))}`);
      }
      if (level===7 || level===10) out.push(`비전 사격: ${choice(ELDRITCH_SHOTS.filter(x=>!exclude.has(x)))}`);
    }
  }

  // Barbarian — 야생의 심장: 3~12 계속 교체 가능
  if (klass==="Barbarian" && sub==="야생의 심장" && level>=3) {
    const hearts = ["곰의 심장","독수리의 심장","엘크의 심장","호랑이의 심장","늑대의 심장"];
    out.push(`야수의 심장: ${choice(hearts.filter(x=>!exclude.has(x)))}`);
    if (level===6 || level===10) {
      const aspects = ["곰","침팬지","악어","독수리","엘크","벌꿀오소리","말","호랑이","늑대","울버린"];
      out.push(`야수의 상: ${choice(aspects.filter(x=>!exclude.has(x)))}`);
    }
  }

  // Ranger — 선호 적/탐험가/전투 방식 + 무리지기 교체
  if (klass==="Ranger") {
    if (level===1) {
      const fav = ["현상금 사냥꾼","장막의 수호자","마법사 파괴자","레인저 나이트","성스러운 추적자"];
      const exp = ["야수 조련사","도시 추적자","황무지 방랑자:냉기","황무지 방랑자:화염","황무지 방랑자:독"];
      out.push(`선호하는 적: ${choice(fav.filter(x=>!exclude.has(x)))}`);
      out.push(`타고난 탐험가: ${choice(exp.filter(x=>!exclude.has(x)))}`);
    }
    if (level===2) out.push(`전투 방식: ${choice(["궁술","방어술","결투술","쌍수 전투"].filter(x=>!exclude.has(x)))}`);
    if (level===6 || level===10) {
      const fav = ["현상금 사냥꾼","장막의 수호자","마법사 파괴자","레인저 나이트","성스러운 추적자"];
      const exp = ["야수 조련사","도시 추적자","황무지 방랑자:냉기","황무지 방랑자:화염","황무지 방랑자:독"];
      out.push(`선호하는 적: ${choice(fav.filter(x=>!exclude.has(x)))}`);
      out.push(`타고난 탐험가: ${choice(exp.filter(x=>!exclude.has(x)))}`);
    }
    if (sub==="무리지기" && level>=3) {
      const swarms = ["꿀벌 군단","해파리 떼","나방 쇄도"];
      out.push(`무리지기: ${choice(swarms.filter(x=>!exclude.has(x)))}`);
    }
  }

  // 하이 엘프/하프 — 위저드 소마법 1개
  if ((subraceKo==="하이 엘프" || subraceKo==="하이 하프 엘프") && level>=1) {
    const wiz0 = WIZARD_SPELLS[0] || [];
    const pick = choice(wiz0.filter(x=>!exclude.has(x)));
    if (pick) { out.push(`종족 소마법: ${pick}`); already.add(pick); }
  }

  // Bard — 마법 비밀 (전승학파 6레벨 ≤3레벨 제한 2개 / 바드 공통 10레벨 2개)
  if (klass==="Bard") {
    // 6레벨(전승학파): 0~3레벨에서 2개
    if (level===6 && sub==="전승학파") {
      const pool063 = [0,1,2,3].flatMap(lv => BARD_SECRETS[lv] || []).filter(s=>!exclude.has(s));
      const picks = pickUnique(pool063, 2, already);
      for (const s of picks) out.push(`마법 비밀: ${s}`);
    }
    // 10레벨(공통): 0~5레벨에서 2개
    if (level===10) {
      const pool05 = [0,1,2,3,4,5].flatMap(lv => BARD_SECRETS[lv] || []).filter(s=>!exclude.has(s));
      const picks = pickUnique(pool05, 2, already);
      for (const s of picks) out.push(`마법 비밀: ${s}`);
    }
  }

  // 주문 추천 — 누적 풀에서 중복 없이 뽑기
  {
    const pool = collectSpellPool(klass, sub, level);
    const flat = flattenPool(pool, exclude);
    const picks = pickUnique(flat, Math.max(0, count), already);
    for (const s of picks) out.push(`주문: ${s}`);

    // 주문 교체: 실제로 굴려서 추가 주문 1개를 더 제시 (교체는 배울 개수와 별개)
    const canReplace =
      (klass==="Ranger" && level>=3) ||
      (klass==="Bard" && level>=2) ||
      (klass==="Sorcerer" && level>=2) ||
      (klass==="Warlock" && level>=2) ||
      (klass==="Rogue" && sub==="비전 괴도" && level>=4) ||
      (klass==="Fighter" && sub==="비술 기사" && level>=4) ||
      (klass==="Monk" && sub==="사원소의 길" && level>=4);
    const known = knownSpellCount(klass, sub, level);
    if (canReplace && known>0) {
      const roll = rand(known) + 1; // 1..known
      const repPool = flat.filter(s=>!already.has(s));
      if (repPool.length>0) {
        const rep = choice(repPool);
        already.add(rep);
        out.push(`주문 교체: 기존 ${roll}번째 주문 제거 → 추가: ${rep}`);
      }
    }
  }

  return out;
}

/** ========= 컴포넌트 ========= */
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
  const [featId, setFeatId] = useState<FeatId | null>(null);
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

  // 라벨
  const T = L[lang];
  const abilLabel = (k: Abil) => (lang === "ko" ? abilKo[k] : (k as string));
  const skillLabel = (s: SkillKey) => (lang === "ko" ? SK.KO[s] : SK.EN[s]);

  const raceOut  = raceKey  === "-" ? "" : (lang === "ko" ? RACES[raceKey].ko  : String(raceKey));
  const classOut = classKey === "-" ? "" : (lang === "ko" ? CLASSES[classKey].ko : String(classKey));

  /** ===== 롤 핸들러 ===== */
  function rollRace() {
    const keys = Object.keys(RACES) as (keyof typeof RACES)[];
    const r = choice(keys);
    setRaceKey(r);
    setSubraceKo(RACES[r].subs ? choice(RACES[r].subs!) : "-");
  }
  function rollClass() {
    const keys = Object.keys(CLASSES) as (keyof typeof CLASSES)[];
    const k = choice(keys);
    setClassKey(k);
    setSubclassKo(choice(CLASSES[k].subclasses));
  }
  function rollBackground() { setBg(choice(BACK_KO)); }
  function rollStatsBtn() {
    const { bonus2, bonus1, final } = rollPointBuyWithBonuses();
    setPbBonus2(bonus2); setPbBonus1(bonus1); setStats(final);
  }
  function rollWeaponsBtn() {
    const raceKoLabel  = raceKey  === "-" ? "" : RACES[raceKey].ko;
    const classKoLabel = classKey === "-" ? "" : CLASSES[classKey].ko;
    const picks = computeWeapons(raceKoLabel, classKoLabel, subclassKo !== "-" ? subclassKo : undefined);
    setWeaponsKO(picks);
  }
  function rollAny2Weapons() { setWeaponsKO(randomAny2KO()); }
  function rollSkillsBtn() {
    const classKoLabel = classKey === "-" ? "" : CLASSES[classKey].ko;
    const picks = computeClassSkills(classKoLabel, bg);
    setSkills(picks);
  }
  function rollAll() {
    rollRace(); rollClass(); rollBackground(); rollStatsBtn();
    setTimeout(()=>{ rollWeaponsBtn(); rollSkillsBtn(); },0);
  }

  /** ===== 주사위/승자 ===== */
  function handleRollDice(){
    const parsed = parseDice(diceExpr);
    if (!parsed) { setDiceDetail("형식 오류"); return; }
    const rolls = Array.from({length: parsed.n}, ()=> rand(parsed.m)+1);
    const sum = rolls.reduce((a,b)=>a+b,0) + parsed.mod;
    setDiceDetail(`${diceExpr} -> [${rolls.join(", ")}] ${parsed.mod? (parsed.mod>0?`+${parsed.mod}`:parsed.mod):""} = ${sum}`);
  }
  function handleVersus(){
    const parts = names.split(/[,\s]+/).map(s=>s.trim()).filter(Boolean);
    if (parts.length<2){ setVsLines(["2명 이상 입력"]); setVsWinner(""); return; }
    const r = uniqueRolls(parts);
    setVsLines(r.lines); setVsWinner(r.winner);
  }

  /** ===== 성장 추천 ===== */
  function doSuggestGrowth() {
    if (growClass === "-" || growLevel < 1) { setGrowResult([]); return; }
    const list = suggestGrowth({
      klass: String(growClass),
      sub: growSub === "-" ? "" : growSub,
      level: growLevel,
      count: growSpellCount,
      subraceKo,
      exclude: growExcluded,
    });
    setGrowResult(list);
  }
  function excludeGrowthItem(line: string){
    const val = line.includes(":") ? line.split(":").slice(1).join(":").trim() : line.trim();
    const next = new Set(growExcluded); next.add(val);
    setGrowExcluded(next);
    const kind = line.includes(":") ? line.split(":")[0] : "주문";
    const remain = growResult.filter(x=>x!==line);
    const again = suggestGrowth({
      klass: String(growClass),
      sub: growSub==="-" ? "" : growSub,
      level: growLevel,
      count: 1,
      subraceKo,
      exclude: next,
    }).find(x=>x.startsWith(kind+":")) || null;
    setGrowResult(again? [...remain, again] : remain);
  }
  function unexcludeGrowthItem(val: string){
    const next = new Set(growExcluded); next.delete(val);
    setGrowExcluded(next);
    doSuggestGrowth();
  }

  /** ===== 재주 ===== */
  function rollFeatBtn(){
    const r = rollFeatRandom(featExcluded, lang);
    setFeatId(r.id);
    setFeatName(r.name);
    setFeatDetails(r.lines);
  }
 // ===== App() 내부: excludeFeatItem 교체 =====
function excludeFeatItem(detailLine: string){
  // detailLine 예: "소마법: 신성한 불길" | "1레벨 주문: 신앙의 방패" | "기술 숙련: 통찰" ...
  const [kindRaw, ...rest] = detailLine.split(":");
  const kind = (kindRaw || "").trim();           // "소마법", "1레벨 주문", "기술 숙련", "무기 숙련", "능력 +1", "의식 주문", "전투 기법" 등
  const value = rest.join(":").trim() || kind;   // "신성한 불길" 등

  // 1) 제외 목록에 '아이템'만 추가
  const nextExcluded = new Set(featExcluded); 
  nextExcluded.add(value);
  setFeatExcluded(nextExcluded);

  // 2) 현재 라인 제거
  const idx = featDetails.findIndex(x => x === detailLine);
  const nextLines = [...featDetails];
  if (idx >= 0) nextLines.splice(idx, 1);

  // 3) 같은 kind로 이미 선택된 값들(중복 방지)
  const existingOfKind = new Set(
    nextLines
      .filter(l => l.startsWith(kind + ":"))
      .map(l => l.split(":").slice(1).join(":").trim())
  );

  // 4) 해당 항목만 재굴림
  if (featId) {
    const single = rollSingleForFeat(featId, lang, nextExcluded, kind, existingOfKind);
    if (single) nextLines.splice(Math.max(idx, 0), 0, single);
    setFeatDetails(nextLines);
  } else {
    // 안전장치: 혹시 featId가 비었으면 통짜 재굴림
    rollFeatBtn();
  }
}

// ===== excludeFeatItem 교체 끝 =====

  function unexcludeFeatItem(val: string){
    const next = new Set(featExcluded); next.delete(val);
    setFeatExcluded(next);
    if (featId){
      const r = rerollSameFeat(featId, next, lang);
      setFeatName(r.name);
      setFeatDetails(r.lines);
    } else {
      rollFeatBtn();
    }
  }

  /** ===== 옵션 ===== */
  const raceOptions = Object.keys(RACES) as (keyof typeof RACES)[];
  const classOptions = Object.keys(CLASSES) as (keyof typeof CLASSES)[];
  const allSkills = Object.keys(SK.KO) as SkillKey[];

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

              {/* 한 줄에 (카테고리 전체) */}
              <div style={{ display:"grid", gridTemplateColumns:"120px 1fr", rowGap:8 }}>
                <div style={{ color:"#6b7280" }}>{T.race}</div>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <div>{raceOut}{subraceKo !== "-" ? ` / ${subraceKo}` : ""}</div>
                </div>

                <div style={{ color:"#6b7280" }}>{T.klass}</div>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <div>{classOut}{subclassKo !== "-" ? ` / ${subclassKo}` : ""}</div>
                </div>

                <div style={{ color:"#6b7280" }}>{T.background}</div>
                <div>{bgLabel(bg, lang)}</div>

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
                <button onClick={()=>{rollRace(); setTimeout(rollWeaponsBtn,0);}} style={btn}>{T.onlyRace}</button>
                <button onClick={()=>{rollClass(); setTimeout(()=>{rollWeaponsBtn(); rollSkillsBtn();},0);}} style={btn}>{T.onlyClass}</button>
                <button onClick={()=>{rollBackground(); setTimeout(rollSkillsBtn,0);}} style={btn}>{T.onlyBG}</button>
                <button onClick={rollStatsBtn} style={btn}>{T.rollStats}</button>
                <button onClick={rollWeaponsBtn} style={btn}>{T.rerollWeapons}</button>
                <button onClick={rollAny2Weapons} style={btn}>{T.any2Weapons}</button>
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
              {featDetails.length>0 && (
                <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:6 }}>
                  {featDetails.map((d,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span>• {d}</span>
                      <button style={btnSecondary} onClick={()=>excludeFeatItem(d)}>{T.exclude}</button>

                    </div>
                  ))}
                  {Array.from(featExcluded).length>0 && (
                    <div style={{ marginTop:6 }}>
                      <div style={{ fontSize:12, color:"#6b7280", marginBottom:4 }}>{T.excluded}</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {Array.from(featExcluded).map(x=>(
                          <button key={x} style={btnSecondary} onClick={()=>unexcludeFeatItem(x)}>{T.clear}: {x}</button>
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
                <input value={diceExpr} onChange={(e)=>setDiceExpr(e.target.value)} placeholder={T.dicePH} style={{...input, minWidth:220, maxWidth:280}}/>
                <button onClick={handleRollDice} style={btn}>{T.rollDice}</button>
              </div>
              {diceDetail && <div style={{ marginTop:8, color:"#374151" }}>{diceDetail}</div>}
            </section>

            {/* 승자 정하기 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16, marginTop:16, marginBottom:24 }}>
              <h2 style={{ fontSize:20, fontWeight:700, margin:"0 0 12px" }}>{T.vsTitle}</h2>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <input value={names} onChange={(e)=>setNames(e.target.value)} placeholder={T.vsPH} style={{...input, minWidth:560}}/>
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

              {/* 종족 (한 줄 정리) */}
              <div style={row}>
                <label style={label}>{T.race}</label>
                <select value={raceKey} onChange={(e:any)=>{ const k = e.target.value as keyof typeof RACES | "-"; setRaceKey(k); setSubraceKo(k==="-"?"-":(RACES[k].subs?.[0] ?? "-")); }} style={{...select, minWidth:180, maxWidth:200}}>
                  <option value="-">-</option>
                  {raceOptions.map(k=><option key={k} value={k}>{lang==="ko"?RACES[k].ko:k}</option>)}
                </select>
                <select disabled={raceKey==="-" || !(RACES[raceKey].subs?.length)} value={subraceKo} onChange={e=>setSubraceKo(e.target.value)} style={{...select, minWidth:180, maxWidth:200}}>
                  {(raceKey==="-" || !RACES[raceKey].subs) ? <option value="-">-</option> : RACES[raceKey].subs!.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <span style={{ color:"#6b7280" }}>{L[lang].locks}</span>
                <input type="checkbox"/>
              </div>

              {/* 클래스 (한 줄 정리) */}
              <div style={row}>
                <label style={label}>{T.klass}</label>
                <select value={classKey} onChange={(e:any)=>{ const k = e.target.value as keyof typeof CLASSES | "-"; setClassKey(k); setSubclassKo(k==="-"?"-":CLASSES[k].subclasses[0]); }} style={{...select, minWidth:200, maxWidth:220}}>
                  <option value="-">-</option>
                  {classOptions.map(k=><option key={k} value={k}>{lang==="ko"?CLASSES[k].ko:k}</option>)}
                </select>
                <select disabled={classKey==="-" } value={subclassKo} onChange={e=>setSubclassKo(e.target.value)} style={{...select, minWidth:200, maxWidth:220}}>
                  {classKey==="-" ? <option value="-">-</option> : CLASSES[classKey].subclasses.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <span style={{ color:"#6b7280" }}>{L[lang].locks}</span>
                <input type="checkbox"/>
              </div>

              {/* 출신 (한 줄 정리) */}
              <div style={row}>
                <label style={label}>{T.background}</label>
                <select value={bg} onChange={(e:any)=>setBg(e.target.value as Background)} style={{...select, minWidth:240, maxWidth:260}}>
                  <option value="-">-</option>
                  {BACK_KO.map(b=><option key={b} value={b}>{lang==="ko"?b:BACK_EN[b]}</option>)}
                </select>
                <span style={{ color:"#6b7280" }}>{L[lang].locks}</span>
                <input type="checkbox"/>
              </div>

              {/* 무기 선택 */}
              <div style={row}>
                <label style={label}>{T.weapons}</label>
                <button style={btn} onClick={()=>{ setTempWeapons(new Set(weaponsKO)); setShowWeaponPicker(true); }}>{T.openPicker}</button>
                <div style={{ color:"#374151", minWidth:180, maxWidth:300, whiteSpace:"pre-wrap" }}>{weaponsKO.join(", ")}</div>
              </div>

              {/* 기술 선택 */}
              <div style={row}>
                <label style={label}>{T.skills}</label>
                <button style={btn} onClick={()=>{ setTempSkills(new Set(skills)); setShowSkillPicker(true); }}>{T.openPicker}</button>
                <div style={{ color:"#374151", minWidth:180, maxWidth:300, whiteSpace:"pre-wrap" }}>{skills.map(skillLabel).join(", ")}</div>
              </div>
            </section>

            {/* 클래스별 특성 */}
            <section style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:16 }}>
              <h3 style={{ fontSize:18, fontWeight:700, margin:"0 0 12px" }}>{T.growth}</h3>
              <div style={{ display:"grid", gap:8 }}>
                <div style={row}>
                  <label style={label}>{T.classPick}</label>
                  <select value={growClass} onChange={(e:any)=>{ const v=e.target.value as keyof typeof CLASSES | "-"; setGrowClass(v); setGrowSub("-"); }} style={{...select, minWidth:220, maxWidth:240}}>
                    <option value="-">-</option>
                    {classOptions.map(k=><option key={k} value={k}>{lang==="ko"?CLASSES[k].ko:k}</option>)}
                  </select>
                </div>
                <div style={row}>
                  <label style={label}>{T.subPick}</label>
                  <select value={growSub} onChange={(e)=>setGrowSub(e.target.value)} style={{...select, minWidth:220, maxWidth:240}} disabled={growClass==="-"}>
                    {growClass==="-"? <option value="-">-</option> : ["-"].concat(CLASSES[growClass].subclasses).map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={row}>
                  <label style={label}>{T.levelPick}</label>
                  <input type="number" min={1} max={12} value={growLevel} onChange={(e)=>setGrowLevel(parseInt(e.target.value||"1",10))} style={{...input, width:120}}/>
                </div>
                <div style={row}>
                  <label style={label}>{T.howManySpells}</label>
                  <input type="number" min={0} max={6} value={growSpellCount} onChange={(e)=>setGrowSpellCount(parseInt(e.target.value||"0",10))} style={{...input, width:120}}/>
                </div>
                <div>
                  <button onClick={doSuggestGrowth} style={btn}>{T.suggest}</button>
                </div>
                {growResult.length>0 && (
                  <div style={{ marginTop:8 }}>
                    {growResult.map((g,i)=>
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span>• {g}</span>
                        <button style={btnSecondary} onClick={()=>excludeGrowthItem(g)}>{T.exclude}</button>
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
              {Array.from(new Set(Object.values(WEAPON_KO))).map(w=>(
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

