import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const AuthTestPage = () => {
  const [email, setEmail] = useState("parent1@saratube.local");
  const [password, setPassword] = useState("ParentPass123!");
  const [displayName, setDisplayName] = useState("Parent One");
  const [token, setToken] = useState("");
  const [result, setResult] = useState("");

  const register = async () => {
    setResult("Registering...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          displayName,
          role: "parent"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Register failed");
      }

      setToken(data.token || "");
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult(error.message || "Register error");
    }
  };

  const login = async () => {
    setResult("Logging in...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setToken(data.token || "");
      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult(error.message || "Login error");
    }
  };

  const me = async () => {
    setResult("Checking token...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Auth check failed");
      }

      setResult(JSON.stringify(data, null, 2));
    } catch (error: any) {
      setResult(error.message || "Auth check error");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>SaraTube Local Auth Test</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This temporary page tests: Frontend → backend-api auth → PostgreSQL.
          </p>

          <div className="space-y-2">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
            />

            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />

            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={register}>Register</Button>
            <Button onClick={login} variant="secondary">Login</Button>
            <Button onClick={me} variant="outline" disabled={!token}>Check /me</Button>
          </div>

          {token && (
            <div className="rounded-lg border p-3 text-xs break-all">
              Token saved in page state.
            </div>
          )}

          {result && (
            <pre className="rounded-lg border p-4 whitespace-pre-wrap text-xs overflow-auto">
              {result}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthTestPage;
