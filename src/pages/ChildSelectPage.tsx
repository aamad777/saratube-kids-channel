import { useNavigate } from "react-router-dom";
import ThemedLayout from "@/components/layout/ThemedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ChildSelectPage = () => {
  const navigate = useNavigate();
  const childName = localStorage.getItem("activeChildName");

  return (
    <ThemedLayout>
      <div className="container py-12 px-4">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Kids Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {childName ? (
              <p>Active child: <strong>{childName}</strong></p>
            ) : (
              <p>No child session active. Please login as a child.</p>
            )}
            <Button onClick={() => navigate("/kid-login")}>Child Login</Button>
          </CardContent>
        </Card>
      </div>
    </ThemedLayout>
  );
};

export default ChildSelectPage;
