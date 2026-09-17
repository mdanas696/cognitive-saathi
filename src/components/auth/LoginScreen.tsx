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
  KeyRound,
  Compass,
  Check,
} from 'lucide-react';
import { LanguageCode, PatientProfile, CaretakerProfile } from '../../types';
import { translations } from '../../lib/i18n';
import { OfflineStore } from '../../lib/offlineStore';
import { VoiceService } from '../../lib/voiceService';
import { ElderAvatar } from '../common/ElderAvatar';
import { PhotoUploader } from '../common/PhotoUploader';
import { LanguageDropdown } from '../common/LanguageDropdown';
import { ForgotPinModal } from './ForgotPinModal';

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
  const [patientLoginInput, setPatientLoginInput] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [showPatientPassword, setShowPatientPassword] = useState(false);

  // Caregiver Login Form State
  const [caregiverLoginInput, setCaregiverLoginInput] = useState('');
  const [caregiverPin, setCaregiverPin] = useState('');
  const [showCaregiverPin, setShowCaregiverPin] = useState(false);

  // Patient Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regPreferredName, setRegPreferredName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regAge, setRegAge] = useState('72');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAvatar, setRegAvatar] = useState<string | undefined>(undefined);

  // Caregiver Registration Form State
  const [regCaregiverName, setRegCaregiverName] = useState('');
  const [regCaregiverUsername, setRegCaregiverUsername] = useState('');
  const [regCaregiverRelation, setRegCaregiverRelation] = useState('Daughter');
  const [regCaregiverPhone, setRegCaregiverPhone] = useState('');
  const [regCaregiverEmail, setRegCaregiverEmail] = useState('');
  const [regCaregiverPin, setRegCaregiverPin] = useState('');
  const [regCaregiverKey, setRegCaregiverKey] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Handle Patient Log In (STRICT: No universal 1234 bypass)
  const handlePatientLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const inputTrimmed = patientLoginInput.trim();
    if (!inputTrimmed) {
      setErrorMsg('Please enter your full name, username, or mobile number.');
      return;
    }

    const inputLower = inputTrimmed.toLowerCase();
    if (inputLower.includes('anima') || inputLower.includes('aita')) {
      setErrorMsg('No account found with those details. Please check your username or mobile number.');
      return;
    }

    const cleanDigits = inputTrimmed.replace(/\D/g, '');
    const allPatients = OfflineStore.getPatients();

    if (allPatients.length === 0) {
      setErrorMsg('No accounts registered yet. Click "Create Account" to register.');
      return;
    }

    // Strict matching
    const target = allPatients.find((p) => {
      const pFullName = p.fullName.trim().toLowerCase();
      const pPrefName = (p.preferredName || '').trim().toLowerCase();
      const pUsername = (p.username || '').trim().toLowerCase();
      const pPhoneDigits = (p.phone || '').trim().replace(/\D/g, '');

      return (
        pFullName === inputLower ||
        pPrefName === inputLower ||
        pUsername === inputLower ||
        (cleanDigits.length >= 7 && pPhoneDigits.endsWith(cleanDigits))
      );
    });

    if (!target) {
      setErrorMsg('No patient account found with those details. Please check spelling or create an account.');
      return;
    }

    if (!patientPassword.trim()) {
      setErrorMsg('Please enter your password or security PIN.');
      return;
    }

    // STRICT: Match target's actual password or pin only. No global '1234' bypass!
    const validCredentials = [target.password, target.pin].filter(Boolean);
    const entered = patientPassword.trim();

    if (!validCredentials.includes(entered)) {
      setErrorMsg('Incorrect password or PIN. Use "Forgot PIN?" below if you need assistance.');
      return;
    }

    // Persist session across refresh and re-open
    OfflineStore.saveAuthSession({
      role: 'PATIENT',
      patientId: target.id,
      userName: target.username || target.fullName,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    VoiceService.speak(`Welcome ${target.preferredName || target.fullName}. Entering your space.`, lang);
    OfflineStore.setActivePatientId(target.id);
    onLoginPatient(target);
  };

  // Handle Patient Registration
  const handlePatientRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const fullNameTrim = regFullName.trim();
    if (!fullNameTrim) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const usernameTrim = (regUsername.trim() || fullNameTrim.toLowerCase().replace(/\s+/g, ''));
    if (!usernameTrim) {
      setErrorMsg('Please enter a username.');
      return;
    }

    // Check if username already exists
    const allPatients = OfflineStore.getPatients();
    const isDuplicateUsername = allPatients.some(
      (p) => (p.username || '').toLowerCase() === usernameTrim.toLowerCase()
    );
    if (isDuplicateUsername) {
      setErrorMsg('Username already exists');
      return;
    }

    if (!regPassword.trim() || regPassword.trim().length < 4) {
      setErrorMsg('Please create a password or PIN at least 4 characters long.');
      return;
    }

    const newPatient: PatientProfile = {
      id: `patient-${Date.now()}`,
      fullName: fullNameTrim,
      preferredName: regPreferredName.trim() || fullNameTrim.split(' ')[0],
      username: usernameTrim,
      age: parseInt(regAge, 10) || 72,
      region: 'Assam',
      state: 'Assam',
      preferredLanguage: lang,
      caregiverName: 'Self',
      caregiverPhone: '',
      linkedCaregiverKey: '',
      avatarUrl: regAvatar || '',
      dailyStreak: 1,
      todayCompletedCount: 0,
      password: regPassword.trim(),
      pin: regPassword.trim(),
      phone: regPhone.trim(),
      hasCaregiver: false,
    };

    OfflineStore.addPatient(newPatient);
    OfflineStore.setActivePatientId(newPatient.id);
    OfflineStore.saveAuthSession({
      role: 'PATIENT',
      patientId: newPatient.id,
      userName: newPatient.username || newPatient.fullName,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    VoiceService.speak(`Account created. Welcome to your space, ${newPatient.preferredName}.`, lang);
    onLoginPatient(newPatient);
  };

  // Handle Caregiver Log In (STRICT: No universal 1234 bypass)
  const handleCaregiverLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const inputTrimmed = caregiverLoginInput.trim();
    if (!inputTrimmed) {
      setErrorMsg('Please enter your caregiver username, email, or mobile.');
      return;
    }

    const inputLower = inputTrimmed.toLowerCase();
    const cleanDigits = inputTrimmed.replace(/\D/g, '');
    const allCaretakers = OfflineStore.getCaretakers();

    if (allCaretakers.length === 0) {
      setErrorMsg('No caregiver accounts registered yet. Click "Create Account" to register.');
      return;
    }

    const target = allCaretakers.find((c) => {
      const cFullName = c.fullName.trim().toLowerCase();
      const cEmail = (c.email || '').trim().toLowerCase();
      const cUsername = (c.username || '').trim().toLowerCase();
      const cPhoneDigits = (c.phone || '').trim().replace(/\D/g, '');

      return (
        cFullName === inputLower ||
        cEmail === inputLower ||
        cUsername === inputLower ||
        (cleanDigits.length >= 7 && cPhoneDigits.endsWith(cleanDigits))
      );
    });

    if (!target) {
      setErrorMsg('Incorrect username or email. Please check spelling or register.');
      return;
    }

    if (!caregiverPin.trim()) {
      setErrorMsg('Please enter your password or security PIN.');
      return;
    }

    // STRICT: Check actual stored password/pin only
    const validCredentials = [target.password, target.pin].filter(Boolean);
    if (!validCredentials.includes(caregiverPin.trim())) {
      setErrorMsg('Incorrect PIN or password.');
      return;
    }

    const allPatients = OfflineStore.getPatients();
    // Find assigned patient, or active patient, or fallback to first
    const assignedPatient =
      allPatients.find((p) => target.assignedPatientIds.includes(p.id)) ||
      allPatients.find((p) => p.id === OfflineStore.getActivePatientId()) ||
      allPatients[0];

    if (!assignedPatient) {
      setErrorMsg('No linked patient found. Please link a patient profile using their Caregiver Key.');
      return;
    }

    OfflineStore.saveAuthSession({
      role: 'CAREGIVER',
      caretakerId: target.id,
      patientId: assignedPatient.id,
      userName: target.username || target.fullName,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });
    OfflineStore.setActiveCaretakerId(target.id);
    onLoginCaregiver(target, assignedPatient);
  };

  // Handle Caregiver Registration (With optional Caregiver Key linking)
  const handleCaregiverRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const nameTrim = regCaregiverName.trim();
    if (!nameTrim) {
      setErrorMsg('Please enter your name.');
      return;
    }

    const usernameTrim = (regCaregiverUsername.trim() || nameTrim.toLowerCase().replace(/\s+/g, ''));
    if (!usernameTrim) {
      setErrorMsg('Please enter a username.');
      return;
    }

    const allCaretakers = OfflineStore.getCaretakers();
    const isDuplicateUsername = allCaretakers.some(
      (c) => (c.username || '').toLowerCase() === usernameTrim.toLowerCase()
    );
    if (isDuplicateUsername) {
      setErrorMsg('Username already exists');
      return;
    }

    if (!regCaregiverPin.trim() || regCaregiverPin.trim().length < 4) {
      setErrorMsg('Please create a password or PIN at least 4 characters long.');
      return;
    }

    // Create Caretaker Profile
    const newCaretakerId = `caretaker-${Date.now()}`;
    const newCaretaker: CaretakerProfile = {
      id: newCaretakerId,
      fullName: nameTrim,
      username: usernameTrim,
      password: regCaregiverPin.trim(),
      pin: regCaregiverPin.trim(),
      caregiverKey: OfflineStore.generateCaregiverKey(),
      relation: regCaregiverRelation.trim() || 'Primary Caregiver',
      phone: regCaregiverPhone.trim() || '',
      email: regCaregiverEmail.trim(),
      assignedPatientIds: [],
    };

    // If caregiver provided a key, link immediately
    if (regCaregiverKey.trim()) {
      OfflineStore.addCaretaker(newCaretaker);
      const linkResult = OfflineStore.linkCaregiverToPatientByKey(newCaretakerId, regCaregiverKey);
      if (!linkResult.success) {
        setErrorMsg(linkResult.error || 'Invalid Caregiver Key. Account created, but please verify patient key.');
        return;
      }
      OfflineStore.saveAuthSession({
        role: 'CAREGIVER',
        caretakerId: newCaretaker.id,
        patientId: linkResult.patient!.id,
        userName: newCaretaker.username || newCaretaker.fullName,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
      OfflineStore.setActiveCaretakerId(newCaretaker.id);
      onLoginCaregiver(newCaretaker, linkResult.patient!);
      return;
    }

    // Otherwise link to any existing patient or wait for link
    const allPatients = OfflineStore.getPatients();
    if (allPatients.length > 0) {
      newCaretaker.assignedPatientIds = [allPatients[0].id];
      OfflineStore.addCaretaker(newCaretaker);
      OfflineStore.saveAuthSession({
        role: 'CAREGIVER',
        caretakerId: newCaretaker.id,
        patientId: allPatients[0].id,
        userName: newCaretaker.username || newCaretaker.fullName,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
      OfflineStore.setActiveCaretakerId(newCaretaker.id);
      onLoginCaregiver(newCaretaker, allPatients[0]);
    } else {
      OfflineStore.addCaretaker(newCaretaker);
      OfflineStore.saveAuthSession({
        role: 'CAREGIVER',
        caretakerId: newCaretaker.id,
        userName: newCaretaker.username || newCaretaker.fullName,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      });
      OfflineStore.setActiveCaretakerId(newCaretaker.id);
      setErrorMsg('Caregiver account created! No patient profile exists yet. Please create a patient account to link.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0E1318] text-[#292524] dark:text-[#E2E8F0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif-heading text-stone-900 dark:text-stone-100 tracking-tight">
            CognitiveSaathi
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium mt-1">
            Cognitive Care & Memory Assistance Platform • Northeast India (NER)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Offline Ready
          </span>
          <LanguageDropdown currentLang={lang} onSelectLang={onLangChange} />
        </div>
      </header>

      {/* Main Authentication Flow Container */}
      <main className="max-w-2xl w-full mx-auto py-6 sm:py-10 space-y-6 animate-fadeIn">
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-center gap-2 text-center">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Space Selection (Patient Space vs Caregiver Space) */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block text-center">
            Select Your Space
          </span>
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {/* 1. Patient Space */}
            <button
              type="button"
              id="select-patient-space-btn"
              onClick={() => {
                setSelectedSpace('PATIENT');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`p-5 sm:p-6 rounded-3xl border-2 transition text-left flex flex-col items-center sm:items-start gap-3 shadow-xs relative ${
                selectedSpace === 'PATIENT'
                  ? 'bg-amber-50/70 dark:bg-amber-950/20 border-teal-800 dark:border-teal-400 ring-2 ring-teal-800/20'
                  : 'bg-white dark:bg-[#1A222C] border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-rose-500 flex items-center justify-center shadow-xs border border-amber-200 dark:border-amber-800">
                <Heart className="w-7 h-7 fill-current" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                    Patient Space
                  </h3>
                  {selectedSpace === 'PATIENT' && <CheckCircle2 className="w-4 h-4 text-teal-800 dark:text-teal-400" />}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Gentle daily routines & memory exercises
                </p>
              </div>
            </button>

            {/* 2. Caregiver Space */}
            <button
              type="button"
              id="select-caregiver-space-btn"
              onClick={() => {
                setSelectedSpace('CAREGIVER');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`p-5 sm:p-6 rounded-3xl border-2 transition text-left flex flex-col items-center sm:items-start gap-3 shadow-xs relative ${
                selectedSpace === 'CAREGIVER'
                  ? 'bg-teal-50/70 dark:bg-teal-950/20 border-teal-800 dark:border-teal-400 ring-2 ring-teal-800/20'
                  : 'bg-white dark:bg-[#1A222C] border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center shadow-xs border border-teal-200 dark:border-teal-800">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                    Caregiver Space
                  </h3>
                  {selectedSpace === 'CAREGIVER' && <CheckCircle2 className="w-4 h-4 text-teal-800 dark:text-teal-400" />}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Family schedules, routines & alerts
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Space Authentication Card */}
        <div className="rounded-3xl bg-white dark:bg-[#1A222C] border border-stone-200 dark:border-stone-700 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header row: Space Name + Mode Switcher */}
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {selectedSpace === 'PATIENT' ? 'Elder & Patient Space' : 'Caregiver & Health Space'}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('LOGIN');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  authMode === 'LOGIN'
                    ? 'bg-white dark:bg-[#121820] text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('REGISTER');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  authMode === 'REGISTER'
                    ? 'bg-white dark:bg-[#121820] text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* ================= PATIENT SPACE FLOW ================= */}
          {selectedSpace === 'PATIENT' && (
            <>
              {authMode === 'LOGIN' ? (
                /* Patient Login Form */
                <form onSubmit={handlePatientLogin} className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="patient-login-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                        Full Name, Username, or Mobile:
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="patient-login-input"
                          type="text"
                          required
                          value={patientLoginInput}
                          onChange={(e) => {
                            setPatientLoginInput(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="e.g. ramesh or Ramesh Sharma"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-white dark:bg-[#121820]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="patient-password-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                          Password or 4-Digit PIN:
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsForgotModalOpen(true)}
                          className="text-xs font-bold text-teal-800 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Forgot PIN?</span>
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="patient-password-input"
                          type={showPatientPassword ? 'text' : 'password'}
                          required
                          value={patientPassword}
                          onChange={(e) => {
                            setPatientPassword(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Enter your personal password or PIN"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-widest text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-white dark:bg-[#121820]"
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
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('REGISTER')}
                        className="font-bold text-teal-800 dark:text-teal-400 hover:underline"
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
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Add gentle profile photo (optional)</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="reg-fullname" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Full Name *
                      </label>
                      <input
                        id="reg-fullname"
                        type="text"
                        required
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        placeholder="e.g. Maya Phukan"
                        className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50/50 dark:bg-[#121820]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-username" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Username (Unique) *
                        </label>
                        <input
                          id="reg-username"
                          type="text"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          placeholder="e.g. mayaphukan"
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-prefname" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Preferred Name / Pet Name
                        </label>
                        <input
                          id="reg-prefname"
                          type="text"
                          value={regPreferredName}
                          onChange={(e) => setRegPreferredName(e.target.value)}
                          placeholder="e.g. Ramesh or Dad"
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-age" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Age
                        </label>
                        <input
                          id="reg-age"
                          type="number"
                          value={regAge}
                          onChange={(e) => setRegAge(e.target.value)}
                          placeholder="72"
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-phone" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Mobile Number
                        </label>
                        <input
                          id="reg-phone"
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="e.g. 94350 12345"
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reg-pass" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Create Password / PIN *
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="reg-pass"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Create a personal password or 4-digit PIN"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-widest text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-white dark:bg-[#121820]"
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
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">
                        A unique Caregiver Key will be automatically generated on your profile for family linking.
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
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('LOGIN')}
                        className="font-bold text-teal-800 dark:text-teal-400 hover:underline"
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
                      <label htmlFor="caregiver-login-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Caregiver Username, Email, or Mobile:
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="caregiver-login-input"
                          type="text"
                          required
                          value={caregiverLoginInput}
                          onChange={(e) => {
                            setCaregiverLoginInput(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="e.g. priya or priya.care@cognitivesaathi.org"
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-white dark:bg-[#121820]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="caregiver-pin-input" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Security PIN or Password:
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="caregiver-pin-input"
                          type={showCaregiverPin ? 'text' : 'password'}
                          required
                          value={caregiverPin}
                          onChange={(e) => {
                            setCaregiverPin(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          placeholder="Enter your personal security PIN"
                          className="w-full pl-10 pr-11 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-widest text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-white dark:bg-[#121820]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCaregiverPin(!showCaregiverPin)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                          aria-label="Toggle password visibility"
                        >
                          {showCaregiverPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
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
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Don't have a caregiver account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('REGISTER')}
                        className="font-bold text-teal-800 dark:text-teal-400 hover:underline"
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
                      <label htmlFor="reg-cg-name" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Caregiver Full Name *
                      </label>
                      <input
                        id="reg-cg-name"
                        type="text"
                        required
                        value={regCaregiverName}
                        onChange={(e) => setRegCaregiverName(e.target.value)}
                        placeholder="e.g. Debashree Gogoi"
                        className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50/50 dark:bg-[#121820]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-cg-user" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Username *
                        </label>
                        <input
                          id="reg-cg-user"
                          type="text"
                          required
                          value={regCaregiverUsername}
                          onChange={(e) => setRegCaregiverUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                          placeholder="e.g. debashree"
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-cg-rel" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Relationship
                        </label>
                        <select
                          id="reg-cg-rel"
                          value={regCaregiverRelation}
                          onChange={(e) => setRegCaregiverRelation(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50/50 dark:bg-[#121820]"
                        >
                          <option value="Daughter">Daughter</option>
                          <option value="Son">Son</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Grandchild">Grandchild</option>
                          <option value="Nurse / Attendant">Nurse / Attendant</option>
                          <option value="Family Caregiver">Family Caregiver</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="reg-cg-phone" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Phone Number *
                        </label>
                        <input
                          id="reg-cg-phone"
                          type="tel"
                          required
                          value={regCaregiverPhone}
                          onChange={(e) => setRegCaregiverPhone(e.target.value)}
                          placeholder="e.g. +91 94350 12345"
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>

                      <div>
                        <label htmlFor="reg-cg-email" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                          Email (Optional)
                        </label>
                        <input
                          id="reg-cg-email"
                          type="email"
                          value={regCaregiverEmail}
                          onChange={(e) => setRegCaregiverEmail(e.target.value)}
                          placeholder="e.g. debashree@care.in"
                          className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-stone-50/50 dark:bg-[#121820]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reg-cg-pin" className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
                        Create PIN or Password *
                      </label>
                      <input
                        id="reg-cg-pin"
                        type="password"
                        required
                        value={regCaregiverPin}
                        onChange={(e) => setRegCaregiverPin(e.target.value)}
                        placeholder="Create a personal security PIN or password"
                        className="w-full px-4 py-3 rounded-2xl border border-stone-300 dark:border-stone-600 text-sm font-semibold tracking-widest text-stone-900 dark:text-stone-100 focus:outline-teal-800 bg-white dark:bg-[#121820]"
                      />
                    </div>

                    {/* Caregiver Key Linking Field */}
                    <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-1.5">
                      <label htmlFor="reg-cg-key" className="text-xs font-bold text-teal-900 dark:text-teal-200 block">
                        Link Patient with Caregiver Key (Optional)
                      </label>
                      <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 leading-relaxed">
                        If a family member gave you a Caregiver Key (e.g. CG-CARE88), enter it here to link automatically:
                      </p>
                      <input
                        id="reg-cg-key"
                        type="text"
                        value={regCaregiverKey}
                        onChange={(e) => setRegCaregiverKey(e.target.value.toUpperCase())}
                        placeholder="e.g. CG-CARE88"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-teal-300 dark:border-teal-700 text-xs font-mono font-bold tracking-wider text-teal-950 dark:text-teal-100 uppercase bg-white dark:bg-[#121820]"
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
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('LOGIN')}
                        className="font-bold text-teal-800 dark:text-teal-400 hover:underline"
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

      {/* Forgot PIN / Password Modal */}
      <ForgotPinModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        lang={lang}
        onSuccess={(msg) => setSuccessMsg(msg)}
      />

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 border-t border-stone-200/80 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
        CognitiveSaathi • Gentle Eldercare, Daily Routines & Family Connection
      </footer>
    </div>
  );
};
