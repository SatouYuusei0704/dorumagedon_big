type Props = {
  title: string;
};

/** 画面上部の共通ヘッダー（タイトル） */
export function AppHeader({ title }: Props) {
  return (
    <header className="mb-3 rounded-lg border-2 border-black bg-[#0f172a] p-2 text-white">
      <h1 className="text-center text-sm font-bold tracking-wider text-[#facc15]">
        {title}
      </h1>
    </header>
  );
}
