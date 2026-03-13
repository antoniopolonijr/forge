import WikiEditor from "@/components/wiki/wiki-editor";
import { stackServerApp } from "@/stack/server";

export default async function NewArticlePage() {
  await stackServerApp.getUser({ or: "redirect" });
  return <WikiEditor isEditing={false} initialImageUrls={[]} />;
}
