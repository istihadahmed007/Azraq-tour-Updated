/**
 * Canonical Visa Requirements & Trust Data Model for Bangladeshi Travelers
 * 
 * Strict Uniqueness Rule:
 * 1 Canonical Country Record per Destination Country.
 * Multiple genuine visa variants (e.g., Single Entry vs Multiple Entry) are cleanly
 * structured as sub-categories under the canonical country.
 */

export interface VisaCategoryVariant {
  id: string;
  name: string;
  visaType: 'Tourist' | 'Business' | 'Medical' | 'Student' | 'Transit' | 'Umrah' | 'Visa on Arrival';
  entryType: string; // e.g. "Single Entry eVisa", "Multiple Entry Sticker", "ETA", "VOA"
  validity: string;
  maxStay: string;
  processingTime: string;
  governmentFeeBDT: string;
  serviceChargeBDT: string;
  totalEstimatedBDT: string;
  minBankBalanceBDT: string;
  applicationMethod: 'Online eVisa' | 'Embassy In-Person' | 'VFS / Authorized Center' | 'Visa on Arrival';
  eligibility: string[];
  generalRequirements: string[];
  occupationRequirements?: {
    jobHolder?: string[];
    businessPerson?: string[];
    student?: string[];
    others?: string[];
  };
  notes?: string[];
}

export interface CanonicalCountryVisa {
  id: string; // URL Slug, e.g. "malaysia", "thailand", "china"
  country: string;
  countryCode: string;
  flagEmoji: string;
  targetNationality: string; // "Bangladeshi (Bangladesh Passport Holder)"
  title: string;
  seoTitle: string;
  metaDescription: string;
  overview: string;
  officialAuthorityName: string;
  officialEmbassySourceUrl: string;
  lastVerifiedDate: string; // e.g. "August 2026"
  isVerified: boolean;
  submissionCenter: string;
  photoSpec: string;
  passportValidity: string;
  disclaimer: string;
  primaryCategory: VisaCategoryVariant;
  availableVariants?: VisaCategoryVariant[];
  faqs?: Array<{ question: string; answer: string }>;
  termsAndConditions?: string[];
}

export interface VisaRequirementItem {
  id: string;
  country: string;
  countryCode?: string;
  flagEmoji?: string;
  title?: string;
  seoTitle?: string;
  metaDescription?: string;
  lastUpdated?: string;
  visaType: 'Tourist' | 'Business' | 'Medical' | 'Student' | 'Transit' | 'Umrah' | 'Visa on Arrival' | 'Other';
  entryType: string;
  validity?: string;
  maxStay?: string;
  processingTime?: string;
  deliveryTime?: string;
  minBankBalance?: string;
  minimumBankBalanceBDT?: string;
  photoSpec?: string;
  passportValidity?: string;
  embassyFeeBDT?: string;
  governmentFeeBDT?: string;
  serviceChargeBDT?: string;
  totalEstimatedBDT?: string;
  submissionCenter?: string;
  applicationMethod?: string;
  officialSourceUrl?: string;
  officialAuthorityName?: string;
  targetNationality?: string;
  isVerified?: boolean;
  disclaimer?: string;
  generalRequirements: string[];
  requiredDocuments?: string[];
  stepsToApply?: string[];
  occupationRequirements?: {
    businessPerson?: string[];
    jobHolder?: string[];
    student?: string[];
    others?: string[];
  };
  notes?: string[];
  termsAndConditions?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  variants?: VisaCategoryVariant[];
}

export type VisaRequirement = VisaRequirementItem;

export const OFFICIAL_VISA_DISCLAIMER =
  'Visa requirements, embassy fees, processing times, and document regulations are subject to change by respective immigration and consular authorities. Always verify the latest requirements with the relevant embassy or authorized visa center before applying.';

// -------------------------------------------------------------
// CANONICAL COUNTRY RECORDS (Strict 1 per Country)
// -------------------------------------------------------------
export const CANONICAL_COUNTRY_VISAS: CanonicalCountryVisa[] = [
  // 1. MALAYSIA
  {
    id: 'malaysia',
    country: 'Malaysia',
    countryCode: 'MY',
    flagEmoji: '🇲🇾',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Malaysia Visa Requirements for Bangladeshi Citizens',
    seoTitle: 'Malaysia Tourist Visa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Complete Malaysia eVisa and sticker visa requirements for Bangladeshi citizens. Official fees, 6-month bank solvency rules, photo specifications, and step-by-step checklist.',
    overview: 'Malaysia offers both single-entry and multiple-entry Electronic Visas (eVisa) for Bangladeshi passport holders traveling for tourism, social visits, or business meetings.',
    officialAuthorityName: 'Immigration Department of Malaysia / High Commission of Malaysia Dhaka',
    officialEmbassySourceUrl: 'https://malaysiavisa.imi.gov.my/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Official Malaysia eVisa Portal & Malaysian High Commission Dhaka Authorized Centers',
    photoSpec: 'Size 35 mm x 50 mm, studio soft copy + 2 printed copies with crisp white background (no glasses/headwear obstructing face).',
    passportValidity: 'Minimum 6 months validity from intended departure date (7 months recommended).',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'malaysia-tourist-single',
      name: 'Tourist Single Entry eVisa',
      visaType: 'Tourist',
      entryType: 'Tourist (Single Entry eVisa)',
      validity: '3 Months (90 Days from issue)',
      maxStay: 'Up to 30 Days Single Stay',
      processingTime: '3–5 Working Days',
      governmentFeeBDT: 'BDT 3,500',
      serviceChargeBDT: 'BDT 1,500',
      totalEstimatedBDT: 'BDT 5,000',
      minBankBalanceBDT: 'BDT 100,000 per applicant',
      applicationMethod: 'Online eVisa',
      eligibility: ['Bangladeshi passport holders traveling for tourism or family visit with verified return ticket.'],
      generalRequirements: [
        'Passport bio-page high-resolution color scan (valid minimum 6 months).',
        'Recent studio digital photograph (35mm x 50mm, white background).',
        'Original bank statement for the last 6 months with minimum ending balance of BDT 100,000 per person.',
        'Original Bank Solvency Certificate signed and sealed by the branch manager.',
        'Confirmed round-trip flight reservation from Dhaka.',
        'Confirmed hotel reservation matching travel dates in Malaysia.'
      ],
      occupationRequirements: {
        jobHolder: [
          'No Objection Certificate (NOC) on company letterhead pad.',
          'Office ID Card copy & visiting card.',
          'Salary certificate and recent 3-month pay slips.'
        ],
        businessPerson: [
          'Updated Trade License (English translated and notarized).',
          'Company Memorandum of Association & Article of Association (for Ltd. companies).',
          'Company bank statement and visiting card.'
        ],
        student: [
          'Valid Student ID Card copy.',
          'Leave certificate / NOC from educational institution.',
          'Birth certificate copy (for minors) & parent sponsorship documents.'
        ],
        others: [
          'Marriage Certificate copy with notarized English translation (for family applications).'
        ]
      },
      notes: [
        'Digital eVisa is sent via email and must be printed on A4 paper before departure.',
        'Mandatory Malaysia Digital Arrival Card (MDAC) must be completed online within 3 days prior to arrival.'
      ]
    },
    availableVariants: [
      {
        id: 'malaysia-multiple-entry',
        name: 'Tourist / Business Multiple Entry eVisa',
        visaType: 'Business',
        entryType: 'Multiple Entry eVisa',
        validity: '6 to 12 Months',
        maxStay: 'Up to 30 Days per entry',
        processingTime: '4–6 Working Days',
        governmentFeeBDT: 'BDT 4,000',
        serviceChargeBDT: 'BDT 1,500',
        totalEstimatedBDT: 'BDT 5,500',
        minBankBalanceBDT: 'BDT 150,000 per applicant',
        applicationMethod: 'Online eVisa',
        eligibility: ['Frequent business travelers and tourists with prior international travel history.'],
        generalRequirements: [
          'Passport scan with at least 7 months validity.',
          'Recent studio photograph (35mm x 50mm, white background).',
          'Bank statement for last 6 months (minimum BDT 150,000 balance).',
          'Bank solvency certificate.',
          'Invitation letter or justification for multiple entry.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Do Bangladeshi passport holders need a visa for Malaysia?',
        answer: 'Yes, Bangladeshi citizens require a valid Malaysia eVisa or sticker visa prior to boarding flights from Dhaka or Chittagong.'
      },
      {
        question: 'What is the required bank balance for a Malaysia tourist visa?',
        answer: 'A minimum ending balance of BDT 100,000 per person on a 6-month bank statement accompanied by an official bank solvency certificate.'
      },
      {
        question: 'How long does Malaysia eVisa processing take in Dhaka?',
        answer: 'Standard eVisa processing takes 3 to 5 business days after online document submission.'
      }
    ]
  },

  // 2. THAILAND
  {
    id: 'thailand',
    country: 'Thailand',
    countryCode: 'TH',
    flagEmoji: '🇹🇭',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Thailand Visa Requirements for Bangladeshi Citizens',
    seoTitle: 'Thailand Tourist Visa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Official Thailand tourist visa guidelines for Bangladeshi passport holders. VFS Global Dhaka submission rules, embassy fees in BDT, photo size, and document checklist.',
    overview: 'Thailand tourist visas for Bangladeshi nationals are processed through the Royal Thai Embassy Dhaka via authorized VFS Global application centers.',
    officialAuthorityName: 'Royal Thai Embassy, Dhaka / VFS Global Thailand Dhaka',
    officialEmbassySourceUrl: 'https://dhaka.thaiembassy.org/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'VFS Global Thailand Visa Application Centre, Gulshan-1 / Chittagong / Sylhet',
    photoSpec: 'Size 35 mm x 45 mm, white background, taken within the last 3 months (2 copies on matte paper).',
    passportValidity: 'Minimum 6 months validity from planned departure date + all previous original passports.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'thailand-tourist-sticker',
      name: 'Tourist Sticker Visa (TR)',
      visaType: 'Tourist',
      entryType: 'Tourist (Single Entry Sticker)',
      validity: '3 Months (Single Entry)',
      maxStay: 'Up to 60 Days',
      processingTime: '5–7 Working Days',
      governmentFeeBDT: 'BDT 4,750',
      serviceChargeBDT: 'BDT 1,500',
      totalEstimatedBDT: 'BDT 6,250',
      minBankBalanceBDT: 'BDT 100,000 per person / BDT 200,000 for family',
      applicationMethod: 'VFS / Authorized Center',
      eligibility: ['Bangladeshi passport holders traveling for leisure, holidays, or sightseeing.'],
      generalRequirements: [
        'Original Passport with minimum 6 months validity plus all previous original passports.',
        'Two recent 35mm x 45mm matte photos with white background.',
        'Original 6-month Bank Statement with minimum balance of BDT 100,000 per person (BDT 200,000 for family).',
        'Bank Solvency Certificate on bank letterhead.',
        'Visiting Card and copy of National ID (NID) card.',
        'Confirmed round-trip flight booking & hotel reservation in Thailand.'
      ],
      occupationRequirements: {
        jobHolder: [
          'No Objection Certificate (NOC) on company letterhead pad.',
          'BMDC Certificate (for Doctors) / Bar Council Certificate (for Lawyers).',
          'Salary Certificate and 3-month salary account statement / pay slips.'
        ],
        businessPerson: [
          'Updated Trade License (English translated and notarized).',
          'Memorandum of Association & Articles for Limited Companies.',
          'Company letterhead blank page and company bank statement.'
        ],
        student: [
          'Student ID card copy and leave approval from school/college/university.',
          'Birth certificate copy & parent sponsorship letter.'
        ]
      },
      notes: [
        'Passports with less than 6 months validity or missing blank visa pages will be rejected by VFS.',
        'Financial documents must be verified and stamped by the respective bank branch.'
      ]
    },
    faqs: [
      {
        question: 'Where do Bangladeshi citizens submit Thailand visa applications in Dhaka?',
        answer: 'Applications are submitted at the VFS Global Thailand Visa Application Centre located in Gulshan-1, Dhaka.'
      },
      {
        question: 'Is there a Visa on Arrival (VOA) for Bangladeshi passport holders in Thailand?',
        answer: 'No, Bangladeshi passport holders must obtain a sticker visa prior to travel.'
      }
    ]
  },

  // 3. CHINA
  {
    id: 'china',
    country: 'China',
    countryCode: 'CN',
    flagEmoji: '🇨🇳',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'China Visa Requirements for Bangladeshi Citizens',
    seoTitle: 'China Tourist & Business Visa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Complete China visa guide for Bangladeshi citizens. Embassy fees, Chinese Visa Application Service Center Dhaka rules, bank solvency, and multiple entry requirements.',
    overview: 'China offers Tourist (L), Business (M), and Multiple-Entry visas for Bangladeshi passport holders through the Chinese Visa Application Service Center in Dhaka.',
    officialAuthorityName: 'Embassy of the People’s Republic of China in Bangladesh / Chinese Visa Application Service Center Dhaka',
    officialEmbassySourceUrl: 'https://www.visaforchina.cn/DAC2_EN/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Chinese Visa Application Service Center, Bilkis Tower, Gulshan-2, Dhaka',
    photoSpec: 'Size 33 mm x 48 mm with white background (2 copies on matte paper). Ears, eyebrows, and forehead must be visible.',
    passportValidity: 'Minimum 6 months validity (Single Entry), 12+ months for multiple-entry.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'china-tourist-single',
      name: 'Tourist Visa (L-Visa Single Entry)',
      visaType: 'Tourist',
      entryType: 'Single Entry (Regular)',
      validity: '3 Months (Single Entry)',
      maxStay: 'Up to 30 Days',
      processingTime: '7–10 Working Days',
      governmentFeeBDT: 'BDT 7,500',
      serviceChargeBDT: 'BDT 2,500',
      totalEstimatedBDT: 'BDT 10,000',
      minBankBalanceBDT: 'BDT 300,000 minimum balance',
      applicationMethod: 'VFS / Authorized Center',
      eligibility: ['Bangladeshi passport holders visiting China for sightseeing, leisure, or family visits.'],
      generalRequirements: [
        'Original Passport with at least 6 months validity.',
        'Two recent 33mm x 48mm photos with white background on matte paper.',
        'Original 6-month Bank Statement with minimum balance of BDT 300,000.',
        'Bank Solvency Certificate.',
        'Visiting Card and National ID Card copy.',
        'Confirmed return air tickets and confirmed hotel booking in China.'
      ],
      occupationRequirements: {
        jobHolder: [
          'Office NOC on company letterhead pad.',
          'Salary Certificate and 3-month pay slips.',
          'Visiting Card and Office ID card.'
        ],
        businessPerson: [
          'Updated Trade License (English translated & notarized).',
          'Memorandum of Association for Limited Companies.',
          'Company Bank Statement & Solvency.'
        ]
      }
    },
    availableVariants: [
      {
        id: 'china-single-urgent',
        name: 'Tourist Single Entry (Urgent Express Fast-Track)',
        visaType: 'Tourist',
        entryType: 'Single Entry (Urgent Fast-Track)',
        validity: '3 Months',
        maxStay: 'Up to 30 Days',
        processingTime: '4–6 Working Days',
        governmentFeeBDT: 'BDT 8,500',
        serviceChargeBDT: 'BDT 3,000',
        totalEstimatedBDT: 'BDT 11,500',
        minBankBalanceBDT: 'BDT 300,000 minimum balance',
        applicationMethod: 'VFS / Authorized Center',
        eligibility: ['Applicants requiring accelerated consular processing for urgent departures.'],
        generalRequirements: [
          'Original Passport with minimum 6 months validity.',
          'Two 33mm x 48mm matte photos on white background.',
          'Bank statement (BDT 300,000 min balance) & solvency certificate.',
          'Express appointment booking at the Chinese Visa Center Dhaka.'
        ]
      },
      {
        id: 'china-double-entry',
        name: 'Double Entry Visa (6 Months)',
        visaType: 'Tourist',
        entryType: '6 Months Double Entry',
        validity: '6 Months',
        maxStay: 'Up to 30 Days per entry',
        processingTime: '7–10 Working Days',
        governmentFeeBDT: 'BDT 9,000',
        serviceChargeBDT: 'BDT 3,000',
        totalEstimatedBDT: 'BDT 12,000',
        minBankBalanceBDT: 'BDT 400,000 minimum balance',
        applicationMethod: 'VFS / Authorized Center',
        eligibility: ['Travelers entering mainland China twice within a 6-month period (e.g. transit via Hong Kong/Macau).'],
        generalRequirements: [
          'Original Passport with minimum 7 months validity.',
          'Bank Statement for last 6 months with BDT 400,000+ balance.',
          'Travel justification and itinerary showing double entry necessity.'
        ]
      },
      {
        id: 'china-business-multiple-1y',
        name: 'Business Visa (M-Visa 1 Year Multiple Entry)',
        visaType: 'Business',
        entryType: '1 Year Multiple Entry',
        validity: '1 Year Multiple Entry',
        maxStay: 'Up to 30/60 Days per entry',
        processingTime: '7–10 Working Days',
        governmentFeeBDT: 'BDT 12,500',
        serviceChargeBDT: 'BDT 3,500',
        totalEstimatedBDT: 'BDT 16,000',
        minBankBalanceBDT: 'BDT 500,000 minimum balance',
        applicationMethod: 'VFS / Authorized Center',
        eligibility: ['Business applicants with verified invitation from Chinese partner company and previous travel record.'],
        generalRequirements: [
          'Original Passport (valid minimum 15 months).',
          'Official Chinese invitation letter (PU letter / Authorized Invitation from Chinese entity).',
          'Proof of at least 2 previous China visas used responsibly.',
          'Updated Trade License (English translated and notarized).',
          'Company & Personal Bank statements with BDT 500,000+ balance.'
        ]
      }
    ],
    faqs: [
      {
        question: 'Where is the Chinese Visa Application Center located in Dhaka?',
        answer: 'It is located on the 3rd Floor of Bilkis Tower, Plot 6, Road 46, Gulshan-2, Dhaka 1212.'
      },
      {
        question: 'What photo size is required for a China visa from Bangladesh?',
        answer: 'China strictly requires 33mm x 48mm matte paper photos with pure white background, ears visible, and no white clothing.'
      }
    ]
  },

  // 4. SINGAPORE
  {
    id: 'singapore',
    country: 'Singapore',
    countryCode: 'SG',
    flagEmoji: '🇸🇬',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Singapore Visa Requirements for Bangladeshi Citizens',
    seoTitle: 'Singapore Tourist eVisa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Singapore tourist eVisa requirements for Bangladeshi citizens. ICA authorized agent submission rules, BDT fees, bank balance, and document checklist.',
    overview: 'Singapore Electronic Visas (eVisa) for Bangladeshi passport holders are processed through Authorized Visa Agents (AVA) appointed by the Singapore Immigration & Checkpoints Authority (ICA).',
    officialAuthorityName: 'Immigration & Checkpoints Authority (ICA) Singapore / Singapore High Commission Dhaka',
    officialEmbassySourceUrl: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Singapore High Commission Appointed Authorized Visa Agents (AVA) in Dhaka',
    photoSpec: 'Size 35 mm x 45 mm, white background, matte paper (2 copies, taken within last 3 months).',
    passportValidity: 'Minimum 6 months validity from entry date.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'singapore-tourist-evisa',
      name: 'Tourist eVisa',
      visaType: 'Tourist',
      entryType: 'Tourist (ICA eVisa)',
      validity: '30 to 60 Days (Single or Multiple Entry as granted by ICA)',
      maxStay: 'Up to 30 Days per visit',
      processingTime: '5–7 Working Days',
      governmentFeeBDT: 'BDT 4,500',
      serviceChargeBDT: 'BDT 2,000',
      totalEstimatedBDT: 'BDT 6,500',
      minBankBalanceBDT: 'BDT 100,000 per applicant',
      applicationMethod: 'Online eVisa',
      eligibility: ['Bangladeshi passport holders traveling for tourism, transit, or visiting family.'],
      generalRequirements: [
        'Original Passport with at least 6 months validity.',
        'Two recent 35mm x 45mm matte photos with white background.',
        'Bank statement for last 6 months with minimum balance of BDT 100,000.',
        'Bank Solvency Certificate.',
        'National ID Card & Visiting Card.',
        'Confirmed flight itinerary reservation from Dhaka.'
      ],
      occupationRequirements: {
        jobHolder: [
          'Office NOC on company letterhead pad.',
          'Visiting card and office ID copy.',
          'Salary certificate and pay slips.'
        ],
        businessPerson: [
          'Updated Trade License (English translated and notarized).',
          'Company letterhead pad & visiting card.',
          'Company bank statement.'
        ]
      },
      notes: [
        'Singapore Arrival Card (SGAC) with electronic health declaration must be submitted within 3 days prior to arrival.'
      ]
    },
    faqs: [
      {
        question: 'Can individuals apply directly on the Singapore ICA portal without an agent?',
        answer: 'Bangladeshi passport holders residing in Bangladesh must submit their visa application through ICA-authorized visa agents or a Singapore citizen/PR local sponsor.'
      }
    ]
  },

  // 5. INDONESIA (BALI)
  {
    id: 'indonesia',
    country: 'Indonesia',
    countryCode: 'ID',
    flagEmoji: '🇮🇩',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Indonesia (Bali) Visa Requirements for Bangladeshi Citizens',
    seoTitle: 'Indonesia Tourist eVisa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Indonesia tourist eVisa guidelines for Bangladeshi passport holders traveling to Bali and Jakarta. USD 2,000 bank solvency, embassy fees in BDT, and photo specs.',
    overview: 'Indonesia requires Bangladeshi passport holders to obtain an approved Tourist eVisa (B211A / 211A) prior to traveling to Bali, Jakarta, or other Indonesian destinations.',
    officialAuthorityName: 'Directorate General of Immigration, Republic of Indonesia / Embassy of Indonesia Dhaka',
    officialEmbassySourceUrl: 'https://evisa.imigrasi.go.id/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Official Indonesian Immigration eVisa Portal & Indonesian Embassy Dhaka',
    photoSpec: 'Recent passport-size photo with white background (digital soft copy and 2 printed copies).',
    passportValidity: 'Minimum 6 months validity from planned departure date.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'indonesia-tourist-evisa',
      name: 'Tourist eVisa (60-Day Stay)',
      visaType: 'Tourist',
      entryType: 'Tourist (Single Entry eVisa)',
      validity: '90 Days from issuance',
      maxStay: 'Up to 60 Days',
      processingTime: '5–8 Working Days',
      governmentFeeBDT: 'BDT 11,000',
      serviceChargeBDT: 'BDT 3,000',
      totalEstimatedBDT: 'BDT 14,000',
      minBankBalanceBDT: 'USD 2,000 equivalent (~BDT 240,000)',
      applicationMethod: 'Online eVisa',
      eligibility: ['Bangladeshi citizens visiting Bali or other Indonesian islands for holidays.'],
      generalRequirements: [
        'Original Passport with minimum 6 months validity.',
        'Recent digital passport photograph with white background.',
        'Original bank statement for last 6 months with minimum balance equivalent to USD 2,000 (~BDT 240,000).',
        'Bank Solvency Certificate.',
        'Notarized NOC or English translated Trade License.',
        'Round-trip flight booking and hotel reservation voucher.'
      ]
    },
    faqs: [
      {
        question: 'Is Bali visa on arrival available for Bangladeshi passport holders?',
        answer: 'No, Bangladeshi passport holders must acquire an Indonesian tourist eVisa before flying to Bali.'
      }
    ]
  },

  // 6. INDIA
  {
    id: 'india',
    country: 'India',
    countryCode: 'IN',
    flagEmoji: '🇮🇳',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'India Visa Requirements for Bangladeshi Citizens',
    seoTitle: 'India Tourist & Medical Visa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'India visa requirements for Bangladeshi citizens. IVAC Dhaka Gulshan / Jamuna Future Park application process, BDT 800 IVAC fee, and documentation checklist.',
    overview: 'India visas for Bangladeshi passport holders are processed through Indian Visa Application Centers (IVAC) managed by State Bank of India across Bangladesh.',
    officialAuthorityName: 'High Commission of India, Dhaka / IVAC Bangladesh',
    officialEmbassySourceUrl: 'https://www.ivacbd.com/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'IVAC Center (Jamuna Future Park Dhaka / Gulshan / Chittagong / Sylhet / Rajshahi / Khulna)',
    photoSpec: 'Two recent 2x2 inch (50mm x 50mm) color photos with white background.',
    passportValidity: 'Minimum 6 months validity plus all old original passports.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'india-tourist-ivac',
      name: 'Tourist / Medical Visa (IVAC)',
      visaType: 'Tourist',
      entryType: 'Tourist (Sticker Visa)',
      validity: '1 Year / 5 Years (Multiple Entry as granted by HCI)',
      maxStay: 'Up to 90 Days per entry',
      processingTime: '5–10 Working Days',
      governmentFeeBDT: 'BDT 800 (IVAC Processing Fee)',
      serviceChargeBDT: 'BDT 700',
      totalEstimatedBDT: 'BDT 1,500',
      minBankBalanceBDT: 'USD 150 endorsement or BDT 20,000+ bank balance',
      applicationMethod: 'VFS / Authorized Center',
      eligibility: ['Bangladeshi passport holders visiting India for tourism, medical treatment, or visiting relatives.'],
      generalRequirements: [
        'Original Passport with minimum 6 months validity + all old passports.',
        'Two recent 2x2 inch white background photos.',
        'National ID Card copy & recent utility bill (Electricity/Gas) for permanent address proof.',
        'Bank Statement (last 6 months) OR International Dollar Endorsement in passport (minimum USD 150).',
        'Proof of profession (NOC / Trade License / Student ID / Pension certificate).'
      ],
      occupationRequirements: {
        jobHolder: ['NOC from employer and Office ID copy.'],
        businessPerson: ['Trade License copy with English translation.'],
        student: ['Student ID card copy.']
      },
      notes: [
        'For Medical Visas: Hospital Invitation letter from India and Doctor Referral / Prescription from Bangladesh required.'
      ]
    },
    faqs: [
      {
        question: 'What is the government visa fee for Bangladeshi citizens visiting India?',
        answer: 'India does not charge a visa fee for Bangladeshi citizens; only the IVAC service processing fee of BDT 800 applies.'
      }
    ]
  },

  // 7. SRI LANKA
  {
    id: 'srilanka',
    country: 'Sri Lanka',
    countryCode: 'LK',
    flagEmoji: '🇱🇰',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Sri Lanka Visa Requirements for Bangladeshi Citizens',
    seoTitle: 'Sri Lanka Tourist ETA / eVisa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Official Sri Lanka tourist ETA requirements for Bangladeshi citizens. Fees in BDT, online approval within 24-48 hours, and required documents.',
    overview: 'Sri Lanka issues Electronic Travel Authorizations (ETA / eVisa) online for Bangladeshi citizens traveling for tourism and leisure.',
    officialAuthorityName: 'Department of Immigration and Emigration, Sri Lanka / High Commission of Sri Lanka Dhaka',
    officialEmbassySourceUrl: 'https://www.srilankaevisa.lk/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Official Sri Lanka ETA / eVisa Online Portal',
    photoSpec: 'Digital soft copy passport photo with white background.',
    passportValidity: 'Minimum 6 months validity from planned arrival date.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'srilanka-tourist-eta',
      name: 'Tourist Electronic Travel Authorization (ETA)',
      visaType: 'Tourist',
      entryType: 'Tourist (ETA / eVisa)',
      validity: '30 Days Double Entry',
      maxStay: 'Up to 30 Days',
      processingTime: '1–2 Working Days',
      governmentFeeBDT: 'BDT 3,000',
      serviceChargeBDT: 'BDT 1,000',
      totalEstimatedBDT: 'BDT 4,000',
      minBankBalanceBDT: 'Sufficient funds for stay',
      applicationMethod: 'Online eVisa',
      eligibility: ['Bangladeshi passport holders visiting Sri Lanka for holidays, sightseeing, or family visits.'],
      generalRequirements: [
        'Passport scan copy with at least 6 months validity.',
        'Recent digital passport size photo with white background.',
        'Confirmed return air ticket.',
        'Hotel booking reservation in Sri Lanka.'
      ]
    },
    faqs: [
      {
        question: 'How fast is Sri Lanka ETA approved for Bangladeshi travelers?',
        answer: 'Sri Lanka ETA approvals are typically issued online within 24 to 48 hours.'
      }
    ]
  },

  // 8. UNITED ARAB EMIRATES (DUBAI)
  {
    id: 'uae-dubai',
    country: 'United Arab Emirates (Dubai)',
    countryCode: 'AE',
    flagEmoji: '🇦🇪',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Dubai & UAE Visa Requirements for Bangladeshi Citizens',
    seoTitle: 'Dubai & UAE Tourist eVisa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Complete Dubai UAE tourist eVisa requirements for Bangladeshi citizens. GDRFA / ICP fees in BDT, 30/60-day options, and verified documentation checklist.',
    overview: 'The United Arab Emirates provides 30-day and 60-day Tourist eVisas for Bangladeshi passport holders processed via GDRFA Dubai / ICP immigration.',
    officialAuthorityName: 'General Directorate of Residency and Foreigners Affairs (GDRFA) Dubai / ICP UAE',
    officialEmbassySourceUrl: 'https://smartservices.icp.gov.ae/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Official UAE Immigration Portal & Authorized Travel Agents in Dhaka',
    photoSpec: 'Passport-size digital photo with white background (clear studio scan).',
    passportValidity: 'Minimum 6 months validity from planned arrival date.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'uae-dubai-tourist-30d',
      name: '30-Day Tourist eVisa',
      visaType: 'Tourist',
      entryType: 'Tourist (30-Day eVisa)',
      validity: '60 Days from issue date to enter UAE',
      maxStay: 'Up to 30 Days Single Stay',
      processingTime: '3–5 Working Days',
      governmentFeeBDT: 'BDT 9,500',
      serviceChargeBDT: 'BDT 2,000',
      totalEstimatedBDT: 'BDT 11,500',
      minBankBalanceBDT: 'Proof of funds recommended',
      applicationMethod: 'Online eVisa',
      eligibility: ['Bangladeshi citizens traveling to Dubai, Abu Dhabi, Sharjah, or other Emirates.'],
      generalRequirements: [
        'Clear color scan copy of passport bio page (minimum 6 months validity).',
        'Recent passport photo with white background (digital scan).',
        'Confirmed return air tickets & hotel reservation in Dubai.',
        'National ID Card copy.'
      ]
    },
    faqs: [
      {
        question: 'Can Bangladeshi citizens travel to Dubai on tourist visas currently?',
        answer: 'Yes, tourist eVisas are issued for genuine tourists through authorized travel agencies in accordance with GDRFA UAE guidelines.'
      }
    ]
  },

  // 9. VIETNAM
  {
    id: 'vietnam',
    country: 'Vietnam',
    countryCode: 'VN',
    flagEmoji: '🇻🇳',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Vietnam Visa Requirements for Bangladeshi Citizens',
    seoTitle: 'Vietnam Tourist eVisa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Official Vietnam tourist eVisa requirements for Bangladeshi citizens. Processing time, fees in BDT, photo specs, and step-by-step application instructions.',
    overview: 'Vietnam offers official electronic visas (eVisa) for Bangladeshi passport holders for 30 or 90 days single/multiple entry.',
    officialAuthorityName: 'Vietnam Immigration Department / Embassy of Vietnam Dhaka',
    officialEmbassySourceUrl: 'https://evisa.xuatnhapcanh.gov.vn/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Official Vietnam National eVisa Web Portal',
    photoSpec: '4x6 cm digital photo with white background, straight face without glasses.',
    passportValidity: 'Minimum 6 months validity from planned arrival date.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'vietnam-tourist-evisa',
      name: 'Tourist eVisa (30 Days Single Entry)',
      visaType: 'Tourist',
      entryType: 'Tourist (Online eVisa)',
      validity: '30 Days Single Entry',
      maxStay: 'Up to 30 Days',
      processingTime: '3–5 Working Days',
      governmentFeeBDT: 'BDT 3,800',
      serviceChargeBDT: 'BDT 1,700',
      totalEstimatedBDT: 'BDT 5,500',
      minBankBalanceBDT: 'Standard travel verification',
      applicationMethod: 'Online eVisa',
      eligibility: ['Bangladeshi passport holders visiting Hanoi, Da Nang, Ho Chi Minh City, or Halong Bay.'],
      generalRequirements: [
        'Passport bio-page clear color scan (valid at least 6 months).',
        'Recent digital portrait photo (4x6 cm, white background).',
        'Entry and exit port details (Hanoi Noi Bai / Da Nang / Ho Chi Minh Tan Son Nhat).',
        'Confirmed flight reservation and hotel accommodation.'
      ]
    },
    faqs: [
      {
        question: 'Can Bangladeshi citizens apply directly for Vietnam eVisa online?',
        answer: 'Yes, Bangladesh is on the official list of eligible countries for Vietnam’s 30/90-day eVisa system.'
      }
    ]
  },

  // 10. JAPAN
  {
    id: 'japan',
    country: 'Japan',
    countryCode: 'JP',
    flagEmoji: '🇯🇵',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Japan Visa Requirements for Bangladeshi Citizens',
    seoTitle: 'Japan Tourist Sticker Visa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Japan tourist visa requirements for Bangladeshi citizens. Embassy of Japan Dhaka checklist, minimum BDT 250,000 bank balance, itinerary schedule, and fees.',
    overview: 'Japan tourist visas for Bangladeshi passport holders are processed through the Consular Section of the Embassy of Japan in Dhaka with no embassy fee for rejected visas.',
    officialAuthorityName: 'Embassy of Japan in Bangladesh, Dhaka',
    officialEmbassySourceUrl: 'https://www.bd.emb-japan.go.jp/itpr_en/visa.html',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Embassy of Japan Consular Section, Plot 5 & 7, Dutabash Road, Baridhara, Dhaka',
    photoSpec: 'Size 2x2 inch (50mm x 50mm) with white background (2 copies, taken within last 6 months).',
    passportValidity: 'Minimum 6 months validity + all original old passports.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'japan-tourist-sticker',
      name: 'Tourist Temporary Visitor Visa',
      visaType: 'Tourist',
      entryType: 'Tourist (Single Entry Sticker)',
      validity: '3 Months (Single Entry)',
      maxStay: 'Up to 15 or 30 Days as granted',
      processingTime: '7–10 Working Days',
      governmentFeeBDT: 'BDT 2,500',
      serviceChargeBDT: 'BDT 2,000',
      totalEstimatedBDT: 'BDT 4,500',
      minBankBalanceBDT: 'BDT 250,000 minimum balance',
      applicationMethod: 'Embassy In-Person',
      eligibility: ['Bangladeshi passport holders visiting Japan for tourism, cultural exchange, or visiting acquaintances.'],
      generalRequirements: [
        'Original Passport with at least 6 months validity + all old passports.',
        'Two 2x2 inch photos with white background.',
        'Original 6-month Bank Statement with minimum balance of BDT 250,000.',
        'Bank Solvency Certificate.',
        'Detailed day-by-day Itinerary in Japan (Schedule of Stay / Taizai Nitteihyo).',
        'Proof of profession (NOC / Trade License / Salary certificate).'
      ]
    },
    faqs: [
      {
        question: 'What is the required daily itinerary format for a Japan visa from Dhaka?',
        answer: 'Japan Embassy requires a day-by-day Schedule of Stay specifying dates, activity plans, contact phone numbers, and hotel names.'
      }
    ]
  },

  // 11. MALDIVES
  {
    id: 'maldives',
    country: 'Maldives',
    countryCode: 'MV',
    flagEmoji: '🇲🇻',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Maldives Visa on Arrival for Bangladeshi Citizens',
    seoTitle: 'Maldives Visa on Arrival Rules for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Maldives Visa on Arrival (VOA) guidelines for Bangladeshi citizens. Free 30-day tourist visa at Male Airport, IMUGA traveler declaration, and entry checklist.',
    overview: 'Maldives grants a free 30-day Tourist Visa on Arrival (VOA) to all Bangladeshi passport holders arriving for leisure holidays.',
    officialAuthorityName: 'Maldives Immigration',
    officialEmbassySourceUrl: 'https://immigration.gov.mv/tourist-visa/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Velana International Airport (Male) Immigration Counter on Arrival',
    photoSpec: 'Standard passport photo (digital upload for IMUGA form).',
    passportValidity: 'Minimum 6 months validity from arrival date.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'maldives-tourist-voa',
      name: 'Tourist Visa on Arrival (Free VOA)',
      visaType: 'Visa on Arrival',
      entryType: 'Visa on Arrival (30 Days)',
      validity: '30 Days on Arrival',
      maxStay: 'Up to 30 Days',
      processingTime: 'Instant on Arrival at Male Airport',
      governmentFeeBDT: 'BDT 0 (Free VOA)',
      serviceChargeBDT: 'BDT 0 (Self-Service / Free)',
      totalEstimatedBDT: 'Free / BDT 0 (Airport VOA)',
      minBankBalanceBDT: 'USD 100 per day or confirmed resort package',
      applicationMethod: 'Visa on Arrival',
      eligibility: ['All Bangladeshi passport holders with confirmed resort/hotel booking and return flight.'],
      generalRequirements: [
        'Valid machine-readable or e-Passport with minimum 6 months validity.',
        'Confirmed return or onward air ticket from Male.',
        'Pre-paid confirmed resort / guesthouse booking voucher.',
        'Completed IMUGA Online Traveler Declaration within 96 hours before departure from Dhaka.'
      ]
    },
    faqs: [
      {
        question: 'Do Bangladeshi passport holders have to pay for a Maldives tourist visa?',
        answer: 'No, tourist visas for Maldives are issued completely FREE on arrival for up to 30 days.'
      }
    ]
  },

  // 12. NEPAL
  {
    id: 'nepal',
    country: 'Nepal',
    countryCode: 'NP',
    flagEmoji: '🇳🇵',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Nepal Visa on Arrival for Bangladeshi Citizens',
    seoTitle: 'Nepal Visa on Arrival & Embassy Guidelines for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Nepal tourist visa rules for Bangladeshi citizens. First visit of the fiscal year is free of government visa fee under SAARC reciprocity.',
    overview: 'Bangladeshi passport holders can obtain a Tourist Visa on Arrival at Tribhuvan International Airport (Kathmandu) with the first 30 days in a visa year granted free of government fee under SAARC reciprocity.',
    officialAuthorityName: 'Department of Immigration, Nepal / Embassy of Nepal Dhaka',
    officialEmbassySourceUrl: 'https://nepalimmigration.gov.np/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Tribhuvan International Airport (Kathmandu) VOA Counter & Embassy of Nepal Dhaka',
    photoSpec: 'Standard passport size photo (1 copy).',
    passportValidity: 'Minimum 6 months validity from departure date.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'nepal-tourist-voa',
      name: 'Tourist Visa on Arrival (SAARC Reciprocity)',
      visaType: 'Visa on Arrival',
      entryType: 'Visa on Arrival (Kathmandu Airport)',
      validity: '30 Days on Arrival',
      maxStay: 'Up to 30 Days (First 30 days free in calendar year)',
      processingTime: 'Instant on Arrival at Kathmandu Airport',
      governmentFeeBDT: 'BDT 0 (First 30 days in visa year free for SAARC)',
      serviceChargeBDT: 'BDT 0 (Self-Service / Free)',
      totalEstimatedBDT: 'Free / BDT 0 (Airport VOA)',
      minBankBalanceBDT: 'Sufficient funds for stay',
      applicationMethod: 'Visa on Arrival',
      eligibility: ['Bangladeshi passport holders traveling for tourism, trekking, or mountain expeditions.'],
      generalRequirements: [
        'Original Passport with minimum 6 months validity.',
        'Online Nepal VOA application form printout / QR code.',
        'Confirmed return flight ticket to Dhaka.',
        'Hotel booking confirmation in Kathmandu or Pokhara.'
      ]
    },
    faqs: [
      {
        question: 'Is Nepal visa free for Bangladeshi citizens?',
        answer: 'Under SAARC reciprocity, Bangladeshi passport holders receive their first 30-day visa in a calendar year free of government visa fees.'
      }
    ]
  },

  // 13. SAUDI ARABIA (UMRAH & TOURIST)
  {
    id: 'saudi-arabia',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    flagEmoji: '🇸🇦',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Saudi Arabia Umrah & Tourist Visa for Bangladeshi Citizens',
    seoTitle: 'Saudi Arabia Umrah & Tourist Visa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Complete Saudi Arabia Umrah visa, Tourist eVisa, and Tasheer Dhaka biometrics requirements for Bangladeshi passport holders.',
    overview: 'Saudi Arabia offers official Umrah eVisas and Tourist Visas for Bangladeshi citizens to perform Umrah in Makkah, visit Madinah, and explore Riyadh and Jeddah.',
    officialAuthorityName: 'Ministry of Hajj and Umrah / Ministry of Foreign Affairs, Kingdom of Saudi Arabia / Tasheer Dhaka',
    officialEmbassySourceUrl: 'https://visa.visitsaudi.com/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Official Nusuk Portal & Tasheer Visa Service Center (Gulshan-1, Dhaka)',
    photoSpec: 'Recent 2x2 inch photo with white background (digital scan).',
    passportValidity: 'Minimum 6 months validity from intended travel date.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'saudi-umrah-evisa',
      name: 'Official Umrah eVisa',
      visaType: 'Umrah',
      entryType: 'Umrah eVisa (Single / Multiple Entry)',
      validity: '90 Days from issuance',
      maxStay: 'Up to 90 Days in Kingdom',
      processingTime: '3–5 Working Days',
      governmentFeeBDT: 'BDT 16,500 (incl. mandatory health insurance)',
      serviceChargeBDT: 'BDT 3,500',
      totalEstimatedBDT: 'BDT 20,000',
      minBankBalanceBDT: 'Standard proof of funds',
      applicationMethod: 'Online eVisa',
      eligibility: ['Bangladeshi Muslims traveling for Umrah pilgrimage in Makkah and Ziyarah in Madinah.'],
      generalRequirements: [
        'Passport bio-page clear color scan (valid at least 6 months).',
        'Recent digital passport photo with white background.',
        'Confirmed round-trip flight booking to Jeddah (JED) or Madinah (MED).',
        'Confirmed Makkah & Madinah hotel booking via approved Nusuk platform.'
      ]
    }
  },

  // 14. TURKEY
  {
    id: 'turkey',
    country: 'Turkey',
    countryCode: 'TR',
    flagEmoji: '🇹🇷',
    targetNationality: 'Bangladeshi (Bangladesh Passport Holder)',
    title: 'Turkey Visa Requirements for Bangladeshi Citizens',
    seoTitle: 'Turkey Tourist Sticker Visa & eVisa Requirements for Bangladeshi Citizens – AzraqTrips',
    metaDescription: 'Turkey sticker visa requirements for Bangladeshi passport holders. Gateway Globe Dhaka center, bank solvency, and conditional eVisa rules.',
    overview: 'Turkey requires Bangladeshi citizens to obtain a sticker visa through Gateway Globe in Dhaka, unless holding a valid USA, UK, Ireland, or Schengen visa which qualifies for instant online eVisa.',
    officialAuthorityName: 'Embassy of the Republic of Turkey in Dhaka / Gateway Globe Bangladesh',
    officialEmbassySourceUrl: 'https://www.evisa.gov.tr/en/',
    lastVerifiedDate: 'August 2026',
    isVerified: true,
    submissionCenter: 'Gateway Globe Turkey Visa Application Center, Gulshan-1, Dhaka',
    photoSpec: 'Size 50 mm x 60 mm biometric photo with white background (2 copies).',
    passportValidity: 'Minimum 6 months validity from planned arrival date.',
    disclaimer: OFFICIAL_VISA_DISCLAIMER,
    primaryCategory: {
      id: 'turkey-tourist-sticker',
      name: 'Tourist Sticker Visa (Gateway Globe)',
      visaType: 'Tourist',
      entryType: 'Tourist (Single Entry Sticker)',
      validity: '6 Months (Single Entry)',
      maxStay: 'Up to 30 or 60 Days',
      processingTime: '10–15 Working Days',
      governmentFeeBDT: 'BDT 12,000',
      serviceChargeBDT: 'BDT 3,500',
      totalEstimatedBDT: 'BDT 15,500',
      minBankBalanceBDT: 'BDT 300,000 minimum balance',
      applicationMethod: 'VFS / Authorized Center',
      eligibility: ['Bangladeshi passport holders visiting Istanbul, Cappadocia, Antalya, or Pamukkale.'],
      generalRequirements: [
        'Original Passport with minimum 6 months validity.',
        'Two biometric photos (50mm x 60mm) with white background.',
        'Original 6-month Bank Statement with minimum balance of BDT 300,000.',
        'Bank Solvency Certificate.',
        'Updated Trade License (English translated and notarized) OR Employer NOC.',
        'Travel health insurance covering Turkey (min EUR 30,000 coverage).'
      ]
    }
  }
];

// -------------------------------------------------------------
// DERIVED OFFICIAL_VISA_REQUIREMENTS (Flat List with Unique IDs)
// -------------------------------------------------------------
export const OFFICIAL_VISA_REQUIREMENTS: VisaRequirementItem[] = CANONICAL_COUNTRY_VISAS.map((c) => {
  return {
    id: c.id,
    country: c.country,
    countryCode: c.countryCode,
    flagEmoji: c.flagEmoji,
    title: c.title,
    seoTitle: c.seoTitle,
    metaDescription: c.metaDescription,
    lastUpdated: c.lastVerifiedDate,
    visaType: c.primaryCategory.visaType,
    entryType: c.primaryCategory.entryType,
    validity: c.primaryCategory.validity,
    maxStay: c.primaryCategory.maxStay,
    processingTime: c.primaryCategory.processingTime,
    minBankBalance: c.primaryCategory.minBankBalanceBDT,
    minimumBankBalanceBDT: c.primaryCategory.minBankBalanceBDT,
    photoSpec: c.photoSpec,
    passportValidity: c.passportValidity,
    embassyFeeBDT: c.primaryCategory.governmentFeeBDT,
    governmentFeeBDT: c.primaryCategory.governmentFeeBDT,
    serviceChargeBDT: c.primaryCategory.serviceChargeBDT,
    totalEstimatedBDT: c.primaryCategory.totalEstimatedBDT,
    submissionCenter: c.submissionCenter,
    applicationMethod: c.primaryCategory.applicationMethod,
    officialSourceUrl: c.officialEmbassySourceUrl,
    officialAuthorityName: c.officialAuthorityName,
    targetNationality: c.targetNationality,
    isVerified: c.isVerified,
    disclaimer: c.disclaimer,
    generalRequirements: c.primaryCategory.generalRequirements,
    requiredDocuments: c.primaryCategory.generalRequirements,
    occupationRequirements: c.primaryCategory.occupationRequirements,
    notes: c.primaryCategory.notes,
    faqs: c.faqs,
    variants: c.availableVariants
  };
});

export const VISA_REQUIREMENTS = OFFICIAL_VISA_REQUIREMENTS;

/**
 * Get canonical country visa by slug or name
 */
export function getCanonicalVisaByCountry(countryNameOrSlug: string): CanonicalCountryVisa | null {
  if (!countryNameOrSlug) return null;
  const query = countryNameOrSlug.toLowerCase().trim();

  // Exact ID match
  const byId = CANONICAL_COUNTRY_VISAS.find((c) => c.id.toLowerCase() === query);
  if (byId) return byId;

  // Exact Country name match
  const byCountry = CANONICAL_COUNTRY_VISAS.find((c) => c.country.toLowerCase() === query);
  if (byCountry) return byCountry;

  // Partial match
  const partial = CANONICAL_COUNTRY_VISAS.find(
    (c) => c.country.toLowerCase().includes(query) || query.includes(c.country.toLowerCase()) || c.id.includes(query)
  );
  return partial || null;
}

/**
 * Robust lookup helper for backwards compatibility
 */
export function getVisaRequirement(countryName: string, visaType?: string): VisaRequirementItem | null {
  if (!countryName) return null;
  const canonical = getCanonicalVisaByCountry(countryName);
  if (!canonical) return null;

  // Check if a specific variant was requested
  if (visaType && canonical.availableVariants) {
    const variant = canonical.availableVariants.find(
      (v) => v.visaType.toLowerCase() === visaType.toLowerCase() || v.name.toLowerCase().includes(visaType.toLowerCase())
    );
    if (variant) {
      return {
        id: variant.id,
        country: canonical.country,
        countryCode: canonical.countryCode,
        flagEmoji: canonical.flagEmoji,
        title: `${canonical.country} ${variant.name} Requirements`,
        seoTitle: canonical.seoTitle,
        metaDescription: canonical.metaDescription,
        lastUpdated: canonical.lastVerifiedDate,
        visaType: variant.visaType,
        entryType: variant.entryType,
        validity: variant.validity,
        maxStay: variant.maxStay,
        processingTime: variant.processingTime,
        minBankBalance: variant.minBankBalanceBDT,
        minimumBankBalanceBDT: variant.minBankBalanceBDT,
        photoSpec: canonical.photoSpec,
        passportValidity: canonical.passportValidity,
        embassyFeeBDT: variant.governmentFeeBDT,
        governmentFeeBDT: variant.governmentFeeBDT,
        serviceChargeBDT: variant.serviceChargeBDT,
        totalEstimatedBDT: variant.totalEstimatedBDT,
        submissionCenter: canonical.submissionCenter,
        applicationMethod: variant.applicationMethod,
        officialSourceUrl: canonical.officialEmbassySourceUrl,
        officialAuthorityName: canonical.officialAuthorityName,
        targetNationality: canonical.targetNationality,
        isVerified: canonical.isVerified,
        disclaimer: canonical.disclaimer,
        generalRequirements: variant.generalRequirements,
        requiredDocuments: variant.generalRequirements,
        occupationRequirements: variant.occupationRequirements || canonical.primaryCategory.occupationRequirements,
        notes: variant.notes || canonical.primaryCategory.notes,
        faqs: canonical.faqs
      };
    }
  }

  // Return primary category representation
  return OFFICIAL_VISA_REQUIREMENTS.find((v) => v.country.toLowerCase() === canonical.country.toLowerCase()) || null;
}

/**
 * Get verified fee range or estimate for a destination
 */
export function getVisaFeeForDestination(countryName: string, visaType?: string): string {
  if (!countryName) return 'BDT 5,000';
  const norm = countryName.toLowerCase();

  if (norm.includes('maldives') || norm.includes('nepal')) {
    return 'VOA Free / On Arrival';
  }

  const req = getVisaRequirement(countryName, visaType);
  if (req && req.totalEstimatedBDT) {
    return req.totalEstimatedBDT;
  }

  if (norm.includes('china')) return 'BDT 10,000';
  if (norm.includes('india')) return 'BDT 1,500';
  if (norm.includes('indonesia') || norm.includes('bali')) return 'BDT 14,000';
  if (norm.includes('malaysia')) return 'BDT 5,000';
  if (norm.includes('singapore')) return 'BDT 6,500';
  if (norm.includes('sri lanka') || norm.includes('srilanka')) return 'BDT 4,000';
  if (norm.includes('thailand')) return 'BDT 6,250';
  if (norm.includes('dubai') || norm.includes('uae')) return 'BDT 11,500';
  if (norm.includes('vietnam')) return 'BDT 5,500';
  if (norm.includes('japan')) return 'BDT 4,500';
  if (norm.includes('saudi') || norm.includes('umrah')) return 'BDT 20,000';
  if (norm.includes('turkey')) return 'BDT 15,500';

  return 'BDT 5,000 (Est.)';
}
