import { redirect } from "next/navigation";

type ShortlinkPageProps = {
  params: { code: string };
};

const mockShortlinks: Record<string, string> = {
  yt: "https://youtube.com/@yourchannel",
  ig: "https://instagram.com/yourprofile"
};

export default function ShortlinkRedirectPage({ params }: ShortlinkPageProps) {
  const target = mockShortlinks[params.code];

  if (!target) {
    redirect("/");
  }

  redirect(target);
}