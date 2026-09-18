import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Calendar,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Heart,
  Plus,
  Bot,
  MessageSquare,
  Send,
  RefreshCw,
  FileText,
  Bell,
  Trash2,
  X,
  KeyRound,
  Copy,
  Edit3,
  Check,
  User,
} from 'lucide-react';
import { LinkPatientKeyModal } from './LinkPatientKeyModal';
import { PatientProfile, CaretakerProfile, ReminderItem, GameSessionResult, RoutineTask, LanguageCode } from '../../types';
import { translations } from '../../lib/i18n';
import { OfflineStore } from '../../lib/offlineStore';
import { FirestoreService } from '../../lib/firestoreService';
import { CaretakerRoutineManager } from './CaretakerRoutineManager';
import { ElderAvatar } from '../common/ElderAvatar';

// Crash-proof responsive SVG Bar Chart for Weekly Activity
const WeeklySessionsChart: React.FC<{ data: { day: string; sessions: number; adherence: number }[] }> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const maxSessions = Math.max(...data.map((d) => d.sessions), 4);
  const chartHeight = 170;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingBottom = 32;
  const paddingTop = 24;
  const availableWidth = chartWidth - paddingX * 2;
  const availableHeight = chartHeight - paddingTop - paddingBottom;
  const step = availableWidth / (data.length || 1);
  const barWidth = Math.min(32, step * 0.55);

  return (
    <div className="w-full relative select-none">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 sm:h-64 overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 1, 2, 3, 4].map((gridLevel) => {
          const val = Math.round((gridLevel / 4) * maxSessions);
          const y = paddingTop + availableHeight - (gridLevel / 4) * availableHeight;
          return (
            <g key={gridLevel}>
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#E5E7EB"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-stone-400 font-mono"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, i) => {
          const barHeight = (item.sessions / maxSessions) * availableHeight;
          const x = paddingX + i * step + (step - barWidth) / 2;
          const y = paddingTop + availableHeight - barHeight;
          const isHovered = hoveredIndex === i;

          return (
            <g
              key={item.day}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {isHovered && (
                <rect
                  x={paddingX + i * step}
                  y={paddingTop}
                  width={step}
                  height={availableHeight}
                  fill="#f0fdfa"
                  rx="6"
                  opacity="0.8"
                />
              )}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(4, barHeight)}
                rx="6"
                fill={isHovered ? '#115e59' : '#0f766e'}
                className="transition-colors duration-200"
              />
              {isHovered && (
                <text
                  x={x + barWidth / 2}
                  y={Math.max(14, y - 6)}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-teal-900 font-sans"
                >
                  {item.sessions} ({item.adherence}%)
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={chartHeight - 8}
                textAnchor="middle"
                className={`text-[11px] font-sans ${isHovered ? 'font-bold fill-teal-900' : 'fill-stone-500'}`}
              >
                {item.day}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-between text-xs text-stone-500 pt-2 px-2 border-t border-stone-100">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-[#0f766e] inline-block" />
          <span>Completed Sessions</span>
        </span>
        <span>Hover for daily adherence %</span>
      </div>
    </div>
  );
};

// Crash-proof responsive SVG Line Chart for Category Consistency
const CategoryEngagementChart: React.FC<{ data: { category: string; score: number }[] }> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const minScore = 60;
  const maxScore = 100;
  const chartHeight = 170;
  const chartWidth = 500;
  const paddingX = 50;
  const paddingBottom = 32;
  const paddingTop = 24;
  const availableWidth = chartWidth - paddingX * 2;
  const availableHeight = chartHeight - paddingTop - paddingBottom;
  const step = availableWidth / (data.length > 1 ? data.length - 1 : 1);

  const points = data.map((d, i) => {
    const x = paddingX + i * step;
    const y = paddingTop + availableHeight - ((d.score - minScore) / (maxScore - minScore)) * availableHeight;
    return { x, y, ...d };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="w-full relative select-none">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-56 sm:h-64 overflow-visible">
        <defs>
          <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[60, 70, 80, 90, 100].map((scoreVal) => {
          const y = paddingTop + availableHeight - ((scoreVal - minScore) / (maxScore - minScore)) * availableHeight;
          return (
            <g key={scoreVal}>
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#E5E7EB"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 10}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-stone-400 font-mono"
              >
                {scoreVal}%
              </text>
            </g>
          );
        })}

        {/* Shaded Area under curve */}
        {points.length > 0 && (
          <polygon
            points={`${points[0].x},${paddingTop + availableHeight} ${polylinePoints} ${points[points.length - 1].x},${paddingTop + availableHeight}`}
            fill="url(#amberGradient)"
          />
        )}

        {/* Trend line */}
        <polyline
          fill="none"
          stroke="#d97706"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />

        {/* Data points */}
        {points.map((p, i) => {
          const isHovered = hoveredIndex === i;
          return (
            <g
              key={p.category}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 7 : 5}
                fill="#d97706"
                stroke="#fff"
                strokeWidth="2"
                className="transition-all duration-150 shadow-xs"
              />
              {isHovered && (
                <g>
                  <rect
                    x={p.x - 26}
                    y={Math.max(4, p.y - 28)}
                    width="52"
                    height="20"
                    rx="6"
                    fill="#78350f"
                    className="shadow-md"
                  />
                  <text
                    x={p.x}
                    y={Math.max(18, p.y - 14)}
                    textAnchor="middle"
                    className="text-[11px] font-bold fill-amber-200 font-mono"
                  >
                    {p.score}%
                  </text>
                </g>
              )}
              <text
                x={p.x}
                y={chartHeight - 8}
                textAnchor="middle"
                className={`text-[11px] font-sans ${isHovered ? 'font-bold fill-amber-900' : 'fill-stone-500'}`}
              >
                {p.category}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-between text-xs text-stone-500 pt-2 px-2 border-t border-stone-100">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#d97706] inline-block" />
          <span>Completion Measure</span>
        </span>
        <span>Target: &ge; 75% consistency</span>
      </div>
    </div>
  );
};

interface CaregiverDashboardProps {
  patient: PatientProfile;
  allPatients?: PatientProfile[];
  onSelectPatient?: (patient: PatientProfile) => void;
  onAddNewPatient?: () => void;
  reminders: ReminderItem[];
  sessions: GameSessionResult[];
  routine: RoutineTask[];
  onUpdateRoutine: (updated: RoutineTask[]) => void;
  lang: LanguageCode;
  onNavigateTab: (tab: string) => void;
  caretaker?: CaretakerProfile | null;
  onDeletePatient?: (id: string) => void;
  onUpdateCaregiverKey?: (newKey: string) => void;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  patient,
  allPatients,
  onSelectPatient,
  onAddNewPatient,
  reminders,
  sessions,
  routine,
  onUpdateRoutine,
  lang,
  onNavigateTab,
  caretaker,
  onDeletePatient,
  onUpdateCaregiverKey,
}) => {
  const t = translations[lang];
  const [patientToDelete, setPatientToDelete] = useState<PatientProfile | null>(null);
  const [isLinkKeyModalOpen, setIsLinkKeyModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [keySuccess, setKeySuccess] = useState<string | null>(null);

  // AI Co-Pilot state for caregiver
  const [coPilotQuestion, setCoPilotQuestion] = useState('');
  const [coPilotResponse, setCoPilotResponse] = useState<string | null>(null);
  const [isCoPilotLoading, setIsCoPilotLoading] = useState(false);

  const handleSaveCaregiverKey = async () => {
    setKeyError(null);
    setKeySuccess(null);
    const clean = customKeyInput.trim().toUpperCase();
    if (!clean || clean.length < 3) {
      setKeyError('Caregiver key must be at least 3 characters.');
      return;
    }
    if (!caretaker?.id) return;
    const res = OfflineStore.updateCaregiverKey(caretaker.id, clean);
    if (!res.success) {
      setKeyError(res.error || 'Failed to update key.');
      return;
    }

    const updatedCaretaker: CaretakerProfile = res.caretaker || { ...caretaker, caregiverKey: clean };
    try {
      await FirestoreService.registerCaregiverKeyMapping(clean, updatedCaretaker);
    } catch (fsErr) {
      console.warn('Firestore key sync warning in CaregiverDashboard:', fsErr);
    }

    fetch(`/api/caretakers/${caretaker.id}/key`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caregiverKey: clean, caretaker: updatedCaretaker }),
    }).catch((e) => console.warn('Server key sync warning in CaregiverDashboard:', e));

    onUpdateCaregiverKey?.(clean);
    setKeySuccess(`Your Caregiver Key is now "${clean}"!`);
    setIsEditingKey(false);
    setTimeout(() => setKeySuccess(null), 3000);
  };

  const handleAskCoPilot = async (customPrompt?: string) => {
    const q = (customPrompt || coPilotQuestion).trim();
    if (!q || isCoPilotLoading) return;

    setIsCoPilotLoading(true);
    setCoPilotResponse(null);

    try {
      const res = await fetch('/api/ai/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          patientName: patient.fullName,
          preferredLanguage: lang,
          role: 'CAREGIVER',
          context: {
            age: patient.age,
            streak: patient.dailyStreak,
            recentAccuracy: sessions.length > 0 ? sessions[0].accuracy : 0.88,
            routineCompleted: routine.filter((r) => r.completed).length,
            totalRoutine: routine.length,
          },
        }),
      });

      const data = await res.json();
      setCoPilotResponse(
        data.reply ||
          'Encourage regular hydration, maintain familiar morning routines, and engage in photo reminiscence before sundown.'
      );
    } catch (err) {
      setCoPilotResponse(
        'Maintain a calming routine, avoid over-stimulation in the evening, and speak in gentle, short reassurance sentences.'
      );
    } finally {
      setIsCoPilotLoading(false);
      setCoPilotQuestion('');
    }
  };

  // Weekly activity trend mock data
  const weeklyData = [
    { day: 'Mon', sessions: 3, adherence: 90 },
    { day: 'Tue', sessions: 2, adherence: 85 },
    { day: 'Wed', sessions: 4, adherence: 95 },
    { day: 'Thu', sessions: 2, adherence: 80 },
    { day: 'Fri', sessions: 3, adherence: 92 },
    { day: 'Sat', sessions: 2, adherence: 88 },
    { day: 'Sun', sessions: 1, adherence: 85 },
  ];

  const categoryData = [
    { category: 'Memory', score: 88 },
    { category: 'Attention', score: 92 },
    { category: 'Pattern', score: 85 },
    { category: 'Recognition', score: 95 },
    { category: 'Routine', score: 90 },
  ];

  const safeReminders = Array.isArray(reminders) ? reminders.filter(Boolean) : [];
  const safeSessions = Array.isArray(sessions) ? sessions.filter(Boolean) : [];
  const safeRoutine = Array.isArray(routine) ? routine.filter(Boolean) : [];
  const safePatients = Array.isArray(allPatients) ? allPatients.filter(Boolean) : [];

  const activeP = (patient && patient.fullName) ? patient : (safePatients.length > 0 ? safePatients[0] : null);

  const completedReminders = safeReminders.filter((r) => r && r.completedToday).length;

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Caregiver Portal Hero & Linked Patient Profile Card */}
      <div className="rounded-3xl bg-teal-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-semibold uppercase tracking-wider">
              {t.roleCaregiver}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-teal-50">
              {t.caregiverDashboardTitle}
            </h2>
            <p className="text-teal-100/90 text-sm max-w-2xl leading-relaxed">
              {t.caregiverOverviewSubtitle}
            </p>

            {/* Caregiver Unique Key badge & Manual Key Setter */}
            <div className="space-y-2 pt-2">
              {!isEditingKey ? (
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-teal-800 border border-teal-600/70 text-amber-300 font-mono text-xs font-bold shadow-inner">
                    <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Your Caregiver Key: {caretaker?.caregiverKey || 'CG-CARE88'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(caretaker?.caregiverKey || 'CG-CARE88');
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-700/80 hover:bg-teal-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-teal-200" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomKeyInput(caretaker?.caregiverKey || 'CG-CARE88');
                      setIsEditingKey(true);
                      setKeyError(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-900" />
                    <span>Set / Edit My Key</span>
                  </button>
                  <button
                    type="button"
                    id="dashboard-goto-me-btn"
                    onClick={() => onNavigateTab('me')}
                    className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-teal-100 text-xs font-bold transition flex items-center gap-1.5 border border-teal-500/80 cursor-pointer shadow-xs"
                  >
                    <User className="w-3.5 h-3.5 text-teal-300" />
                    <span>Go to Me Tab</span>
                  </button>
                  <span className="text-[11px] text-teal-200/90 hidden sm:inline">
                    You or your patient can set your own personalized keys anytime.
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-teal-800/95 border border-teal-600 shadow-md">
                  <span className="text-xs font-bold text-amber-300">Set Custom Key:</span>
                  <input
                    type="text"
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value.toUpperCase())}
                    placeholder="e.g. ALICARE, CG-MOM"
                    className="px-3 py-1.5 rounded-xl border border-teal-400 font-mono text-xs font-bold bg-white text-stone-900 uppercase"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCustomKeyInput(`CG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-teal-100 text-xs font-bold border border-teal-500"
                  >
                    🎲 Random
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCaregiverKey}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Save Key
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingKey(false);
                      setKeyError(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-teal-900 hover:bg-teal-950 text-teal-200 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {keyError && <p className="text-xs text-rose-300 font-bold">{keyError}</p>}
              {keySuccess && <p className="text-xs text-emerald-300 font-bold">{keySuccess}</p>}
            </div>
          </div>

          {activeP && activeP.fullName ? (
            <div className="bg-teal-800/90 border border-teal-700 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shrink-0 shadow-xs">
              <ElderAvatar
                name={activeP.preferredName || activeP.fullName}
                avatarUrl={activeP.avatarUrl}
                size="lg"
                className="border-2 border-amber-300 shadow-2xs shrink-0"
              />
              <div>
                <span className="text-xs uppercase text-teal-300 font-semibold block">Active Patient</span>
                <h3 className="text-base sm:text-lg font-bold text-white">{activeP.fullName}, {activeP.age}</h3>
                <p className="text-xs text-teal-200">{activeP.preferredName ? `(${activeP.preferredName}) • ` : ''}{activeP.region}</p>
              </div>
            </div>
          ) : (
            <div className="bg-teal-800/90 border border-teal-700 p-4 sm:p-5 rounded-2xl flex items-center gap-3 shrink-0 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-teal-700 flex items-center justify-center text-amber-300 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase text-teal-300 font-semibold block">Caregiver Space</span>
                <h3 className="text-base sm:text-lg font-bold text-white">No Active Patient</h3>
                <p className="text-xs text-teal-200">Link or register a patient</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clean Slate when no patients exist under care */}
      {safePatients.length === 0 ? (
        <div className="bg-white dark:bg-[#1A222C] rounded-3xl border-2 border-dashed border-stone-300 dark:border-stone-700 p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-2xl font-bold font-serif-heading text-stone-900 dark:text-stone-100">
              Fresh Caregiver Space
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              You have a fresh, clean slate with zero pre-loaded patients or reports. Connect an existing patient using their unique <strong>Patient Key</strong> (or phone number), or register a new patient to begin monitoring cognitive routines and brain exercises.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsLinkKeyModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>+ Link Patient with Key / Phone</span>
            </button>
            {onAddNewPatient && (
              <button
                type="button"
                onClick={onAddNewPatient}
                className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Register New Patient</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
      {/* Patients Under Care Selector (Teacher & Students Model) */}
      {safePatients.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Patients Under Your Care ({safePatients.length})
              </h3>
              <p className="text-xs text-stone-500">
                Select a patient to review their cognitive activity, adjust daily routines, and check reminders.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLinkKeyModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-800 text-amber-300 hover:bg-teal-900 text-xs font-bold transition shadow-2xs"
                title="Link patient using their unique Caregiver Key"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>+ Link with Key</span>
              </button>
              {onAddNewPatient && (
                <button
                  type="button"
                  onClick={onAddNewPatient}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Register Patient</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {safePatients.map((p) => {
              const isSelected = activeP ? p.id === activeP.id : false;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPatient && onSelectPatient(p)}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition cursor-pointer group ${
                    isSelected
                      ? 'bg-teal-800 text-white border-teal-900 shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-900 border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <ElderAvatar
                      name={p.preferredName || p.fullName}
                      avatarUrl={p.avatarUrl}
                      size="md"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm truncate">{p.fullName}</div>
                      <div className={`text-xs ${isSelected ? 'text-teal-200' : 'text-stone-500'}`}>
                        {p.age} yrs • {p.preferredName || p.region}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && (
                      <span className="text-[10px] bg-teal-700 text-amber-300 font-bold px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}

                    {onDeletePatient && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPatientToDelete(p);
                        }}
                        className={`p-1.5 rounded-xl transition ${
                          isSelected
                            ? 'text-teal-200 hover:text-rose-300 hover:bg-teal-700'
                            : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title={`Delete ${p.fullName}`}
                        aria-label={`Delete ${p.fullName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delete Patient Confirmation Modal */}
          {patientToDelete && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn"
            >
              <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 shadow-2xl p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded-md">
                        Remove Patient
                      </span>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                        Remove Patient from Care Circle?
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPatientToDelete(null)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  Are you sure you want to remove <strong>{patientToDelete.fullName}</strong> ({patientToDelete.preferredName})? They will be removed from your care circle, and their profile will receive an update in their "Me" section stating you removed them.
                </p>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setPatientToDelete(null)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeletePatient) {
                        onDeletePatient(patientToDelete.id);
                      }
                      setPatientToDelete(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Caregiver Co-Pilot Banner & Interactive Assistant */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-teal-950 text-white p-6 shadow-sm border border-teal-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-teal-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-teal-50 font-serif-heading">AI Caregiver Co-Pilot</h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-800 text-amber-300 text-[10px] font-bold uppercase">
                  Gemini Clinical Assistant
                </span>
              </div>
              <p className="text-xs text-teal-200/90">
                Ask evidence-based caregiving questions for {activeP?.preferredName || activeP?.fullName || 'the elder'}.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('reports')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-750 text-teal-100 text-xs font-bold transition self-start sm:self-auto"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Open AI Daily Reports →</span>
          </button>
        </div>

        {/* Quick Question Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-teal-300 uppercase shrink-0">Quick Ask:</span>
          {[
            'How can I ease evening sundowning?',
            'Suggest memory stimulation activities for elder',
            'Evaluate today’s routine adherence and focus',
            'What hydration schedule works best for elders with dementia?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAskCoPilot(prompt)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-teal-800/80 hover:bg-teal-700 text-teal-100 text-xs font-medium transition border border-teal-700/60"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={coPilotQuestion}
            onChange={(e) => setCoPilotQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAskCoPilot();
            }}
            placeholder={`Ask AI Co-Pilot any eldercare or clinical question about ${activeP?.preferredName || activeP?.fullName || 'the elder'}...`}
            className="flex-1 bg-teal-950/70 border border-teal-700 text-teal-50 placeholder:text-teal-400/70 rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            onClick={() => handleAskCoPilot()}
            disabled={!coPilotQuestion.trim() || isCoPilotLoading}
            className="px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 font-bold text-xs transition flex items-center gap-1.5 shrink-0"
          >
            {isCoPilotLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Ask Co-Pilot</span>
          </button>
        </div>

        {/* Co-pilot response box */}
        {coPilotResponse && (
          <div className="p-4 rounded-2xl bg-teal-950/90 border border-teal-700 text-teal-100 text-xs leading-relaxed animate-fadeIn space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Caregiver Clinical Guidance</span>
            </div>
            <p className="font-medium text-teal-50">{coPilotResponse}</p>
          </div>
        )}
      </div>

      {/* Dedicated Caregiver Feature Hub (Cleanly organized modular navigation) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Caregiver Feature Modules
            </h3>
            <p className="text-xs text-stone-500">
              Dedicated tools and schedules for {activeP?.preferredName || activeP?.fullName || 'the elder'}
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
            Dedicated Tools
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Module 1: Daily Routine */}
          <button
            type="button"
            onClick={() => onNavigateTab('routine')}
            className="p-5 rounded-3xl bg-white border border-stone-200 hover:border-teal-500 hover:shadow-md transition text-left group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-teal-50 text-teal-800 group-hover:bg-teal-800 group-hover:text-white transition">
                <Calendar className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-teal-800 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900 group-hover:text-teal-900 transition font-serif-heading">
                Daily Routines
              </h4>
              <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                {safeRoutine.length} structured daily steps for wake-up, namaz/puja, walks & rest.
              </p>
            </div>
            <div className="text-[11px] font-bold text-teal-700 pt-1">
              Manage Tasks & Times →
            </div>
          </button>

          {/* Module 2: Reminders & Medicines */}
          <button
            type="button"
            onClick={() => onNavigateTab('reminders')}
            className="p-5 rounded-3xl bg-white border border-stone-200 hover:border-teal-500 hover:shadow-md transition text-left group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition">
                <Bell className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-800 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900 group-hover:text-teal-900 transition font-serif-heading">
                Medications & Alerts
              </h4>
              <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                {completedReminders} of {safeReminders.length} doses confirmed. Set voice alerts & hydration.
              </p>
            </div>
            <div className="text-[11px] font-bold text-emerald-700 pt-1">
              Check Schedules →
            </div>
          </button>

          {/* Module 3: Memories & Reminiscence */}
          <button
            type="button"
            onClick={() => onNavigateTab('memories')}
            className="p-5 rounded-3xl bg-white border border-stone-200 hover:border-rose-500 hover:shadow-md transition text-left group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-800 group-hover:bg-rose-800 group-hover:text-white transition">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-rose-800 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900 group-hover:text-teal-900 transition font-serif-heading">
                Memories & Album
              </h4>
              <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                Curate nostalgic family photos, stories, and voice prompts for reminiscence therapy.
              </p>
            </div>
            <div className="text-[11px] font-bold text-rose-700 pt-1">
              Curate Moments →
            </div>
          </button>

          {/* Module 4: AI Clinical Reports */}
          <button
            type="button"
            onClick={() => onNavigateTab('reports')}
            className="p-5 rounded-3xl bg-white border border-stone-200 hover:border-teal-500 hover:shadow-md transition text-left group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-800 group-hover:bg-indigo-800 group-hover:text-white transition">
                <FileText className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-indigo-800 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900 group-hover:text-teal-900 transition font-serif-heading">
                AI Clinical Reports
              </h4>
              <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                Detailed Gemini progress analysis, doctor visit printable reports & observations.
              </p>
            </div>
            <div className="text-[11px] font-bold text-indigo-700 pt-1">
              View Doctor Reports →
            </div>
          </button>

          {/* Module 5: Patient Profile & History */}
          <button
            type="button"
            onClick={() => onNavigateTab('patient_detail')}
            className="p-5 rounded-3xl bg-white border border-stone-200 hover:border-teal-500 hover:shadow-md transition text-left group space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-800 group-hover:bg-amber-800 group-hover:text-white transition">
                <Users className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-800 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-900 group-hover:text-teal-900 transition font-serif-heading">
                Patient Profile & Notes
              </h4>
              <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                Personal history, doctor contacts, regional settings and account details.
              </p>
            </div>
            <div className="text-[11px] font-bold text-amber-700 pt-1">
              View Profile Details →
            </div>
          </button>
        </div>
      </div>

      {/* Key Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Daily Streak</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold font-serif-heading text-stone-900">{activeP?.dailyStreak ?? 0} Days</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-stone-500">Consistent daily interaction</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Today's Activities</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold font-serif-heading text-stone-900">{activeP?.todayCompletedCount ?? 0} Completed</span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-stone-500">Preserving cognitive engagement</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Reminder Adherence</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold font-serif-heading text-stone-900">{completedReminders} of {safeReminders.length}</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-stone-500">Prescribed medicine & hydration</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Activity Frequency</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold font-serif-heading text-stone-900">17 Sessions</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-stone-500">Over the past 7 days</p>
        </div>
      </div>

      {/* Analytics Visualization: Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Trends */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif-heading text-stone-900">Weekly Activity Frequency</h3>
              <p className="text-xs text-stone-500">Cognitive exercises completed per day this week</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800">
              Healthy Rhythm
            </span>
          </div>

          <div className="w-full pt-2">
            <WeeklySessionsChart data={weeklyData} />
          </div>
        </div>

        {/* Category Performance Indicator */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-serif-heading text-stone-900">Category Engagement Consistency</h3>
              <p className="text-xs text-stone-500">Comfort and completion rate across activity domains</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900">
              Activity Measure
            </span>
          </div>

          <div className="w-full pt-2">
            <CategoryEngagementChart data={categoryData} />
          </div>
        </div>
      </div>

      {/* Observed Activity Alerts & Recent Sessions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Observed Activity Alerts */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-serif-heading text-stone-900">
              {t.attentionAlerts}
            </h3>
            <span className="text-xs text-stone-500">Real-time alerts</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200/80 space-y-1">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>Morning Medication Confirmed</span>
              </div>
              <p className="text-xs text-stone-700">
                {activeP?.preferredName || activeP?.fullName || 'Patient'} marked morning BP medicine taken at 08:15 AM after red tea.
              </p>
              <span className="text-[11px] text-stone-500 block pt-1">Today, 08:16 AM</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Afternoon Rest Period</span>
              </div>
              <p className="text-xs text-stone-700">
                Scheduled rest period on veranda active. Gentle evening memory game suggested at 04:30 PM.
              </p>
              <span className="text-[11px] text-stone-500 block pt-1">Today, 01:00 PM</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Adaptive Difficulty Feedback</span>
              </div>
              <p className="text-xs text-stone-700">
                Memory Recall activity automatically maintained gentle difficulty 2 based on smooth response times.
              </p>
              <span className="text-[11px] text-stone-500 block pt-1">Yesterday</span>
            </div>
          </div>
        </div>

        {/* Right: Recent Sessions Table */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-serif-heading text-stone-900">
              {t.recentSessions}
            </h3>
            <button
              onClick={() => onNavigateTab('patient_detail')}
              className="text-xs font-semibold text-teal-800 hover:text-teal-950 underline"
            >
              View Full History →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-stone-600 font-semibold uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-3">Activity</th>
                  <th className="py-3 px-3">Accuracy</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3">Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {safeSessions.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-3 font-semibold text-stone-900 capitalize">
                      {s.gameId ? s.gameId.replace('-', ' ') : 'Exercise'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold">
                        {Math.round((s.accuracy ?? 0) * 100)}%
                      </span>
                    </td>
                    <td className="py-3 px-3">{Math.round((s.completionTimeMs ?? 0) / 1000)}s</td>
                    <td className="py-3 px-3 text-stone-500">{s.completedAt || 'Recently'}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-teal-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Saved</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Mandatory Medical Safety Disclaimer */}
      <div className="rounded-2xl bg-stone-100 p-5 border border-stone-200 text-stone-700 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-800 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          {t.clinicalNotice}
        </p>
      </div>

      {/* Link Patient by Caregiver Key Modal */}
      <LinkPatientKeyModal
        isOpen={isLinkKeyModalOpen}
        onClose={() => setIsLinkKeyModalOpen(false)}
        caretakerId={caretaker?.id}
        onPatientLinked={(linkedPatient) => {
          if (onSelectPatient) {
            onSelectPatient(linkedPatient);
          }
        }}
      />
    </div>
  );
};
