import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    // System prompt specifically for math tutoring
    const systemMessage = {
      role: "system",
      content: `You are an expert Math Assistant on an EdTech platform.
Your goal is to help students learn mathematics.
IMPORTANT RULES:
1. Do NOT give direct answers immediately.
2. Provide hints, step-by-step explanations, and ask leading questions to help the student arrive at the answer themselves.
3. Use clear formatting, bullet points, and markdown for math formulas where appropriate.
4. Keep a friendly, encouraging, and academic tone.`,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can switch to gpt-4 or gpt-4o if available
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ reply: response.choices[0].message }, { status: 200 });
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with AI Assistant. Ensure OPENAI_API_KEY is correct." },
      { status: 500 }
    );
  }
}
