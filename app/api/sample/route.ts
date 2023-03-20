import { fetchOpenAI } from "@/lib/openai";
import { NextResponse } from "next/server";

export const runtime = "experimental-edge";

async function getSampleText(message: string) {
  const body = {
    model: "gpt-3.5-turbo",
    temperature: 1.5,
    messages: [
      {
        role: "user",
        content: `Respond with a Markdown string only. Try to combine various headings (#, ##, ###). Please write a 300-word essay with a subtle, witty reference to this message: ${message}`,
      },
    ],
  };

  const response = await fetchOpenAI(body);

  return JSON.parse(JSON.stringify({ sample: response }));
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const message = formData.get("message") as string;

  if (!message) {
    return NextResponse.json({ message: "No message provided" });
  }

  const { sample } = await getSampleText(message);

  return NextResponse.json(sample);
}
