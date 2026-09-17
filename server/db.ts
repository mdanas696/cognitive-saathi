import fs from 'fs';
import path from 'path';
import { PatientProfile, CaretakerProfile, RoutineTask, ReminderItem, MemoryMoment, GameSessionResult } from '../src/types';

export interface DatabaseSchema {
  patients: PatientProfile[];
  caretakers: CaretakerProfile[];
  routines: Record<string, RoutineTask[]>;
  reminders: Record<string, ReminderItem[]>;
  memories: Record<string, MemoryMoment[]>;
  sessions: Record<string, GameSessionResult[]>;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'database.json');

// Default initial data for demo/startup
const INITIAL_PATIENTS: PatientProfile[] = [
  {
    id: 'patient-senior-1',
    fullName: 'Ramesh Sharma',
    preferredName: 'Ramesh',
    username: 'ramesh',
    password: 'password123',
    pin: '5678',
    linkedCaregiverKey: 'CG-CARE88',
    age: 72,
    region: 'Guwahati, Assam',
    state: 'Assam',
    preferredLanguage: 'en',
    caregiverName: 'Priya Sharma (Daughter)',
    caregiverPhone: '9435012345',
    avatarUrl: '',
    dailyStreak: 0,
    todayCompletedCount: 0,
    phone: '9435011111',
    hasCaregiver: true,
  },
  {
    id: 'patient-independent-2',
    fullName: 'Biren Kalita',
    preferredName: 'Biren',
    username: 'biren',
    password: 'password123',
    pin: '4321',
    age: 76,
    region: 'Guwahati, Assam',
    state: 'Assam',
    preferredLanguage: 'as',
    caregiverName: 'Self',
    caregiverPhone: '9435022222',
    avatarUrl: '',
    dailyStreak: 0,
    todayCompletedCount: 0,
    phone: '9435022222',
    hasCaregiver: false,
  },
];

const INITIAL_CARETAKERS: CaretakerProfile[] = [
  {
    id: 'caretaker-priya',
    fullName: 'Priya Sharma',
    username: 'priya',
    password: 'password123',
    phone: '9435012345',
    email: 'priya.care@cognitivesaathi.org',
    relation: 'Daughter & Primary Caregiver',
    pin: '5678',
    caregiverKey: 'CG-CARE88',
    avatarUrl: '',
    assignedPatientIds: ['patient-senior-1'],
  },
];

export class ServerDB {
  private static cache: DatabaseSchema | null = null;

  private static ensureDbExists(): DatabaseSchema {
    if (this.cache) return this.cache;

    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        this.cache = {
          patients: parsed.patients || INITIAL_PATIENTS,
          caretakers: parsed.caretakers || INITIAL_CARETAKERS,
          routines: parsed.routines || {},
          reminders: parsed.reminders || {},
          memories: parsed.memories || {},
          sessions: parsed.sessions || {},
        };
        return this.cache;
      }
    } catch (e) {
      console.warn('Error reading server database, initializing fresh state:', e);
    }

    const defaultDb: DatabaseSchema = {
      patients: INITIAL_PATIENTS,
      caretakers: INITIAL_CARETAKERS,
      routines: {},
      reminders: {},
      memories: {},
      sessions: {},
    };
    this.save(defaultDb);
    this.cache = defaultDb;
    return defaultDb;
  }

  private static save(db: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
      this.cache = db;
    } catch (e) {
      console.error('Failed to write to database.json:', e);
    }
  }

  static getPatients(): PatientProfile[] {
    const db = this.ensureDbExists();
    return db.patients;
  }

  static getCaretakers(): CaretakerProfile[] {
    const db = this.ensureDbExists();
    return db.caretakers;
  }

  static findPatient(identifier: string): PatientProfile | undefined {
    const db = this.ensureDbExists();
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    return db.patients.find((p) => {
      if (p.id.toLowerCase() === clean) return true;
      if (p.username && p.username.toLowerCase() === clean) return true;
      if (p.fullName.toLowerCase() === clean) return true;
      if (p.phone) {
        const pDigits = p.phone.replace(/\D/g, '');
        if (pDigits && cleanDigits && (pDigits === cleanDigits || pDigits.endsWith(cleanDigits) || cleanDigits.endsWith(pDigits))) {
          return true;
        }
      }
      return false;
    });
  }

  static findCaretaker(identifier: string): CaretakerProfile | undefined {
    const db = this.ensureDbExists();
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');

    return db.caretakers.find((c) => {
      if (c.id.toLowerCase() === clean) return true;
      if (c.username && c.username.toLowerCase() === clean) return true;
      if (c.fullName.toLowerCase() === clean) return true;
      if (c.phone) {
        const cDigits = c.phone.replace(/\D/g, '');
        if (cDigits && cleanDigits && (cDigits === cleanDigits || cDigits.endsWith(cleanDigits) || cleanDigits.endsWith(cDigits))) {
          return true;
        }
      }
      return false;
    });
  }

  static isUsernameTaken(username: string): boolean {
    const db = this.ensureDbExists();
    const clean = username.trim().toLowerCase();
    const inPatients = db.patients.some((p) => (p.username || '').trim().toLowerCase() === clean);
    const inCaretakers = db.caretakers.some((c) => (c.username || '').trim().toLowerCase() === clean);
    return inPatients || inCaretakers;
  }

  static isPhoneTaken(phone: string): boolean {
    const db = this.ensureDbExists();
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits) return false;

    const inPatients = db.patients.some((p) => {
      const d = (p.phone || '').replace(/\D/g, '');
      return d && (d === cleanDigits || d.endsWith(cleanDigits) || cleanDigits.endsWith(d));
    });

    const inCaretakers = db.caretakers.some((c) => {
      const d = (c.phone || '').replace(/\D/g, '');
      return d && (d === cleanDigits || d.endsWith(cleanDigits) || cleanDigits.endsWith(d));
    });

    return inPatients || inCaretakers;
  }

  static addPatient(patient: PatientProfile): PatientProfile {
    const db = this.ensureDbExists();
    const existingIndex = db.patients.findIndex((p) => p.id === patient.id || (patient.phone && p.phone === patient.phone));

    if (existingIndex >= 0) {
      db.patients[existingIndex] = { ...db.patients[existingIndex], ...patient };
    } else {
      db.patients.push(patient);
    }

    this.save(db);
    return patient;
  }

  static addCaretaker(caretaker: CaretakerProfile): CaretakerProfile {
    const db = this.ensureDbExists();
    const existingIndex = db.caretakers.findIndex((c) => c.id === caretaker.id || (caretaker.phone && c.phone === caretaker.phone));

    if (existingIndex >= 0) {
      db.caretakers[existingIndex] = { ...db.caretakers[existingIndex], ...caretaker };
    } else {
      db.caretakers.push(caretaker);
    }

    this.save(db);
    return caretaker;
  }
}
