import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar profile={profile} email={user.email ?? ""} />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
