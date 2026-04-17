import { NextRequest, NextResponse } from "next/server";
import { Song } from "@/lib/types";

const CORS_PROXIES = [
  "https://api.codetabs.com/v1/proxy",
  "https://corsproxy.io/?",
];

async function fetchWithProxies(url: string, timeout = 15000): Promise<string> {
  let lastError = null;
  
  for (const proxy of CORS_PROXIES) {
    try {
      const urlToFetch = proxy.includes("codetabs") 
        ? `${proxy}?quest=${encodeURIComponent(url)}`
        : `${proxy}${encodeURIComponent(url)}`;
      
      const controller = new AbortController();
      const setTimeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(urlToFetch, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: controller.signal,
      });

      clearTimeout(setTimeoutId);

      if (response.ok) {
        return await response.text();
      }
      lastError = `Status ${response.status}`;
    } catch (error: any) {
      lastError = error.message;
      continue;
    }
  }
  
  throw new Error(lastError || "All proxies failed");
}

function parseDuration(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(":").map(p => parseInt(p) || 0);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function parseYouTubeSearchResults(html: string): Song[] {
  const results: Song[] = [];
  
  const ytInitialDataMatch = html.match(/ytInitialData\s*=\s*({.*?});/s);
  
  if (ytInitialDataMatch) {
    try {
      const data = JSON.parse(ytInitialDataMatch[1]);
      const videos = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
      
      if (videos && Array.isArray(videos)) {
        for (const section of videos) {
          const items = section?.itemSectionRenderer?.contents;
          if (items && Array.isArray(items)) {
            for (const item of items) {
              const video = item?.videoRenderer;
              if (video?.videoId && video?.title?.runs?.[0]?.text) {
                const videoId = video.videoId;
                const title = video.title.runs[0].text;
                const channel = video.ownerText?.runs?.[0]?.text || "Unknown";
                const duration = video.lengthText?.simpleText || "0:00";
                
                results.push({
                  id: videoId,
                  title: title,
                  artist: channel,
                  thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                  duration: parseDuration(duration),
                  videoId: videoId,
                });
              }
            }
          }
        }
      }
    } catch (parseError) {
      console.error("Parse error:", parseError);
    }
  }
  
  if (results.length === 0) {
    const videoIdRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    let match;
    const foundIds = new Set<string>();
    
    while ((match = videoIdRegex.exec(html)) !== null) {
      const id = match[1];
      if (!foundIds.has(id)) {
        foundIds.add(id);
        results.push({
          id: id,
          title: "Song",
          artist: "YouTube",
          thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
          duration: 0,
          videoId: id,
        });
      }
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const genre = searchParams.get("genre");

  let searchQuery = query;

  if (!searchQuery && genre) {
    const genreQueries: Record<string, string> = {
      haryanvi: "haryanvi song official video 2024 new popular",
      bollywood: "bollywood song official video 2024 new",
      punjabi: "punjabi song official video 2024 new popular",
      rajasthani: "rajasthani song official video traditional",
      hiphop: "hip hop song 2024 new",
      lofi: "lofi song 2024 chill beats",
      trending: "top trending music 2024 india",
      mix: "hindi songs 2024 popular",
      folk: "india folk song traditional",
      bhojpuri: "bhojpuri song official video 2024 new",
      dj: "hindi dj song 2024 remix",
      old: "old hindi songs 90s 80s popular",
    };
    searchQuery = genreQueries[genre.toLowerCase()] || `${genre} music`;
  }

  if (!searchQuery) {
    searchQuery = "haryanvi song popular 2024";
  }

  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}&sp=EgIQAQ%3D%3D`;
    const html = await fetchWithProxies(searchUrl);
    const results = parseYouTubeSearchResults(html);

    return NextResponse.json({ 
      results: results.slice(0, 25),
      query: searchQuery 
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { videoId, artistName, songTitle } = body;
  
  if (!videoId) {
    return NextResponse.json({ results: [] });
  }

  const relatedQueries = [
    `${artistName || songTitle} songs similar`,
    `${songTitle} recommended songs`,
    `${songTitle} 2024 similar`,
  ];

  for (const query of relatedQueries) {
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%3D%3D`;
      const html = await fetchWithProxies(searchUrl);
      const results = parseYouTubeSearchResults(html);

      const filtered = results.filter((song: Song) => song.id !== videoId);
      
      if (filtered.length > 0) {
        return NextResponse.json({ results: filtered.slice(0, 10) });
      }
    } catch (error) {
      console.error("Related songs error:", error);
    }
  }

  return NextResponse.json({ results: [] });
}