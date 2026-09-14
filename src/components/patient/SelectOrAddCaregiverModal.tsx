import React, { useState } from 'react';
import { ShieldCheck, UserPlus, X, Phone, Heart, Check, Trash2, User, Mail } from 'lucide-react';
import { PatientProfile, CaretakerProfile, LanguageCode } from '../../types';
import { OfflineStore } from '../../lib/offlineStore';

interface SelectOrAddCaregiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onCaregiverLinked: (updatedPatient: PatientProfile) => void;
  lang?: LanguageCode;
}

export const SelectOrAddCaregiverModal: React.FC<SelectOrAddCaregiverModalProps> = ({
  isOpen,
  onClose,
  patient,
  onCaregiverLinked,
}) => {
  // New Caregiver Form
  const [fullName, setFullName] = useState('');
  const [relation, setRelation] = useState('Daughter');
  const [customRelation, setCustomRelation] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter the caregiver full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please enter a valid phone number.');
      return;
    }

    const resolvedRelation = relation === 'Other' ? (customRelation.trim() || 'Caregiver') : relation;

    const newCaretakerId = `caretaker-${Date.now()}`;
    const newCaretaker: CaretakerProfile = {
      id: newCaretakerId,
      fullName: fullName.trim(),
      relation: resolvedRelation,
      phone: phone.trim(),
      email: email.trim(),
      pin: pin.trim() || '1234',
      assignedPatientIds: [patient.id],
      avatarUrl: '',
    };

    OfflineStore.addCaretaker(newCaretaker);

    const updatedPatient: PatientProfile = {
      ...patient,
      caregiverName: `${fullName.trim()} (${resolvedRelation})`,
      caregiverPhone: phone.trim(),
      hasCaregiver: true,
    };

    OfflineStore.savePatient(updatedPatient);
    onCaregiverLinked(updatedPatient);
    onClose();
  };

  const handleSetSelfCare = () => {
    const updatedPatient: PatientProfile = {
      ...patient,
      caregiverName: '',
      caregiverPhone: patient.phone || '',
      hasCaregiver: false,
    };
    OfflineStore.savePatient(updatedPatient);
    onCaregiverLinked(updatedPatient);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="select-caregiver-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div className="w-full max-w-lg my-6 rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                Support Network
              </span>
              <h2 id="select-caregiver-title" className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                Link or Add Your Caregiver
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

        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          Add your family member, trusted neighbor, or health attendant's contact details so they can support you with reminders and daily routines.
        </p>

        {/* Currently Linked Caregiver if any */}
        {patient.hasCaregiver && patient.caregiverName && (
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                Currently Linked Caregiver
              </div>
              <div className="font-bold text-sm text-stone-900 dark:text-stone-100 mt-0.5">
                {patient.caregiverName}
              </div>
              {patient.caregiverPhone && (
                <div className="text-xs text-stone-600 dark:text-stone-400 font-mono">
                  {patient.caregiverPhone}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSetSelfCare}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1 shrink-0"
              title="Unlink caregiver"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Unlink</span>
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Add Caregiver Form */}
        <form onSubmit={handleAddNewSubmit} className="space-y-4 pt-1">
          <div className="space-y-1">
            <label htmlFor="caregiver-name" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              Caregiver Full Name *
            </label>
            <input
              id="caregiver-name"
              type="text"
              required
              placeholder="e.g. Debashree Gogoi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="caregiver-relation" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Relationship to You *
              </label>
              <select
                id="caregiver-relation"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
              >
                <option value="Daughter">Daughter</option>
                <option value="Son">Son</option>
                <option value="Spouse">Spouse</option>
                <option value="Granddaughter">Granddaughter</option>
                <option value="Grandson">Grandson</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Nurse / Attendant">Nurse / Attendant</option>
                <option value="Other">Other / Custom</option>
              </select>
            </div>

            {relation === 'Other' && (
              <div className="space-y-1">
                <label htmlFor="caregiver-custom-relation" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                  Specify Relationship *
                </label>
                <input
                  id="caregiver-custom-relation"
                  type="text"
                  placeholder="e.g. Niece, Caretaker"
                  value={customRelation}
                  onChange={(e) => setCustomRelation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
                />
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="caregiver-phone" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Phone Number *
              </label>
              <input
                id="caregiver-phone"
                type="text"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="caregiver-email" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Email Address (Optional)
              </label>
              <input
                id="caregiver-email"
                type="email"
                placeholder="caregiver@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820]"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="caregiver-pin" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                Security Gate PIN (4 Digits)
              </label>
              <input
                id="caregiver-pin"
                type="password"
                maxLength={4}
                placeholder="1234"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-medium text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50 dark:bg-[#121820] font-mono tracking-widest"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={handleSetSelfCare}
              className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 text-xs font-semibold underline transition"
            >
              No caregiver (Self-Care)
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-amber-300" />
                <span>Save & Link Caregiver</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
