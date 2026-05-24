import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "standard",
      }),
    });

    const text = await res.text();
    console.log("OpenAI raw response:", text);
    console.log("OpenAI status:", res.status);
    console.log("API key exists:", !!process.env.OPENAI_API_KEY);
    console.log("API key prefix:", process.env.OPENAI_API_KEY?.slice(0, 12));

    const data = JSON.parse(text);
    if (data.error) {
      return NextResponse.json({ error: data.error.message, code: data.error.code, type: data.error.type }, { status: 500 });
    }

    return NextResponse.json({ url: data.data[0].url });
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}