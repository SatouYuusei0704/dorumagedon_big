import type { AvatarData } from "@/types/database";
import { FACE_TYPES, HAIR_STYLES, normalizeAvatar } from "./parts";

type Props = {
  avatar: Partial<AvatarData> | null | undefined;
  /** 拡大率（1 で幅約 80px × 高さ約 110px） */
  scale?: number;
  className?: string;
};

/** キャラクター作成で作ったアバターのドット絵 */
export function AvatarSprite({ avatar, scale = 1, className = "" }: Props) {
  const { hair, eyes, color } = normalizeAvatar(avatar);
  const eyeType = FACE_TYPES[eyes].eyeType;

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`}
      style={{ transform: `scale(${scale})` }}
      aria-hidden="true"
    >
      {/* あたま（かみ + かお） */}
      <div
        className="relative flex h-12 w-16 flex-col justify-end border-2 border-black p-1"
        style={{ backgroundColor: HAIR_STYLES[hair].hex }}
      >
        <div className="absolute top-0 right-0 left-0 h-3 bg-black/10"></div>
        <div className="relative z-10 flex h-8 w-full items-center justify-around border-2 border-black bg-[#f8c39d] px-1">
          {eyeType === "normal" && (
            <>
              <div className="h-2.5 w-2.5 bg-black"></div>
              <div className="h-2.5 w-2.5 bg-black"></div>
            </>
          )}
          {eyeType === "sharp" && (
            <>
              <div className="h-1.5 w-2.5 rotate-12 bg-black"></div>
              <div className="h-1.5 w-2.5 -rotate-12 bg-black"></div>
            </>
          )}
          {eyeType === "happy" && (
            <>
              <div className="h-1 w-2.5 -translate-y-0.5 bg-black"></div>
              <div className="h-1 w-2.5 -translate-y-0.5 bg-black"></div>
            </>
          )}
          {eyeType === "glasses" && (
            <div className="flex h-2 w-full items-center justify-around border border-white bg-black/80">
              <div className="h-1.5 w-1.5 bg-cyan-300"></div>
              <div className="h-1.5 w-1.5 bg-cyan-300"></div>
            </div>
          )}
        </div>
      </div>

      {/* からだ（うで + ふく + つるぎ） */}
      <div className="relative flex items-center">
        <div className="h-8 w-2.5 border-y-2 border-l-2 border-black bg-[#2b1e1a]"></div>
        <div
          className="flex h-10 w-12 justify-center border-2 border-black"
          style={{ backgroundColor: color }}
        >
          <div className="h-full w-4 border-x-2 border-black/20 bg-white"></div>
        </div>
        <div className="relative flex items-center">
          <div className="h-8 w-2.5 border-y-2 border-r-2 border-black bg-[#2b1e1a]"></div>
          <div className="absolute -top-3 left-1.5 flex flex-col items-center">
            <div className="h-7 w-2 border border-black bg-slate-300"></div>
            <div className="h-1.5 w-5 border border-black bg-slate-500"></div>
          </div>
        </div>
      </div>

      {/* あし */}
      <div className="flex w-12 justify-around gap-2">
        <div className="h-5 w-3 border-x-2 border-b-2 border-black bg-[#18181b]"></div>
        <div className="h-5 w-3 border-x-2 border-b-2 border-black bg-[#18181b]"></div>
      </div>
    </div>
  );
}
