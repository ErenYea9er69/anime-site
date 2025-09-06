import type { NextApiRequest, NextApiResponse } from 'next'
import https from "https";
import http from "http";

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (!req.query.url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }
  
      const url = new URL(req.query.url as string);
    const headersParam = decodeURIComponent(req.query.headers as string || "");
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';

    const headers = {
      "User-Agent": userAgent
    };

    if (headersParam) {
      const additionalHeaders = JSON.parse(headersParam);
      Object.entries(additionalHeaders).forEach(([key, value]) => {
        if (!["Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers"].includes(key)) {
          headers[key as keyof typeof headers] = value as string;
        }
      });    }

    if (url.pathname.endsWith(".m3u8")) {
      const response = await fetch(url, { headers });
      const modifiedM3u8 = (await response.text())
        .split("\n")
        .map((line) => {
          if (line.startsWith("#") || line.trim() === '') return line;
          const targetUrlTrimmed = encodeURIComponent(url.origin + url.pathname.replace(/[^/]+\.m3u8$/, "").trim());
          return `/api/proxy?url=${targetUrlTrimmed}${encodeURIComponent(line)}${headersParam ? `&headers=${encodeURIComponent(headersParam)}` : ""}`;
        })
        .join("\n");

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(200).send(modifiedM3u8);
    }

    else if (url.pathname.endsWith(".ts")) {
        const protocol = url.protocol === 'https:' ? https : http;
        const options = {
          hostname: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: url.pathname + url.search,
          method: 'GET',
          headers
        };
      
        const proxy = protocol.request(options, (response) => {
          res.setHeader("Content-Type", "video/mp2t");
          res.setHeader("Access-Control-Allow-Origin", "*");
          
          response.pipe(res);
          
          response.on('error', (error) => {
            console.error('Response error:', error);
            if (!res.headersSent) {
              res.status(500).json({ error: 'Stream error' });
            }
          });
        });
      
        req.on('close', () => {
          proxy.destroy();
        });
      
        proxy.on('error', (error) => {
          console.error('Proxy error:', error);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Proxy request failed' });
          }
        });
      
        proxy.end();
        return;
      }
      

    else {
        const response = await fetch(url, { 
          headers,
          method: req.method,
          body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });
  
        const contentType = response.headers.get("Content-Type");
        res.setHeader("Content-Type", contentType || "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
  
        if (contentType?.includes('application/json')) {
          return res.status(response.status).json(await response.json());
        } else {
          return res.status(response.status).send(await response.text());
        }
      }
  
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
