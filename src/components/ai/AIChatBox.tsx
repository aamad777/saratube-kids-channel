import { useState } from "react";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

interface AIChatBoxProps {
  videoTitle?: string;
}

const AIChatBox = ({ videoTitle = "this video" }: AIChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hi there! 🌟 I'm Sara's AI helper! Ask me anything about ${videoTitle} and I'll help you understand it better!`,
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponses = [
        "That's a great question! 🎉 This video teaches us about creativity and having fun while learning!",
        "Wow, you're so curious! 🌈 Let me explain that in a fun way...",
        "I love that you're asking questions! 💖 Learning is an adventure!",
        "Great thinking! ⭐ Here's something cool about what you asked...",
      ];
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponses[Math.floor(Math.random() * botResponses.length)],
        isBot: true,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="bg-card rounded-3xl shadow-card overflow-hidden border border-border">
      {/* Header */}
      <div className="bg-gradient-hero p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-primary-foreground">
            Ask Sara's AI! 🤖
          </h3>
          <p className="text-sm text-primary-foreground/80">
            I can help you understand the video!
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.isBot ? "" : "justify-end"}`}
          >
            {msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-sara-purple-light flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-sara-purple" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.isBot
                  ? "bg-muted text-foreground rounded-tl-sm"
                  : "bg-primary text-primary-foreground rounded-tr-sm"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
            {!msg.isBot && (
              <div className="w-8 h-8 rounded-full bg-sara-pink-light flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-sara-pink" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-sara-purple-light flex items-center justify-center">
              <Bot className="h-4 w-4 text-sara-purple" />
            </div>
            <div className="bg-muted p-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
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
            placeholder="Ask me anything! 🌟"
            className="flex-1 rounded-full"
          />
          <Button type="submit" variant="hero" size="icon" className="rounded-full">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIChatBox;
