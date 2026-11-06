import type { AvatarData } from "@/types/database";

/** ふく色（AvatarData.color にはこの hex を保存する） */
export const BODY_COLORS = [
  { name: "レッド", hex: "#e63946" },
  { name: "ブルー", hex: "#1d3557" },
  { name: "グリーン", hex: "#2a9d8f" },
  { name: "イエロー", hex: "#e9c46a" },
] as const;

/** かみ色（AvatarData.hair はこの配列の番号） */
export const HAIR_STYLES = [
  { name: "ダークブラウン", hex: "#2b1e1a" },
  { name: "ブラック", hex: "#18181b" },
  { name: "ゴールド", hex: "#d97706" },
  { name: "シルバー", hex: "#94a3b8" },
] as const;

/** かお（AvatarData.eyes はこの配列の番号） */
export const FACE_TYPES = [
  { name: "ノーマル", eyeType: "normal" },
  { name: "キリッ", eyeType: "sharp" },
  { name: "にっこり", eyeType: "happy" },
  { name: "ロボ/メガネ", eyeType: "glasses" },
] as const;

/** アバター未作成の人に使う見た目 */
export const DEFAULT_AVATAR: AvatarData = {
  skin: 0,
  hair: 0,
  eyes: 0,
  color: BODY_COLORS[0].hex,
};

/**
 * DB から来たアバター（未作成だと {}）を、表示できる値にそろえる。
 * 範囲外の番号や不正な色はデフォルトに戻す。
 */
export function normalizeAvatar(
  avatar: Partial<AvatarData> | null | undefined,
) {
  const index = (n: unknown, length: number) =>
    Number.isInteger(n) && (n as number) >= 0 && (n as number) < length
      ? (n as number)
      : 0;
  const color =
    typeof avatar?.color === "string" && /^#[0-9a-f]{6}$/i.test(avatar.color)
      ? avatar.color
      : DEFAULT_AVATAR.color;
  return {
    skin: 0,
    hair: index(avatar?.hair, HAIR_STYLES.length),
    eyes: index(avatar?.eyes, FACE_TYPES.length),
    color,
  } satisfies AvatarData;
}
