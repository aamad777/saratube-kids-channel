import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const API_URL = `${API_BASE_URL}/api/ai/parent-advisor`;

const AITestPage = () => {
  const [question, setQuestion] = useState("What videos are good for a 4 year old before bedtime?");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: question
            }
          ],
          childInfo: {
            name: "Sara",
            age: 4
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.response || "No response from AI.");
    } catch (error: any) {
      setAnswer(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>SaraTube Local AI Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This page tests: Frontend → backend-api → Ollama → Mistral.
          </p>

          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            placeholder="Ask the local AI..."
          />

          <Button onClick={askAI} disabled={loading}>
            {loading ? "Asking local AI..." : "Ask Local AI"}
          </Button>

          {answer && (
            <div className="rounded-lg border p-4 whitespace-pre-wrap">
              {answer}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AITestPage;
