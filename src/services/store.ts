import { Donation, Staff, Notice, CalendarItem, TempleConfig, AdminLog } from '../types';
import { syncDonationToGoogleSheet } from './googleSheetSync';

// Storage keys
const STORAGE_KEYS = {
  DONATIONS: 'mjs_donations',
  STAFF: 'mjs_staff',
  NOTICES: 'mjs_notices',
  CALENDAR: 'mjs_calendar',
  CONFIG: 'mjs_config',
  LOGS: 'mjs_logs',
  CURRENT_STAFF: 'mjs_current_staff',
  CURRENT_ADMIN: 'mjs_current_admin',
};

// TODO: Change to seva@maajagdambasthan.org after buying domain
export const DEFAULT_EMAIL = 'maajagdambasthan.mathurapur@gmail.com';
export const WEBSITE_URL = 'https://maa-jagdamba-sthan-mathurapur.web.app';
export const CONTACT_PHONE = '+91 9709168876';
export const TEMPLE_ADDRESS = 'मथुरापुर, मुजफ्फरपुर, बिहार - 843119';

const INITIAL_CONFIG: TempleConfig = {
  upiId: '9709168876@upi',
  qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=9709168876@upi%26pn=Maa%20Jagdamba%20Sthan%20Trust%26cu=INR',
  phone: CONTACT_PHONE,
  email: DEFAULT_EMAIL, // TODO: Change to seva@maajagdambasthan.org after buying domain
  website: WEBSITE_URL,
  address: TEMPLE_ADDRESS,
  adminId: '9709168876',
  adminPassword: 'Shashi@2026',
  aboutText: 'माँ जगदंबा स्थान, मथुरापुर, मुजफ्फरपुर (बिहार) उत्तर भारत का एक अत्यंत पावन, प्राचीन एवं सिद्ध शक्तिपीठ है। सदियों से यहाँ माता जगदम्बा की असीम कृपा से भक्तों की हर मनोकामना पूर्ण होती रही है। यहाँ स्थापित माँ भगवती की स्वयंभू अलौकिक प्रतिमा भक्तों को संकटों से मुक्ति और सुख-समृद्धि प्रदान करती है।',
  historyText: 'मान्यता अनुसार, इस पावन धरा पर माँ भगवती का आगमन सदियों पूर्व हुआ था। मथुरापुर धाम में वर्ष भर अखंड ज्योति प्रज्ज्वलित रहती है। शारदीय एवं चैत्र नवरात्र के दौरान यहाँ लाखों श्रद्धालु माँ के दर्शनार्थ पहुँचते हैं। मंदिर परिसर में भव्य यज्ञशाला, गौशाला, संकीर्तन भवन एवं भक्त निवास का निरंतर विस्तार जारी है।',
  aartiMorning: 'प्रातः 05:00 AM (मंगला व प्रभात आरती)',
  aartiEvening: 'सायं 07:00 PM (महाआरती व शयन आरती)',
  darshanTimings: 'प्रातः 04:30 AM से दोपहर 12:30 PM | सायं 04:00 PM से रात्रि 09:30 PM',
  galleryPhotos: [
    {
      id: 'g1',
      url: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=800&q=80',
      title: 'माँ जगदंबा गर्भगृह',
      caption: 'स्वर्ण मुकुट व दिव्य श्रृंगार में माँ जगदम्बा के प्रातः दर्शन'
    },
    {
      id: 'g2',
      url: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?auto=format&fit=crop&w=800&q=80',
      title: 'संध्या महाआरती',
      caption: 'अखंड दीपों के साथ आयोजित सांध्य महाआरती'
    },
    {
      id: 'g3',
      url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      title: 'भव्य मंदिर शिखर',
      caption: 'मथुरापुर धाम का दिव्य व नयनाभिराम मुख्य मंदिर'
    },
    {
      id: 'g4',
      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      title: 'नवरात्र शतचंडी महायज्ञ',
      caption: 'पवित्र यज्ञशाला में आहुति देते पूज्य आचार्य गण'
    },
    {
      id: 'g5',
      url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
      title: 'महाप्रसाद एवं भंडारा',
      caption: 'श्रद्धालुओं के लिए अनवरत चल रही प्रसाद सेवा'
    },
    {
      id: 'g6',
      url: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
      title: 'दीपावली दीपदान उत्सव',
      caption: 'हजारों दीयों से जगमगाता पावन शक्तिपीठ परिसर'
    }
  ],
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
  googleSheetWebhookUrl: '',
  autoSyncToSheet: true,
};

const INITIAL_STAFF: Staff[] = [
  {
    id: 'ramesh01',
    name: 'पं. रमेश शर्मा',
    mobile: '9835012345',
    role: 'Pujari',
    password: 'mandir123',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    joinDate: '2025-01-15',
    active: true,
  },
  {
    id: 'manoj02',
    name: 'मनोज तिवारी',
    mobile: '9709168876',
    role: 'Cash',
    password: 'mandir123',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    joinDate: '2025-03-10',
    active: true,
  },
  {
    id: 'amit03',
    name: 'अमित कुमार सिंह',
    mobile: '9431234567',
    role: 'Volunteer',
    password: 'mandir123',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    joinDate: '2025-06-01',
    active: true,
  }
];

const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'd-101',
    name: 'रमेश कुमार पोद्दार',
    mobile: '9835123456',
    amount: 501,
    date: '2026-09-22',
    timestamp: Date.now() - 1000 * 60 * 30,
    type: 'ONLINE',
    status: 'APPROVED',
    receiptNo: 'MJS-2026-1001',
    receiptLink: `${WEBSITE_URL}/receipt/MJS-2026-1001`,
    sankalp: 'परिवार कल्याण एवं सुख शांति'
  },
  {
    id: 'd-102',
    name: 'सीता देवी',
    mobile: '9431987654',
    amount: 1100,
    date: '2026-09-22',
    timestamp: Date.now() - 1000 * 60 * 90,
    type: 'ONLINE',
    status: 'APPROVED',
    receiptNo: 'MJS-2026-1002',
    receiptLink: `${WEBSITE_URL}/receipt/MJS-2026-1002`,
    sankalp: 'माँ जगदम्बा श्रृंगार सेवा'
  },
  {
    id: 'd-103',
    name: 'मोहन प्रसाद जायसवाल',
    mobile: '9122345678',
    amount: 251,
    date: '2026-09-22',
    timestamp: Date.now() - 1000 * 60 * 180,
    type: 'CASH',
    status: 'APPROVED',
    receiptNo: 'MJS-2026-1003',
    receiptLink: `${WEBSITE_URL}/receipt/MJS-2026-1003`,
    collectedBy: {
      staffId: 'manoj02',
      staffName: 'मनोज तिवारी'
    },
    sankalp: 'महाप्रसाद भंडारा सहयोग'
  },
  {
    id: 'd-104',
    name: 'अंजलि शर्मा',
    mobile: '9835998877',
    amount: 5100,
    date: '2026-09-21',
    timestamp: Date.now() - 1000 * 60 * 600,
    type: 'ONLINE',
    status: 'APPROVED',
    receiptNo: 'MJS-2026-1004',
    receiptLink: `${WEBSITE_URL}/receipt/MJS-2026-1004`,
    sankalp: 'मंदिर जीर्णोद्धार सहयोग'
  },
  {
    id: 'd-105',
    name: 'राजेश कुमार चौधरी',
    mobile: '9430112233',
    amount: 1001,
    date: '2026-09-21',
    timestamp: Date.now() - 1000 * 60 * 900,
    type: 'CASH',
    status: 'APPROVED',
    receiptNo: 'MJS-2026-1005',
    receiptLink: `${WEBSITE_URL}/receipt/MJS-2026-1005`,
    collectedBy: {
      staffId: 'ramesh01',
      staffName: 'पं. रमेश शर्मा'
    },
    sankalp: 'अखंड ज्योति एवं गौ सेवा'
  },
  {
    id: 'd-106',
    name: 'सुनीता सिंह',
    mobile: '9934567890',
    amount: 501,
    date: '2026-09-20',
    timestamp: Date.now() - 1000 * 60 * 1500,
    type: 'ONLINE',
    status: 'APPROVED',
    receiptNo: 'MJS-2026-1006',
    receiptLink: `${WEBSITE_URL}/receipt/MJS-2026-1006`,
  },
  {
    id: 'd-107',
    name: 'विक्रम यादव',
    mobile: '9708123456',
    amount: 2100,
    date: '2026-09-20',
    timestamp: Date.now() - 1000 * 60 * 2000,
    type: 'ONLINE',
    status: 'APPROVED',
    receiptNo: 'MJS-2026-1007',
    receiptLink: `${WEBSITE_URL}/receipt/MJS-2026-1007`,
    sankalp: 'ध्वज एवं छत्र अर्पण'
  },
  {
    id: 'd-108',
    name: 'गौरव कुमार मिश्रा',
    mobile: '9304123987',
    amount: 501,
    date: '2026-09-22',
    timestamp: Date.now() - 1000 * 60 * 15,
    type: 'ONLINE',
    screenshotUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=400&q=80',
    status: 'PENDING',
    sankalp: 'नवरात्र घटस्थापना निमित्त'
  }
];

const INITIAL_NOTICES: Notice[] = [
  {
    id: 'n-1',
    title: 'शारदीय नवरात्र 2026 की विशेष तैयारी एवं कलश स्थापना आमंत्रण',
    details: 'मथुरापुर धाम में शारदीय नवरात्र महापर्व का शुभारंभ भव्य कलश यात्रा एवं ध्वजारोहण के साथ होगा। सभी श्रद्धालु सादर आमंत्रित हैं।',
    date: '2026-09-22',
    addedBy: 'Admin',
    addedByRole: 'Admin',
    status: 'APPROVED',
  },
  {
    id: 'n-2',
    title: 'प्रतिदिन सायं 7:00 बजे महाआरती एवं महाप्रसाद वितरण की नई व्यवस्था',
    details: 'माँ जगदम्बा की संध्या महाआरती में भक्तों की भारी भीड़ को देखते हुए प्रसाद वितरण हेतु अलग काउंटर बनाए गए हैं।',
    date: '2026-09-21',
    addedBy: 'मनोज तिवारी',
    addedByRole: 'Staff',
    status: 'APPROVED',
  },
  {
    id: 'n-3',
    title: 'मंदिर नवनिर्माण एवं भक्त निवास सहयोग योजना',
    details: 'दूर-दराज से आने वाले तीर्थयात्रियों की सुविधा हेतु 20 कमरों के सर्वसुविधायुक्त धर्मशाला निर्माण का संकल्प लिया गया है।',
    date: '2026-09-20',
    addedBy: 'Admin',
    addedByRole: 'Admin',
    status: 'APPROVED',
  },
  {
    id: 'n-4',
    title: 'गौ-सेवा केंद्र एवं अखंड ज्योति संकल्प व्यवस्था',
    details: 'मंदिर गौशाला में 50 देशी गौवंश के संवर्धन हेतु भक्तगण अपनी स्वेच्छा से मासिक या वार्षिक सहयोग दे सकते हैं।',
    date: '2026-09-18',
    addedBy: 'पं. रमेश शर्मा',
    addedByRole: 'Staff',
    status: 'APPROVED',
  },
  {
    id: 'n-5',
    title: 'रविवार को निःशुल्क स्वास्थ्य परामर्श एवं भजन कीर्तन संध्या',
    details: 'आगामी रविवार दोपहर 12 से 4 बजे तक मंदिर प्रांगण में निःशुल्क चिकित्सा शिविर एवं सायं 5 बजे से भजन संध्या का आयोजन।',
    date: '2026-09-15',
    addedBy: 'Admin',
    addedByRole: 'Admin',
    status: 'APPROVED',
  }
];

const INITIAL_CALENDAR: CalendarItem[] = [
  {
    id: 'c-1',
    title: 'शारदीय नवरात्र घटस्थापना',
    date: '2026-10-11',
    description: 'प्रथम दिन माँ शैलपुत्री पूजन व घटस्थापना मुहूर्त प्रातः 06:15 से 08:30 बजे तक।',
    tithi: 'आश्विन शुक्ल प्रतिपदा',
    isMajor: true,
  },
  {
    id: 'c-2',
    title: 'दुर्गा महाअष्टमी एवं महानिशा पूजा',
    date: '2026-10-18',
    description: 'माँ महागौरी पूजन, संधि पूजा एवं कन्या पूजन महाभंडारा।',
    tithi: 'आश्विन शुक्ल अष्टमी',
    isMajor: true,
  },
  {
    id: 'c-3',
    title: 'विजयादशमी (दशहरा) महामहोत्सव',
    date: '2026-10-20',
    description: 'माँ जगदम्बा की भव्य शोभायात्रा, अपराजिता पूजन एवं जयघोष।',
    tithi: 'आश्विन शुक्ल दशमी',
    isMajor: true,
  },
  {
    id: 'c-4',
    title: 'शरद पूर्णिमा अमृत महोत्सव',
    date: '2026-10-25',
    description: 'खीर भोग अर्पण एवं रात्रि जागरण भजन संध्या।',
    tithi: 'आश्विन पूर्णिमा',
    isMajor: false,
  },
  {
    id: 'c-5',
    title: 'दीपावली एवं महालक्ष्मी पूजन',
    date: '2026-11-08',
    description: '11,000 दीपों से दीपदान महामहोत्सव व महाआरती।',
    tithi: 'कार्तिक अमावस्या',
    isMajor: true,
  },
  {
    id: 'c-6',
    title: 'सूर्य षष्ठी महापर्व (छठ पूजा)',
    date: '2026-11-14',
    description: 'मंदिर सरोवर तट पर अस्ताचलगामी एवं उदीयमान सूर्य को अर्घ्य दान।',
    tithi: 'कार्तिक शुक्ल षष्ठी',
    isMajor: true,
  }
];

const INITIAL_LOGS: AdminLog[] = [
  {
    id: 'log-1',
    action: 'SYSTEM_INIT',
    details: 'माँ जगदंबा स्थान, मथुरापुर पोर्टल का शुभारंभ एवं डाटा इनिशियलाइज किया गया।',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    adminUser: 'SuperAdmin'
  }
];

// In-memory or localStorage helper
class TempleStore {
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => {
        this.notify();
      });
    }
  }

  private init() {
    if (typeof window === 'undefined') return;

    const storedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (!storedConfig) {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
    } else {
      try {
        const parsed = JSON.parse(storedConfig);
        if (parsed.adminPassword === 'mandir123' || !parsed.adminId || parsed.adminId !== '9709168876' || parsed.adminPassword !== 'Shashi@2026') {
          parsed.adminId = '9709168876';
          parsed.adminPassword = 'Shashi@2026';
          localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(parsed));
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DONATIONS)) {
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(INITIAL_DONATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(INITIAL_NOTICES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CALENDAR)) {
      localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(INITIAL_CALENDAR));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Config
  public getConfig(): TempleConfig {
    if (typeof window === 'undefined') return INITIAL_CONFIG;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return data ? JSON.parse(data) : INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  }

  public updateConfig(updates: Partial<TempleConfig>) {
    const current = this.getConfig();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
    this.logAction('CONFIG_UPDATE', `मंदिर कॉन्फ़िगरेशन अपडेट किया गया (${Object.keys(updates).join(', ')})`);
    this.notify();
  }

  // Donations
  public getDonations(): Donation[] {
    if (typeof window === 'undefined') return INITIAL_DONATIONS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DONATIONS);
      return data ? JSON.parse(data) : INITIAL_DONATIONS;
    } catch {
      return INITIAL_DONATIONS;
    }
  }

  public getApprovedDonations(limitCount = 20): Donation[] {
    const all = this.getDonations();
    return all
      .filter((d) => d.status === 'APPROVED')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limitCount);
  }

  public getDonationById(id: string): Donation | undefined {
    return this.getDonations().find((d) => d.id === id);
  }

  public getDonationByReceiptNo(receiptNo: string): Donation | undefined {
    return this.getDonations().find((d) => d.receiptNo === receiptNo);
  }

  public addOnlineDonation(data: {
    name: string;
    mobile: string;
    amount: number;
    screenshotUrl?: string;
    sankalp?: string;
    gotra?: string;
    city?: string;
  }): Donation {
    const all = this.getDonations();
    const today = new Date().toISOString().split('T')[0];
    const newDonation: Donation = {
      id: 'don-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: data.name.trim(),
      mobile: data.mobile.trim(),
      amount: Number(data.amount),
      date: today,
      timestamp: Date.now(),
      type: 'ONLINE',
      screenshotUrl: data.screenshotUrl || '',
      status: 'PENDING',
      sankalp: data.sankalp || '',
      gotra: data.gotra || '',
      city: data.city || '',
    };
    all.unshift(newDonation);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(all));
    this.notify();
    try {
      syncDonationToGoogleSheet(newDonation, this.getConfig());
    } catch {}
    return newDonation;
  }

  public generateReceiptNo(): string {
    const all = this.getDonations();
    const approved = all.filter((d) => d.receiptNo);
    const highestNum = approved.reduce((max, d) => {
      const match = d.receiptNo?.match(/MJS-2026-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1000);
    const nextNum = highestNum + 1;
    return `MJS-2026-${nextNum}`;
  }

  public approveDonation(id: string): { donation: Donation; whatsappUrl: string } {
    const all = this.getDonations();
    const index = all.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('Donation not found');

    const d = all[index];
    const receiptNo = d.receiptNo || this.generateReceiptNo();
    const receiptLink = `${WEBSITE_URL}/receipt/${receiptNo}`;

    const updated: Donation = {
      ...d,
      status: 'APPROVED',
      receiptNo,
      receiptLink,
    };
    all[index] = updated;
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(all));

    this.logAction('APPROVE_DONATION', `दान रसीद ${receiptNo} स्वीकृत: ${d.name} (₹${d.amount})`);

    const cleanMobile = d.mobile.replace(/\D/g, '').slice(-10);
    const whatsappMsg =
      `🙏 जय माँ जगदंबा 🙏\n` +
      `प्रिय ${d.name} जी, आपका ₹${d.amount} दान प्राप्त हुआ।\n` +
      `रसीद संख्या: ${receiptNo}\n` +
      `दिनांक: ${d.date}\n` +
      `- माँ जगदंबा स्थान ट्रस्ट, मथुरापुर, मुजफ्फरपुर\n` +
      `डिजिटल रसीद देखें/डाउनलोड करें: ${receiptLink}`;

    const whatsappUrl = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(whatsappMsg)}`;

    this.notify();
    try {
      syncDonationToGoogleSheet(updated, this.getConfig());
    } catch {}
    return { donation: updated, whatsappUrl };
  }

  public rejectDonation(id: string, reason?: string) {
    const all = this.getDonations();
    const index = all.findIndex((d) => d.id === id);
    if (index === -1) return;

    all[index] = {
      ...all[index],
      status: 'REJECTED',
      rejectionReason: reason || 'अमान्य अथवा स्पष्ट न दिखने वाला स्क्रीनशॉट',
    };
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(all));
    this.logAction('REJECT_DONATION', `दान अस्वीकृत: ID ${id}, नाम: ${all[index].name}, कारण: ${reason || 'अमान्य'}`);
    this.notify();
  }

  public updateDonation(id: string, updates: Partial<Donation>) {
    const all = this.getDonations();
    const index = all.findIndex((d) => d.id === id);
    if (index === -1) return;

    all[index] = { ...all[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(all));
    this.logAction('EDIT_DONATION', `दान विवरण संशोधित: ID ${id}, नाम: ${all[index].name}`);
    this.notify();
  }

  public deleteDonation(id: string, passwordConfirmation: string): boolean {
    const config = this.getConfig();
    if (passwordConfirmation !== config.adminPassword) {
      throw new Error('गलत एडमिन पासवर्ड! कृपया सही पासवर्ड दर्ज करें।');
    }

    const all = this.getDonations();
    const toDelete = all.find((d) => d.id === id);
    if (!toDelete) return false;

    const filtered = all.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(filtered));

    this.logAction(
      'DELETE_DONATION',
      `हटाया गया दान रिकॉर्ड: ID: ${id}, नाम: ${toDelete.name}, राशि: ₹${toDelete.amount}, रसीद: ${toDelete.receiptNo || 'N/A'}`
    );
    this.notify();
    return true;
  }

  // Cash Donation (by Staff or Admin)
  public addCashDonation(data: {
    name: string;
    mobile: string;
    amount: number;
    staffId: string;
    staffName: string;
    sankalp?: string;
    gotra?: string;
    city?: string;
  }): { donation: Donation; receiptLink: string } {
    const all = this.getDonations();
    const today = new Date().toISOString().split('T')[0];
    const receiptNo = this.generateReceiptNo();
    const receiptLink = `${WEBSITE_URL}/receipt/${receiptNo}`;

    const newDonation: Donation = {
      id: 'cash-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      name: data.name.trim(),
      mobile: data.mobile.trim(),
      amount: Number(data.amount),
      date: today,
      timestamp: Date.now(),
      type: 'CASH',
      status: 'APPROVED',
      receiptNo,
      receiptLink,
      collectedBy: {
        staffId: data.staffId,
        staffName: data.staffName,
      },
      sankalp: data.sankalp || '',
      gotra: data.gotra || '',
      city: data.city || '',
    };

    all.unshift(newDonation);
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(all));

    this.logAction(
      'CASH_DONATION',
      `नकद चंदा काटा गया: रसीद ${receiptNo}, ₹${data.amount}, सेवक: ${data.staffName} (${data.staffId})`
    );
    this.notify();
    try {
      syncDonationToGoogleSheet(newDonation, this.getConfig());
    } catch {}
    return { donation: newDonation, receiptLink };
  }

  // Staff Management
  public getStaffList(): Staff[] {
    if (typeof window === 'undefined') return INITIAL_STAFF;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STAFF);
      return data ? JSON.parse(data) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  }

  public getStaffById(id: string): Staff | undefined {
    return this.getStaffList().find((s) => s.id.toLowerCase() === id.toLowerCase());
  }

  public addStaff(staffData: {
    id: string;
    name: string;
    mobile: string;
    role: 'Pujari' | 'Cash' | 'Volunteer';
    password: string;
    photoUrl?: string;
  }): Staff {
    const list = this.getStaffList();
    const cleanId = staffData.id.trim().toLowerCase();

    if (list.some((s) => s.id.toLowerCase() === cleanId)) {
      throw new Error(`स्टाफ ID "${cleanId}" पहले से मौजूद है! कृपया दूसरी ID चुनें।`);
    }

    const today = new Date().toISOString().split('T')[0];
    const newStaff: Staff = {
      id: cleanId,
      name: staffData.name.trim(),
      mobile: staffData.mobile.trim(),
      role: staffData.role,
      password: staffData.password.trim(),
      photoUrl:
        staffData.photoUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      joinDate: today,
      active: true,
    };

    list.push(newStaff);
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
    this.logAction('ADD_STAFF', `नया स्टाफ जोड़ा गया: ${newStaff.name} (ID: ${newStaff.id}, Role: ${newStaff.role})`);
    this.notify();
    return newStaff;
  }

  public updateStaff(id: string, updates: Partial<Staff>) {
    const list = this.getStaffList();
    const index = list.findIndex((s) => s.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return;

    list[index] = { ...list[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(list));
    this.logAction('EDIT_STAFF', `स्टाफ विवरण अपडेट किया गया: ${list[index].name} (ID: ${list[index].id})`);
    this.notify();
  }

  public deleteStaff(id: string) {
    const list = this.getStaffList();
    const target = list.find((s) => s.id.toLowerCase() === id.toLowerCase());
    if (!target) return;

    const filtered = list.filter((s) => s.id.toLowerCase() !== id.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(filtered));
    this.logAction('DELETE_STAFF', `स्टाफ हटाया गया: ${target.name} (ID: ${target.id})`);
    this.notify();
  }

  public getStaffStats(staffId: string): {
    todayAmount: number;
    todayCount: number;
    totalAmount: number;
    totalCount: number;
  } {
    const donations = this.getDonations();
    const today = new Date().toISOString().split('T')[0];
    const staffDonations = donations.filter(
      (d) => d.collectedBy?.staffId.toLowerCase() === staffId.toLowerCase() && d.status === 'APPROVED'
    );

    let totalAmount = 0;
    let todayAmount = 0;
    let todayCount = 0;

    staffDonations.forEach((d) => {
      totalAmount += d.amount;
      if (d.date === today) {
        todayAmount += d.amount;
        todayCount += 1;
      }
    });

    return {
      todayAmount,
      todayCount,
      totalAmount,
      totalCount: staffDonations.length,
    };
  }

  public getStaffReceipts(staffId: string): Donation[] {
    const donations = this.getDonations();
    return donations.filter(
      (d) => d.collectedBy?.staffId.toLowerCase() === staffId.toLowerCase()
    );
  }

  // Notices
  public getNotices(): Notice[] {
    if (typeof window === 'undefined') return INITIAL_NOTICES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
      return data ? JSON.parse(data) : INITIAL_NOTICES;
    } catch {
      return INITIAL_NOTICES;
    }
  }

  public getApprovedNotices(limitCount = 5): Notice[] {
    const list = this.getNotices();
    return list
      .filter((n) => n.status === 'APPROVED')
      .slice(0, limitCount);
  }

  public addNotice(data: {
    title: string;
    details: string;
    date: string;
    addedBy: string;
    addedByRole: 'Admin' | 'Staff';
    status?: 'PENDING' | 'APPROVED';
  }): Notice {
    const list = this.getNotices();
    const newNotice: Notice = {
      id: 'not-' + Date.now(),
      title: data.title.trim(),
      details: data.details.trim(),
      date: data.date,
      addedBy: data.addedBy,
      addedByRole: data.addedByRole,
      status: data.status || (data.addedByRole === 'Admin' ? 'APPROVED' : 'PENDING'),
    };
    list.unshift(newNotice);
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(list));
    this.logAction('ADD_NOTICE', `नई सूचना जोड़ी गई: "${newNotice.title}" द्वारा ${newNotice.addedBy} (${newNotice.status})`);
    this.notify();
    return newNotice;
  }

  public approveNotice(id: string) {
    const list = this.getNotices();
    const index = list.findIndex((n) => n.id === id);
    if (index === -1) return;

    list[index].status = 'APPROVED';
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(list));
    this.logAction('APPROVE_NOTICE', `सूचना स्वीकृत की गई: "${list[index].title}"`);
    this.notify();
  }

  public updateNotice(id: string, updates: Partial<Notice>) {
    const list = this.getNotices();
    const index = list.findIndex((n) => n.id === id);
    if (index === -1) return;

    list[index] = { ...list[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(list));
    this.notify();
  }

  public deleteNotice(id: string) {
    const list = this.getNotices();
    const target = list.find((n) => n.id === id);
    const filtered = list.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(filtered));
    if (target) {
      this.logAction('DELETE_NOTICE', `सूचना हटाई गई: "${target.title}"`);
    }
    this.notify();
  }

  // Calendar
  public getCalendar(): CalendarItem[] {
    if (typeof window === 'undefined') return INITIAL_CALENDAR;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      return data ? JSON.parse(data) : INITIAL_CALENDAR;
    } catch {
      return INITIAL_CALENDAR;
    }
  }

  public updateCalendar(items: CalendarItem[]) {
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(items));
    this.notify();
  }

  public addCalendarItem(item: Omit<CalendarItem, 'id'>) {
    const list = this.getCalendar();
    const newItem: CalendarItem = {
      ...item,
      id: 'cal-' + Date.now(),
    };
    list.push(newItem);
    this.updateCalendar(list);
    this.logAction('ADD_CALENDAR', `कैलेंडर में पर्व जोड़ा गया: ${newItem.title}`);
  }

  public deleteCalendarItem(id: string) {
    const list = this.getCalendar();
    const filtered = list.filter((c) => c.id !== id);
    this.updateCalendar(filtered);
    this.notify();
  }

  // Gallery
  public addGalleryPhoto(photo: Omit<import('../types').GalleryPhoto, 'id'>) {
    const config = this.getConfig();
    const newPhoto = {
      ...photo,
      id: 'photo-' + Date.now(),
    };
    const updatedPhotos = [newPhoto, ...config.galleryPhotos];
    this.updateConfig({ galleryPhotos: updatedPhotos });
  }

  public deleteGalleryPhoto(id: string) {
    const config = this.getConfig();
    const updatedPhotos = config.galleryPhotos.filter((p) => p.id !== id);
    this.updateConfig({ galleryPhotos: updatedPhotos });
  }

  // Logs
  public getAdminLogs(): AdminLog[] {
    if (typeof window === 'undefined') return INITIAL_LOGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      return data ? JSON.parse(data) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  }

  public logAction(action: string, details: string, adminUser = 'Admin') {
    const logs = this.getAdminLogs();
    const newLog: AdminLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 100),
      action,
      details,
      timestamp: Date.now(),
      adminUser,
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  // Dashboard calculations
  public getDashboardStats() {
    const donations = this.getDonations();
    const staff = this.getStaffList();

    let totalOnlineApproved = 0;
    let totalCashAllStaff = 0;
    let pendingCount = 0;

    donations.forEach((d) => {
      if (d.status === 'PENDING') {
        pendingCount += 1;
      } else if (d.status === 'APPROVED') {
        if (d.type === 'ONLINE') {
          totalOnlineApproved += d.amount;
        } else if (d.type === 'CASH') {
          totalCashAllStaff += d.amount;
        }
      }
    });

    return {
      totalOnlineApproved,
      totalCashAllStaff,
      pendingCount,
      totalStaffCount: staff.filter((s) => s.active).length,
    };
  }
}

export const templeStore = new TempleStore();
