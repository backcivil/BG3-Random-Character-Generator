import React, { useMemo, useState } from "react";

// ✅ BG3 랜덤 캐릭터 생성기 완성본 App.tsx
// public/images 폴더에 이미지들을 넣고 아래 IMAGES 배열에 이름만 맞춰주세요.

// ---------------- 기본 유틸 ----------------
const rand = (n: number) => Math.floor(Math.random() * n);
const choice = <T,>(arr: T[]): T => arr[rand(arr.length)];

// ---------------- 데이터 ----------------
const RACES: Record<string, string[] | undefined> = {
  Human: undefined,
  Elf: ["High Elf", "Wood Elf", "Drow"],
  Dwarf: ["Gold Dwarf", "Shield Dwarf", "Duergar"],
  Halfling: ["Lightfoot Halfling", "Strongheart Halfling"],
  Githyanki: undefined,
  "Half-Elf": ["High Half-Elf", "Wood Half-Elf", "Drow Half-Elf"],
  Tiefling: ["Asmodeus Tiefling", "Mephistopheles Tiefling", "Zariel Tiefling"],
  Dragonborn: [
    "Black Dragonborn",
    "Blue Dragonborn",
    "Brass Dragonborn",
    "Bronze Dragonborn",
    "Copper Dragonborn",
    "Gold Dragonborn",
    "Green Dragonborn",
    "Red Dragonborn",
    "Silver Dragonborn",
    "White Dragonborn",
  ],
  Gnome: ["Forest Gnome", "Rock Gnome", "Deep Gnome"],
  "Half-Orc": undefined,
};

const CLASSES: Record<string, string[]> = {
  Barbarian: ["Berserker", "Wildheart", "Wild Magic"],
  Bard: ["College of Lore", "College of Valour", "College of Swords"],
  Cleric: [
    "Knowledge Domain",
    "Life Domain",
    "Light Domain",
    "Nature Domain",
    "Tempest Domain",
    "Trickery Domain",
    "War Domain",
  ],
  Druid: ["Circle of the Land", "Circle of the Moon", "Circle of Spores"],
  Fighter: ["Battle Master", "Champion", "Eldritch Knight"],
  Monk: ["Way of the Open Hand", "Way of Shadow", "Way of the Four Elements"],
  Paladin: [
    "Oath of Devotion",
    "Oath of the Ancients",
    "Oath of Vengeance",
    "Oathbreaker",
  ],
  Ranger: ["Beast Master", "Gloom Stalker", "Hunter"],
  Rogue: ["Arcane Trickster", "Thief", "Assassin"],
  Sorcerer: ["Draconic Bloodline", "Wild Magic", "Storm Sorcery"],
  Warlock: ["The Fiend", "The Great Old One", "The Archfey"],
  Wizard: [
    "Abjuration School",
    "Conjuration School",
    "Divination School",
    "Enchantment School",
    "Evocation School",
    "Illusion School",
    "Necromancy School",
    "Transmutation School",
  ],
};

const BACKGROUNDS = [
  "Acolyte",
  "Charlatan",
  "Criminal",
  "Entertainer",
  "Folk Hero",
  "Guild Artisan",
  "Hermit",
  "Noble",
  "Outlander",
  "Sage",
  "Sailor",
  "Soldier",
  "Urchin",
];

const ABILS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
type Abil = typeof ABILS[number];

// 이미지 배열 (public/images 폴더에 파일 넣고 이름만 맞추세요)
const IMAGES = [
  "/images/bg3_1.jpg",
  "/images/bg3_2.jpg",
  "/images/bg3_3.jpg",
];

// ---------------- 스탯 생성 로직 ----------------
const COST: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

function roll4d6DropLowest(): number {
  const dice = [1, 2, 3, 4].map(() => 1 + rand(6));
  dice.sort((a, b) => a - b);
  return dice[1] + dice[2] + dice[3];
}

function gen4d6Set(): Record<Abil, number> {
  const rolls = ABILS.map(() => roll4d6DropLowest());
  const sorted = [...rolls].sort((a, b) => b - a);
  const res: Record<Abil, number> = {
    STR: 0,
    DEX: 0,
    CON: 0,
    INT: 0,
    WIS: 0,
    CHA: 0,
  };
  ABILS.forEach((k, i) => (res[k] = sorted[i]));
  return res;
}

function randomPointBuy(): Record<Abil, number> {
  const vals = [8, 8, 8, 8, 8, 8];
  let budget = 27;
  let guard = 1000;
  while (budget > 0 && guard-- > 0) {
    const i = rand(6);
    if (vals[i] >= 15) continue;
    const cur = vals[i];
    const nxt = cur + 1;
    const delta = COST[nxt] - COST[cur];
    if (delta <= budget) {
      vals[i] = nxt;
      budget -= delta;
    } else {
      break;
    }
  }
  return {
    STR: vals[0],
    DEX: vals[1],
    CON: vals[2],
    INT: vals[3],
    WIS: vals[4],
    CHA: vals[5],
  };
}

// ---------------- 컴포넌트 ----------------
export default function App() {
  const [race, setRace] = useState<string>("-");
  const [subrace, setSubrace] = useState<string>("-");
  const [klass, setKlass] = useState<string>("-");
  const [subclass, setSubclass] = useState<string>("-");
  const [bg, setBg] = useState<string>("-");
  const [stats, setStats] = useState<Record<Abil, number>>({
    STR: 8,
    DEX: 8,
    CON: 8,
    INT: 8,
    WIS: 8,
    CHA: 8,
  });
  const [img, setImg] = useState<string>(IMAGES[0] ?? "");

  const allData = useMemo(
    () => ({ race, subrace, klass, subclass, background: bg, stats, image: img }),
    [race, subrace, klass, subclass, bg, stats, img]
  );

  function rollRace() {
    const r = choice(Object.keys(RACES));
    const subs = RACES[r];
    setRace(r);
    setSubrace(subs ? choice(subs) : "-");
  }
  function rollClass() {
    const k = choice(Object.keys(CLASSES));
    setKlass(k);
    setSubclass(choice(CLASSES[k]));
  }
  function rollBackground() {
    setBg(choice(BACKGROUNDS));
  }
  function rollStats4d6() {
    setStats(gen4d6Set());
  }
  function rollStatsPointBuy() {
    setStats(randomPointBuy());
  }
  function rollImage() {
    if (IMAGES.length === 0) return;
    setImg(choice(IMAGES));
  }
  function rollAll() {
    rollRace();
    rollClass();
    rollBackground();
    Math.random() < 0.5 ? rollStats4d6() : rollStatsPointBuy();
    rollImage();
  }
  function copyJSON() {
    navigator.clipboard.writeText(JSON.stringify(allData, null, 2));
    alert("클립보드에 복사됨");
  }

  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui", padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>BG3 랜덤 캐릭터 생성기</h1>
      <p style={{ color: "#555", marginBottom: 20 }}>
        버튼을 눌러 종족/직업/배경/스탯/이미지를 무작위로 정해보세요.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {/* 왼쪽: 결과 카드 */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>결과</h2>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 8 }}>
            <div style={{ color: "#6b7280" }}>Race</div>
            <div>{race}{subrace !== "-" ? ` / ${subrace}` : ""}</div>
            <div style={{ color: "#6b7280" }}>Class</div>
            <div>{klass}{subclass !== "-" ? ` / ${subclass}` : ""}</div>
            <div style={{ color: "#6b7280" }}>Background</div>
            <div>{bg}</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Abilities</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {ABILS.map((k) => (
                    <th key={k} style={{ textAlign: "left", padding: 6, borderBottom: "1px solid #eee" }}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {ABILS.map((k) => (
                    <td key={k} style={{ padding: 6, borderBottom: "1px solid #f3f4f6" }}>{stats[k]}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button onClick={copyJSON} style={btnSecondary}>JSON 복사</button>
          </div>
        </div>

        {/* 오른쪽: 미리보기 이미지 */}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, textAlign: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>이미지</h2>
          {img ? (
            <img src={img} alt="preview" style={{ width: "100%", height: 360, objectFit: "cover", borderRadius: 10 }} />
          ) : (
            <div style={{ height: 360, display: "grid", placeItems: "center", color: "#9ca3af" }}>
              이미지를 등록하세요 (public/images)
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <small style={{ color: "#6b7280" }}>public/images 폴더에 이미지를 넣고 파일명을 IMAGES 배열에 추가하세요.</small>
          </div>
        </div>
      </div>

      {/* 버튼들 */}
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button onClick={rollAll} style={btnPrimary}>전체 랜덤</button>
        <button onClick={rollRace} style={btn}>종족만</button>
        <button onClick={rollClass} style={btn}>직업만</button>
        <button onClick={rollBackground} style={btn}>배경만</button>
        <button onClick={rollStats4d6} style={btn}>스탯(4d6D1)</button>
        <button onClick={rollStatsPointBuy} style={btn}>스탯(포인트바이)</button>
        <button onClick={rollImage} style={btn}>이미지 랜덤</button>
      </div>

      <footer style={{ marginTop: 24, color: "#6b7280", fontSize: 12 }}>
        GitHub Pages 배포 시 Vite <code>base</code> 설정과 <code>404.html</code> 복사 단계를 꼭 확인하세요.
      </footer>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
};
const btn: React.CSSProperties = { ...btnBase };
const btnPrimary: React.CSSProperties = { ...btnBase, background: "#111827", color: "#fff", borderColor: "#111827" };
const btnSecondary: React.CSSProperties = { ...btnBase, background: "#f3f4f6" };
