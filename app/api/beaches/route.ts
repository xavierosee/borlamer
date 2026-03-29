import { NextResponse } from 'next/server';
import { getBeaches } from '@/lib/beaches';

export async function GET() {
  try {
    const beaches = await getBeaches();
    return NextResponse.json(beaches);
  } catch (error) {
    console.error('Failed to fetch beaches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beaches' },
      { status: 500 }
    );
  }
}
