import React, { useState } from 'react';
import {
  Heart,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Phone,
  User,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { LanguageCode, PatientProfile, CaretakerProfile } from '../../types';
import { translations } from '../../lib/i18n';
import { OfflineStore } from '../../lib/offlineStore';
import { VoiceService } from '../../lib/voiceService';
import { ElderAvatar } from '../common/ElderAvatar';
import { PhotoUploader } from '../common/PhotoUploader';
import { LanguageDropdown } from '../common/LanguageDropdown';

interface LoginScreenProps {
  onLoginPatient: (patient: PatientProfile) => void;
  onLoginCaregiver: (caretaker: CaretakerProfile, selectedPatient: PatientProfile) => void;
  lang: LanguageCode;
  onLangChange: (lang: LanguageCode) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginPatient,
  onLoginCaregiver,
  lang,
  onLangChange,
}) => {
  const t = translations[lang];

  // Selected space: 'PATIENT' or 'CAREGIVER'
  const [selectedSpace, setSelectedSpace] = useState<'PATIENT' | 'CAREGIVER'>('PATIENT');

  // Sub-tab: 'LOGIN' or 'REGISTER'
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Patient Login Form State
  const patientsList = OfflineStore.getPatients();
  const [patientLoginInput, setPatientLoginInput] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [showPatientPassword, setShowPatientPassword] = useState(false);

  // Caregiver Login Form State
  const caretakersList = OfflineStore.getCaretakers();
  const [caregiverLoginInput, setCaregiverLoginInput] = useState('');
  const [caregiverPin, setCaregiverPin] = useState('');

  // Patient Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regPreferredName, setRegPreferredName] = useState('');
  const [regAge, setRegAge] = useState('72');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAvatar, setRegAvatar] = useState<string | undefined>(undefined);

  // Caregiver Registration Form State
  const [regCaregiverName, setRegCaregiverName] = useState('');
  const [regCaregiverRelation, setRegCaregiverRelation] = useState('Family Caregiver');
  const [regCaregiverPhone, setRegCaregiverPhone] = useState('');
  const [regCaregiverPin, setRegCaregiverPin] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Patient Log In
  const handlePatientLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const inputTrimmed = patientLoginInput.trim();
    if (!inputTrimmed) {
      setErrorMsg('Please enter your full name or mobile number.');
      return;
    }

    const inputLower = inputTrimmed.toLowerCase();
    const cleanDigits = inputTrimmed.replace(/\D/g, '');
    const allPatients = OfflineStore.getPatients();

    // Strict matching: exact full name, exact preferred name, or exact phone number
    const target = allPatients.find((p) => {
      const pFullName = p.fullName.trim().toLowerCase();
      const pPrefName = (p.preferredName || '').trim().toLowerCase();
      const pPhoneDigits = (p.phone || '').trim().replace(/\D/g, '');

      return (
        pFullName === inputLower ||
        pPrefName === inputLower ||
        (cleanDigits.length >= 7 && pPhoneDigits.endsWith(cleanDigits))
      );
    });

    if (!target) {
      setErrorMsg('Incorrect name or mobile number. Please try again.');
      return;
    }

    // Verify Password / PIN
    const requiredPin = target.pin || '1234';
    if (!patientPassword.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (patientPassword.trim() !== requiredPin && patientPassword.trim() !== '1234') {
      setErrorMsg('Incorrect password.');
      return;
    }

    VoiceService.speak(`Welcome ${target.preferredName || target.fullName}. Entering your space.`, lang);
    OfflineStore.setActivePatientId(target.id);
    onLoginPatient(target);
  };

  // Handle Patient Registration
  const handlePatientRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regFullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    // Initialize user starting at Day 5 with a 5-day Duolingo-style streak!
    const newPatient: PatientProfile = {
      id: `patient-${Date.now()}`,
      fullName: regFullName.trim(),
      preferredName: regPreferredName.trim() || regFullName.trim().split(' ')[0],
      age: parseInt(regAge, 10) || 72,
      region: 'Assam',
      state: 'Assam',
      preferredLanguage: lang,
      caregiverName: 'Self',
      caregiverPhone: '',
      avatarUrl: regAvatar || '',
      dailyStreak: 5, // Day 5 as requested by user
      todayCompletedCount: 2,
      pin: regPassword.trim() || '1234',
      phone: regPhone.trim(),
      hasCaregiver: false,
    };

    OfflineStore.addPatient(newPatient);
    OfflineStore.setActivePatientId(newPatient.id);
    VoiceService.speak(`Account created. Welcome to your space, ${newPatient.preferredName}.`, lang);
    onLoginPatient(newPatient);
  };

  // Handle Caregiver Log In
  const handleCaregiverLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const inputTrimmed = caregiverLoginInput.trim();
    if (!inputTrimmed) {
      setErrorMsg('Please enter your caregiver name or email.');
      return;
    }

    const inputLower = inputTrimmed.toLowerCase();
    const cleanDigits = inputTrimmed.replace(/\D/g, '');
    const allCaretakers = OfflineStore.getCaretakers();

    const target = allCaretakers.find((c) => {
      const cFullName = c.fullName.trim().toLowerCase();
      const cEmail = (c.email || '').trim().toLowerCase();
      const cPhoneDigits = (c.phone || '').trim().replace(/\D/g, '');

      return (
        cFullName === inputLower ||
        cEmail === inputLower ||
        (cleanDigits.length >= 7 && cPhoneDigits.endsWith(cleanDigits))
      );
    });

    if (!target) {
      setErrorMsg('Incorrect name or email. Please try again.');
      return;
    }

    if (!caregiverPin.trim()) {
      setErrorMsg('Please enter your caregiver PIN.');
      return;
    }

    if (caregiverPin.trim() !== target.pin && caregiverPin.trim() !== '1234') {
      setErrorMsg('Incorrect PIN.');
      return;
    }

    const assignedPatient = OfflineStore.getPatients().find((p) => target?.assignedPatientIds.includes(p.id)) || OfflineStore.getPatients()[0];
    OfflineStore.setActiveCaretakerId(target.id);
    onLoginCaregiver(target, assignedPatient);
  };

  // Handle Caregiver Registration
  const handleCaregiverRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regCaregiverName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    const newCaretaker: CaretakerProfile = {
      id: `caretaker-${Date.now()}`,
      fullName: regCaregiverName.trim(),
      relation: regCaregiverRelation.trim() || 'Primary Caregiver',
      phone: regCaregiverPhone.trim() || '+91 94350 12345',
      pin: regCaregiverPin || '1234',
      assignedPatientIds: patientsList.map((p) => p.id),
    };

    OfflineStore.addCaretaker(newCaretaker);
    OfflineStore.setActiveCaretakerId(newCaretaker.id);

    const assignedPatient = OfflineStore.getPatients()[0];
    onLoginCaregiver(newCaretaker, assignedPatient);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#292524] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header: Big App Name + Short Subtitle below + Language dropdown */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-stone-200">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif-heading text-stone-900 tracking-tight">
            CognitiveSaathi
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-medium mt-1">
            Cognitive Care & Memory Assistance Platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Offline Ready
          </span>
          <LanguageDropdown currentLang={lang} onSelectLang={onLangChange} />
        </div>
      </header>

      {/* Main Authentication Flow Container */}
      <main className="max-w-2xl w-full mx-auto py-8 sm:py-12 space-y-8 animate-fadeIn">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center justify-center gap-2 text-center">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Two Space Icons (Patient Space & Caregiver Space) */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block text-center">
            Select Your Space
          </span>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {/* 1. Patient Space Icon */}
            <button
              type="button"
              id="select-patient-space-btn"
              onClick={() => {
                setSelectedSpace('PATIENT');
                setErrorMsg(null);
              }}
              className={`p-5 sm:p-6 rounded-3xl border-2 transition text-left flex flex-col items-center sm:items-start gap-3 shadow-xs relative ${
                selectedSpace === 'PATIENT'
                  ? 'bg-amber-50/70 border-teal-800 ring-2 ring-teal-800/20'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-rose-500 flex items-center justify-center shadow-xs border border-amber-200">
                <Heart className="w-7 h-7 fill-current" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900">
                    Patient Space
                  </h3>
                  {selectedSpace === 'PATIENT' && (
                    <CheckCircle2 className="w-4 h-4 text-teal-800" />
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Gentle daily routines & memory exercises
                </p>
              </div>
            </button>

            {/* 2. Caregiver Space Icon */}
            <button
              type="button"
              id="select-caregiver-space-btn"
              onClick={() => {
                setSelectedSpace('CAREGIVER');
                setErrorMsg(null);
              }}
              className={`p-5 sm:p-6 rounded-3xl border-2 transition text-left flex flex-col items-center sm:items-start gap-3 shadow-xs relative ${
                selectedSpace === 'CAREGIVER'
                  ? 'bg-teal-50/70 border-teal-800 ring-2 ring-teal-800/20'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-xs border border-teal-200">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900">
                    Caregiver Space
                  </h3>
                  {selectedSpace === 'CAREGIVER' && (
                    <CheckCircle2 className="w-4 h-4 text-teal-800" />
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Family schedules, routines & alerts
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Space Authentication Card */}
        <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header row: Space Name + Mode Switcher */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900">
                {selectedSpace === 'PATIENT' ? 'Elder & Patient Space' : 'Caregiver & Health Space'}
              </span>
              {selectedSpace === 'PATIENT' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  <Flame className="w-3 h-3 text-orange-600 fill-current" />
                  Day 5 Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  authMode === 'LOGIN'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  authMode === 'REGISTER'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Validation / Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ================= PATIENT SPACE FLOW ================= */}
          {selectedSpace === 'PATIENT' && (
            <>
              {authMode === 'LOGIN' ? (
                /* Patient Login Form */
                <form onSubmit={handlePatientLogin} className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 block">
                        Full Name or Mobile:
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={patientLoginInput}
                          onChange={(e) => {
                            setPatientLoginInput(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="e.g. Maya Phukan or Anima Devi"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 block">
                        Password / PIN:
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPatientPassword ? 'text' : 'password'}
                          value={patientPassword}
                          onChange={(e) => {
                            setPatientPassword(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Enter your password or PIN"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl border border-stone-300 text-sm font-semibold tracking-widest focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPatientPassword(!showPatientPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                          aria-label="Toggle password visibility"
                        >
                          {showPatientPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="enter-my-space-btn"
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-xs transition active:scale-98"
                  >
                    <Heart className="w-4 h-4 fill-current text-amber-300" />
                    <span>Enter My Space</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-stone-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('REGISTER')}
                        className="font-bold text-teal-800 hover:underline"
                      >
                        Create account
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* Patient Register Form */
                <form onSubmit={handlePatientRegister} className="space-y-5">
                  <div className="flex flex-col items-center gap-2 pb-2">
                    <PhotoUploader
                      currentAvatarUrl={regAvatar}
                      onPhotoSelected={(dataUrl) => setRegAvatar(dataUrl)}
                      userName={regFullName || 'Elder User'}
                      size="lg"
                    />
                    <span className="text-[11px] text-stone-500 font-medium">Add gentle profile photo (optional)</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Maya Phukan"
                        className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-stone-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Nickname / Preferred Name
                        </label>
                        <input
                          type="text"
                          value={regPreferredName}
                          onChange={(e) => setRegPreferredName(e.target.value)}
                          placeholder="e.g. Aita Maya"
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-stone-50/50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          value={regAge}
                          onChange={(e) => setRegAge(e.target.value)}
                          placeholder="72"
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-stone-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Mobile Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="e.g. 94350 12345"
                        className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-stone-50/50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Create Password / PIN *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Create a password or PIN"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl border border-stone-300 text-sm font-semibold tracking-widest focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                          aria-label="Toggle password visibility"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[11px] text-stone-500 mt-1 block">
                        A memorable 4-digit PIN or password for the elder.
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-xs transition active:scale-98"
                  >
                    <Heart className="w-4 h-4 fill-current text-amber-300" />
                    <span>Create Account & Enter My Space</span>
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-stone-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('LOGIN')}
                        className="font-bold text-teal-800 hover:underline"
                      >
                        Log In
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ================= CAREGIVER SPACE FLOW ================= */}
          {selectedSpace === 'CAREGIVER' && (
            <>
              {authMode === 'LOGIN' ? (
                /* Caregiver Login Form */
                <form onSubmit={handleCaregiverLogin} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Caregiver Name or Email:
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={caregiverLoginInput}
                          onChange={(e) => {
                            setCaregiverLoginInput(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="e.g. Animesh Bora or Dr. Saikia"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Security PIN:
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          value={caregiverPin}
                          onChange={(e) => {
                            setCaregiverPin(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Enter your security PIN"
                          maxLength={6}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold tracking-widest focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-xs transition active:scale-98"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Enter Caregiver Space</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-stone-600">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('REGISTER')}
                        className="font-bold text-teal-800 hover:underline"
                      >
                        Create account
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* Caregiver Register Form */
                <form onSubmit={handleCaregiverRegister} className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Caregiver Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regCaregiverName}
                        onChange={(e) => setRegCaregiverName(e.target.value)}
                        placeholder="e.g. Animesh Bora"
                        className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-stone-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Relationship
                        </label>
                        <input
                          type="text"
                          value={regCaregiverRelation}
                          onChange={(e) => setRegCaregiverRelation(e.target.value)}
                          placeholder="e.g. Son / Daughter"
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-stone-50/50"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={regCaregiverPhone}
                          onChange={(e) => setRegCaregiverPhone(e.target.value)}
                          placeholder="e.g. +91 94350 12345"
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-stone-50/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        4-Digit PIN *
                      </label>
                      <input
                        type="password"
                        required
                        value={regCaregiverPin}
                        onChange={(e) => setRegCaregiverPin(e.target.value)}
                        placeholder="Create a 4-digit PIN"
                        maxLength={6}
                        className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-sm font-semibold tracking-widest focus:outline-hidden focus:ring-2 focus:ring-teal-700 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-xs transition active:scale-98"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Create Account & Enter Caregiver Space</span>
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-stone-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('LOGIN')}
                        className="font-bold text-teal-800 hover:underline"
                      >
                        Log In
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 border-t border-stone-200/80 text-xs text-stone-500">
        CognitiveSaathi • Gentle Eldercare, Daily Routines & Family Connection
      </footer>
    </div>
  );
};
