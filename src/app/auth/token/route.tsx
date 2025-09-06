import { NextResponse } from 'next/server';
import { clientData } from '@/modules/clientData';

export async function POST(request: Request) {
  const data = await request.json();
  
  const tokenResponse = await fetch('https://anilist.co/api/v2/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: clientData.clientId,
      client_secret: clientData.clientSecret,
      redirect_uri: clientData.redirectUri,
      code: data.code,
    }),
  });

  const tokenData = await tokenResponse.json();
  return NextResponse.json(tokenData);
}
