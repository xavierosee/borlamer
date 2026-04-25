'use client';

import dynamic from 'next/dynamic';

const BeachMap = dynamic(() => import('@/components/BeachMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <p className="text-gray-400 text-sm">Chargement...</p>
    </div>
  ),
});

export default function BeachMapClient({ locale }: { locale: string }) {
  return <BeachMap locale={locale} />;
}
