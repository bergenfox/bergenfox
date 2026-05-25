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
        model: gpt-image-1
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", JSON.stringify(data).slice(0, 500));

    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message || "OpenAI error", status: res.status }, { status: 500 });
    }

    return NextResponse.json({ url: data.data[0].url });
  } catch (err) {
    console.log("CATCH ERROR:", String(err));
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}