"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppFooter } from "@/components/ui/AppFooter";
import { useAuth } from "@/features/auth";
import {
  AvatarSprite,
  BODY_COLORS,
  FACE_TYPES,
  HAIR_STYLES,
  normalizeAvatar,
} from "@/features/avatar";
import type {
  AvatarData,
  BattleStats,
  CollectionEntry,
  Profile,
} from "@/types/database";

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
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<CollectionEntry[]>([]);
  const [stats, setStats] = useState<BattleStats | null>(null);
  const [hairIndex, setHairIndex] = useState(0);
  const [faceIndex, setFaceIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"face" | "hair" | "color">("face");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // ログアウト操作中は「未ログインなら /login へ」を動かさない（/start への遷移を優先）
  const signingOut = useRef(false);

  useEffect(() => {
    if (authLoading || signingOut.current) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    let cancelled = false;

    async function loadStatus() {
      try {
        const [profileResponse, itemsResponse, statsResponse] =
          await Promise.all([
            fetch("/api/profile"),
            fetch("/api/items"),
            fetch("/api/battles"),
          ]);
        if (!profileResponse.ok) {
          throw new Error(await responseError(profileResponse));
        }
        if (!itemsResponse.ok) {
          throw new Error(await responseError(itemsResponse));
        }

        const loadedProfile: Profile = await profileResponse.json();
        const loadedItems: CollectionEntry[] = await itemsResponse.json();
        // 戦績は取れなくても画面は出す
        const loadedStats: BattleStats | null = statsResponse.ok
          ? await statsResponse.json()
          : null;
        if (cancelled) return;

        const avatar = normalizeAvatar(loadedProfile.avatar);
        setProfile(loadedProfile);
        setHairIndex(avatar.hair);
        setFaceIndex(avatar.eyes);
        setColorIndex(
          Math.max(
            0,
            BODY_COLORS.findIndex((option) => option.hex === avatar.color),
          ),
        );
        setItems(loadedItems);
        setStats(loadedStats);
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
  }, [authLoading, user, router]);

  const ownedItems = items.filter((item) => item.quantity > 0);
  const equippedItemId = profile?.equipped_item_id ?? null;
  const equippedItem = ownedItems.find((item) => item.id === equippedItemId);

  const previewAvatar: AvatarData = {
    skin: 0,
    hair: hairIndex,
    eyes: faceIndex,
    color: BODY_COLORS[colorIndex].hex,
  };

  const changePart = (direction: -1 | 1) => {
    const step = (length: number) => (current: number) =>
      (current + direction + length) % length;
    if (activeTab === "face") setFaceIndex(step(FACE_TYPES.length));
    else if (activeTab === "hair") setHairIndex(step(HAIR_STYLES.length));
    else setColorIndex(step(BODY_COLORS.length));
  };

  const patchProfile = async (body: object, successMessage: string) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(await responseError(response));
      }
      setProfile((await response.json()) as Profile);
      setNotice(successMessage);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "保存できませんでした。",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveAvatar = () =>
    patchProfile(
      { avatar: previewAvatar },
      "キャラクターの見た目を保存しました！",
    );
  const equipItem = (itemId: number) =>
    patchProfile(
      { equippedItemId: itemId },
      "そうびを変更しました！ バトルの ご当地わざ になります",
    );
  const unequipItem = () =>
    patchProfile({ equippedItemId: null }, "そうびをはずしました。");

  const handleSignOut = async () => {
    signingOut.current = true;
    await signOut();
    router.replace("/start");
  };

  return (
    <main className="flex min-h-dvh justify-center bg-[#101b2c] font-mono text-[#17283b]">
      <div className="flex w-full max-w-[420px] flex-col">
        <div className="flex flex-1 flex-col gap-4 px-3 py-5">
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
                    {profile?.nickname ?? "ぼうけんしゃ"}（
                    {profile?.home_area ?? "出身地ふめい"}）
                  </span>
                </div>

                <div className="relative mb-3 flex h-48 items-center justify-center overflow-hidden border-4 border-[#17283b] bg-[#8dd5ef]">
                  <div className="absolute inset-x-0 bottom-0 h-10 border-t-4 border-[#4c875f] bg-[#83bd70]" />
                  <div className="relative z-10">
                    <AvatarSprite avatar={previewAvatar} scale={1.25} />
                  </div>
                  {equippedItem && (
                    <span className="absolute right-2 bottom-2 z-10 border-2 border-[#17283b] bg-[#fff0c8] px-2 py-1 text-xs">
                      {equippedItem.icon} {equippedItem.name} をそうび中
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
                    {activeTab === "color" && BODY_COLORS[colorIndex].name}
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

              <section className="border-4 border-[#17283b] bg-[#f5d992] p-3 shadow-[4px_4px_0_#080f1c]">
                <h2 className="mb-2 font-bold">せんせき</h2>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="border-2 border-[#17283b] bg-white py-2">
                    <p className="text-[10px] text-[#715831]">かち</p>
                    <p className="text-lg font-black text-[#e95749]">
                      {stats?.wins ?? "-"}
                    </p>
                  </div>
                  <div className="border-2 border-[#17283b] bg-white py-2">
                    <p className="text-[10px] text-[#715831]">まけ</p>
                    <p className="text-lg font-black">{stats?.losses ?? "-"}</p>
                  </div>
                  <div className="border-2 border-[#17283b] bg-white py-2">
                    <p className="text-[10px] text-[#715831]">しょうりつ</p>
                    <p className="text-lg font-black">
                      {stats && stats.wins + stats.losses > 0
                        ? `${Math.round((stats.wins / (stats.wins + stats.losses)) * 100)}%`
                        : "-"}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-[#715831]">
                  ひろばで すれちがった人を えらぶと バトルできます
                </p>
              </section>

              <section className="border-4 border-[#17283b] bg-[#f5d992] p-3 shadow-[4px_4px_0_#080f1c]">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="font-bold">もちもの</h2>
                  <span className="text-[10px] text-[#715831]">
                    {ownedItems.length}しゅるい
                  </span>
                </div>
                <p className="mb-3 text-[10px] leading-5 text-[#715831]">
                  そうびした アイテムが バトルの「ご当地わざ」になります。
                  なにも そうびしていないときは 出身地の わざを つかいます。
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
                            {item.icon || "🎁"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold">
                              {item.name}
                            </p>
                            <p className="mt-1 text-[10px] text-[#715831]">
                              {item.prefecture ?? "ぜんこく"} ・ {item.quantity}
                              こ
                            </p>
                          </div>
                          <button
                            aria-pressed={isEquipped}
                            className={`shrink-0 border-2 border-[#17283b] px-2 py-1 text-[10px] font-bold disabled:opacity-60 ${
                              isEquipped
                                ? "bg-[#397b62] text-white"
                                : "bg-white"
                            }`}
                            disabled={saving || isEquipped}
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
                    className="mt-3 w-full border-2 border-[#17283b] bg-white py-2 text-xs font-bold disabled:opacity-60"
                    disabled={saving}
                    onClick={unequipItem}
                    type="button"
                  >
                    そうびをはずす
                  </button>
                )}
              </section>

              <button
                className="border-2 border-white/40 bg-[#334b64] py-2 text-xs font-bold text-white"
                onClick={handleSignOut}
                type="button"
              >
                ログアウト
              </button>
            </>
          )}
        </div>

        <AppFooter className="sticky bottom-0" />
      </div>
    </main>
  );
}
