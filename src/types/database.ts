// supabase/migrations の定義と対応させる。
// 将来的には `npx supabase gen types typescript` で自動生成に置き換える。

export type Profile = {
  id: string;
  nickname: string;
  home_area: string | null;
  avatar: AvatarData;
  created_at: string;
};

export type AvatarData = {
  skin: number;
  hair: number;
  eyes: number;
  color: string;
};

export type Encounter = {
  id: number;
  user_a: string;
  user_b: string;
  encountered_at: string;
  /** user_a が受け取った果物 */
  item_to_a: number | null;
  /** user_b が受け取った果物 */
  item_to_b: number | null;
};

export type Item = {
  id: number;
  slug: string;
  name: string;
  rarity: number;
};

export type UserItem = {
  user_id: string;
  item_id: number;
  quantity: number;
};

// ---- API レスポンス ----

/** 他のユーザーとして公開するプロフィール */
export type PublicProfile = Pick<
  Profile,
  "id" | "nickname" | "home_area" | "avatar"
>;

/** POST /api/location のレスポンス */
export type LocationResponse = {
  /** 今回新しく成立したすれ違い（なければ空配列） */
  encounters: NewEncounter[];
};

export type NewEncounter = {
  id: number;
  partner: PublicProfile | null;
  receivedItem: Item | null;
};

/** GET /api/encounters のレスポンス要素 */
export type EncounterHistoryEntry = {
  id: number;
  encounteredAt: string;
  partner: PublicProfile | null;
  receivedItem: Item | null;
};

/** GET /api/items のレスポンス要素（図鑑） */
export type CollectionEntry = Item & { quantity: number };
