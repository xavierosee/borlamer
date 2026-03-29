'use client';

import { useTranslations } from 'next-intl';

type Status = 'clean' | 'moderate' | 'bad' | 'unknown';

const statusColors: Record<Status, string> = {
  clean: 'bg-green-100 text-green-800 border-green-300',
  moderate: 'bg-orange-100 text-orange-800 border-orange-300',
  bad: 'bg-red-100 text-red-800 border-red-300',
  unknown: 'bg-gray-100 text-gray-600 border-gray-300',
};

export default function StatusBadge({ status }: { status: Status }) {
  const t = useTranslations('status');

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[status]}`}
    >
      {t(status)}
    </span>
  );
}
