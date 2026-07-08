import KidsChatBot from "@/components/ai/KidsChatBot";

const KidsAITestPage = () => {
  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold">SaraTube Kids AI Test</h1>
        <p className="text-muted-foreground">
          This temporary page tests KidsChatBot without child login.
        </p>
        <p className="text-sm text-muted-foreground">
          Click the floating penguin/chat button at the bottom-right and ask a safe question.
        </p>
      </div>

      <KidsChatBot />
    </div>
  );
};

export default KidsAITestPage;
