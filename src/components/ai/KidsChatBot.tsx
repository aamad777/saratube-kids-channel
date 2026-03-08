import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kids-chat`;

const QUICK_PROMPTS = [
  "🎵 Music videos!",
  "🦁 Animals!",
  "🎨 Crafts!",
  "🚀 Science!",
  "🏎️ Cars!",
  "✨ Magic!",
];

const PetIcon = ({ size = 40, waving = false }: { size?: number; waving?: boolean }) => (
  <motion.div
    className="relative"
    style={{ width: size, height: size }}
  >
    {/* Penguin body */}
    <motion.div
      className="w-full h-full rounded-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center shadow-lg border-2 border-gray-700 relative overflow-hidden"
      animate={waving ? { rotate: [0, -3, 3, -3, 0] } : {}}
      transition={{ duration: 1.5, repeat: waving ? Infinity : 0, repeatDelay: 2 }}
    >
      {/* White belly */}
      <div
        className="absolute bg-white rounded-full"
        style={{
          width: size * 0.6,
          height: size * 0.55,
          bottom: size * 0.08,
        }}
      />
      {/* Eyes */}
      <div className="flex gap-[22%] absolute top-[25%]">
        <motion.div
          className="rounded-full bg-white"
          style={{ width: size * 0.18, height: size * 0.18 }}
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 5 }}
        >
          <div
            className="rounded-full bg-gray-900 absolute"
            style={{
              width: size * 0.1,
              height: size * 0.1,
              top: size * 0.04,
              left: size * 0.04,
            }}
          />
        </motion.div>
        <motion.div
          className="rounded-full bg-white"
          style={{ width: size * 0.18, height: size * 0.18 }}
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 5 }}
        >
          <div
            className="rounded-full bg-gray-900 absolute"
            style={{
              width: size * 0.1,
              height: size * 0.1,
              top: size * 0.04,
              left: size * 0.04,
            }}
          />
        </motion.div>
      </div>
      {/* Beak */}
      <div
        className="absolute"
        style={{
          width: 0,
          height: 0,
          top: "48%",
          borderLeft: `${size * 0.08}px solid transparent`,
          borderRight: `${size * 0.08}px solid transparent`,
          borderTop: `${size * 0.1}px solid #f59e0b`,
        }}
      />
    </motion.div>

    {/* Waving flipper */}
    <motion.div
      className="absolute bg-gray-800 rounded-full origin-top"
      style={{
        width: size * 0.18,
        height: size * 0.4,
        top: size * 0.35,
        right: -size * 0.06,
        borderRadius: "40%",
      }}
      animate={waving ? {
        rotate: [0, -30, 10, -30, 10, 0],
      } : { rotate: 0 }}
      transition={{ duration: 1, repeat: waving ? Infinity : 0, repeatDelay: 2 }}
    />
  </motion.div>
);

const KidsChatBot = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWaddling, setIsWaddling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Trigger waddle when assistant sends a new message
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (messages.length > prevMsgCount.current && lastMsg?.role === "assistant") {
      setIsWaddling(true);
      const timer = setTimeout(() => setIsWaddling(false), 1200);
      return () => clearTimeout(timer);
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  const streamChat = async (allMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed (${resp.status})`);
    }
    if (!resp.body) throw new Error("No response stream");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") return;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantSoFar += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantSoFar }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = { role: "user", content: messageText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(updatedMessages);
    } catch (e: any) {
      console.error("Kids chat error:", e);
      toast.error(e.message || "Oops! Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating pet button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 sm:bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center"
            aria-label="Open Buddy chat"
          >
            <PetIcon size={56} waving />
            <motion.span
              className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Hi! 👋
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)]"
          >
            <Card className="shadow-2xl border-2 border-primary/20 overflow-hidden rounded-3xl">
              {/* Header */}
              <div className={`bg-gradient-to-r ${theme.primary} p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <PetIcon size={36} waving />
                  <div>
                    <h3 className="font-display font-bold text-white text-sm">
                      Buddy 🐧
                    </h3>
                    <p className="text-[11px] text-white/80">
                      Your video finding friend!
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Chat content */}
              <ScrollArea className="h-[380px] p-4">
                <div ref={scrollRef} className="space-y-3">
                  {/* Welcome */}
                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex gap-2">
                        <div className="flex-shrink-0 mt-1">
                          <PetIcon size={28} />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 text-sm">
                          Waddle waddle! 🐧 Hi there, friend! I'm Buddy the penguin! I can help you find super fun videos to watch! 🌟 What do you feel like watching today?
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pl-9">
                        {QUICK_PROMPTS.map((prompt) => (
                          <Button
                            key={prompt}
                            variant="outline"
                            size="sm"
                            className="text-xs rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleSend(prompt)}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Messages */}
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0 mt-1">
                          <PetIcon size={28} />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading */}
                  {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex gap-2">
                      <div className="flex-shrink-0">
                        <PetIcon size={28} waving />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t border-border">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Buddy anything! 🐧"
                    className="flex-1 rounded-full text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full h-10 w-10 flex-shrink-0"
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KidsChatBot;
