import { NextRequest } from "next/server";

type Role = "user" | "assistant";
type Message = {
  role: Role | "system";
  content: string;
};

const OPENPIPE_URL = "https://app.openpipe.ai/api/v1/chat/completions";
const MODEL = "openpipe:fruity-brandon";

const SYSTEM_PROMPT = "Brandon is chatting with Leo on WhatsApp";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENPIPE_API_KEY;
    if (!apiKey) {
      return new Response("Missing OPENPIPE_API_KEY", { status: 500 });
    }

    const { messages } = (await req.json()) as { messages: { role: Role; content: string }[] };
    if (!Array.isArray(messages)) {
      return new Response("Invalid payload: messages[] required", { status: 400 });
    }

    const payload = {
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT } as Message,
        // Forward conversation as-is: user and assistant messages only
        ...messages.map((m) => ({ role: m.role, content: m.content } as Message)),
      ],
      temperature: 0,
      store: true,
    };

    const res = await fetch(OPENPIPE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(text || `Upstream error ${res.status}`, { status: 502 });
    }
    const data = (await res.json()) as any;
    const content: string | undefined = data?.choices?.[0]?.message?.content;
    if (!content) {
      return new Response("No content from model", { status: 502 });
    }

    return Response.json({ message: { role: "assistant", content } satisfies Message });
  } catch (e: any) {
    return new Response(e?.message || "Unexpected error", { status: 500 });
  }
}

