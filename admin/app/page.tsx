import { redirect } from "next/navigation";

export default function Home() {
  redirect("/pages/articles");
}
