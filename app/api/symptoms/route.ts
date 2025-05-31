import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { symptom } = await req.json();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `What could be the cause of: ${symptom}` }] }],
      }),
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
