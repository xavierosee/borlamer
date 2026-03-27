"use client";

import { useState } from "react";
import type { AlertLevel, Beach, SargassumReport } from "@/types";
import { ALERT_LEVEL_CONFIG } from "@/types";

interface ReportFormProps {
  beach: Beach;
  onSubmit: (report: SargassumReport) => void;
  onCancel: () => void;
}

export function ReportForm({ beach, onSubmit, onCancel }: ReportFormProps) {
  const [alertLevel, setAlertLevel] = useState<AlertLevel>("low");
  const [description, setDescription] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const report: SargassumReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      beachId: beach.id,
      alertLevel,
      description: description.trim() || undefined,
      photoUrl: photoPreview ?? undefined,
      createdAt: new Date().toISOString(),
      lat: beach.lat,
      lng: beach.lng,
    };

    onSubmit(report);
  }

  const levels = Object.entries(ALERT_LEVEL_CONFIG) as [
    AlertLevel,
    (typeof ALERT_LEVEL_CONFIG)[AlertLevel],
  ][];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-lg font-bold">
        Signaler — {beach.name}
      </h3>

      {/* Alert level selection */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          Niveau observé
        </legend>
        <div className="flex flex-wrap gap-2">
          {levels.map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => setAlertLevel(key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                alertLevel === key
                  ? "text-white shadow-md ring-2 ring-offset-1"
                  : "opacity-50 hover:opacity-75"
              }`}
              style={{
                backgroundColor: config.color,
              }}
            >
              {config.emoji} {config.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Photo upload */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
          Photo (optionnel)
        </label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-cyan-900 dark:file:text-cyan-300"
        />
        {photoPreview && (
          <img
            src={photoPreview}
            alt="Aperçu de la photo"
            className="mt-2 h-32 w-auto rounded-lg object-cover"
          />
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="report-description"
          className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
        >
          Description (optionnel)
        </label>
        <textarea
          id="report-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez ce que vous observez..."
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-cyan-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-cyan-700"
        >
          Envoyer le signalement
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium transition-colors hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
