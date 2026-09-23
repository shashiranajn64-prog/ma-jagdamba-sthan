import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Donation, Staff, Notice, CalendarItem, TempleConfig } from '../types';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use the provisioned database ID
const databaseId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
export const db = getFirestore(app, databaseId);

// Test connection as mandated by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();

// Collection names
const COLLECTIONS = {
  DONATIONS: 'donations',
  CONFIG: 'config',
  STAFF: 'staff',
  NOTICES: 'notices',
  CALENDAR: 'calendar',
  LOGS: 'logs',
};

/**
 * Real-time listeners
 */
export const subscribeToDonations = (
  callback: (donations: Donation[]) => void
): Unsubscribe => {
  const donationsRef = collection(db, COLLECTIONS.DONATIONS);
  return onSnapshot(
    donationsRef,
    (snapshot) => {
      const items: Donation[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Donation);
      });
      // Sort newest first by timestamp or date
      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      callback(items);
    },
    (err) => {
      console.warn('Donations onSnapshot error:', err);
    }
  );
};

export const subscribeToConfig = (
  callback: (config: TempleConfig) => void
): Unsubscribe => {
  const configDocRef = doc(db, COLLECTIONS.CONFIG, 'general');
  return onSnapshot(
    configDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as TempleConfig);
      }
    },
    (err) => {
      console.warn('Config onSnapshot error:', err);
    }
  );
};

export const subscribeToStaff = (
  callback: (staff: Staff[]) => void
): Unsubscribe => {
  const staffRef = collection(db, COLLECTIONS.STAFF);
  return onSnapshot(
    staffRef,
    (snapshot) => {
      const items: Staff[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Staff);
      });
      callback(items);
    },
    (err) => {
      console.warn('Staff onSnapshot error:', err);
    }
  );
};

export const subscribeToNotices = (
  callback: (notices: Notice[]) => void
): Unsubscribe => {
  const noticesRef = collection(db, COLLECTIONS.NOTICES);
  return onSnapshot(
    noticesRef,
    (snapshot) => {
      const items: Notice[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Notice);
      });
      callback(items);
    },
    (err) => {
      console.warn('Notices onSnapshot error:', err);
    }
  );
};

export const subscribeToCalendar = (
  callback: (calendar: CalendarItem[]) => void
): Unsubscribe => {
  const calendarRef = collection(db, COLLECTIONS.CALENDAR);
  return onSnapshot(
    calendarRef,
    (snapshot) => {
      const items: CalendarItem[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as CalendarItem);
      });
      callback(items);
    },
    (err) => {
      console.warn('Calendar onSnapshot error:', err);
    }
  );
};

/**
 * Cloud Operations
 */
export const cloudSaveDonation = async (donation: Donation): Promise<void> => {
  try {
    const cleanId = donation.id || `don-${Date.now()}`;
    const cleanData = { ...donation, id: cleanId };
    await setDoc(doc(db, COLLECTIONS.DONATIONS, cleanId), cleanData, { merge: true });
  } catch (err) {
    console.warn('Failed to save donation to Firestore:', err);
  }
};

export const cloudDeleteDonation = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.DONATIONS, id));
  } catch (err) {
    console.warn('Failed to delete donation from Firestore:', err);
  }
};

export const cloudSaveConfig = async (config: TempleConfig): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONFIG, 'general'), config, { merge: true });
  } catch (err) {
    console.warn('Failed to save config to Firestore:', err);
  }
};

export const cloudSaveStaff = async (staff: Staff): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.STAFF, staff.id), staff, { merge: true });
  } catch (err) {
    console.warn('Failed to save staff to Firestore:', err);
  }
};

export const cloudDeleteStaff = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.STAFF, id));
  } catch (err) {
    console.warn('Failed to delete staff from Firestore:', err);
  }
};

export const cloudSaveNotice = async (notice: Notice): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.NOTICES, notice.id), notice, { merge: true });
  } catch (err) {
    console.warn('Failed to save notice to Firestore:', err);
  }
};

export const cloudDeleteNotice = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.NOTICES, id));
  } catch (err) {
    console.warn('Failed to delete notice from Firestore:', err);
  }
};

export const cloudSaveCalendar = async (item: CalendarItem): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.CALENDAR, item.id), item, { merge: true });
  } catch (err) {
    console.warn('Failed to save calendar item to Firestore:', err);
  }
};

export const cloudDeleteCalendar = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CALENDAR, id));
  } catch (err) {
    console.warn('Failed to delete calendar item from Firestore:', err);
  }
};

/**
 * Seed cloud database if empty, so any new device receives all current data immediately
 */
export const seedCloudDatabaseIfEmpty = async (defaults: {
  donations: Donation[];
  config: TempleConfig;
  staff: Staff[];
  notices: Notice[];
  calendar: CalendarItem[];
}): Promise<void> => {
  try {
    // 1. Check donations
    const donSnap = await getDocs(collection(db, COLLECTIONS.DONATIONS));
    if (donSnap.empty && defaults.donations.length > 0) {
      const batch = writeBatch(db);
      defaults.donations.forEach((d) => {
        batch.set(doc(db, COLLECTIONS.DONATIONS, d.id), d);
      });
      await batch.commit();
      console.log('Seeded donations to Firestore');
    }

    // 2. Check config
    const confSnap = await getDocFromServer(doc(db, COLLECTIONS.CONFIG, 'general')).catch(() => null);
    if (!confSnap || !confSnap.exists()) {
      await setDoc(doc(db, COLLECTIONS.CONFIG, 'general'), defaults.config);
      console.log('Seeded config to Firestore');
    }

    // 3. Check staff
    const staffSnap = await getDocs(collection(db, COLLECTIONS.STAFF));
    if (staffSnap.empty && defaults.staff.length > 0) {
      const batch = writeBatch(db);
      defaults.staff.forEach((s) => {
        batch.set(doc(db, COLLECTIONS.STAFF, s.id), s);
      });
      await batch.commit();
      console.log('Seeded staff to Firestore');
    }

    // 4. Check notices
    const notSnap = await getDocs(collection(db, COLLECTIONS.NOTICES));
    if (notSnap.empty && defaults.notices.length > 0) {
      const batch = writeBatch(db);
      defaults.notices.forEach((n) => {
        batch.set(doc(db, COLLECTIONS.NOTICES, n.id), n);
      });
      await batch.commit();
      console.log('Seeded notices to Firestore');
    }

    // 5. Check calendar
    const calSnap = await getDocs(collection(db, COLLECTIONS.CALENDAR));
    if (calSnap.empty && defaults.calendar.length > 0) {
      const batch = writeBatch(db);
      defaults.calendar.forEach((c) => {
        batch.set(doc(db, COLLECTIONS.CALENDAR, c.id), c);
      });
      await batch.commit();
      console.log('Seeded calendar to Firestore');
    }
  } catch (err) {
    console.warn('Seeding check warning:', err);
  }
};
