type Props = {
  title?: string;
  children: React.ReactNode;
};

/** 3DS風のドット絵ウィンドウ枠 */
export function PixelWindow({ title, children }: Props) {
  return (
    <section className="pixel-border bg-white p-4 text-black">
      {title && <h2 className="mb-2 text-lg">{title}</h2>}
      {children}
    </section>
  );
}
