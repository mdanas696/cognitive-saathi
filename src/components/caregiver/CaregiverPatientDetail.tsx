import React, { useState } from 'react';
import {
  User,
  Calendar,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart,
  FileText,
  Plus,
  ShieldAlert,
  Lock,
  KeyRound,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { PatientProfile, GameSessionResult, RoutineTask, LanguageCode } from '../../types';
import { translations } from '../../lib/i18n';
import { OfflineStore } from '../../lib/offlineStore';
import { CaretakerRoutineManager } from './CaretakerRoutineManager';
import { ElderAvatar } from '../common/ElderAvatar';

interface CaregiverPatientDetailProps {
  patient: PatientProfile;
  sessions: GameSessionResult[];
  routine: RoutineTask[];
  onUpdateRoutine?: (updated: RoutineTask[]) => void;
  lang: LanguageCode;
  onLockToPatient?: () => void;
  onAddNewPatient?: () => void;
}

export const CaregiverPatientDetail: React.FC<CaregiverPatientDetailProps> = ({
  patient,
  sessions,
  routine,
  onUpdateRoutine,
  lang,
  onLockToPatient,
  onAddNewPatient,
}) => {
  const t = translations[lang];
  const [notes, setNotes] = useState<string[]>([
    'Patient was very happy recalling family memories this morning.',
    'Completed Morning BP tablet promptly with warm tea.',
    'Enjoyed looking at cultural artifacts during Memory Recall exercise.',
  ]);
  const [newNote, setNewNote] = useState('');

  // Caregiver PIN management
  const [pinValue, setPinValue] = useState<string>(() => OfflineStore.getCaregiverPin());
  const [pinSavedMsg, setPinSavedMsg] = useState<string | null>(null);

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinValue.trim().length === 4) {
      OfflineStore.setCaregiverPin(pinValue.trim());
      setPinSavedMsg('Security PIN updated successfully!');
      setTimeout(() => setPinSavedMsg(null), 3000);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes([newNote.trim(), ...notes]);
    setNewNote('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Patient Summary Header Card */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <ElderAvatar
              name={patient.preferredName || patient.fullName}
              avatarUrl={patient.avatarUrl}
              size="xl"
              className="border-2 border-teal-700 shadow-xs shrink-0"
            />
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-serif-heading text-stone-900">
                {patient.fullName} ({patient.preferredName})
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-700" /> {patient.age} years old
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" /> {patient.region}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-teal-700" /> Caregiver: {patient.caregiverName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t sm:border-t-0 sm:border-l border-stone-200 pt-3 sm:pt-0 sm:pl-6">
            {onAddNewPatient && (
              <button
                type="button"
                onClick={onAddNewPatient}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition shadow-xs"
                title="Register a new patient under your care"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Add Patient</span>
              </button>
            )}

            <div className="text-left sm:text-right">
              <span className="text-xs text-stone-500 uppercase font-semibold">Streak</span>
              <p className="text-xl font-bold text-amber-700">{patient.dailyStreak} Active Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Routine Status & Recent Session History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Routine Adherence Checklist */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-lg font-bold font-serif-heading text-stone-900">
            Today's Routine Check
          </h3>

          <div className="space-y-2.5">
            {routine.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${r.completed ? 'bg-emerald-600' : 'bg-stone-300'}`} />
                  <span className={`font-semibold ${r.completed ? 'text-stone-900' : 'text-stone-600'}`}>
                    {r.title}
                  </span>
                </div>
                <span className="text-stone-500 font-medium shrink-0 ml-2">{r.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cognitive Session Activity History */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-lg font-bold font-serif-heading text-stone-900">
            Cognitive Activity Log
          </h3>

          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-stone-900 capitalize">
                      {s.gameId.replace('-', ' ')}
                    </h4>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 font-medium">
                      Level {s.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Completed at {s.completedAt} • Duration: {Math.round(s.completionTimeMs / 1000)}s
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold text-emerald-800">
                    {Math.round(s.accuracy * 100)}%
                  </span>
                  <span className="text-[10px] text-stone-400 block">Accuracy</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Routine Management for this Patient */}
      {onUpdateRoutine && (
        <CaretakerRoutineManager
          patient={patient}
          routine={routine}
          onUpdateRoutine={onUpdateRoutine}
        />
      )}

      {/* Caregiver Observation Notes Log */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-800" />
            <h3 className="text-lg font-bold font-serif-heading text-stone-900">
              Caregiver Observation Notes
            </h3>
          </div>
          <span className="text-xs text-stone-500">For family & clinician reference</span>
        </div>

        <form onSubmit={handleAddNote} className="flex gap-3">
          <input
            type="text"
            placeholder="Add an observation (e.g., Patient was cheerful during morning walk)..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 p-3 rounded-2xl border border-stone-300 bg-stone-50 text-sm text-stone-900 focus:outline-teal-700"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-teal-800 text-white text-sm font-bold hover:bg-teal-900 transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </form>

        <div className="space-y-2 pt-2">
          {notes.map((note, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800">
              {note}
            </div>
          ))}
        </div>
      </div>

      {/* Caregiver Security Lock & PIN Configuration Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/70 border-2 border-amber-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-amber-300 flex items-center justify-center shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  Elder-Safe Kiosk Mode
                </span>
              </div>
              <h3 className="text-lg font-bold font-serif-heading text-stone-900">
                Caregiver Security Gate & PIN
              </h3>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
          The patient view is permanently secured so elderly dementia patients cannot access clinical configurations or switch roles by accident. To access the Caregiver Portal from the patient device, the 4-digit PIN below is required.
        </p>

        <form onSubmit={handleSavePin} className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-2xl px-4 py-2.5 shadow-2xs">
            <KeyRound className="w-4 h-4 text-stone-400" />
            <label htmlFor="caregiver-pin-input" className="text-xs font-bold text-stone-600">
              PIN:
            </label>
            <input
              id="caregiver-pin-input"
              type="text"
              maxLength={4}
              pattern="[0-9]{4}"
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              className="w-20 font-mono text-base font-bold text-stone-900 tracking-widest text-center focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={pinValue.trim().length !== 4}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs transition shadow-2xs"
          >
            Update PIN
          </button>

          {pinSavedMsg && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{pinSavedMsg}</span>
            </span>
          )}
        </form>
      </div>
    </div>
  );
};
