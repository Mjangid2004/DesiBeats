import { NextRequest, NextResponse } from "next/server";

const CORS_PROXIES = [
  "https://api.codetabs.com/v1/proxy",
  "https://corsproxy.io/?",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "Video ID required" }, { status: 400 });
  }

  let lastError = null;

  for (const proxy of CORS_PROXIES) {
    try {
      const streamUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const urlToFetch = proxy.includes("codetabs") 
        ? `${proxy}?quest=${encodeURIComponent(streamUrl)}`
        : `${proxy}${encodeURIComponent(streamUrl)}`;
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(urlToFetch, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        lastError = `Proxy returned ${response.status}`;
        continue;
      }

      const html = await response.text();

      const signatureMatch = html.match(/"signatureCipher".*?"url":"([^"]+)"/);
      if (signatureMatch) {
        const audioUrl = decodeURIComponent(signatureMatch[1].replace(/\\u0026/g, "&"));
        return NextResponse.json({ audioUrl, success: true, videoId });
      }

      const urlMatches = html.match(/,"url":"([^"]+)"/g);
      if (urlMatches) {
        for (const match of urlMatches) {
          const urlMatch = match.match(/,"url":"([^"]+)"/);
          if (urlMatch) {
            const audioUrl = decodeURIComponent(urlMatch[1].replace(/\\u0026/g, "&"));
            if (audioUrl.includes("googlevideo.com")) {
              return NextResponse.json({ audioUrl, success: true, videoId });
            }
          }
        }
      }

      const playerResponseUrl = html.match(/"playerResponseUrl":"([^"]+)"/);
      if (playerResponseUrl && playerResponseUrl[1]) {
        const playerUrl = decodeURIComponent(playerResponseUrl[1].replace(/\\u0026/g, "&"));
        const playerRes = await fetch(playerUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        const playerData = await playerRes.json();
        
        if (playerData.streamingData?.formats?.length > 0) {
          const format = playerData.streamingData.formats.find((f: any) => f.url) 
            || playerData.streamingData.formats[0];
          if (format?.url) {
            return NextResponse.json({ audioUrl: format.url, success: true, videoId });
          }
        }
      }
    } catch (error: any) {
      lastError = error.message;
      continue;
    }
  }

  return NextResponse.json({ 
    error: "No audio stream found",
    message: "This video may not allow audio extraction",
    videoId 
  }, { status: 404 });
}