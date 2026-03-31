import { useTranslations } from 'next-intl';
import Link from 'next/link';
import BeachMapClient from '@/components/BeachMapClient';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MapPage({ params }: PageProps) {
  const { locale } = await params;
  const t = useTranslations();
  const otherLocale = locale === 'fr' ? 'en' : 'fr';

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm z-10">
        <div>
          <h1 className="text-lg font-bold text-sky-600">{t('app.title')}</h1>
          <p className="text-xs text-gray-500 hidden sm:block">{t('app.subtitle')}</p>
        </div>
        <Link
          href={`/${otherLocale}`}
          className="px-2 py-1 text-xs font-medium text-sky-600 border border-sky-200 rounded hover:bg-sky-50 transition-colors"
        >
          {t(`language.${otherLocale}`)}
        </Link>
      </header>

      {/* Map */}
      <main className="flex-1 relative">
        <BeachMapClient locale={locale} />
      </main>
    </div>
  );
}
