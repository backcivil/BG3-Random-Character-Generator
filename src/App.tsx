// src/App.tsx
import { useState } from "react";

// ✅ 추가/교체
import { ABILS, type Abil } from "./lib/types";


/** BG3 랜덤 생성기 · lib 분리판
 * - 초기엔 빈 화면(자동 생성 안 함)
 * - 몽크일 때만 무기풀에 비무장 공격 포함
 * - 기술: 출신 2개 제외 후 클래스 n개 추천
 * - '이중 몇개 선택' 표기 제거
 * - EN 모드에서 주요 라벨/값 영문 표시
 */

// ----- 로컬 UI 라벨 -----
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
    diceTitle: "주사위 굴리기",
    dicePH: "예: 1d4, 5d30, 3d6+2",
    rollDice: "주사위 굴리기",
    vsTitle: "승자 정하기",
    vsPH: "이름들을 쉼표로 구분 (예: 알프레드, 보리, 시라)",
    vsRoll: "굴리기 (기본 1d20)",
    winner: "승자",
    langBtn: "English",
    str: "힘", dex: "민첩", con: "건강", int: "지능", wis: "지혜", cha: "매력",
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
    diceTitle: "Dice Roller",
    dicePH: "e.g., 1d4, 5d30, 3d6+2",
    rollDice: "Roll",
    vsTitle: "Decide Winner",
    vsPH: "Comma-separated names (e.g., Alex, Bora, Choi)",
    vsRoll: "Roll (1d20)",
    winner: "Winner",
    langBtn: "한국어",
    str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
  },
} as const;

// ----- 로컬 상수(데이터 수정 없이 몽크 전용 비무장 처리) -----
const UNARMED_KO = "비무장 공격";
const UNARMED_EN = "Unarmed Strike";

// lib에 타입이 없다면 여기서 단순 선언
type Background = typeof BACK_KO[number] | "-";
type Abil = typeof ABILS[number];

// ----- 컴포넌트 -----
export default function App() {
  const [lang, setLang] = useState<Lang>("ko");

  const [raceKey, setRaceKey] = useState<keyof typeof RACES | "-">("-");
  const [subraceKo, setSubraceKo] = useState<string>("-");

  const [classKey, setClassKey] = useState<keyof typeof CLASSES | "-">("-");
  const [subclassKo, setSubclassKo] = useState<string>("-");

  const [bg, setBg] = useState<Background>("-");

  const [stats, setStats] = useState<Record<Abil, number>>({
    STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8,
  });
  const [pbBonus2, setPbBonus2] = useState<Abil | null>(null);
  const [pbBonus1, setPbBonus1] = useState<Abil | null>(null);

  const [weaponsKO, setWeaponsKO] = useState<string[]>([]); // 내부 계산은 KO라벨
  const [skills, setSkills] = useState<(keyof typeof SK.KO)[]>([]);
  const [feat, setFeat] = useState<string>("");

  // Dice
  const [diceExpr, setDiceExpr] = useState<string>("1d20");
  const [diceDetail, setDiceDetail] = useState<string>("");

  // Versus
  const [names, setNames] = useState<string>("");
  const [vsLines, setVsLines] = useState<string[]>([]);
  const [vsWinner, setVsWinner] = useState<string>("");

  // ----- 랜덤 함수들 -----
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
    setPbBonus2(bonus2);
    setPbBonus1(bonus1);
    setStats(final);
  }

  function rollWeapons() {
    // 종족/클래스 기반 숙련 풀(한국어 명칭)
    const raceKo = raceKey === "-" ? "" : RACES[raceKey].ko;
    const classKo = classKey === "-" ? "" : CLASSES[classKey].ko;

    const racePool = RACE_WEAP_KO[raceKo] || [];
    const classPool = CLASS_WEAP_KO[classKo] || [];
    let pool = Array.from(new Set([...racePool, ...classPool]));

    // 방패 숙련
    const hasShield =
      (raceKo && RACE_SHIELD.has(raceKo)) ||
      (classKo && CLASS_SHIELD.has(classKo));
    if (hasShield && !pool.includes(SHIELD_KO)) pool.push(SHIELD_KO);

    // 몽크면 비무장 공격 추가
    if (classKo === "몽크" && !pool.includes(UNARMED_KO)) {
      pool.push(UNARMED_KO);
    }

    if (pool.length === 0) {
      // 숙련이 없으면 아무거나 2
      setWeaponsKO(randomAny2KO());
      return;
    }

    const pickN = pool.length <= 8 ? 1 : 2;
    setWeaponsKO(shuffle(pool).slice(0, Math.min(pickN, pool.length)));
  }

  function randomAny2KO(): string[] {
    // EN 풀에서 2개 뽑고 KO라벨로 변환
    const picks = shuffle(ALL_WEAPONS_EN).slice(0, 2);
    return picks.map((w) => WEAPON_KO[w] ?? w);
  }

  function rollAny2Weapons() {
    // 아무거나 2개 (몽크 여부와 무관)
    setWeaponsKO(randomAny2KO());
  }

  function rollSkills() {
    if (bg === "-" || classKey === "-") {
      setSkills([]);
      return;
    }
    const [bg1, bg2] = BG_SKILLS[bg]; // 배경으로 이미 찍힌 2개
    const clsKo = CLASSES[classKey].ko;
    const cfg = CLASS_SK_CHOICE[clsKo];
    if (!cfg) {
      setSkills([]);
      return;
    }
    // 배경 2개 제외 → 클래스 풀에서 n개 추천
    const pool = cfg.list.filter((s) => s !== bg1 && s !== bg2);
    setSkills(shuffle(pool).slice(0, cfg.n));
  }

  function rollFeat() {
    // 한글만 (영문 병기 제거)
    const feats = [
      "능력 향상","배우","경계","운동선수","돌격자","쇠뇌 전문가","방어적인 결투가","쌍수 전문가",
      "던전 탐구자","불굴","원소 숙련","대형 무기의 달인","중갑 무장","중갑의 달인","경갑 무장",
      "행운","마법사 슬레이어","마법 입문: 바드","마법 입문: 클레릭","마법 입문: 드루이드",
      "마법 입문: 소서러","마법 입문: 워락","마법 입문: 위자드","무예 숙련","평갑의 달인","기동력",
      "적당히 무장함","공연가","장병기의 달인","저항력","의식 시전자","맹렬한 공격자",
      "파수꾼","명사수","방패의 달인","숙련가","주문 저격수","술집 싸움꾼","강골","전쟁 시전자","무기의 달인",
    ];
    setFeat(choice(feats));
  }

  function rollAll() {
    rollRace();
    rollClass();
    rollBackground();
    rollStats();
    // 무기/기술은 종족/클래스/출신 결정 후 한 틱 뒤에
    setTimeout(() => {
      rollWeapons();
      rollSkills();
    }, 0);
  }

  // ----- 주사위 / 승자 -----
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

  function handleVersus() {
    const list = names.split(/[, \n]+/).map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) {
      setVsLines(["이름을 입력하세요"]);
      setVsWinner("");
      return;
    }
    const results = list.map((n) => ({ name: n, roll: 1 + rand(20) }));
    const max = Math.max(...results.map((r) => r.roll));
    const winners = results.filter((r) => r.roll === max).map((r) => r.name);
    setVsLines(results.map((r) => `${r.name}: ${r.roll}`));
    setVsWinner(winners.join(", "));
  }

  // ----- 라벨/표시 -----
  const T = L[lang];
  const abilLabel = (k: Abil) => (lang === "ko" ? abilKo[k] : (L.en as any)[k.toLowerCase()]);
  const bgLabel = (b: Background) => (b === "-" ? "-" : lang === "ko" ? b : BACK_EN[b]);

  // 무기 표시는 EN 모드일 때 영문으로 역매핑(비무장/방패 예외 처리)
  const weaponsOut = (() => {
    if (lang === "ko") return weaponsKO;
    const mapEN: Record<string, string> = {};
    for (const en of ALL_WEAPONS_EN) mapEN[WEAPON_KO[en]] = en;
    mapEN[UNARMED_KO] = UNARMED_EN;
    mapEN[SHIELD_KO] = "Shield";
    return weaponsKO.map((w) => mapEN[w] || w);
  })();

  const raceOut = (raceKey === "-" ? "-" : lang === "ko" ? RACES[raceKey].ko : String(raceKey));
  const classOut = (classKey === "-" ? "-" : lang === "ko" ? CLASSES[classKey].ko : String(classKey));
  const skillsOut = skills.map((s) => (lang === "ko" ? SK.KO[s] : SK.EN[s]));

  // ----- UI -----
  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start", background: "#fff" }}>
      <div style={{ width: "min(1100px, 96%)", margin: "24px auto", fontFamily: "ui-sans-serif, system-ui" }}>
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

        {/* 결과 */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>{T.result}</h2>

            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 8 }}>
              <div style={{ color: "#6b7280" }}>{T.race}</div>
              <div>{raceOut}{subraceKo !== "-" ? ` / ${subraceKo}` : ""}</div>

              <div style={{ color: "#6b7280" }}>{T.klass}</div>
              <div>{classOut}{subclassKo !== "-" ? ` / ${subclassKo}` : ""}</div>

              <div style={{ color: "#6b7280" }}>{T.background}</div>
              <div>{bgLabel(bg)}</div>

              <div style={{ color: "#6b7280" }}>{T.weapons}</div>
              <div>{weaponsOut.length ? weaponsOut.join(", ") : "-"}</div>

              <div style={{ color: "#6b7280" }}>{T.skills}</div>
              <div>{skillsOut.length ? skillsOut.join(", ") : "-"}</div>
            </div>

            {/* 능력치 */}
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontWeight: 700, margin: "0 0 6px" }}>{T.abilities}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, textAlign: "center" }}>
{ABILS.map((k: Abil)=> (
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
              <button onClick={rollAll} style={btnPrimary}>{T.rollAll}</button>
              <button onClick={() => { rollRace(); setTimeout(rollWeapons, 0); }} style={btn}>{T.onlyRace}</button>
              <button onClick={() => { rollClass(); setTimeout(() => { rollWeapons(); rollSkills(); }, 0); }} style={btn}>{T.onlyClass}</button>
              <button onClick={() => { rollBackground(); setTimeout(rollSkills, 0); }} style={btn}>{T.onlyBG}</button>
              <button onClick={rollStats} style={btn}>{T.rollStats}</button>
              <button onClick={rollWeapons} style={btn}>{T.rerollWeapons}</button>
              <button onClick={rollAny2Weapons} style={btn}>{T.any2Weapons}</button>
              <button onClick={rollSkills} style={btn}>{T.rollSkills}</button>
            </div>
          </div>
        </section>

        {/* 재주 */}
        <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginTop: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px" }}>{T.featSection}</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={rollFeat} style={btn}>{T.rollFeat}</button>
            {feat && <div style={{ fontWeight: 700 }}>{feat}</div>}
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
    </div>
  );
}

// ----- 스타일(React 타입 의존 X로 간단 표기) -----
const btnBase = { padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" } as const;
const btn = { ...btnBase } as const;
const btnPrimary = { ...btnBase, background: "#111827", color: "#fff", borderColor: "#111827" } as const;
const btnSecondary = { ...btnBase, background: "#f3f4f6" } as const;
const input = { padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 10, minWidth: 260 } as const;
const badge = { display: "inline-block", padding: "0 6px", fontSize: 12, borderRadius: 999, background: "#111827", color: "#fff", lineHeight: "18px", height: 18, margin: "0 2px" } as const;
