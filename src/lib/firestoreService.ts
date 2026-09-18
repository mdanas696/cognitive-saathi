import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { db, auth } from './firebase';
import {
  PatientProfile,
  CaretakerProfile,
  GameSessionResult,
  RoutineTask,
  ReminderItem,
  MemoryMoment,
} from '../types';

export interface CaregiverKeyDoc {
  key: string;
  patientId: string;
  redeemed: boolean;
  redeemedByCaregiverId?: string;
  createdAt: string;
  redeemedAt?: string;
}

// Convert username or phone into a clean internal auth email for Firebase Auth
export function toAuthEmail(identifier: string, role: 'patient' | 'caregiver'): string {
  const clean = identifier.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${role}_${clean}@cognitivesaathi.internal`;
}

// Ensure the client has an active Firebase Auth session before Firestore calls
export async function ensureAuthUser(): Promise<User | null> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  return new Promise((resolve) => {
    let resolved = false;
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (user) {
        resolved = true;
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolved = true;
          resolve(cred.user);
        } catch (err) {
          console.warn('Firebase anonymous auth fallback error (continuing with open rules):', err);
          resolved = true;
          resolve(null);
        }
      }
    });
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { unsub(); } catch {}
        resolve(auth.currentUser);
      }
    }, 1500);
  });
}

export class FirestoreService {
  // -------------------------------------------------------------
  // PATIENT AUTH & PROFILE
  // -------------------------------------------------------------

  static async registerPatient(
    patientData: Omit<PatientProfile, 'id'>,
    password?: string
  ): Promise<PatientProfile> {
    await ensureAuthUser();
    let authUid = auth.currentUser?.uid;

    if (password && patientData.username) {
      const email = toAuthEmail(patientData.username, 'patient');
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        authUid = cred.user.uid;
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          authUid = cred.user.uid;
        } else {
          console.warn('Firebase Auth user creation fallback:', err);
        }
      }
    }

    const patientId = authUid || `patient-${Date.now()}`;
    const newPatient: PatientProfile = {
      ...patientData,
      id: patientId,
      dailyStreak: patientData.dailyStreak || 0,
      todayCompletedCount: patientData.todayCompletedCount || 0,
    };

    const patientRef = doc(db, 'patients', patientId);
    await setDoc(patientRef, {
      ...newPatient,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    return newPatient;
  }

  static async loginPatient(identifier: string, password?: string): Promise<PatientProfile | null> {
    await ensureAuthUser();
    const cleanId = identifier.trim().toLowerCase();

    // 1. Try Firebase Auth email/pass if password exists
    if (password) {
      try {
        const email = toAuthEmail(identifier, 'patient');
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const pRef = doc(db, 'patients', cred.user.uid);
        const pSnap = await getDoc(pRef);
        if (pSnap.exists()) {
          return pSnap.data() as PatientProfile;
        }
      } catch {
        // Fall back to querying Firestore documents directly
      }
    }

    // 2. Query Firestore patients collection
    const patientsCol = collection(db, 'patients');
    const snap = await getDocs(patientsCol);
    for (const docSnap of snap.docs) {
      const p = docSnap.data() as PatientProfile;
      const uMatch = (p.username || '').toLowerCase() === cleanId;
      const pMatch = (p.phone || '').replace(/\D/g, '').endsWith(cleanId.replace(/\D/g, ''));
      const idMatch = p.id === identifier;
      const keyMatch =
        (p.patientKey || '').toLowerCase() === cleanId ||
        (p.linkedCaregiverKey || '').toLowerCase() === cleanId;

      if (uMatch || pMatch || idMatch || keyMatch) {
        if (!password || p.password === password || p.pin === password) {
          // Automatically ensure patient is registered in the caregiver's assigned list
          if (p.linkedCaregiverKey) {
            this.linkPatientWithCaregiverKey(p.id, p.linkedCaregiverKey).catch((e) => {
              console.warn('Auto caregiver link on patient login error:', e);
            });
          }
          return p;
        }
      }
    }

    return null;
  }

  static async getPatient(patientId: string): Promise<PatientProfile | null> {
    await ensureAuthUser();
    const pRef = doc(db, 'patients', patientId);
    const snap = await getDoc(pRef);
    if (snap.exists()) {
      return snap.data() as PatientProfile;
    }
    return null;
  }

  static async updatePatient(patientId: string, updates: Partial<PatientProfile>): Promise<void> {
    await ensureAuthUser();
    const pRef = doc(db, 'patients', patientId);
    await setDoc(pRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
  }

  // -------------------------------------------------------------
  // CAREGIVER AUTH & PROFILE
  // -------------------------------------------------------------

  static async registerCaregiver(
    caregiverData: Omit<CaretakerProfile, 'id'>,
    pin?: string
  ): Promise<CaretakerProfile> {
    await ensureAuthUser();
    let authUid = auth.currentUser?.uid;

    if (pin && caregiverData.username) {
      const email = caregiverData.email || toAuthEmail(caregiverData.username, 'caregiver');
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pin.length >= 6 ? pin : `${pin}0000`);
        authUid = cred.user.uid;
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, email, pin.length >= 6 ? pin : `${pin}0000`);
          authUid = cred.user.uid;
        } else {
          console.warn('Firebase caregiver auth fallback:', err);
        }
      }
    }

    const caregiverId = authUid || `caregiver-${Date.now()}`;
    const newCaregiver: CaretakerProfile = {
      ...caregiverData,
      id: caregiverId,
      assignedPatientIds: caregiverData.assignedPatientIds || [],
    };

    const cRef = doc(db, 'caregivers', caregiverId);
    await setDoc(cRef, {
      ...newCaregiver,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    return newCaregiver;
  }

  static async loginCaregiver(identifier: string, pin?: string): Promise<CaretakerProfile | null> {
    await ensureAuthUser();
    const cleanId = identifier.trim().toLowerCase();

    // 1. Try Firebase Auth email/pin
    if (pin) {
      try {
        const email = identifier.includes('@') ? identifier : toAuthEmail(identifier, 'caregiver');
        const cred = await signInWithEmailAndPassword(auth, email, pin.length >= 6 ? pin : `${pin}0000`);
        const cRef = doc(db, 'caregivers', cred.user.uid);
        const cSnap = await getDoc(cRef);
        if (cSnap.exists()) {
          return cSnap.data() as CaretakerProfile;
        }
      } catch {
        // Fall back to Firestore collection query
      }
    }

    // 2. Query Firestore caregivers collection
    const caregiversCol = collection(db, 'caregivers');
    const snap = await getDocs(caregiversCol);
    for (const docSnap of snap.docs) {
      const c = docSnap.data() as CaretakerProfile;
      const uMatch = (c.username || '').toLowerCase() === cleanId;
      const pMatch = (c.phone || '').replace(/\D/g, '').endsWith(cleanId.replace(/\D/g, ''));
      const eMatch = (c.email || '').toLowerCase() === cleanId;
      const idMatch = c.id === identifier;

      if (uMatch || pMatch || eMatch || idMatch) {
        if (!pin || c.pin === pin || c.password === pin) {
          return c;
        }
      }
    }

    return null;
  }

  static async getCaregiver(caregiverId: string): Promise<CaretakerProfile | null> {
    await ensureAuthUser();
    const cRef = doc(db, 'caregivers', caregiverId);
    const snap = await getDoc(cRef);
    if (snap.exists()) {
      return snap.data() as CaretakerProfile;
    }
    return null;
  }

  static async updateCaregiver(caregiverId: string, updates: Partial<CaretakerProfile>): Promise<void> {
    await ensureAuthUser();
    const cRef = doc(db, 'caregivers', caregiverId);
    await setDoc(cRef, { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
  }

  // -------------------------------------------------------------
  // CAREGIVER KEY GENERATION & REDEMPTION (ACROSS DEVICES)
  // -------------------------------------------------------------

  static async generateCaregiverKey(patientId: string): Promise<string> {
    await ensureAuthUser();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CG-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const keyRef = doc(db, 'caregiverKeys', code);
    const keyData: CaregiverKeyDoc = {
      key: code,
      patientId,
      redeemed: false,
      createdAt: new Date().toISOString(),
    };

    await setDoc(keyRef, keyData);

    // Also link to patient document
    await this.updatePatient(patientId, {
      patientKey: code,
      linkedCaregiverKey: code,
    });

    return code;
  }

  static async redeemCaregiverKey(
    keyInput: string,
    caregiverId: string
  ): Promise<{ patientId: string; patient: PatientProfile }> {
    await ensureAuthUser();
    const normalizedKey = keyInput.trim().toUpperCase();

    let targetPatientId = '';
    let targetPatient: PatientProfile | null = null;

    await runTransaction(db, async (transaction) => {
      const keyRef = doc(db, 'caregiverKeys', normalizedKey);
      const keySnap = await transaction.get(keyRef);

      if (!keySnap.exists()) {
        throw new Error(`Caregiver key "${normalizedKey}" not found. Please verify the code.`);
      }

      const keyData = keySnap.data() as CaregiverKeyDoc;
      if (keyData.redeemed) {
        throw new Error(`Key "${normalizedKey}" has already been redeemed.`);
      }

      targetPatientId = keyData.patientId;
      const patientRef = doc(db, 'patients', targetPatientId);
      const patientSnap = await transaction.get(patientRef);

      if (!patientSnap.exists()) {
        throw new Error('Associated patient record not found.');
      }

      targetPatient = patientSnap.data() as PatientProfile;

      const caregiverRef = doc(db, 'caregivers', caregiverId);
      const caregiverSnap = await transaction.get(caregiverRef);

      const existingAssigned: string[] = caregiverSnap.exists()
        ? (caregiverSnap.data().assignedPatientIds || [])
        : [];

      const updatedAssigned = Array.from(new Set([...existingAssigned, targetPatientId]));

      // Mark key as redeemed
      transaction.update(keyRef, {
        redeemed: true,
        redeemedByCaregiverId: caregiverId,
        redeemedAt: new Date().toISOString(),
      });

      // Update caregiver document
      transaction.set(
        caregiverRef,
        {
          assignedPatientIds: updatedAssigned,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Update patient document with linked caregiver details
      transaction.update(patientRef, {
        hasCaregiver: true,
        linkedCaregiverKey: normalizedKey,
        caregiverName: caregiverSnap.exists() ? caregiverSnap.data().fullName : 'Primary Caregiver',
        caregiverPhone: caregiverSnap.exists() ? caregiverSnap.data().phone : '',
        updatedAt: new Date().toISOString(),
      });
    });

    return { patientId: targetPatientId, patient: targetPatient! };
  }

  // Register caregiver key mapping in Firestore for instant cross-device lookup
  static async registerCaregiverKeyMapping(
    keyInput: string,
    caregiver: CaretakerProfile
  ): Promise<void> {
    const cleanKey = keyInput.trim().toUpperCase();
    if (!cleanKey) return;
    try {
      await ensureAuthUser();
      const keyRef = doc(db, 'caregiverKeys', cleanKey);
      await setDoc(
        keyRef,
        {
          key: cleanKey,
          caregiverId: caregiver.id,
          caregiverName: caregiver.fullName,
          caregiverPhone: caregiver.phone || '',
          caregiverRelation: caregiver.relation || 'Caregiver',
          caregiverData: {
            id: caregiver.id,
            fullName: caregiver.fullName,
            username: caregiver.username || '',
            phone: caregiver.phone || '',
            relation: caregiver.relation || 'Caregiver',
            caregiverKey: cleanKey,
            assignedPatientIds: caregiver.assignedPatientIds || [],
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Ensure caregiver doc exists
      const cgRef = doc(db, 'caregivers', caregiver.id);
      await setDoc(
        cgRef,
        {
          ...caregiver,
          caregiverKey: cleanKey,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('registerCaregiverKeyMapping warning:', err);
    }
  }

  // Link a Patient to Caregiver using Caregiver Key (Executed from Patient side)
  static async linkPatientWithCaregiverKey(
    patientId: string,
    caregiverKeyInput: string,
    patientData?: PatientProfile
  ): Promise<{ success: boolean; caregiver?: CaretakerProfile; patient?: PatientProfile; error?: string }> {
    await ensureAuthUser();
    const cleanKey = caregiverKeyInput.trim().toUpperCase();
    if (!cleanKey) {
      return { success: false, error: 'Please enter a valid Caregiver Key.' };
    }

    try {
      let foundCaregiver: CaretakerProfile | null = null;

      // 1. Direct O(1) key document lookup in caregiverKeys collection
      try {
        const keyRef = doc(db, 'caregiverKeys', cleanKey);
        const keySnap = await getDoc(keyRef);
        if (keySnap.exists()) {
          const kData = keySnap.data() as any;
          if (kData.caregiverData) {
            foundCaregiver = kData.caregiverData as CaretakerProfile;
          } else if (kData.caregiverId || kData.redeemedByCaregiverId) {
            foundCaregiver = await this.getCaregiver(kData.caregiverId || kData.redeemedByCaregiverId);
          }
        }
      } catch (kErr) {
        console.warn('Direct caregiverKeys lookup warning:', kErr);
      }

      // 2. Scan caregivers collection
      if (!foundCaregiver) {
        try {
          const cgCol = collection(db, 'caregivers');
          const snap = await getDocs(cgCol);
          for (const d of snap.docs) {
            const cg = d.data() as CaretakerProfile;
            if ((cg.caregiverKey || '').trim().toUpperCase() === cleanKey) {
              foundCaregiver = cg;
              break;
            }
          }
        } catch (cgErr) {
          console.warn('caregivers collection scan warning:', cgErr);
        }
      }

      // 3. Fallback to Server API
      if (!foundCaregiver) {
        try {
          const res = await fetch(`/api/patients/${patientId}/link-caregiver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caregiverKey: cleanKey, patient: patientData }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.caretaker) {
              foundCaregiver = data.caretaker;
              this.registerCaregiverKeyMapping(cleanKey, data.caretaker).catch(() => {});
            }
          }
        } catch (sErr) {
          console.warn('Server fallback link request warning:', sErr);
        }
      }

      if (!foundCaregiver) {
        return {
          success: false,
          error: `No caregiver account found with key "${cleanKey}". Please ask your caregiver for the key shown on their Caregiver Dashboard.`,
        };
      }

      // 4. Update caregiver's assignedPatientIds in Firestore
      const updatedAssigned = Array.from(new Set([...(foundCaregiver.assignedPatientIds || []), patientId]));
      foundCaregiver.assignedPatientIds = updatedAssigned;
      await this.updateCaregiver(foundCaregiver.id, {
        assignedPatientIds: updatedAssigned,
        caregiverKey: cleanKey,
      }).catch((e) => console.warn('Update caregiver assignedPatientIds error:', e));

      // Also ensure key mapping has updated assignedPatientIds
      await this.registerCaregiverKeyMapping(cleanKey, foundCaregiver).catch(() => {});

      // 5. Update patient with linked caregiver details
      const patientUpdates: Partial<PatientProfile> = {
        hasCaregiver: true,
        linkedCaregiverKey: cleanKey,
        caregiverName: `${foundCaregiver.fullName} (${foundCaregiver.relation || 'Caregiver'})`,
        caregiverPhone: foundCaregiver.phone,
      };

      if (patientData) {
        await this.updatePatient(patientId, { ...patientData, ...patientUpdates }).catch(() => {});
      } else {
        await this.updatePatient(patientId, patientUpdates).catch(() => {});
      }

      const updatedPatient = (await this.getPatient(patientId)) || (patientData ? { ...patientData, ...patientUpdates } : undefined);

      return {
        success: true,
        caregiver: foundCaregiver,
        patient: updatedPatient,
      };
    } catch (err: any) {
      console.error('Error linking patient with caregiver key:', err);
      return { success: false, error: err?.message || 'Failed to link caregiver.' };
    }
  }

  // Link Caregiver to a Patient by Patient Key / Identifier (Executed from Caregiver side)
  static async linkCaregiverToPatient(
    caregiverId: string,
    patientIdentifier: string
  ): Promise<{ success: boolean; patient?: PatientProfile; error?: string }> {
    await ensureAuthUser();
    const cleanId = patientIdentifier.trim().toUpperCase();
    if (!cleanId) {
      return { success: false, error: 'Please enter a Patient Key or username.' };
    }

    try {
      const caregiver = await this.getCaregiver(caregiverId);
      if (!caregiver) {
        return { success: false, error: 'Caregiver account not found.' };
      }

      // 1. Try to find patient by patientKey, username, phone, or id
      const pCol = collection(db, 'patients');
      const snap = await getDocs(pCol);
      let foundPatient: PatientProfile | null = null;

      for (const d of snap.docs) {
        const p = d.data() as PatientProfile;
        const pKey = (p.patientKey || '').toUpperCase();
        const lKey = (p.linkedCaregiverKey || '').toUpperCase();
        const pUser = (p.username || '').toUpperCase();
        const pPhone = (p.phone || '').replace(/\D/g, '');
        const cleanDigits = cleanId.replace(/\D/g, '');

        if (
          pKey === cleanId ||
          lKey === cleanId ||
          pUser === cleanId ||
          p.id === patientIdentifier ||
          (cleanDigits.length >= 7 && pPhone.endsWith(cleanDigits))
        ) {
          foundPatient = p;
          break;
        }
      }

      // Check caregiverKeys collection as fallback
      if (!foundPatient) {
        const keyRef = doc(db, 'caregiverKeys', cleanId);
        const keySnap = await getDoc(keyRef);
        if (keySnap.exists()) {
          const kData = keySnap.data() as CaregiverKeyDoc;
          foundPatient = await this.getPatient(kData.patientId);
        }
      }

      if (!foundPatient) {
        return {
          success: false,
          error: `Patient with key or identifier "${patientIdentifier}" not found.`,
        };
      }

      // 2. Add to caregiver's assigned list
      const updatedAssigned = Array.from(new Set([...(caregiver.assignedPatientIds || []), foundPatient.id]));
      await this.updateCaregiver(caregiverId, {
        assignedPatientIds: updatedAssigned,
      });

      // 3. Update patient's caregiver information
      await this.updatePatient(foundPatient.id, {
        hasCaregiver: true,
        caregiverName: caregiver.fullName,
        caregiverPhone: caregiver.phone,
        linkedCaregiverKey: caregiver.caregiverKey || cleanId,
      });

      const refreshedPatient = await this.getPatient(foundPatient.id);

      return {
        success: true,
        patient: refreshedPatient || foundPatient,
      };
    } catch (err: any) {
      console.error('Error linking caregiver to patient:', err);
      return { success: false, error: err?.message || 'Failed to link patient.' };
    }
  }

  // -------------------------------------------------------------
  // REAL-TIME ACTIVITY SYNC (IMMEDIATE SUBCOLLECTION WRITES)
  // -------------------------------------------------------------

  static async recordGameSession(patientId: string, session: GameSessionResult): Promise<void> {
    await ensureAuthUser();
    const sessionRef = doc(db, 'patients', patientId, 'sessions', session.id);
    await setDoc(sessionRef, {
      ...session,
      syncedAt: new Date().toISOString(),
    });

    // Also update patient streaks/counts
    const patientRef = doc(db, 'patients', patientId);
    const snap = await getDoc(patientRef);
    if (snap.exists()) {
      const p = snap.data() as PatientProfile;
      await updateDoc(patientRef, {
        todayCompletedCount: (p.todayCompletedCount || 0) + 1,
        lastActiveAt: new Date().toISOString(),
      });
    }
  }

  static async updateRoutineTask(patientId: string, task: RoutineTask): Promise<void> {
    await ensureAuthUser();
    const taskRef = doc(db, 'patients', patientId, 'routines', task.id);
    await setDoc(taskRef, {
      ...task,
      updatedAt: new Date().toISOString(),
    });
  }

  static async deleteRoutineTask(patientId: string, taskId: string): Promise<void> {
    await ensureAuthUser();
    const taskRef = doc(db, 'patients', patientId, 'routines', taskId);
    await deleteDoc(taskRef);
  }

  static async updateReminderItem(patientId: string, reminder: ReminderItem): Promise<void> {
    await ensureAuthUser();
    const remRef = doc(db, 'patients', patientId, 'reminders', reminder.id);
    await setDoc(remRef, {
      ...reminder,
      updatedAt: new Date().toISOString(),
    });
  }

  static async deleteReminderItem(patientId: string, reminderId: string): Promise<void> {
    await ensureAuthUser();
    const remRef = doc(db, 'patients', patientId, 'reminders', reminderId);
    await deleteDoc(remRef);
  }

  static async addMemoryMoment(patientId: string, memory: MemoryMoment): Promise<void> {
    await ensureAuthUser();
    const memRef = doc(db, 'patients', patientId, 'memories', memory.id);
    await setDoc(memRef, {
      ...memory,
      createdAt: new Date().toISOString(),
    });
  }

  static async deleteMemoryMoment(patientId: string, memoryId: string): Promise<void> {
    await ensureAuthUser();
    const memRef = doc(db, 'patients', patientId, 'memories', memoryId);
    await deleteDoc(memRef);
  }

  // -------------------------------------------------------------
  // REAL-TIME LISTENERS (onSnapshot) FOR CAREGIVER & PATIENT VIEWS
  // -------------------------------------------------------------

  static listenToPatient(patientId: string, callback: (patient: PatientProfile | null) => void): Unsubscribe {
    const pRef = doc(db, 'patients', patientId);
    return onSnapshot(
      pRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as PatientProfile);
        } else {
          callback(null);
        }
      },
      (err) => {
        console.warn(`Firestore patient listen error (${patientId}):`, err);
      }
    );
  }

  static listenToCaregiver(caregiverId: string, callback: (caregiver: CaretakerProfile | null) => void): Unsubscribe {
    const cRef = doc(db, 'caregivers', caregiverId);
    return onSnapshot(
      cRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as CaretakerProfile);
        } else {
          callback(null);
        }
      },
      (err) => {
        console.warn(`Firestore caregiver listen error (${caregiverId}):`, err);
      }
    );
  }

  static listenToSessions(patientId: string, callback: (sessions: GameSessionResult[]) => void): Unsubscribe {
    const sCol = collection(db, 'patients', patientId, 'sessions');
    return onSnapshot(
      sCol,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as GameSessionResult);
        callback(list);
      },
      (err) => {
        console.warn(`Firestore sessions listen error (${patientId}):`, err);
      }
    );
  }

  static listenToRoutines(patientId: string, callback: (routines: RoutineTask[]) => void): Unsubscribe {
    const rCol = collection(db, 'patients', patientId, 'routines');
    return onSnapshot(
      rCol,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as RoutineTask);
        callback(list);
      },
      (err) => {
        console.warn(`Firestore routines listen error (${patientId}):`, err);
      }
    );
  }

  static listenToReminders(patientId: string, callback: (reminders: ReminderItem[]) => void): Unsubscribe {
    const remCol = collection(db, 'patients', patientId, 'reminders');
    return onSnapshot(
      remCol,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as ReminderItem);
        callback(list);
      },
      (err) => {
        console.warn(`Firestore reminders listen error (${patientId}):`, err);
      }
    );
  }

  static listenToMemories(patientId: string, callback: (memories: MemoryMoment[]) => void): Unsubscribe {
    const mCol = collection(db, 'patients', patientId, 'memories');
    return onSnapshot(
      mCol,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as MemoryMoment);
        callback(list);
      },
      (err) => {
        console.warn(`Firestore memories listen error (${patientId}):`, err);
      }
    );
  }
}
