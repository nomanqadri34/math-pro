"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AssistantPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there! I'm your AI Math Assistant. You can ask me to solve problems, explain concepts, or generate practice questions. I'll guide you step-by-step!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (status === "loading") {
    return <PageWrapper className="flex items-center justify-center">Loading...</PageWrapper>;
  }

  if (status === "unauthenticated") {
    return (
      <PageWrapper className="flex items-center justify-center">
        <div className="text-center max-w-md p-12 bg-white rounded-[3rem] shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Login Required</h2>
          <p className="text-slate-600 mb-8">Please log in to access your personal AI Math Assistant and start solving problems step-by-step.</p>
          <div className="flex flex-col gap-3">
            <Link href="/login?callbackUrl=/assistant">
              <Button size="lg" className="w-full">Sign In to Continue</Button>
            </Link>
            <Link href="/register">
              <Button variant="ghost" className="w-full">Create an Account</Button>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages.filter(m => m.role !== "system"), userMsg],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [...prev, data.reply]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error.message || "Failed to get a response."}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper className="bg-slate-50">
      <div className="container mx-auto px-4 max-w-4xl py-12 flex-grow flex flex-col">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <Bot className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Math AI Tutor</h1>
          <p className="text-slate-600">Your personal guide for step-by-step math problem solving.</p>
        </div>

        <div className="flex-grow flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
          {/* Chat History */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {messages.map((msg, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  msg.role === "user" ? "bg-accent/10" : "bg-primary/10"
                }`}>
                  {msg.role === "user" ? (
                      <User className="w-5 h-5 text-accent" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-primary" />
                  )}
                </div>
                
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === "user" 
                    ? "bg-accent text-white rounded-tr-sm" 
                    : "bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200"
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSubmit} className="flex gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a math question (e.g., How do I solve 2x + 5 = 15?)"
                className="flex-grow bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-14"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1.5 bottom-1.5 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
