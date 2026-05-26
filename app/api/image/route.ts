import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, imageUrl } = await req.json();

    // If we have an NFT image URL, fetch it and use as reference
    if (imageUrl) {
      try {
        // Fetch the NFT image
        const imgRes = await fetch(imageUrl);
        if (imgRes.ok) {
          const imgBuffer = await imgRes.arrayBuffer();
          const imgBase64 = Buffer.from(imgBuffer).toString("base64");
          const contentType = imgRes.headers.get("content-type") || "image/png";

          // Use gpt-image-1 edit endpoint with the NFT as reference
          const formData = new FormData();
          
          // Convert base64 to blob for form data
          const byteArray = Buffer.from(imgBase64, "base64");
          const blob = new Blob([byteArray], { type: contentType });
          
          formData.append("image", blob, "nft.png");
          formData.append("prompt", prompt);
          formData.append("model", "gpt-image-1");
          formData.append("n", "1");
          formData.append("size", "1024x1024");

          const res = await fetch("https://api.openai.com/v1/images/edits", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: formData,
          });

          const data = await res.json();
          console.log("Edit API status:", res.status);
          console.log("Edit API response:", JSON.stringify(data).slice(0, 300));

          if (res.ok && data.data?.[0]?.b64_json) {
            return NextResponse.json({ b64: data.data[0].b64_json });
          }
          
          // Fall through to generation if edit fails
          console.log("Edit failed, falling back to generation");
        }
      } catch (imgErr) {
        console.log("Image fetch error, falling back:", String(imgErr));
      }
    }

    // Fallback: standard generation with detailed character description in prompt
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    const data = await res.json();
    console.log("Gen API status:", res.status);
    console.log("Gen API response:", JSON.stringify(data).slice(0, 300));

    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message || "OpenAI error" }, { status: 500 });
    }

    const b64 = data.data[0]?.b64_json;
    if (b64) return NextResponse.json({ b64 });
    return NextResponse.json({ url: data.data[0]?.url });

  } catch (err) {
    console.log("Route error:", String(err));
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
