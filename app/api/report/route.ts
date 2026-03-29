import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { submitReport } from '@/lib/reports';
import { updateBeachStatus } from '@/lib/beaches';

interface ReportBody {
  token: string;
  beach_id: string;
  status: 'clean' | 'moderate' | 'bad';
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReportBody;
    const { token, beach_id, status, notes } = body;

    if (!token || !beach_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: token, beach_id, status' },
        { status: 400 }
      );
    }

    if (!['clean', 'moderate', 'bad'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be clean, moderate, or bad' },
        { status: 400 }
      );
    }

    // Validate token against partners table
    const client = getServiceClient();
    const { data: partner, error: partnerError } = await client
      .from('partners')
      .select('id, name')
      .eq('token', token)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Invalid partner token' },
        { status: 401 }
      );
    }

    // Submit the report
    const report = await submitReport(beach_id, partner.id, status, notes);

    // Update beach status
    await updateBeachStatus(beach_id, status, 'partner');

    return NextResponse.json({
      success: true,
      report_id: report.id,
      partner_name: partner.name,
    });
  } catch (error) {
    console.error('Failed to submit report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
