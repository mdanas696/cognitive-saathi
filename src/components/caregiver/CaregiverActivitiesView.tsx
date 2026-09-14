import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Clock,
  Award,
  CheckCircle2,
  TrendingUp,
  Brain,
  Eye,
  Music,
  Heart,
  ShieldCheck,
  ChevronRight,
  Info,
} from 'lucide-react';
import { GameDefinition, PatientProfile, GameSessionResult, LanguageCode } from '../../types';

interface CaregiverActivitiesViewProps {
  patient: PatientProfile;
  games: GameDefinition[];
  sessions: GameSessionResult[];
  onPreviewGame: (game: GameDefinition) => void;
  lang?: LanguageCode;
}

export const CaregiverActivitiesView: React.FC<CaregiverActivitiesViewProps> = ({
  patient,
  games,
  sessions,
  onPreviewGame,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'All Exercises' },
    { id: 'MEMORY', label: 'Memory Recall' },
    { id: 'ATTENTION', label: 'Visual Focus' },
    { id: 'RECOGNITION', label: 'Heritage Recognition' },
  ];

  const filteredGames = games.filter(
    (g) => selectedCategory === 'ALL' || g.category === selectedCategory
  );

  // Stats calculation
  const totalCompleted = sessions.length;
  const avgAccuracy =
    sessions.length > 0
      ? Math.round(
          (sessions.reduce((acc, s) => acc + s.accuracy, 0) / sessions.length) * 100
        )
      : 88;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl bg-teal-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-semibold uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-amber-300" />
              <span>Cognitive Therapy & Workouts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-teal-50">
              Memory Workout & Brain Games
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 max-w-2xl leading-relaxed">
              Culturally grounded, stress-free cognitive stimulation tailored for {patient.preferredName || patient.fullName}. Preview exercises, monitor therapeutic domains, or guide an interactive session together.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 shrink-0 border-t md:border-t-0 md:border-l border-teal-800/80 pt-4 md:pt-0 md:pl-6">
            <div className="bg-teal-950/60 p-3.5 rounded-2xl border border-teal-800">
              <div className="text-xs text-teal-300 font-medium">Exercises Done</div>
              <div className="text-2xl font-bold text-white flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-5 h-5 text-amber-300" />
                <span>{totalCompleted}</span>
              </div>
            </div>
            <div className="bg-teal-950/60 p-3.5 rounded-2xl border border-teal-800">
              <div className="text-xs text-teal-300 font-medium">Avg. Accuracy</div>
              <div className="text-2xl font-bold text-amber-300 flex items-center gap-1.5 mt-1">
                <TrendingUp className="w-5 h-5 text-amber-300" />
                <span>{avgAccuracy}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-teal-800 text-white shadow-xs'
                : 'bg-white dark:bg-[#1A222C] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGames.map((game) => {
          const gameSessions = sessions.filter((s) => s.gameId === game.id);
          const lastSession = gameSessions[0];

          return (
            <div
              key={game.id}
              className="rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-700/50 transition"
            >
              <div className="space-y-3">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    {game.culturalTag || 'NER HERITAGE'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{game.estimatedMinutes || 3} min</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold font-serif-heading text-stone-900 dark:text-stone-100">
                    {game.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-1.5">
                    {game.shortDescription}
                  </p>
                </div>

                {/* Domain & Clinical Target */}
                <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
                  <span>
                    <strong>Clinical Target:</strong>{' '}
                    {game.category === 'MEMORY'
                      ? 'Short-term visual recognition & semantic recall'
                      : game.category === 'ATTENTION'
                      ? 'Sustained focus & visual discrimination'
                      : 'Audio-visual sensory stimulation'}
                  </span>
                </div>

                {/* Patient Performance Insight */}
                {lastSession ? (
                  <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400 pt-1">
                    <span>Last accuracy: <strong className="text-teal-700 dark:text-teal-400">{Math.round(lastSession.accuracy * 100)}%</strong></span>
                    <span>Completed: {lastSession.completedAt}</span>
                  </div>
                ) : (
                  <div className="text-xs text-stone-400 dark:text-stone-500 pt-1">
                    Ready for today's gentle session with {patient.preferredName}.
                  </div>
                )}
              </div>

              {/* Launch / Preview Button */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => onPreviewGame(game)}
                  className="w-full py-3 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs active:scale-98"
                >
                  <Play className="w-4 h-4 fill-current text-amber-300" />
                  <span>Preview & Test Exercise</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
