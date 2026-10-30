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
