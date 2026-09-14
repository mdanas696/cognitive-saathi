import { GameSessionResult, RoutineTask, ReminderItem, PatientProfile, CaretakerProfile, SyncEvent, MemoryMoment, GameDefinition } from '../types';

export const DEFAULT_PATIENTS: PatientProfile[] = [
  {
    id: 'patient-anima-72',
    fullName: 'Anima Devi',
    preferredName: 'Aita Anima',
    age: 72,
    region: 'Kamrup, Assam',
    state: 'Assam',
    preferredLanguage: 'en',
    caregiverName: 'Animesh Bora (Son)',
    caregiverPhone: '+91 94350 12345',
    avatarUrl: '',
    dailyStreak: 5,
    todayCompletedCount: 2,
    pin: '1234',
    phone: '9435011111',
    hasCaregiver: true,
  },
  {
    id: 'patient-biren-76',
    fullName: 'Biren Kalita',
    preferredName: 'Koka Biren',
    age: 76,
    region: 'Guwahati, Assam',
    state: 'Assam',
    preferredLanguage: 'as',
    caregiverName: 'Self',
    caregiverPhone: '+91 94350 22222',
    avatarUrl: '',
    dailyStreak: 3,
    todayCompletedCount: 1,
    pin: '1234',
    phone: '9435022222',
    hasCaregiver: false,
  },
  {
    id: 'patient-maya-69',
    fullName: 'Maya Phukan',
    preferredName: 'Aita Maya',
    age: 69,
    region: 'Dibrugarh, Assam',
    state: 'Assam',
    preferredLanguage: 'en',
    caregiverName: 'Dr. Priyam Saikia (Caregiver)',
    caregiverPhone: '+91 98765 43210',
    avatarUrl: '',
    dailyStreak: 7,
    todayCompletedCount: 3,
    pin: '1234',
    phone: '9435033333',
    hasCaregiver: true,
  },
];

export const DEFAULT_PATIENT: PatientProfile = DEFAULT_PATIENTS[0];

export const DEFAULT_CARETAKERS: CaretakerProfile[] = [
  {
    id: 'caretaker-animesh',
    fullName: 'Animesh Bora',
    phone: '+91 94350 12345',
    email: 'animesh.bora@care.in',
    relation: 'Son & Primary Caregiver',
    pin: '1234',
    avatarUrl: '',
    assignedPatientIds: ['patient-anima-72'],
  },
  {
    id: 'caretaker-priyam',
    fullName: 'Dr. Priyam Saikia',
    phone: '+91 98765 43210',
    email: 'priyam.saikia@eldercare.org',
    relation: 'Elder Care Specialist',
    pin: '1234',
    avatarUrl: '',
    assignedPatientIds: ['patient-maya-69', 'patient-anima-72'],
  },
];

export const DEFAULT_GAMES: GameDefinition[] = [
  {
    id: 'find-matching',
    title: 'Find Matching Object',
    category: 'MEMORY',
    shortDescription: 'Match familiar objects like the tea cup, clay diya, and reading glasses with gentle guidance.',
    estimatedMinutes: 3,
    iconName: 'Sparkles',
    culturalTag: 'Familiar Comforts',
    difficultyLevels: 3,
  },
  {
    id: 'attention-focus',
    title: 'Find Target',
    category: 'ATTENTION',
    shortDescription: 'Spot the gentle blooming lotus or teacup among peaceful garden leaves at your own pace.',
    estimatedMinutes: 3,
    iconName: 'Eye',
    culturalTag: 'Nature & Tea Estates',
    difficultyLevels: 3,
  },
  {
    id: 'pattern-sequence',
    title: 'Complete Pattern',
    category: 'PATTERN',
    shortDescription: 'Follow traditional textile diamond and floral motifs to complete the serene sequence.',
    estimatedMinutes: 4,
    iconName: 'Grid',
    culturalTag: 'Traditional Handloom',
    difficultyLevels: 3,
  },
  {
    id: 'daily-routine',
    title: 'Morning Routine Steps',
    category: 'ROUTINE',
    shortDescription: 'Reinforce peaceful daily habits: warm tea, prescribed morning tablet, and garden walk.',
    estimatedMinutes: 3,
    iconName: 'CalendarCheck',
    culturalTag: 'Daily Independence',
    difficultyLevels: 2,
  },
  {
    id: 'object-familiarity',
    title: 'Everyday Household Objects',
    category: 'RECOGNITION',
    shortDescription: 'Identify everyday comfort objects like reading glasses, brass kettle, and clay diya.',
    estimatedMinutes: 3,
    iconName: 'Smile',
    culturalTag: 'Household Comforts',
    difficultyLevels: 2,
  },
];

export const DEFAULT_ROUTINE: RoutineTask[] = [
  {
    id: 'task-1',
    title: 'Morning Lal Chai (Warm Red Tea) & Light Breakfast',
    timeSlot: 'Morning',
    time: '07:30 AM',
    icon: 'Coffee',
    completed: true,
    notes: 'Taken with warm pitha and water',
  },
  {
    id: 'task-2',
    title: 'Morning BP & Memory Support Tablet',
    timeSlot: 'Morning',
    time: '08:15 AM',
    icon: 'Pill',
    completed: true,
    notes: 'Prescribed morning medicine',
  },
  {
    id: 'task-3',
    title: 'Gentle 15-min Veranda Garden Walk',
    timeSlot: 'Morning',
    time: '09:00 AM',
    icon: 'Footprints',
    completed: false,
    notes: 'Enjoy the pleasant morning sun',
  },
  {
    id: 'task-4',
    title: 'Midday Glass of Warm Water & Seasonal Fruit',
    timeSlot: 'Afternoon',
    time: '12:30 PM',
    icon: 'Droplet',
    completed: false,
    notes: 'Hydration check',
  },
  {
    id: 'task-5',
    title: 'Afternoon Quiet Rest & Music',
    timeSlot: 'Afternoon',
    time: '02:00 PM',
    icon: 'Moon',
    completed: false,
    notes: 'Comfortable nap',
  },
  {
    id: 'task-6',
    title: 'Evening Family Talk & Heritage Memory Game',
    timeSlot: 'Evening',
    time: '06:00 PM',
    icon: 'Users',
    completed: false,
    notes: 'Gentle engagement with grandson',
  },
  {
    id: 'task-7',
    title: 'Night Medicine & Warm Milk',
    timeSlot: 'Evening',
    time: '08:30 PM',
    icon: 'ShieldCheck',
    completed: false,
    notes: 'Restful night routine',
  },
];

export const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    patientId: 'patient-anima-72',
    type: 'MEDICINE',
    title: 'Morning BP & Heart Tablet',
    description: 'Take 1 tablet with a full glass of water after tea.',
    time: '08:15 AM',
    period: 'Morning',
    completedToday: true,
    enabled: true,
    categoryLabel: 'Prescribed Medication',
  },
  {
    id: 'rem-2',
    patientId: 'patient-anima-72',
    type: 'HYDRATION',
    title: 'Midday Hydration (Warm Water)',
    description: 'Drink 1 soothing glass of water or lemonade.',
    time: '12:30 PM',
    period: 'Afternoon',
    completedToday: false,
    enabled: true,
    categoryLabel: 'Hydration',
  },
  {
    id: 'rem-3',
    patientId: 'patient-anima-72',
    type: 'ACTIVITY',
    title: 'Memory Keepsake Activity',
    description: 'Spend 3 comfortable minutes exercising memory with Saathi.',
    time: '04:30 PM',
    period: 'Afternoon',
    completedToday: false,
    enabled: true,
    categoryLabel: 'Cognitive Session',
  },
  {
    id: 'rem-4',
    patientId: 'patient-anima-72',
    type: 'APPOINTMENT',
    title: 'Dr. Barua Routine Clinic Checkup',
    description: 'Upcoming routine blood pressure & wellness follow-up on Thursday.',
    time: '11:00 AM',
    period: 'Morning',
    completedToday: false,
    enabled: true,
    categoryLabel: 'Doctor Consultation',
  },
];

export const DEFAULT_MEMORIES: MemoryMoment[] = [
  {
    id: 'mem-1',
    title: 'Bihu Celebration with Family',
    category: 'Festival',
    region: 'Jorhat, Assam',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800',
    imageAlt: 'Elderly woman wearing traditional Assamese Muga silk smiling with family',
    dateLabel: 'Spring Season (Rongali Bihu)',
    story: 'You were wearing your cherished Muga silk Sador and making traditional coconut laddus for the neighbors and children.',
    audioPrompt: 'This was during Rongali Bihu in Jorhat. Your daughter brought fresh orchids and the sound of the dhol was in the courtyard.',
    interactiveQuestion: {
      question: 'Which traditional sweet do you love preparing during Bihu?',
      options: ['Narikol Laru (Coconut sweets)', 'Jalebi', 'Dry cake'],
      correctIndex: 0,
    },
  },
  {
    id: 'mem-2',
    title: 'The Ancestral Veranda & Tulsi Chora',
    category: 'Place',
    region: 'Kamrup, Assam',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
    imageAlt: 'Peaceful garden veranda with morning sunlight and tea bushes',
    dateLabel: 'Morning Sunlight at Home',
    story: 'Your favorite cane armchair on the south veranda where you read the morning newspaper and watered the Tulsi plant.',
    audioPrompt: 'Every morning, the birds would sing in the bamboo grove while your tea was brewing.',
    interactiveQuestion: {
      question: 'Where do you enjoy your morning warm cup of tea?',
      options: ['On the peaceful south veranda', 'In the busy market', 'In the car'],
      correctIndex: 0,
    },
  },
  {
    id: 'mem-3',
    title: 'Granddaughter Priya’s Graduation Day',
    category: 'Family',
    region: 'Guwahati, Assam',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    imageAlt: 'Granddaughter holding diploma and gently embracing grandmother',
    dateLabel: 'May 2024',
    story: 'Priya came directly to touch your feet and receive your blessings after her engineering convocation.',
    audioPrompt: 'Priya gifted you a soft warm shawl and said your encouragement made her dream possible.',
    interactiveQuestion: {
      question: 'Who touched your feet and asked for your blessings on graduation day?',
      options: ['Priya (Granddaughter)', 'A postman', 'A shopkeeper'],
      correctIndex: 0,
    },
  },
];

export const DEFAULT_RECENT_SESSIONS: GameSessionResult[] = [
  {
    id: 'sess-1',
    gameId: 'memory-recall',
    patientId: 'patient-anima-72',
    difficulty: 2,
    accuracy: 0.90,
    reactionTimeMs: 3800,
    completionTimeMs: 35000,
    attempts: 4,
    mistakes: 0,
    hintsUsed: 1,
    completedAt: 'Today, 09:30 AM',
    syncStatus: 'synced',
  },
  {
    id: 'sess-2',
    gameId: 'daily-routine',
    patientId: 'patient-anima-72',
    difficulty: 1,
    accuracy: 1.0,
    reactionTimeMs: 2900,
    completionTimeMs: 28000,
    attempts: 3,
    mistakes: 0,
    hintsUsed: 0,
    completedAt: 'Yesterday, 04:15 PM',
    syncStatus: 'synced',
  },
  {
    id: 'sess-3',
    gameId: 'pattern-sequence',
    patientId: 'patient-anima-72',
    difficulty: 2,
    accuracy: 0.85,
    reactionTimeMs: 4200,
    completionTimeMs: 42000,
    attempts: 4,
    mistakes: 1,
    hintsUsed: 1,
    completedAt: '2 days ago, 10:00 AM',
    syncStatus: 'synced',
  },
  {
    id: 'sess-4',
    gameId: 'attention-focus',
    patientId: 'patient-anima-72',
    difficulty: 1,
    accuracy: 0.95,
    reactionTimeMs: 3100,
    completionTimeMs: 32000,
    attempts: 4,
    mistakes: 0,
    hintsUsed: 0,
    completedAt: '3 days ago, 11:20 AM',
    syncStatus: 'synced',
  },
];

const STORAGE_KEYS = {
  PATIENT: 'cognitivesaathi_patient',
  PATIENTS_LIST: 'cognitivesaathi_patients_list',
  CARETAKERS_LIST: 'cognitivesaathi_caretakers_list',
  ACTIVE_PATIENT_ID: 'cognitivesaathi_active_patient_id',
  ACTIVE_CARETAKER_ID: 'cognitivesaathi_active_caretaker_id',
  ROUTINE: 'cognitivesaathi_routine',
  REMINDERS: 'cognitivesaathi_reminders',
  MEMORIES: 'cognitivesaathi_memories',
  SESSIONS: 'cognitivesaathi_sessions',
  SYNC_QUEUE: 'cognitivesaathi_sync_queue',
};

// Helper to strip any legacy stock photos from stored data
const stripStockAvatar = (url?: string): string => {
  if (!url) return '';
  if (url.includes('unsplash.com') || url.includes('placeholder')) return '';
  return url;
};

const sanitizePatient = (p: PatientProfile): PatientProfile => ({
  ...p,
  avatarUrl: stripStockAvatar(p.avatarUrl),
});

const sanitizeCaretaker = (c: CaretakerProfile): CaretakerProfile => ({
  ...c,
  avatarUrl: stripStockAvatar(c.avatarUrl),
});

// Safe Local Storage & IndexedDB abstraction
export class OfflineStore {
  static getPatients(): PatientProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS_LIST);
      const list: PatientProfile[] = data ? JSON.parse(data) : DEFAULT_PATIENTS;
      const sanitized = list.map(sanitizePatient);
      // If any had legacy stock photos, update storage cleanly
      if (data && JSON.stringify(list) !== JSON.stringify(sanitized)) {
        this.savePatients(sanitized);
      }
      return sanitized;
    } catch {
      return DEFAULT_PATIENTS;
    }
  }

  static savePatients(patients: PatientProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PATIENTS_LIST, JSON.stringify(patients));
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static addPatient(patient: PatientProfile): void {
    const list = this.getPatients();
    const existingIndex = list.findIndex(p => p.id === patient.id || (p.phone && p.phone === patient.phone));
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...patient };
    } else {
      list.push(patient);
    }
    this.savePatients(list);
    this.setActivePatientId(patient.id);
  }

  static deletePatient(id: string): PatientProfile[] {
    try {
      const list = this.getPatients().filter((p) => p.id !== id);
      this.savePatients(list);

      // Clean up patient specific local data
      localStorage.removeItem(`${STORAGE_KEYS.ROUTINE}_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.REMINDERS}_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.SESSIONS}_${id}`);
      localStorage.removeItem(`${STORAGE_KEYS.MEMORIES}_${id}`);

      if (this.getActivePatientId() === id) {
        if (list.length > 0) {
          this.setActivePatientId(list[0].id);
          this.savePatient(list[0]);
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_PATIENT_ID);
          localStorage.removeItem(STORAGE_KEYS.PATIENT);
        }
      }
      return list;
    } catch (e) {
      console.warn('Local storage deletePatient error:', e);
      return this.getPatients();
    }
  }

  static getPatient(id?: string): PatientProfile {
    try {
      const list = this.getPatients();
      if (id) {
        const found = list.find(p => p.id === id);
        if (found) return sanitizePatient(found);
      }
      const activeId = this.getActivePatientId();
      const foundActive = list.find(p => p.id === activeId);
      if (foundActive) return sanitizePatient(foundActive);

      const data = localStorage.getItem(STORAGE_KEYS.PATIENT);
      const pat = data ? JSON.parse(data) : list[0] || DEFAULT_PATIENT;
      return sanitizePatient(pat);
    } catch {
      return DEFAULT_PATIENT;
    }
  }

  static savePatient(patient: PatientProfile): void {
    try {
      const sanitized = sanitizePatient(patient);
      localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(sanitized));
      this.addPatient(sanitized);
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static getActivePatientId(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT_ID) || DEFAULT_PATIENTS[0].id;
    } catch {
      return DEFAULT_PATIENTS[0].id;
    }
  }

  static setActivePatientId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT_ID, id);
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static getCaretakers(): CaretakerProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARETAKERS_LIST);
      const list: CaretakerProfile[] = data ? JSON.parse(data) : DEFAULT_CARETAKERS;
      const sanitized = list.map(sanitizeCaretaker);
      if (data && JSON.stringify(list) !== JSON.stringify(sanitized)) {
        this.saveCaretakers(sanitized);
      }
      return sanitized;
    } catch {
      return DEFAULT_CARETAKERS;
    }
  }

  static saveCaretakers(caretakers: CaretakerProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CARETAKERS_LIST, JSON.stringify(caretakers));
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static addCaretaker(caretaker: CaretakerProfile): void {
    const list = this.getCaretakers();
    const existingIndex = list.findIndex(c => c.id === caretaker.id || c.phone === caretaker.phone);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...caretaker };
    } else {
      list.push(caretaker);
    }
    this.saveCaretakers(list);
    this.setActiveCaretakerId(caretaker.id);
  }

  static getActiveCaretakerId(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_CARETAKER_ID) || DEFAULT_CARETAKERS[0].id;
    } catch {
      return DEFAULT_CARETAKERS[0].id;
    }
  }

  static setActiveCaretakerId(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CARETAKER_ID, id);
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static getRoutine(patientId?: string): RoutineTask[] {
    try {
      const pId = patientId || this.getActivePatientId();
      const key = `${STORAGE_KEYS.ROUTINE}_${pId}`;
      const data = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEYS.ROUTINE);
      return data ? JSON.parse(data) : DEFAULT_ROUTINE;
    } catch {
      return DEFAULT_ROUTINE;
    }
  }

  static saveRoutine(routine: RoutineTask[], patientId?: string): void {
    try {
      const pId = patientId || this.getActivePatientId();
      const key = `${STORAGE_KEYS.ROUTINE}_${pId}`;
      localStorage.setItem(key, JSON.stringify(routine));
      localStorage.setItem(STORAGE_KEYS.ROUTINE, JSON.stringify(routine));
      this.enqueueSyncEvent('ROUTINE_UPDATED', { count: routine.filter(r => r.completed).length, patientId: pId });
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static addTaskToRoutine(task: RoutineTask, patientId?: string): RoutineTask[] {
    const list = this.getRoutine(patientId);
    const updated = [...list, task];
    this.saveRoutine(updated, patientId);
    return updated;
  }

  static addMultipleTasksToRoutine(newTasks: RoutineTask[], patientId?: string): RoutineTask[] {
    const list = this.getRoutine(patientId);
    const updated = [...list, ...newTasks];
    this.saveRoutine(updated, patientId);
    return updated;
  }

  static deleteTaskFromRoutine(taskId: string, patientId?: string): RoutineTask[] {
    const list = this.getRoutine(patientId);
    const updated = list.filter(t => t.id !== taskId);
    this.saveRoutine(updated, patientId);
    return updated;
  }

  static getAiReport(patientId?: string): any | null {
    try {
      const pId = patientId || this.getActivePatientId();
      const data = localStorage.getItem(`cognitivesaathi_ai_report_${pId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static saveAiReport(report: any, patientId?: string): void {
    try {
      const pId = patientId || this.getActivePatientId();
      localStorage.setItem(`cognitivesaathi_ai_report_${pId}`, JSON.stringify(report));
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static getReminders(): ReminderItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      return data ? JSON.parse(data) : DEFAULT_REMINDERS;
    } catch {
      return DEFAULT_REMINDERS;
    }
  }

  static saveReminders(reminders: ReminderItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
      this.enqueueSyncEvent('REMINDER_TOGGLED', { total: reminders.length });
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static getMemories(patientId?: string): MemoryMoment[] {
    try {
      const pId = patientId || this.getActivePatientId();
      const key = `${STORAGE_KEYS.MEMORIES}_${pId}`;
      const data = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEYS.MEMORIES);
      return data ? JSON.parse(data) : DEFAULT_MEMORIES;
    } catch {
      return DEFAULT_MEMORIES;
    }
  }

  static saveMemories(memories: MemoryMoment[], patientId?: string): void {
    try {
      const pId = patientId || this.getActivePatientId();
      const key = `${STORAGE_KEYS.MEMORIES}_${pId}`;
      localStorage.setItem(key, JSON.stringify(memories));
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static addMemory(memory: MemoryMoment, patientId?: string): MemoryMoment[] {
    const list = this.getMemories(patientId);
    const updated = [memory, ...list];
    this.saveMemories(updated, patientId);
    return updated;
  }

  static deleteMemory(id: string, patientId?: string): MemoryMoment[] {
    const list = this.getMemories(patientId);
    const updated = list.filter(m => m.id !== id);
    this.saveMemories(updated, patientId);
    return updated;
  }

  static getSessions(): GameSessionResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : DEFAULT_RECENT_SESSIONS;
    } catch {
      return DEFAULT_RECENT_SESSIONS;
    }
  }

  static addSession(session: GameSessionResult): void {
    try {
      const sessions = this.getSessions();
      const updated = [session, ...sessions];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));

      // Also enqueue in offline sync queue
      this.enqueueSyncEvent('GAME_COMPLETED', {
        gameId: session.gameId,
        accuracy: session.accuracy,
        durationMs: session.completionTimeMs,
      });

      // Update patient streak & count
      const patient = this.getPatient();
      patient.todayCompletedCount += 1;
      this.savePatient(patient);
    } catch (e) {
      console.warn('Local storage error:', e);
    }
  }

  static getSyncQueue(): SyncEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static enqueueSyncEvent(type: SyncEvent['eventType'], payload: Record<string, unknown>): void {
    try {
      const queue = this.getSyncQueue();
      const newEvent: SyncEvent = {
        clientEventId: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventType: type,
        patientId: 'patient-anima-72',
        timestamp: new Date().toISOString(),
        payload,
        status: 'pending',
      };
      queue.push(newEvent);
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.warn('Sync queue error:', e);
    }
  }

  static clearSyncQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
      // Mark pending sessions as synced
      const sessions = this.getSessions().map(s => ({ ...s, syncStatus: 'synced' as const }));
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Sync queue clear error:', e);
    }
  }

  static getCaregiverPin(): string {
    try {
      return localStorage.getItem('cognitivesaathi_caregiver_pin') || '1234';
    } catch {
      return '1234';
    }
  }

  static setCaregiverPin(newPin: string): void {
    try {
      localStorage.setItem('cognitivesaathi_caregiver_pin', newPin.trim());
    } catch (e) {
      console.warn('Failed to save caregiver PIN:', e);
    }
  }
}
