import { getServiceClient } from './supabase';

export interface ConditionReport {
  id: string;
  beach_id: string;
  partner_id: string | null;
  status: 'clean' | 'moderate' | 'bad';
  notes: string | null;
  source: 'partner' | 'satellite' | 'crowdsource';
  reported_at: string;
}

export async function submitReport(
  beachId: string,
  partnerId: string,
  status: 'clean' | 'moderate' | 'bad',
  notes?: string
): Promise<ConditionReport> {
  const client = getServiceClient();
  const { data, error } = await client
    .from('condition_reports')
    .insert({
      beach_id: beachId,
      partner_id: partnerId,
      status,
      notes: notes || null,
      source: 'partner',
    })
    .select()
    .single();

  if (error) throw error;
  return data as ConditionReport;
}

export async function getLatestReport(beachId: string): Promise<ConditionReport | null> {
  const client = getServiceClient();
  const { data, error } = await client
    .from('condition_reports')
    .select('*')
    .eq('beach_id', beachId)
    .order('reported_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as ConditionReport | null;
}
