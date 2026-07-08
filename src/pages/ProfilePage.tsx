import ThemedLayout from "@/components/layout/ThemedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfilePage = () => {
  const user = localStorage.getItem("saratube_user");
  const parsedUser = user ? JSON.parse(user) : null;

  return (
    <ThemedLayout>
      <div className="container py-12 px-4">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Local Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email:</strong> {parsedUser?.email || "Not signed in"}</p>
            <p><strong>Role:</strong> {parsedUser?.role || "-"}</p>
            <p className="text-muted-foreground">
              Profile editing will be connected to local backend later.
            </p>
          </CardContent>
        </Card>
      </div>
    </ThemedLayout>
  );
};

export default ProfilePage;
