import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Placeholder — actual scraping of sargassummonitoring.com goes here
  console.log('Satellite cron triggered at', new Date().toISOString());

  return NextResponse.json({
    success: true,
    message: 'Satellite cron triggered',
    timestamp: new Date().toISOString(),
  });
}
