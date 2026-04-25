'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { Beach } from '@/lib/beaches';

type Status = 'clean' | 'moderate' | 'bad';

interface ReportPageProps {
  params: Promise<{ locale: string; token: string }>;
}

const statusConfig: { value: Status; emoji: string; colorClass: string }[] = [
  { value: 'clean', emoji: '🟢', colorClass: 'border-green-400 bg-green-50 hover:bg-green-100 text-green-800' },
  { value: 'moderate', emoji: '🟠', colorClass: 'border-orange-400 bg-orange-50 hover:bg-orange-100 text-orange-800' },
  { value: 'bad', emoji: '🔴', colorClass: 'border-red-400 bg-red-50 hover:bg-red-100 text-red-800' },
];

export default function ReportPage({ params: paramsPromise }: ReportPageProps) {
  const { locale, token } = use(paramsPromise);
  const t = useTranslations();
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBeach, setSelectedBeach] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/beaches')
      .then((res) => res.json())
      .then((data: Beach[]) => {
        setBeaches(data);
        setLoading(false);
      })
      .catch(() => {
        setError(t('report.error'));
        setLoading(false);
      });
  }, [t]);

  const handleSubmit = async () => {
    if (!selectedBeach || !selectedStatus) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          beach_id: selectedBeach,
          status: selectedStatus,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          setError(t('report.invalidToken'));
        } else {
          setError(data.error || t('report.error'));
        }
        return;
      }

      setSuccess(true);
      setSelectedBeach('');
      setSelectedStatus(null);
      setNotes('');
    } catch {
      setError(t('report.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const otherLocale = locale === 'fr' ? 'en' : 'fr';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-bold text-sky-600">{t('app.title')}</h1>
        <Link
          href={`/${otherLocale}/report/${token}`}
          className="px-2 py-1 text-xs font-medium text-sky-600 border border-sky-200 rounded hover:bg-sky-50"
        >
          {t(`language.${otherLocale}`)}
        </Link>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('report.title')}</h2>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {t('report.success')}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">{t('map.loading')}</p>
        ) : (
          <div className="space-y-5">
            {/* Beach selector */}
            <div>
              <label htmlFor="beach" className="block text-sm font-medium text-gray-700 mb-1">
                {t('report.selectBeach')}
              </label>
              <select
                id="beach"
                value={selectedBeach}
                onChange={(e) => {
                  setSelectedBeach(e.target.value);
                  setSuccess(false);
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              >
                <option value="">{t('report.selectBeach')}</option>
                {beaches.map((beach) => (
                  <option key={beach.id} value={beach.id}>
                    {locale === 'fr' && beach.name_fr ? beach.name_fr : beach.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status buttons */}
            {selectedBeach && (
              <div className="flex gap-2">
                {statusConfig.map(({ value, emoji, colorClass }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setSelectedStatus(value);
                      setSuccess(false);
                    }}
                    className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedStatus === value
                        ? `${colorClass} ring-2 ring-offset-1 ring-sky-400`
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-lg">{emoji}</span>
                    {t(`report.${value}`)}
                  </button>
                ))}
              </div>
            )}

            {/* Notes */}
            {selectedStatus && (
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('report.notes')}
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('report.notesPlaceholder')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                />
              </div>
            )}

            {/* Submit */}
            {selectedBeach && selectedStatus && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? t('report.submitting') : t('report.submit')}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
