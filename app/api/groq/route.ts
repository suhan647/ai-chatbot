import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const data = await groqRes.json();
    return NextResponse.json(data, { status: groqRes.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from Groq' }, { status: 500 });
  }
} 