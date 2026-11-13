"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AvatarData, CollectionEntry, Profile } from "@/types/database";

const FACE_TYPES = [
  { name: "ノーマル", eyes: "normal" },
  { name: "キリッ", eyes: "sharp" },
  { name: "にっこり", eyes: "happy" },
  { name: "メガネ", eyes: "glasses" },
] as const;

const HAIR_STYLES = [
  { name: "ダークブラウン", color: "#2b1e1a" },
  { name: "ブラック", color: "#18181b" },
  { name: "ゴールド", color: "#d97706" },
  { name: "シルバー", color: "#94a3b8" },
] as const;

const BODY_COLORS = [
  { name: "レッド", color: "#e63946" },
  { name: "ブルー", color: "#1d3557" },
  { name: "グリーン", color: "#2a9d8f" },
  { name: "イエロー", color: "#e9c46a" },
] as const;

const EQUIPPED_ITEM_KEY = "park-equipped-item";

function isValidIndex(value: unknown, length: number): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < length
  );
}

function normalizeAvatar(avatar: AvatarData): AvatarData {
  const value = avatar as Partial<AvatarData>;
  return {
    skin: typeof value.skin === "number" ? value.skin : 0,
    hair: isValidIndex(value.hair, HAIR_STYLES.length) ? value.hair : 0,
    eyes: isValidIndex(value.eyes, FACE_TYPES.length) ? value.eyes : 0,
    color:
      typeof value.color === "string" && /^#[0-9a-fA-F]{6}$/.test(value.color)
        ? value.color
        : BODY_COLORS[0].color,
  };
}

function itemIcon(slug: string) {
  const icons: Record<string, string> = {
    apple: "🍎",
    grape: "🍇",
    orange: "🍊",
    peach: "🍑",
    melon: "🍈",
  };
  return icons[slug] ?? "🎁";
}

async function responseError(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }
  return `通信に失敗しました (${response.status})`;
}

export default function StatusPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<CollectionEntry[]>([]);
  const [hairIndex, setHairIndex] = useState(0);
  const [faceIndex, setFaceIndex] = useState(0);
  const [bodyColor, setBodyColor] = useState<string>(BODY_COLORS[0].color);
  const [activeTab, setActiveTab] = useState<"face" | "hair" | "color">("face");
  const [equippedItemId, setEquippedItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const [profileResponse, itemsResponse] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/items"),
        ]);
        if (!profileResponse.ok) {
          throw new Error(await responseError(profileResponse));
        }
        if (!itemsResponse.ok) {
          throw new Error(await responseError(itemsResponse));
        }

        const loadedProfile: Profile = await profileResponse.json();
        const loadedItems: CollectionEntry[] = await itemsResponse.json();
        if (cancelled) return;

        const avatar = normalizeAvatar(loadedProfile.avatar);
        setProfile(loadedProfile);
        setHairIndex(avatar.hair);
        setFaceIndex(avatar.eyes);
        setBodyColor(avatar.color);
        setItems(loadedItems);

        const storedItemId = window.localStorage.getItem(EQUIPPED_ITEM_KEY);
        if (storedItemId !== null) {
          const parsedItemId = Number(storedItemId);
          if (
            Number.isInteger(parsedItemId) &&
            loadedItems.some(
              (item) => item.id === parsedItemId && item.quantity > 0,
            )
          ) {
            setEquippedItemId(parsedItemId);
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "データを読み込めませんでした。",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const ownedItems = items.filter((item) => item.quantity > 0);
  const equippedItem = ownedItems.find((item) => item.id === equippedItemId);

  const changePart = (direction: -1 | 1) => {
    if (activeTab === "face") {
      setFaceIndex(
        (current) =>
          (current + direction + FACE_TYPES.length) % FACE_TYPES.length,
      );
    } else if (activeTab === "hair") {
      setHairIndex(
        (current) =>
          (current + direction + HAIR_STYLES.length) % HAIR_STYLES.length,
      );
    } else {
      const currentIndex = BODY_COLORS.findIndex(
        (option) => option.color === bodyColor,
      );
      const nextIndex =
        (currentIndex + direction + BODY_COLORS.length) % BODY_COLORS.length;
      setBodyColor(BODY_COLORS[nextIndex].color);
    }
  };

  const saveAvatar = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    setNotice("");

    const avatar: AvatarData = {
      ...normalizeAvatar(profile.avatar),
      hair: hairIndex,
      eyes: faceIndex,
      color: bodyColor,
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar }),
      });
      if (!response.ok) {
        throw new Error(await responseError(response));
      }
      const updatedProfile: Profile = await response.json();
      setProfile(updatedProfile);
      setNotice("キャラクターの見た目を保存しました！");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "キャラクターを保存できませんでした。",
      );
    } finally {
      setSaving(false);
    }
  };

  const equipItem = (itemId: number) => {
    try {
      window.localStorage.setItem(EQUIPPED_ITEM_KEY, String(itemId));
      setEquippedItemId(itemId);
      setError("");
      setNotice("そうびを変更しました！");
    } catch {
      setError(
        "そうびを保存できませんでした。ブラウザーの保存設定をご確認ください。",
      );
    }
  };

  const unequipItem = () => {
    try {
      window.localStorage.removeItem(EQUIPPED_ITEM_KEY);
      setEquippedItemId(null);
      setError("");
      setNotice("そうびをはずしました。");
    } catch {
      setError("そうびを変更できませんでした。");
    }
  };

  return (
    <main className="min-h-dvh bg-[#101b2c] px-3 py-5 font-mono text-[#17283b]">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-[420px] flex-col gap-4">
        <header className="flex items-center justify-between border-4 border-[#0b1422] bg-[#1a2e47] px-3 py-3 text-white shadow-[4px_4px_0_#080f1c]">
          <Link
            className="border-2 border-white/60 bg-[#334b64] px-2 py-1 text-xs"
            href="/park"
          >
            ◀ ひろば
          </Link>
          <div className="text-right">
            <p className="text-[9px] tracking-widest text-[#f0c14b]">
              CHARACTER
            </p>
            <h1 className="text-sm font-bold">キャラともちもの</h1>
          </div>
        </header>

        {(error || notice) && (
          <p
            aria-live="polite"
            className={`border-2 px-3 py-2 text-xs font-bold ${
              error
                ? "border-[#9e342e] bg-[#ffe0d4] text-[#8a2924]"
                : "border-[#397b62] bg-[#e1f4d2] text-[#275b47]"
            }`}
          >
            {error || notice}
          </p>
        )}

        {loading ? (
          <div className="grid flex-1 place-items-center border-4 border-[#17283b] bg-[#f5d992] p-6 text-sm font-bold">
            データをよみこみ中...
          </div>
        ) : (
          <>
            <section className="border-4 border-[#17283b] bg-[#f5d992] p-3 shadow-[4px_4px_0_#080f1c]">
              <div className="mb-3 flex items-center justify-between border-b-2 border-[#c7a861] pb-2">
                <h2 className="font-bold">キャラクター</h2>
                <span className="text-[10px] text-[#715831]">
                  {profile?.nickname ?? "ぼうけんしゃ"}
                </span>
              </div>

              <div className="relative mb-3 flex h-48 items-center justify-center overflow-hidden border-4 border-[#17283b] bg-[#8dd5ef]">
                <div className="absolute inset-x-0 bottom-0 h-10 border-t-4 border-[#4c875f] bg-[#83bd70]" />
                <div className="relative z-10 flex scale-125 flex-col items-center">
                  <div
                    className="relative flex h-12 w-16 flex-col justify-end border-2 border-black p-1"
                    style={{ backgroundColor: HAIR_STYLES[hairIndex].color }}
                  >
                    <div className="absolute inset-x-0 top-0 h-3 bg-black/10" />
                    <div className="relative z-10 flex h-8 w-full items-center justify-around border-2 border-black bg-[#f8c39d] px-1">
                      {FACE_TYPES[faceIndex].eyes === "glasses" ? (
                        <div className="flex h-3 w-full items-center justify-around border border-white bg-black/80">
                          <span className="h-1.5 w-1.5 bg-cyan-300" />
                          <span className="h-1.5 w-1.5 bg-cyan-300" />
                        </div>
                      ) : (
                        <>
                          <span
                            className={`w-2.5 bg-black ${
                              FACE_TYPES[faceIndex].eyes === "happy"
                                ? "h-1"
                                : FACE_TYPES[faceIndex].eyes === "sharp"
                                  ? "h-1.5 rotate-12"
                                  : "h-2.5"
                            }`}
                          />
                          <span
                            className={`w-2.5 bg-black ${
                              FACE_TYPES[faceIndex].eyes === "happy"
                                ? "h-1"
                                : FACE_TYPES[faceIndex].eyes === "sharp"
                                  ? "h-1.5 -rotate-12"
                                  : "h-2.5"
                            }`}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <span className="h-8 w-2.5 border-y-2 border-l-2 border-black bg-[#2b1e1a]" />
                    <div
                      className="flex h-10 w-12 justify-center border-2 border-black"
                      style={{ backgroundColor: bodyColor }}
                    >
                      <span className="h-full w-4 border-x-2 border-black/20 bg-white" />
                    </div>
                    <span className="h-8 w-2.5 border-y-2 border-r-2 border-black bg-[#2b1e1a]" />
                    <span className="absolute -top-5 right-0 h-7 w-2 rotate-12 border border-black bg-slate-200" />
                  </div>
                  <div className="flex w-12 justify-around gap-2">
                    <span className="h-5 w-3 border-x-2 border-b-2 border-black bg-[#18181b]" />
                    <span className="h-5 w-3 border-x-2 border-b-2 border-black bg-[#18181b]" />
                  </div>
                </div>
                {equippedItem && (
                  <span className="absolute right-2 bottom-2 border-2 border-[#17283b] bg-[#fff0c8] px-2 py-1 text-xs">
                    {itemIcon(equippedItem.slug)} {equippedItem.name} をそうび中
                  </span>
                )}
              </div>

              <div className="mb-3 grid grid-cols-3 gap-1">
                {(
                  [
                    ["face", "かお"],
                    ["hair", "かみ"],
                    ["color", "ふく"],
                  ] as const
                ).map(([tab, label]) => (
                  <button
                    aria-pressed={activeTab === tab}
                    className={`border-2 border-[#17283b] py-2 text-xs font-bold ${
                      activeTab === tab
                        ? "bg-[#facc15]"
                        : "bg-white hover:bg-[#fff1c7]"
                    }`}
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between border-2 border-[#17283b] bg-white p-2">
                <button
                  aria-label="前のデザイン"
                  className="border-2 border-[#17283b] bg-[#1a2e47] px-4 py-1 font-bold text-white active:translate-y-0.5"
                  onClick={() => changePart(-1)}
                  type="button"
                >
                  ◀
                </button>
                <span className="text-center text-xs font-bold">
                  {activeTab === "face" && FACE_TYPES[faceIndex].name}
                  {activeTab === "hair" && HAIR_STYLES[hairIndex].name}
                  {activeTab === "color" &&
                    BODY_COLORS.find((option) => option.color === bodyColor)
                      ?.name}
                </span>
                <button
                  aria-label="次のデザイン"
                  className="border-2 border-[#17283b] bg-[#1a2e47] px-4 py-1 font-bold text-white active:translate-y-0.5"
                  onClick={() => changePart(1)}
                  type="button"
                >
                  ▶
                </button>
              </div>

              <button
                className="mt-3 w-full border-4 border-[#17283b] bg-[#e95749] py-3 text-sm font-black text-white shadow-[3px_3px_0_#17283b] active:translate-y-0.5 active:shadow-[1px_1px_0_#17283b] disabled:opacity-60"
                disabled={saving || !profile}
                onClick={saveAvatar}
                type="button"
              >
                {saving ? "ほぞん中..." : "このすがたを保存"}
              </button>
            </section>

            <section className="flex-1 border-4 border-[#17283b] bg-[#f5d992] p-3 shadow-[4px_4px_0_#080f1c]">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="font-bold">もちもの</h2>
                <span className="text-[10px] text-[#715831]">
                  {ownedItems.length}しゅるい
                </span>
              </div>
              <p className="mb-3 text-[10px] leading-5 text-[#715831]">
                すれちがいなどで手に入れたアイテムです。選ぶとそうびを変更できます。
              </p>

              {ownedItems.length === 0 ? (
                <div className="border-2 border-dashed border-[#b39860] bg-[#fff0c8] px-3 py-5 text-center text-xs leading-6">
                  まだアイテムを持っていません。
                  <br />
                  すれちがってアイテムを集めよう！
                </div>
              ) : (
                <ul className="grid gap-2">
                  {ownedItems.map((item) => {
                    const isEquipped = equippedItemId === item.id;
                    return (
                      <li
                        className={`flex items-center gap-3 border-2 p-2 ${
                          isEquipped
                            ? "border-[#27775a] bg-[#e1f4d2]"
                            : "border-[#17283b] bg-[#fff0c8]"
                        }`}
                        key={item.id}
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center border-2 border-[#17283b] bg-white text-2xl">
                          {itemIcon(item.slug)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold">
                            {item.name}
                          </p>
                          <p className="mt-1 text-[10px] text-[#715831]">
                            レア度 {item.rarity} ・ {item.quantity}こ
                          </p>
                        </div>
                        <button
                          aria-pressed={isEquipped}
                          className={`shrink-0 border-2 border-[#17283b] px-2 py-1 text-[10px] font-bold ${
                            isEquipped ? "bg-[#397b62] text-white" : "bg-white"
                          }`}
                          onClick={() => equipItem(item.id)}
                          type="button"
                        >
                          {isEquipped ? "そうび中" : "そうび"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {equippedItem && (
                <button
                  className="mt-3 w-full border-2 border-[#17283b] bg-white py-2 text-xs font-bold"
                  onClick={unequipItem}
                  type="button"
                >
                  そうびをはずす
                </button>
              )}
              <p className="mt-3 text-center text-[9px] text-[#715831]">
                そうびの設定はこの端末に保存されます
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
