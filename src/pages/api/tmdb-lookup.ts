import type { NextApiRequest, NextApiResponse } from "next";

const KNOWN_TMDB_MAPPINGS: Record<string, string> = {
  "113417": "95897", // Overflow
  "10851": "85552",  // Euphoria
  "320": "200753",   // Kite
  "1639": "100412",  // Boku no Pico
  "101374": "93782", // Yarichin Bitch-bu
};

function extractIds(html: string, pattern: RegExp): string[] {
  const ids: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    if (match[1] && ids.indexOf(match[1]) === -1) {
      ids.push(match[1]);
    }
  }
  return ids;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, title, type } = req.query;

  if (!title && !id) {
    return res.status(400).json({ error: "Missing title or id" });
  }

  // Check known mapping by ID first
  if (id && KNOWN_TMDB_MAPPINGS[id as string]) {
    return res.status(200).json({ tmdbId: KNOWN_TMDB_MAPPINGS[id as string], source: "known" });
  }

  const queryTitle = (title as string || "")
    .replace(/[^\w\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!queryTitle) {
    return res.status(200).json({ tmdbId: null });
  }

  const searchType = type === "movie" ? "movie" : "tv";

  try {
    const response = await fetch(
      `https://www.themoviedb.org/search/${searchType}?query=${encodeURIComponent(queryTitle)}`,
      {
        signal: AbortSignal.timeout(4000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          Accept: "text/html",
        },
      }
    );

    if (!response.ok) {
      return res.status(200).json({ tmdbId: null });
    }

    const html = await response.text();
    const pattern = searchType === "movie" ? /\/movie\/(\d+)/g : /\/tv\/(\d+)/g;
    const ids = extractIds(html, pattern);

    if (ids.length > 0) {
      return res.status(200).json({ tmdbId: ids[0], source: "search" });
    }

    // If TV search had no result, try movie search as fallback
    if (searchType === "tv") {
      const movieRes = await fetch(
        `https://www.themoviedb.org/search/movie?query=${encodeURIComponent(queryTitle)}`,
        {
          signal: AbortSignal.timeout(3000),
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            Accept: "text/html",
          },
        }
      );
      if (movieRes.ok) {
        const movieHtml = await movieRes.text();
        const movieIds = extractIds(movieHtml, /\/movie\/(\d+)/g);
        if (movieIds.length > 0) {
          return res.status(200).json({ tmdbId: movieIds[0], isMovie: true, source: "fallback_movie" });
        }
      }
    }

    return res.status(200).json({ tmdbId: null });
  } catch (error) {
    console.error("TMDB lookup error:", error);
    return res.status(200).json({ tmdbId: null });
  }
}
