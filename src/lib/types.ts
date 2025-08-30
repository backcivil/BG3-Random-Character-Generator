// 타입 정의
// src/lib/types.ts
export const ABILS = ["STR","DEX","CON","INT","WIS","CHA"] as const;
export type Abil = typeof ABILS[number];

export type Lang = "ko" | "en";

export type Background =
  | "복사" | "사기꾼" | "범죄자" | "연예인" | "시골 영웅" | "길드 장인"
  | "귀족" | "이방인" | "현자" | "군인" | "부랑아" | "-";
