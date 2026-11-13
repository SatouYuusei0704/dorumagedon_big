// supabase/migrations の定義と対応させる。
// 将来的には `npx supabase gen types typescript` で自動生成に置き換える。

export type Profile = {
  id: string;
  nickname: string;
  home_area: string | null;
  avatar: AvatarData;
  /** そうび中のアイテム（バトルのご当地わざになる） */
  equipped_item_id: number | null;
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
  /** user_a が受け取ったアイテム */
  item_to_a: number | null;
  /** user_b が受け取ったアイテム */
  item_to_b: number | null;
};

export type Item = {
  id: number;
  slug: string;
  name: string;
  rarity: number;
  /** このアイテムがもらえる出身地（null は出身地に関係ないアイテム） */
  prefecture: string | null;
  /** 表示用の絵文字（ドット絵ができたら差し替える） */
  icon: string;
  description: string;
};

export type Battle = {
  id: number;
  user_id: string;
  opponent_id: string;
  won: boolean;
  /** 勝利でもらったアイテム（負け・報酬上限のときは null） */
  reward_item_id: number | null;
  fought_at: string;
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

/** バトルに出るキャラクター */
export type BattleFighter = {
  profile: PublicProfile;
  /** ご当地わざ（そうび中のアイテム、なければ出身地のアイテム） */
  move: Item;
};

/** GET /api/battles/setup?opponent=<id> のレスポンス */
export type BattleSetupResponse = {
  player: BattleFighter;
  enemy: BattleFighter;
};

/** POST /api/battles のレスポンス */
export type BattleResultResponse = {
  won: boolean;
  /** もらったアイテム（負け・同じ相手から今日すでにもらっている場合は null） */
  reward: Item | null;
};

/** GET /api/battles のレスポンス（戦績） */
export type BattleStats = {
  wins: number;
  losses: number;
};
