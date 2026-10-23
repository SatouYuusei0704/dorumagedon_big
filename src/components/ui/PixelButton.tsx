type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** レトロゲーム風ボタン */
export function PixelButton({ className = "", ...props }: Props) {
  return (
    <button
      className={`pixel-border bg-lime-300 px-4 py-2 text-black active:translate-y-0.5 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
