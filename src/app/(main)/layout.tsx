import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function MainLayout() {
  const h = await headers();
  const url = h.get("x-invoke-path") ?? h.get("x-url") ?? "/";
  const pathname = url.startsWith("http") ? new URL(url).pathname : url;
  redirect(`/es${pathname || "/"}`);
}
