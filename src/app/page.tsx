import { PixelButton } from "@/components/ui/PixelButton";
import { PixelWindow } from "@/components/ui/PixelWindow";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-6">
      <h1 className="text-center text-3xl">すれ違い広場</h1>
      <PixelWindow title="ようこそ！">
        <p>近くの人とすれ違って、くだものを集めよう。</p>
      </PixelWindow>
      <PixelButton>はじめる</PixelButton>
    </main>
  );
}
