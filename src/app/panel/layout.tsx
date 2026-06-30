import { gerekliOturum } from "@/lib/auth";
import { Shell } from "@/components/shell";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email, profile } = await gerekliOturum();

  return (
    <Shell
      rol={profile.rol}
      adSoyad={profile.ad_soyad ?? email?.split("@")[0] ?? "Kullanıcı"}
      email={email}
    >
      {children}
    </Shell>
  );
}
