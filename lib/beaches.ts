import { getPublicClient, getServiceClient } from './supabase';

export interface Beach {
  id: string;
  name: string;
  name_fr: string | null;
  lat: number;
  lng: number;
  island: string;
  current_status: 'clean' | 'moderate' | 'bad' | 'unknown';
  last_updated: string | null;
  last_report_source: 'partner' | 'satellite' | 'crowdsource' | null;
  created_at: string;
}

export async function getBeaches(): Promise<Beach[]> {
  const client = getPublicClient();
  const { data, error } = await client
    .from('beaches')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Beach[];
}

export async function updateBeachStatus(
  beachId: string,
  status: 'clean' | 'moderate' | 'bad',
  source: 'partner' | 'satellite' | 'crowdsource'
) {
  const client = getServiceClient();
  const { error } = await client
    .from('beaches')
    .update({
      current_status: status,
      last_updated: new Date().toISOString(),
      last_report_source: source,
    })
    .eq('id', beachId);

  if (error) throw error;
}
