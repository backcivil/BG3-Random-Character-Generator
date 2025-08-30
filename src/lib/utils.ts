import type { Abil } from "./types";

export const rand = (n:number)=>Math.floor(Math.random()*n);
export const choice = <T,>(arr:readonly T[]):T=>arr[rand(arr.length)];
export const shuffle = <T,>(arr:readonly T[])=>{
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
};

// 포인트바이(8~13: +1비용, 14~15: +2비용, 상한 15)
export function rollPointBuyRaw(): Record<Abil,number> {
  const vals=[8,8,8,8,8,8]; let budget=27;
  const cost=(v:number)=>(v>=13?2:1);
  let guard=2000;
  while(budget>0 && guard-->0){
    const i=rand(6); const cur=vals[i];
    if(cur>=15) continue;
    const c=cost(cur);
    if(budget<c){
      const any = vals.some(v => (v<13 && budget>=1) || (v>=13 && v<15 && budget>=2));
      if(!any) break;
      continue;
    }
    vals[i]+=1; budget-=c;
  }
  return { STR:vals[0],DEX:vals[1],CON:vals[2],INT:vals[3],WIS:vals[4],CHA:vals[5] };
}

export function rollPointBuyWithBonuses(){
  const base = rollPointBuyRaw();
  const ABILS = ["STR","DEX","CON","INT","WIS","CHA"] as const;
  let b2 = ABILS[rand(6)];
  let b1 = ABILS[rand(6)];
  while(b1===b2) b1 = ABILS[rand(6)];
  const final = { ...base };
  final[b2] = Math.min(17, final[b2]+2);
  final[b1] = Math.min(17, final[b1]+1);
  return { base, bonus2:b2, bonus1:b1, final };
}

// Dice
export function parseDice(expr:string){
  const t=expr.trim().replace(/\s+/g,'');
  const m=t.match(/^(\d+)[dD](\d+)([+-]\d+)?$/);
  if(!m) return null;
  const n=Math.max(1,parseInt(m[1],10));
  const sides=Math.max(2,parseInt(m[2],10));
  const mod=m[3]?parseInt(m[3],10):0;
  return { n, m:sides, mod };
}
export function rollNdM(n:number,m:number){ return Array.from({length:n},()=>1+rand(m)); }
