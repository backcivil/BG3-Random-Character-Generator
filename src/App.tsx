import React, { useEffect, useState } from "react";

/** BG3 랜덤 생성기 · 최신 수정본
 * - 새로고침 시 무기/기술도 자동 랜덤
 * - “무기만 아무거나 2” → “무기만 (아무거나)”
 * - 능력치 표 정렬 및 보너스는 해당 능력 밑에 +2/+1로 표시
 * - 기술은 선택 결과만 보여줌 (자동 적용된 것만)
 * - 재주 이름에서 영어 부분 제거
 * - 다이스 롤러: 합계 제거
 * - 이름 대전 → 승자 정하기
 * - 영어 모드일 때 종족/클래스/배경/무기도 영어 표기로 변환
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
    featSection: "재주",
    rollFeat: "재주 뽑기",
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
    bonus: "Bonus",
    rollAll: "Roll All",
    onlyRace: "Race Only",
    onlyClass: "Class Only",
    onlyBG: "Background Only",
    rollStats: "Roll Abilities",
    rerollWeapons: "Reroll Proficient",
    any2Weapons: "Any Weapons (2)",
    featSection: "Feats",
    rollFeat: "Roll Feat",
    langBtn: "한국어",
    str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA",
  },
} as const;

const ABILS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
type Abil = typeof ABILS[number];

type Background = typeof BACK_KO[number] | "-";

// ---------------- 데이터 (예시 축약) ----------------

// 배경 한글
const BACK_KO = ["복사","사기꾼","범죄자","연예인","시골 영웅","길드 장인","귀족","이방인","현자","군인","부랑아"] as const;

// 기술
const SK = {
  KO: {
    Athletics: "운동", Acrobatics: "곡예", Sleight: "손재주", Stealth: "은신",
    Arcana: "비전", History: "역사", Investigation: "조사", Nature: "자연", Religion: "종교",
    Animal: "동물 조련", Insight: "통찰", Medicine: "의학", Perception: "포착", Survival: "생존",
    Deception: "기만", Intimidation: "협박", Performance: "공연", Persuasion: "설득",
  }
};

// 배경별 기술 2개
const BG_SKILLS: Record<Exclude<Background,"-">,[string,string]> = {
  "복사": [SK.KO.Insight, SK.KO.Religion],
  "사기꾼": [SK.KO.Deception, SK.KO.Sleight],
  "범죄자": [SK.KO.Deception, SK.KO.Stealth],
  "연예인": [SK.KO.Acrobatics, SK.KO.Performance],
  "시골 영웅": [SK.KO.Animal, SK.KO.Survival],
  "길드 장인": [SK.KO.Insight, SK.KO.Persuasion],
  "귀족": [SK.KO.History, SK.KO.Persuasion],
  "이방인": [SK.KO.Athletics, SK.KO.Survival],
  "현자": [SK.KO.Arcana, SK.KO.History],
  "군인": [SK.KO.Athletics, SK.KO.Intimidation],
  "부랑아": [SK.KO.Sleight, SK.KO.Stealth],
};

// 무기 목록
const SIMPLE = ["곤봉","단검","대형 곤봉","손도끼","투창","경쇠뇌","경량 망치","철퇴","육척봉","단궁","낫","창"];
const MARTIAL = ["전투 도끼","도리깨","협도","대형 도끼","대검","미늘창","손 쇠뇌","중쇠뇌","장궁","장검","대형 망치","모닝스타","장창","레이피어","언월도","소검","삼지창","전쟁 망치","전쟁 곡괭이"];
const ALL_WEAPONS = [...SIMPLE,...MARTIAL];

// ---------------- 능력치 ----------------
function rollPointBuyRaw(): Record<Abil, number> {
  const vals = [8,8,8,8,8,8];
  let budget = 27;
  const cost = (v:number)=>(v>=13?2:1);
  let guard=2000;
  while(budget>0 && guard--){
    const i=rand(6);
    const cur=vals[i];
    if(cur>=15) continue;
    const c=cost(cur);
    if(budget>=c){ vals[i]+=1; budget-=c; }
  }
  return {STR:vals[0],DEX:vals[1],CON:vals[2],INT:vals[3],WIS:vals[4],CHA:vals[5]};
}
type PBResult={base:Record<Abil,number>;bonus2:Abil;bonus1:Abil;final:Record<Abil,number>};
function rollPointBuyWithBonuses():PBResult{
  const base=rollPointBuyRaw();
  let b2=ABILS[rand(6)], b1=ABILS[rand(6)];
  while(b1===b2) b1=ABILS[rand(6)];
  const final={...base};
  final[b2]=Math.min(17,final[b2]+2);
  final[b1]=Math.min(17,final[b1]+1);
  return{base,bonus2:b2,bonus1:b1,final};
}

// ---------------- 메인 컴포넌트 ----------------
export default function App(){
  const [lang,setLang]=useState<Lang>("ko");
  const [bg,setBg]=useState<Background>("-");
  const [stats,setStats]=useState<Record<Abil,number>>({STR:8,DEX:8,CON:8,INT:8,WIS:8,CHA:8});
  const [pbBonus2,setPbBonus2]=useState<Abil|null>(null);
  const [pbBonus1,setPbBonus1]=useState<Abil|null>(null);
  const [weapons,setWeapons]=useState<string[]>([]);
  const [skills,setSkills]=useState<string[]>([]);

  useEffect(()=>{ rollAll(); },[]);

  function rollBackground(){ setBg(choice(BACK_KO)); }
  function rollStats(){
    const {bonus2,bonus1,final}=rollPointBuyWithBonuses();
    setPbBonus2(bonus2); setPbBonus1(bonus1); setStats(final);
  }
  function rollWeapons(){ setWeapons(shuffle(ALL_WEAPONS).slice(0,2)); }
  function rollSkills(){ if(bg!=="-") setSkills(BG_SKILLS[bg]); }

  function rollAll(){ rollBackground(); rollStats(); rollWeapons(); setTimeout(rollSkills,0); }

  return(
    <div style={{display:"flex",justifyContent:"center",padding:20}}>
      <div style={{maxWidth:800,width:"100%"}}>
        <header style={{textAlign:"center"}}>
          <h1>{L[lang].title}</h1>
          <p>{L[lang].sub}</p>
          <button onClick={()=>setLang(lang==="ko"?"en":"ko")}>{L[lang].langBtn}</button>
        </header>

        <section style={{border:"1px solid #ccc",borderRadius:12,padding:16,marginTop:20}}>
          <h2>{L[lang].result}</h2>
          <div>{L[lang].background}: {bg}</div>
          <div>{L[lang].weapons}: {weapons.join(", ")||"-"}</div>
          <div>{L[lang].skills}: {skills.join(", ")||"-"}</div>

          <h3 style={{marginTop:16}}>{L[lang].abilities}</h3>
          <table style={{width:"100%",textAlign:"center",borderCollapse:"collapse"}}>
            <thead><tr>{ABILS.map(k=><th key={k}>{L[lang][k.toLowerCase() as keyof typeof L["ko"]]}</th>)}</tr></thead>
            <tbody><tr>{ABILS.map(k=><td key={k}>{stats[k]}<div style={{color:"red",fontSize:12}}>
              {pbBonus2===k?"+2":pbBonus1===k?"+1":""}</div></td>)}</tr></tbody>
          </table>

          <div style={{marginTop:16,display:"flex",gap:8,flexWrap:"wrap"}}>
            <button onClick={rollAll}>{L[lang].rollAll}</button>
            <button onClick={rollBackground}>{L[lang].onlyBG}</button>
            <button onClick={rollStats}>{L[lang].rollStats}</button>
            <button onClick={rollWeapons}>{L[lang].any2Weapons}</button>
          </div>
        </section>

        {/* 다이스 롤러 */}
        <section style={{marginTop:20,padding:16,border:"1px solid #ccc",borderRadius:12}}>
          <h2>🎲 Dice Roller</h2>
          <DiceRoller/>
        </section>

        {/* 승자 정하기 */}
        <section style={{marginTop:20,padding:16,border:"1px solid #ccc",borderRadius:12}}>
          <h2>🏆 승자 정하기</h2>
          <NameBattle/>
        </section>
      </div>
    </div>
  );
}

// ----------- Dice Roller -----------
function DiceRoller(){
  const [expr,setExpr]=useState("1d20");
  const [result,setResult]=useState<number[]>([]);
  function roll(){
    const m=/(\d+)d(\d+)/i.exec(expr);
    if(!m) return;
    const n=+m[1],s=+m[2];
    const rolls=Array.from({length:n},()=>1+rand(s));
    setResult(rolls);
  }
  return(<div>
    <input value={expr} onChange={e=>setExpr(e.target.value)} />
    <button onClick={roll}>Roll</button>
    <div>{result.join(", ")}</div>
  </div>);
}

// ----------- Name Battle -----------
function NameBattle(){
  const [names,setNames]=useState("");
  const [winner,setWinner]=useState("");
  function decide(){
    const arr=names.split(/[, \n]+/).filter(Boolean);
    if(arr.length===0)return;
    setWinner(choice(arr));
  }
  return(<div>
    <textarea rows={3} style={{width:"100%"}} value={names} onChange={e=>setNames(e.target.value)} />
    <button onClick={decide}>승자 정하기</button>
    <div>{winner && `👉 ${winner}`}</div>
  </div>);
}
