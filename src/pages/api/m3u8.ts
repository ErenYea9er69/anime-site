import { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';
import http from 'http';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, headers: headersParam } = req.query;
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';

  try {
    const targetUrl = new URL(url as string);
    const headers = {
      "User-Agent": userAgent
    };

    if (headersParam) {
      const additionalHeaders = JSON.parse(decodeURIComponent(headersParam as string));
      Object.entries(additionalHeaders).forEach(([key, value]) => {
        if (!["Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers"].includes(key)) {
          headers[key as keyof typeof headers] = value as string;
        }
      });    }

    if (targetUrl.pathname.endsWith('.m3u8')) {
      const response = await fetch(targetUrl, { headers });
      let m3u8Content = await response.text();
      
      const baseUrl = encodeURIComponent(targetUrl.origin + targetUrl.pathname.replace(/[^/]+\.m3u8$/, '').trim());
      m3u8Content = m3u8Content.split('\n').map(line => {
        if (line.startsWith('#') || line.trim() === '') return line;
        return `/api/proxy/m3u8?url=${baseUrl}${encodeURIComponent(line)}${headersParam ? `&headers=${encodeURIComponent(headersParam as string)}` : ''}`;
      }).join('\n');

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      return res.status(200).send(m3u8Content);
    }

    if (targetUrl.pathname.endsWith('.ts')) {
      const protocol = targetUrl.protocol === 'https:' ? https : http;
      const proxyReq = protocol.request(targetUrl, { headers }, (proxyRes) => {
        res.setHeader('Content-Type', 'video/mp2t');
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (error) => {
        res.status(500).json({ error: error.message });
      });

      proxyReq.end();
      return;
    }

    const response = await fetch(targetUrl, { headers });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
    return res.status(200).send(await response.text());

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Proxy request failed' });
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
