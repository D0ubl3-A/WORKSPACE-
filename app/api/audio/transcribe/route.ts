import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GROQ_AUDIO_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

function getApiKey() {
  return process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
}

export async function POST(request: Request) {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 503 });
    }
    const form = await request.formData();
    const model = (form.get("model") as string) || "whisper-large-v3";
    const file = form.get("file") as File | null;
    const url = (form.get("url") as string) || "";
    if (!file && !url) {
      return NextResponse.json({ error: "Provide a file or url" }, { status: 400 });
    }

    const groqForm = new FormData();
    groqForm.append("model", model);
    const language = (form.get("language") as string) || "";
    const prompt = (form.get("prompt") as string) || "";
    if (language) groqForm.append("language", language);
    if (prompt) groqForm.append("prompt", prompt);
    if (url) groqForm.append("url", url);
    if (file) groqForm.append("file", file, (file as File).name || "audio.file");

    const groqRes = await fetch(GROQ_AUDIO_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: groqForm,
    });
    const data = await groqRes.json();
    if (!groqRes.ok) {
      const msg = data?.error?.message || data?.error || data?.msg || groqRes.statusText;
      return NextResponse.json({ error: msg, detail: data }, { status: groqRes.status || 502 });
    }
    return NextResponse.json({ text: data?.text || "", raw: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unexpected transcription error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
