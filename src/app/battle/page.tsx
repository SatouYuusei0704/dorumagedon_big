    'use client';

    import React, { useState, useEffect, Suspense } from 'react';
    import Link from 'next/link';
    import { useSearchParams } from 'next/navigation';

    // 都道府県ごとのご当地アイテムデータ（右手：武器 / 左手：盾・サブアイテム）
    const REGIONAL_ITEMS: Record<string, { name: string; rightIcon: string; leftIcon: string }> = {
    青森県: { name: 'りんごのつるぎ', rightIcon: '🍎🗡️', leftIcon: '🍎' },
    滋賀県: { name: '琵琶湖の大ナマズ剣', rightIcon: '🐟🗡️', leftIcon: '🛡️' },
    石川県: { name: '金箔のつるぎ', rightIcon: '✨🗡️', leftIcon: '✨🛡️' },
    群馬県: { name: '上州ダルマのかぶと', rightIcon: '🗡️', leftIcon: '🔴' },
    静岡県: { name: '茶摘みのやいば', rightIcon: '🍃🗡️', leftIcon: '🍃' },
    長野県: { name: '信州そばの盾', rightIcon: '🗡️', leftIcon: '🍜🛡️' },
    京都府: { name: '八ツ橋のかぶと', rightIcon: '🗡️', leftIcon: '🍡' },
    福井県: { name: '恐竜の化石ブレード', rightIcon: '🦖🗡️', leftIcon: '🦴🛡️' },
    島根県: { name: '勾玉のおまもり', rightIcon: '🗡️', leftIcon: '☯️✨' },
    東京都: { name: 'タワーのたて', rightIcon: '🗡️', leftIcon: '🗼🛡️' },
    大阪府: { name: 'なにわのハリセン', rightIcon: '🪭', leftIcon: '🛡️' },
    北海道: { name: '木彫りのくま', rightIcon: '🐻🗡️', leftIcon: '🐟' },
    };

    const DEFAULT_ITEM = { name: '旅人のつるぎ', rightIcon: '🗡️', leftIcon: '🛡️' };

    const BODY_COLORS = ['bg-[#e63946]', 'bg-[#1d3557]', 'bg-[#2a9d8f]', 'bg-[#e9c46a]'];
    const HAIR_STYLES = ['bg-[#2b1e1a]', 'bg-[#18181b]', 'bg-[#d97706]', 'bg-[#94a3b8]'];

    interface Fighter {
    name: string;
    location: string;
    hp: number;
    maxHp: number;
    itemName: string;
    rightItemIcon: string;
    leftItemIcon: string;
    bodyColor: string;
    hairColor: string;
    }

    function BattleContent() {
    const searchParams = useSearchParams();

    // 1. プレイヤー状態（クエリパラメータから取得して動的更新）
    const [player, setPlayer] = useState<Fighter>({
        name: 'ゆうしゃ',
        location: '石川県',
        hp: 100,
        maxHp: 100,
        itemName: '金箔のつるぎ',
        rightItemIcon: '✨🗡️',
        leftItemIcon: '✨🛡️',
        bodyColor: 'bg-[#e63946]',
        hairColor: 'bg-[#2b1e1a]',
    });

    // 2. 敵状態（指定通り固定）
    const [enemy, setEnemy] = useState<Fighter>({
        name: 'たろう',
        location: '青森県',
        hp: 100,
        maxHp: 100,
        itemName: 'りんごのつるぎ',
        rightItemIcon: '🍎🗡️',
        leftItemIcon: '🍎',
        bodyColor: 'bg-[#1d3557]',
        hairColor: 'bg-[#d97706]',
    });

    // URLからプレイヤーの情報を取得して反映
    useEffect(() => {
        const queryName = searchParams.get('name') || 'ゆうしゃ';
        const queryLocation = searchParams.get('location') || '石川県';
        const hairIdx = parseInt(searchParams.get('hair') || '0', 10);
        const bodyIdx = parseInt(searchParams.get('body') || '0', 10);

        const item = REGIONAL_ITEMS[queryLocation] || DEFAULT_ITEM;

        setPlayer({
        name: queryName,
        location: queryLocation,
        hp: 100,
        maxHp: 100,
        itemName: item.name,
        rightItemIcon: item.rightIcon,
        leftItemIcon: item.leftIcon,
        bodyColor: BODY_COLORS[bodyIdx] || BODY_COLORS[0],
        hairColor: HAIR_STYLES[hairIdx] || HAIR_STYLES[0],
        });
    }, [searchParams]);

    const [logs, setLogs] = useState<string[]>([
        `${enemy.location}の ${enemy.name} が あらわれた！`,
        `コマンドを えらんでね！`,
    ]);
    const [isBattleEnd, setIsBattleEnd] = useState(false);

    const addLog = (msg: string) => {
        setLogs((prev) => [...prev.slice(-3), msg]);
    };

    const handleAttack = () => {
        if (isBattleEnd) return;

        const damage = Math.floor(Math.random() * 15) + 15;
        const newEnemyHp = Math.max(0, enemy.hp - damage);
        setEnemy((prev) => ({ ...prev, hp: newEnemyHp }));
        addLog(`${player.name} の こうげき！ ${enemy.name} に ${damage} のダメージ！`);

        if (newEnemyHp === 0) {
        addLog(`かんぜんしょうり！ ${enemy.name} を たおした！`);
        setIsBattleEnd(true);
        return;
        }

        setTimeout(() => {
        const enemyDamage = Math.floor(Math.random() * 12) + 10;
        setPlayer((prev) => {
            const newPlayerHp = Math.max(0, prev.hp - enemyDamage);
            if (newPlayerHp === 0) {
            addLog(`${player.name} は たおれてしまった…`);
            setIsBattleEnd(true);
            }
            return { ...prev, hp: newPlayerHp };
        });
        addLog(`${enemy.name} の はんげき！ ${player.name} は ${enemyDamage} のダメージ！`);
        }, 800);
    };

    const handleSpecialSkill = () => {
        if (isBattleEnd) return;

        const damage = Math.floor(Math.random() * 20) + 25;
        const newEnemyHp = Math.max(0, enemy.hp - damage);
        setEnemy((prev) => ({ ...prev, hp: newEnemyHp }));
        addLog(`${player.name} は 【${player.itemName}】 のひっさつわざ！`);
        addLog(`${enemy.name} に ${damage} の だいだめーじ！`);

        if (newEnemyHp === 0) {
        addLog(`かんぜんしょうり！ ${enemy.name} を たおした！`);
        setIsBattleEnd(true);
        return;
        }

        setTimeout(() => {
        const enemyDamage = Math.floor(Math.random() * 12) + 10;
        setPlayer((prev) => {
            const newPlayerHp = Math.max(0, prev.hp - enemyDamage);
            if (newPlayerHp === 0) {
            addLog(`${player.name} は たおれてしまった…`);
            setIsBattleEnd(true);
            }
            return { ...prev, hp: newPlayerHp };
        });
        addLog(`${enemy.name} の こうげき！ ${player.name} は ${enemyDamage} のダメージ！`);
        }, 800);
    };

    return (
        <main className="min-h-screen bg-[#1e293b] flex justify-center items-center p-2 font-mono selection:bg-[#e11d48] selection:text-white">
        <div className="w-full max-w-[420px] bg-[#fef08a] border-4 border-[#0f172a] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-2xl overflow-hidden relative min-h-[750px] flex flex-col justify-between p-4">
            
            {/* ヘッダー */}
            <div className="flex justify-between items-center bg-[#0f172a] text-white p-2 rounded-lg border-2 border-black mb-3">
            <Link href="/start" className="text-xs bg-[#334155] hover:bg-[#475569] px-2 py-1 rounded border border-white/40">
                ◀ にげる
            </Link>
            <h1 className="text-sm font-bold tracking-wider text-[#ef4444]">⚔️ すれちがいバトル</h1>
            <div className="w-12"></div>
            </div>

            {/* 1. 対戦ステージ */}
            <div className="bg-[#7dd3fc] border-4 border-[#0f172a] rounded-xl p-4 flex flex-col justify-between relative shadow-inner mb-4 flex-1 min-h-[360px]">
            
            {/* ライバル（敵） */}
            <div className="flex justify-between items-start">
                <div className="bg-[#0f172a] text-white p-2.5 rounded-lg border-2 border-black w-48 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between text-[11px] text-[#facc15] font-bold">
                    <span>{enemy.name}</span>
                    <span>{enemy.location}</span>
                </div>
                <div className="w-full bg-slate-700 h-3.5 rounded-full mt-1.5 border border-black overflow-hidden relative">
                    <div 
                    className="bg-emerald-400 h-full transition-all duration-300" 
                    style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                    ></div>
                </div>
                <div className="text-[10px] text-right mt-1 text-slate-300 font-bold">
                    HP {enemy.hp}/{enemy.maxHp}
                </div>
                </div>

                <div className="scale-110 origin-top-right mr-2 mt-2">
                <AvatarGraphic fighter={enemy} isEnemy={true} />
                </div>
            </div>

            {/* 中央 VS ロゴ */}
            <div className="self-center bg-[#facc15] border-3 border-black px-4 py-1 rounded-lg font-black text-sm text-[#0f172a] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] my-3 tracking-widest">
                VS
            </div>

            {/* プレイヤー（自分） */}
            <div className="flex justify-between items-end">
                <div className="scale-110 origin-bottom-left ml-2 mb-2">
                <AvatarGraphic fighter={player} isEnemy={false} />
                </div>

                <div className="bg-[#0f172a] text-white p-2.5 rounded-lg border-2 border-black w-48 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                <div className="flex justify-between text-[11px] text-[#facc15] font-bold">
                    <span>{player.name}</span>
                    <span>{player.location}</span>
                </div>
                <div className="w-full bg-slate-700 h-3.5 rounded-full mt-1.5 border border-black overflow-hidden relative">
                    <div 
                    className="bg-emerald-400 h-full transition-all duration-300" 
                    style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                    ></div>
                </div>
                <div className="text-[10px] text-right mt-1 text-slate-300 font-bold">
                    HP {player.hp}/{player.maxHp}
                </div>
                </div>
            </div>

            </div>

            {/* 2. ログ */}
            <div className="bg-[#1e293b] text-white border-4 border-[#0f172a] rounded-xl p-3 mb-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] h-24 flex flex-col justify-end text-xs leading-relaxed overflow-hidden">
            {logs.map((log, index) => (
                <p key={index}>▶ {log}</p>
            ))}
            </div>

            {/* 3. コマンド */}
            {!isBattleEnd ? (
            <div className="grid grid-cols-2 gap-2">
                <button
                onClick={handleAttack}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-black py-3.5 rounded-xl border-4 border-[#0f172a] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 text-xs cursor-pointer"
                >
                ⚔️ こうげき
                </button>
                <button
                onClick={handleSpecialSkill}
                className="bg-[#f59e0b] hover:bg-[#d97706] text-white font-black py-3.5 rounded-xl border-4 border-[#0f172a] shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5 text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                <span>{player.rightItemIcon}</span> ご当地わざ
                </button>
            </div>
            ) : (
            <Link
                href="/start"
                className="block w-full bg-[#3b82f6] text-white text-center font-black py-3.5 rounded-xl border-4 border-[#0f172a] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-[#2563eb] active:translate-y-0.5 text-xs tracking-widest"
            >
                ひろばへ もどる ➔
            </Link>
            )}

        </div>
        </main>
    );
    }

    export default function BattlePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#1e293b] text-white flex justify-center items-center">Loading...</div>}>
        <BattleContent />
        </Suspense>
    );
    }

    // ドットアバター描画コンポーネント
    function AvatarGraphic({ fighter, isEnemy }: { fighter: Fighter; isEnemy: boolean }) {
    return (
        <div className={`relative flex flex-col items-center justify-center scale-125 ${isEnemy ? '-scale-x-125' : ''}`}>
        <div className={`relative w-16 h-12 ${fighter.hairColor} border-2 border-black flex flex-col justify-end p-0.5`}>
            <div className="w-full h-8 bg-[#f8c39d] border-2 border-black flex items-center justify-around px-1 relative z-10">
            <div className="w-2.5 h-2.5 bg-black"></div>
            <div className="w-2.5 h-2.5 bg-black"></div>
            </div>
        </div>

        <div className="relative flex items-center">
            {/* 左手 ＋ アイテム */}
            <div className="relative flex items-center">
            <div className="w-2.5 h-8 bg-[#2b1e1a] border-y-2 border-l-2 border-black"></div>
            <div className="absolute -left-3 -top-3 z-25 flex items-center justify-center">
                <span className="text-sm drop-shadow-[1px_1px_0px_#000]">{fighter.leftItemIcon}</span>
            </div>
            </div>

            {/* 胴体 */}
            <div className={`w-12 h-10 ${fighter.bodyColor} border-2 border-black flex justify-center`}>
            <div className="w-4 h-full bg-white border-x-2 border-black/20"></div>
            </div>

            {/* 右手 ＋ アイテム */}
            <div className="relative flex items-center">
            <div className="w-2.5 h-8 bg-[#2b1e1a] border-y-2 border-r-2 border-black"></div>
            <div className="absolute -left-1 -top-4 z-20 flex items-center justify-center">
                <span className="text-base drop-shadow-[1px_1px_0px_#000]">{fighter.rightItemIcon}</span>
            </div>
            </div>
        </div>

        <div className="flex gap-2 w-12 justify-around">
            <div className="w-3 h-5 bg-[#18181b] border-x-2 border-b-2 border-black"></div>
            <div className="w-3 h-5 bg-[#18181b] border-x-2 border-b-2 border-black"></div>
        </div>
        </div>
    );
    }