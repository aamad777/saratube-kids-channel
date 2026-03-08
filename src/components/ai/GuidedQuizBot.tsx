import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, ChevronRight, Sparkles, Loader2, RotateCcw, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  emoji: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "How old is your child?",
    options: ["Under 2 years", "2-4 years", "5-7 years", "8-10 years", "11+ years"],
    emoji: "👶",
  },
  {
    id: 2,
    question: "What does your child enjoy the most?",
    options: ["Singing & dancing", "Drawing & crafts", "Animals & nature", "Science experiments", "Stories & reading"],
    emoji: "🎯",
  },
  {
    id: 3,
    question: "How does your child learn best?",
    options: ["Watching & listening", "Hands-on activities", "Repetition & practice", "Interactive games", "Through stories"],
    emoji: "📚",
  },
  {
    id: 4,
    question: "What's your child's energy level?",
    options: ["Very active & energetic", "Moderately active", "Calm & focused", "It varies throughout the day"],
    emoji: "⚡",
  },
  {
    id: 5,
    question: "When does your child usually watch videos?",
    options: ["Morning routine", "After school", "Before bedtime", "During meals", "Weekends mostly"],
    emoji: "🕐",
  },
  {
    id: 6,
    question: "What's your main goal for screen time?",
    options: ["Educational learning", "Entertainment & fun", "Calming & relaxation", "Creative inspiration", "A mix of everything"],
    emoji: "🎯",
  },
  {
    id: 7,
    question: "Does your child have any specific interests?",
    options: ["Dinosaurs & space", "Princesses & fairy tales", "Cars & robots", "Cooking & food", "Music & instruments"],
    emoji: "💡",
  },
  {
    id: 8,
    question: "How long does your child typically focus on one activity?",
    options: ["Less than 5 minutes", "5-10 minutes", "10-20 minutes", "20-30 minutes", "More than 30 minutes"],
    emoji: "⏱️",
  },
  {
    id: 9,
    question: "What concerns you most about screen time?",
    options: ["Too much time watching", "Not educational enough", "Inappropriate content", "Affecting sleep", "Reducing physical activity"],
    emoji: "🤔",
  },
  {
    id: 10,
    question: "What type of content do you prefer for your child?",
    options: ["Animated cartoons", "Real-life educational", "Music videos & songs", "DIY & activity guides", "Bedtime stories"],
    emoji: "📺",
  },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quiz-advisor`;

const GuidedQuizBot = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [resultText, setResultText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentQuestion, resultText, answers]);

  const handleAnswer = (answer: string) => {
    const q = QUIZ_QUESTIONS[currentQuestion];
    const newAnswers = [...answers, { question: q.question, answer }];
    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setQuizComplete(true);
      fetchSuggestions(newAnswers);
    }
  };

  const fetchSuggestions = async (quizAnswers: { question: string; answer: string }[]) => {
    setIsLoading(true);
    setShowResult(true);
    setResultText("");

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ answers: quizAnswers }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }
      if (!resp.body) throw new Error("No response stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullText = "";

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
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResultText(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error("Quiz advisor error:", e);
      toast.error(e.message || "Failed to get suggestions");
      setResultText("Sorry, I couldn't generate suggestions right now. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setResultText("");
    setQuizComplete(false);
  };

  const progress = ((answers.length) / QUIZ_QUESTIONS.length) * 100;

  return (
    <>
      {/* Floating chat button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r ${theme.primary} text-white shadow-xl flex items-center justify-center`}
          >
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
              AI
            </span>
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
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
          >
            <Card className="shadow-2xl border-2 border-primary/20 overflow-hidden">
              {/* Header */}
              <div className={`bg-gradient-to-r ${theme.primary} p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm">
                      Content Advisor 🤖
                    </h3>
                    <p className="text-[11px] text-white/80">
                      Answer questions, get personalized tips!
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

              {/* Progress bar */}
              <div className="h-1.5 bg-muted">
                <motion.div
                  className={`h-full bg-gradient-to-r ${theme.primary}`}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Chat content */}
              <ScrollArea className="h-[420px] p-4">
                <div ref={scrollRef}>
                <div className="space-y-4">
                  {/* Welcome message */}
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[85%]">
                      Hi! 👋 I'll help you find the perfect content for your child. Just answer these quick questions!
                    </div>
                  </div>

                  {/* Answered questions */}
                  {answers.map((a, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">{QUIZ_QUESTIONS[i].emoji}</span>
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[85%]">
                          {a.question}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 text-sm max-w-[85%]">
                          {a.answer}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Current question */}
                  {!quizComplete && (
                    <motion.div
                      key={currentQuestion}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">{QUIZ_QUESTIONS[currentQuestion].emoji}</span>
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[85%]">
                          <span className="text-[10px] text-muted-foreground block mb-1">
                            Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}
                          </span>
                          {QUIZ_QUESTIONS[currentQuestion].question}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pl-9">
                        {QUIZ_QUESTIONS[currentQuestion].options.map((opt) => (
                          <Button
                            key={opt}
                            variant="outline"
                            size="sm"
                            className="text-xs rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleAnswer(opt)}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Result */}
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[90%]">
                          {isLoading && !resultText && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Analyzing your answers...
                            </div>
                          )}
                          {resultText && (
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {resultText}
                            </div>
                          )}
                        </div>
                      </div>

                      {!isLoading && resultText && (
                        <div className="pl-9">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetQuiz}
                            className="gap-2 text-xs rounded-full"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Start Over
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
                </div>
              </ScrollArea>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GuidedQuizBot;
