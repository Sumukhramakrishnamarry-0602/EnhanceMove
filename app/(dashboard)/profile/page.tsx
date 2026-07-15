import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";
import { NotificationPrefsForm } from "@/components/profile/notification-prefs-form";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/onboarding/profile");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Profile &amp; settings</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUploader avatarUrl={profile.avatar_url} name={profile.full_name} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile info</CardTitle>
          <CardDescription>Update your name, role, company, and timezone.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Choose a strong password you don&apos;t use elsewhere.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control which emails you receive from EnhanceMove.</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPrefsForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
