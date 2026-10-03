'use client';

export type LanguageCode = 'en' | 'hi' | 'te';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  reportIssue: string;
  trackComplaints: string;
  liveMap: string;
  dashboard: string;
  status: string;
  priority: string;
  origin: string;
  cleanlinessScore: string;
  ecoPoints: string;
  emergencySos: string;
  syncStatus: string;
  online: string;
  offline: string;
  syncNow: string;
  submitReport: string;
  selectLocation: string;
  category: string;
  description: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: 'SmartWaste 360',
    tagline: 'Visakhapatnam Municipal Operations Platform',
    reportIssue: 'Report Waste Problem',
    trackComplaints: 'Track Complaints',
    liveMap: 'Live Operations Map',
    dashboard: 'Municipal Command Centre',
    status: 'Lifecycle State',
    priority: 'Priority Level',
    origin: 'Data Provenance',
    cleanlinessScore: 'Ward Cleanliness Score',
    ecoPoints: 'Eco-Points & Rewards',
    emergencySos: 'EMERGENCY SOS',
    syncStatus: 'Offline Synchronization',
    online: 'Network Online',
    offline: 'Offline Mode Active',
    syncNow: 'Sync Now',
    submitReport: 'Submit Incident Report',
    selectLocation: 'Select GPS Location',
    category: 'Waste Category',
    description: 'Issue Description',
  },
  hi: {
    appName: 'स्मार्टवेस्ट 360',
    tagline: 'विशाखापटनम नगर निगम परिचालन मंच',
    reportIssue: 'कचरा समस्या की रिपोर्ट करें',
    trackComplaints: 'शिकायतों को ट्रैक करें',
    liveMap: 'लाइव जीआईएस मानचित्र',
    dashboard: 'नगर निगम कमांड सेंटर',
    status: 'स्थिति अवस्था',
    priority: 'प्राथमिकता स्तर',
    origin: 'डेटा स्रोत provenance',
    cleanlinessScore: 'वार्ड स्वच्छता स्कोर',
    ecoPoints: 'इको-पॉइंट्स और पुरस्कार',
    emergencySos: 'आपातकालीन एसओएस',
    syncStatus: 'ऑफलाइन सिंक स्थिति',
    online: 'नेटवर्क ऑनलाइन',
    offline: 'ऑफलाइन मोड सक्रिय',
    syncNow: 'अभी सिंक करें',
    submitReport: 'घटना रिपोर्ट जमा करें',
    selectLocation: 'जीपीएस स्थान चुनें',
    category: 'कचरा श्रेणी',
    description: 'समस्या का विवरण',
  },
  te: {
    appName: 'స్మార్ట్‌వేస్ట్ 360',
    tagline: 'విశాఖపట్నం మున్సిపల్ ఆపరేషన్స్ ప్లాట్‌ఫారమ్',
    reportIssue: 'చెత్త సమస్యను నివేదించండి',
    trackComplaints: 'ఫిర్యాదులను ట్రాక్ చేయండి',
    liveMap: 'లైవ్ GIS మ్యాప్',
    dashboard: 'మున్సిపల్ కమాండ్ సెంటర్',
    status: 'స్థితి దశాంశం',
    priority: 'ప్రాధాన్యతా స్థాయి',
    origin: 'డేటా మూలం (Provenance)',
    cleanlinessScore: 'వార్డు పరిశుభ్రత స్కోరు',
    ecoPoints: 'ఈకో-పాయింట్లు మరియు రివార్డులు',
    emergencySos: 'అత్యవసర SOS',
    syncStatus: 'ఆఫ్‌లైన్ సింక్ పరిస్థితి',
    online: 'నెట్‌వర్క్ ఆన్‌లైన్',
    offline: 'ఆఫ్‌లైన్ మోడ్ యాక్టివ్',
    syncNow: 'ఇప్పుడే సింక్ చేయండి',
    submitReport: 'సమస్య నివేదికను సమర్పించండి',
    selectLocation: 'GPS స్థానాన్ని ఎంచుకోండి',
    category: 'చెత్త వర్గం',
    description: 'సమస్య వివరణ',
  },
};
