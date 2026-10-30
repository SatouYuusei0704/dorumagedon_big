import { redirect } from "next/navigation";

// 起動時はタイトル画面（/start）を最初に表示する
export default function Home() {
  redirect("/start");
}
