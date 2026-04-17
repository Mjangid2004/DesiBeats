import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const title = searchParams.get("title");
  const artist = searchParams.get("artist");

  if (!title) {
    return NextResponse.json({ lyrics: null });
  }

  const placeholderLyrics = `♪ ♫ ♪

${title}
${artist}

♪ ♫ ♪

🎤 Lyrics coming soon...

This feature uses placeholder lyrics. 
In a full version, lyrics would be fetched from a lyrics API.

♪ ♫ ♪`;

  return NextResponse.json({ lyrics: placeholderLyrics });
}