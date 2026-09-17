import React, { useState } from 'react';
import { KeyRound, ShieldCheck, CheckCircle2, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { OfflineStore } from '../../lib/offlineStore';
import { PatientProfile } from '../../types';

interface LinkPatientKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  caretakerId?: string;
  onPatientLinked: (patient: PatientProfile) => void;
}

export const LinkPatientKeyModal: React.FC<LinkPatientKeyModalProps> = ({
  isOpen,
  onClose,
  caretakerId,
  onPatientLinked,
}) => {
  const [caregiverKey, setCaregiverKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedKey = caregiverKey.trim().toUpperCase();
    if (!trimmedKey) {
      setError('Please enter the patient’s Caregiver Key.');
      return;
    }

    const currentCaretakerId = caretakerId || OfflineStore.getActiveCaretakerId() || 'caretaker-1';
    const result = OfflineStore.linkCaregiverToPatientByKey(currentCaretakerId, trimmedKey);

    if (!result.success || !result.patient) {
      setError(result.error || 'No patient found with that Caregiver Key. Please double check with the elder.');
      return;
    }

    onPatientLinked(result.patient);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-patient-key-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div className="w-full max-w-md my-6 rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                Secure Linking
              </span>
              <h2 id="link-patient-key-title" className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                Link Patient by Key
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          Enter the unique Caregiver Key for the patient (e.g. CG-CARE88) to link securely:
        </p>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLink} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="patient-key-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              Caregiver Key:
            </label>
            <input
              id="patient-key-input"
              type="text"
              required
              value={caregiverKey}
              onChange={(e) => setCaregiverKey(e.target.value.toUpperCase())}
              placeholder="e.g. CG-CARE88"
              className="w-full p-3 rounded-2xl border border-stone-300 dark:border-stone-600 font-mono font-bold tracking-widest text-base text-stone-900 dark:text-stone-100 uppercase focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Link Patient</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
