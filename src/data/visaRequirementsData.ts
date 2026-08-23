export interface VisaRequirementItem {
  id: string;
  country: string;
  visaType: 'Tourist' | 'Business' | 'Medical' | 'Student' | 'Transit' | 'Other';
  entryType: string; // e.g. E-Visa, Sticker Visa, ETA, VOA
  validity?: string;
  processingTime?: string;
  deliveryTime?: string;
  minBankBalance?: string;
  photoSpec?: string;
  passportValidity?: string;
  embassyFeeBDT?: string;
  serviceChargeBDT?: string;
  totalEstimatedBDT?: string;
  generalRequirements: string[];
  occupationRequirements?: {
    businessPerson?: string[];
    jobHolder?: string[];
    student?: string[];
    others?: string[];
  };
  notes?: string[];
  termsAndConditions?: string[];
}

export type VisaRequirement = VisaRequirementItem;

export const OFFICIAL_VISA_REQUIREMENTS: VisaRequirementItem[] = [
  // 1. Malaysia Single Entry - ৳5,000
  {
    id: 'malaysia-tourist-single',
    country: 'Malaysia',
    visaType: 'Tourist',
    entryType: 'Tourist (Single Entry E-Visa)',
    validity: '3 Months (Single Entry)',
    processingTime: '3–5 Working Days',
    minBankBalance: 'BDT 100,000 per applicant',
    photoSpec: 'Size 35 mm x 50 mm (Original soft copy from studio + printed copy with white background)',
    passportValidity: 'Minimum 7 months validity',
    embassyFeeBDT: 'BDT 3,500',
    serviceChargeBDT: 'BDT 1,500',
    totalEstimatedBDT: 'BDT 5,000',
    generalRequirements: [
      'Photograph of Applicant (Original soft copy from studio, size 35mm x 50mm + printed copy)',
      'Passport first page scan copy (Valid minimum 7 months)',
      'Latest Bank Statement for last 6 months (Minimum balance BDT 100,000 per applicant)',
      'Bank Solvency Certificate'
    ],
    occupationRequirements: {
      businessPerson: [
        'Renewal Trade License copy with notary public (English translated)',
        'Memorandum for Limited Company',
        'Office pad (Blank page on company letterhead)',
        'Visiting Card'
      ],
      jobHolder: [
        'No Objection Certificate (NOC) from employer',
        'BMDC Certificate (for Doctors)',
        'BAR Council Certificate (for Advocates)',
        'Salary Certificate with Pay Slips'
      ],
      student: [
        'Student ID Card photocopy',
        'Birth Certificate (Only for child & infant)',
        'Leave Certificate / School NOC'
      ],
      others: [
        'Marriage Certificate copy (For family application if husband name is not in passport)'
      ]
    }
  },

  // 2. Malaysia Multiple Entry - ৳5,500
  {
    id: 'malaysia-multiple-entry',
    country: 'Malaysia',
    visaType: 'Tourist',
    entryType: 'Tourist / Business (Multiple Entry E-Visa)',
    validity: '6/12 Months Multiple Entry',
    processingTime: '4–6 Working Days',
    minBankBalance: 'BDT 150,000 per applicant',
    photoSpec: 'Size 35 mm x 50 mm (White background, 2 copies)',
    passportValidity: 'Minimum 7 months validity',
    embassyFeeBDT: 'BDT 4,000',
    serviceChargeBDT: 'BDT 1,500',
    totalEstimatedBDT: 'BDT 5,500',
    generalRequirements: [
      'Original Passport scan (Minimum 7 months validity)',
      'Recent 35mm x 50mm white background photo (soft copy + printed)',
      'Bank Statement for last 6 months (Minimum balance BDT 150,000)',
      'Bank Solvency Certificate'
    ],
    occupationRequirements: {
      businessPerson: [
        'Trade License renewal copy with English translation and Notary',
        'Visiting card and company letterhead pad',
        'Company bank statement'
      ],
      jobHolder: [
        'Employer No Objection Certificate (NOC)',
        'Salary certificate and recent 3-month payslips',
        'Official ID card copy'
      ]
    }
  },

  // 3. Thailand - ৳6,250
  {
    id: 'thailand-tourist-evisa',
    country: 'Thailand',
    visaType: 'Tourist',
    entryType: 'Tourist (E-Visa / Sticker)',
    processingTime: '3–5 Working Days',
    deliveryTime: '5–10 Working Days (as per Embassy schedule)',
    minBankBalance: 'BDT 100,000 per person',
    photoSpec: 'Size 35mm x 45mm with white background (recent last 3 months, 2 copies)',
    passportValidity: 'Minimum 7 months validity (include old passports if any)',
    embassyFeeBDT: 'BDT 4,750',
    serviceChargeBDT: 'BDT 1,500',
    totalEstimatedBDT: 'BDT 6,250',
    generalRequirements: [
      'Passport validity minimum 07 months (include old passports if available)',
      'Recent 02 copies Photograph with white background (Size 35mm x 45mm, taken in last 3 months)',
      'Bank Statement for last 6 months (Minimum balance BDT 100,000 per person)',
      'Visiting Card',
      'Bank Solvency Certificate'
    ],
    occupationRequirements: {
      businessPerson: [
        'Renewal Trade License copy with notary public (English translated)',
        'Memorandum for Limited Company'
      ],
      jobHolder: [
        'No Objection Certificate (NOC) on office letterhead',
        'BMDC Certificate for Doctor / BAR Council Certificate for Advocate',
        'Salary Bank Statement (preferably) / Pay Slip / Salary Certificate'
      ],
      student: [
        'Student ID Card photocopy',
        'Birth Certificate (Only for child & infant)'
      ],
      others: [
        'Marriage Certificate copy (For family application - notarized English translation required)'
      ]
    },
    notes: [
      'If sponsored by company: Submit company Bank Statement, Solvency Letter, and Trade License.',
      'All documents in Bengali must be translated into English and certified by a notary public.'
    ]
  },

  // 4. China Single Entry (Regular) - ৳10,000
  {
    id: 'china-single-entry-regular',
    country: 'China',
    visaType: 'Tourist',
    entryType: 'Single Entry (Regular 15 Days)',
    validity: '3 Months (Single Entry 30-Day Stay)',
    processingTime: '12–15 Working Days',
    minBankBalance: 'BDT 300,000 minimum balance',
    photoSpec: 'Size 33 mm x 48 mm with white background (2 copies on mat paper)',
    passportValidity: 'Minimum 6 months validity from departure date',
    embassyFeeBDT: 'BDT 7,500',
    serviceChargeBDT: 'BDT 2,500',
    totalEstimatedBDT: 'BDT 10,000',
    generalRequirements: [
      'Original Passport (Validity at least 06 months from date of departure)',
      'Recent 33 mm x 48 mm size photo with white background (2 copies, mat paper)',
      'Visiting Card & National ID Card',
      'N.O.C / G.O / Trade License (Notarized copy with English translation on letterhead pad)',
      'Original Bank Statement for last 6 months (Minimum balance BDT 300,000)',
      'Bank Solvency Certificate',
      'Confirmed Return Air Ticket & Hotel Reservation'
    ],
    occupationRequirements: {
      businessPerson: [
        'Updated Trade License (Mandatory for business applicants, English translated & notarized)',
        'Memorandum for Limited Company',
        'Company Bank Statement & Solvency'
      ],
      jobHolder: [
        'Office NOC on company letterhead pad',
        'Salary Certificate and 3-month pay slips',
        'Visiting Card & Office ID card'
      ]
    },
    termsAndConditions: [
      'Visa fee is non-refundable regardless of the Embassy decision.',
      'Visa approval is at the sole discretion of the Chinese Embassy.'
    ]
  },

  // 5. China Single Entry (Express) - ৳10,500
  {
    id: 'china-single-entry-express',
    country: 'China',
    visaType: 'Tourist',
    entryType: 'Single Entry (Express 10–12 Days)',
    validity: '3 Months (Single Entry 30-Day Stay)',
    processingTime: '10–12 Working Days',
    minBankBalance: 'BDT 300,000 minimum balance',
    photoSpec: 'Size 33 mm x 48 mm with white background (2 copies on mat paper)',
    passportValidity: 'Minimum 6 months validity from departure date',
    embassyFeeBDT: 'BDT 8,000',
    serviceChargeBDT: 'BDT 2,500',
    totalEstimatedBDT: 'BDT 10,500',
    generalRequirements: [
      'Original Passport (Validity at least 06 months from date of departure)',
      'Recent 33 mm x 48 mm photo with white background (2 copies on mat paper)',
      'Visiting Card & National ID Card',
      'Bank Statement for last 6 months (Minimum balance BDT 300,000)',
      'Bank Solvency Certificate',
      'Express appointment and documentation processing'
    ]
  },

  // 6. China Single Entry (Urgent) - ৳11,500
  {
    id: 'china-single-entry-urgent',
    country: 'China',
    visaType: 'Tourist',
    entryType: 'Single Entry (Urgent 7 Days)',
    validity: '3 Months (Single Entry 30-Day Stay)',
    processingTime: '5–7 Working Days',
    minBankBalance: 'BDT 300,000 minimum balance',
    photoSpec: 'Size 33 mm x 48 mm with white background (2 copies on mat paper)',
    passportValidity: 'Minimum 6 months validity from departure date',
    embassyFeeBDT: 'BDT 8,500',
    serviceChargeBDT: 'BDT 3,000',
    totalEstimatedBDT: 'BDT 11,500',
    generalRequirements: [
      'Original Passport (Validity at least 06 months from date of departure)',
      'Recent 33 mm x 48 mm photo with white background (2 copies on mat paper)',
      'Visiting Card & National ID Card',
      'Priority fast-track processing at the Embassy center',
      'Bank Statement for last 6 months (Minimum balance BDT 300,000)',
      'Bank Solvency Certificate'
    ]
  },

  // 7. China 6 Months Double Entry - ৳12,000
  {
    id: 'china-double-entry-6m',
    country: 'China',
    visaType: 'Tourist',
    entryType: '6 Months Double Entry',
    validity: '6 Months (2 Entries, up to 30 days per entry)',
    processingTime: '12–15 Working Days',
    minBankBalance: 'BDT 400,000 minimum balance',
    photoSpec: 'Size 33 mm x 48 mm with white background (2 copies on mat paper)',
    passportValidity: 'Minimum 7 months validity from departure date',
    embassyFeeBDT: 'BDT 9,000',
    serviceChargeBDT: 'BDT 3,000',
    totalEstimatedBDT: 'BDT 12,000',
    generalRequirements: [
      'Original Passport (Validity at least 07 months)',
      'Recent 33 mm x 48 mm size photo with white background (2 copies on mat paper)',
      'Visiting Card & National ID Card',
      'Bank Statement for last 6 months (Minimum balance BDT 400,000)',
      'Bank Solvency Certificate',
      'Previous China visa copy or travel justification for double entry'
    ]
  },

  // 8. China 1 Year Multiple Entry - ৳16,000
  {
    id: 'china-multiple-entry-1y',
    country: 'China',
    visaType: 'Business',
    entryType: '1 Year Multiple Entry',
    validity: '1 Year Multiple Entry (Up to 30/60 days per visit)',
    processingTime: '12–15 Working Days',
    minBankBalance: 'BDT 500,000 minimum balance',
    photoSpec: 'Size 33 mm x 48 mm with white background (2 copies on mat paper)',
    passportValidity: 'Minimum 15 months validity from departure date',
    embassyFeeBDT: 'BDT 12,500',
    serviceChargeBDT: 'BDT 3,500',
    totalEstimatedBDT: 'BDT 16,000',
    generalRequirements: [
      'Original Passport (Validity at least 15 months)',
      'Recent 33 mm x 48 mm photo with white background (2 copies)',
      'Previous China visas (at least 2 previous entries required for 1-year eligibility)',
      'Official Chinese invitation letter from partner company (PU Letter / Official Invitation)',
      'Updated Trade License (English translated & notarized)',
      'Company and Personal Bank Statement (6 months, minimum BDT 500,000 balance)',
      'Bank Solvency Certificate'
    ]
  },

  // 9. China 2 Years Multiple Entry - ৳17,500
  {
    id: 'china-multiple-entry-2y',
    country: 'China',
    visaType: 'Business',
    entryType: '2 Years Multiple Entry',
    validity: '2 Years Multiple Entry (Up to 60/90 days per visit)',
    processingTime: '12–15 Working Days',
    minBankBalance: 'BDT 600,000 minimum balance',
    photoSpec: 'Size 33 mm x 48 mm with white background (2 copies on mat paper)',
    passportValidity: 'Minimum 27 months validity from departure date',
    embassyFeeBDT: 'BDT 13,500',
    serviceChargeBDT: 'BDT 4,000',
    totalEstimatedBDT: 'BDT 17,500',
    generalRequirements: [
      'Original Passport (Validity at least 27 months)',
      'Recent 33 mm x 48 mm photo with white background (2 copies)',
      'Proven China travel track record (Multiple previous visas used in the last 2 years)',
      'Official Chinese host company Invitation Letter',
      'Updated Trade License (Notarized English translation)',
      'Company and Personal Bank Statements (6 months, minimum BDT 600,000 balance)',
      'Bank Solvency Certificate'
    ]
  },

  // 10. India - ৳1,500
  {
    id: 'india-tourist-medical',
    country: 'India',
    visaType: 'Tourist',
    entryType: 'Tourist / Medical Visa (IVAC)',
    validity: '1 Year / 5 Years (Multiple Entry as per Embassy policy)',
    processingTime: '4–7 Working Days',
    passportValidity: 'Valid for at least 6 months beyond intended date of travel',
    photoSpec: 'Two recent 2x2 inch passport-sized photos with white background',
    embassyFeeBDT: 'BDT 800 (IVAC center fee)',
    serviceChargeBDT: 'BDT 700',
    totalEstimatedBDT: 'BDT 1,500',
    generalRequirements: [
      'Passport: Valid for at least 6 months beyond intended date of travel + old passports',
      'Photographs: Two recent 2x2 inch passport-sized photos with white background',
      'NID Card / Utility Bill copy for address proof',
      'Bank Statement / International Endorsement (Min USD 150 equivalent or BDT 20,000+)',
      'Profession proof: NOC / Trade License / Student ID card'
    ],
    notes: [
      'For Medical Visas: Hospital Invitation Letter and Doctor Referral from Bangladesh required.',
      'IVAC online appointment slot booking and document preparation included.'
    ]
  },

  // 11. Indonesia - ৳14,000
  {
    id: 'indonesia-tourist-evisa',
    country: 'Indonesia',
    visaType: 'Tourist',
    entryType: 'Tourist (E-Visa / Sticker)',
    processingTime: '5–10 Working Days',
    validity: 'Single-entry: Valid for 90 days, allows stay up to 60 days',
    minBankBalance: 'USD 2,000 (approx. BDT 240,000)',
    photoSpec: 'Recent passport-size photo with white background (soft copy & printed)',
    passportValidity: 'Valid for at least 6 months from planned departure date',
    embassyFeeBDT: 'BDT 11,000',
    serviceChargeBDT: 'BDT 3,000',
    totalEstimatedBDT: 'BDT 14,000',
    generalRequirements: [
      'Original passport – valid for at least 6 months from planned departure date',
      'Passport-size photo – recent, with white background',
      'Original bank statement – last 6 months, with minimum balance of USD 2,000 (~ BDT 240,000)',
      'Bank solvency certificate',
      'Notarized NOC / Trade license – translated into English on company letterhead pad',
      'Visiting card and National ID card',
      'Round-trip flight booking & hotel reservation voucher'
    ],
    notes: [
      'Single-entry visa valid for 90 days allowing up to 60 days stay in Bali / Jakarta.'
    ]
  },

  // 12. Singapore - ৳6,500
  {
    id: 'singapore-tourist-evisa',
    country: 'Singapore',
    visaType: 'Tourist',
    entryType: 'Tourist (E-Visa)',
    processingTime: '5–7 Working Days',
    minBankBalance: 'BDT 100,000 minimum balance',
    photoSpec: 'Size 35 mm x 45 mm with white background (2 copies on mat paper)',
    passportValidity: 'Minimum 6 months validity from departure date',
    embassyFeeBDT: 'BDT 4,500',
    serviceChargeBDT: 'BDT 2,000',
    totalEstimatedBDT: 'BDT 6,500',
    generalRequirements: [
      'Original Passport (Validity at least 06 months from date of departure)',
      'Recent 35 mm x 45 mm photo with white background (Mat Paper, 2 copies)',
      'Visiting Card & National ID Card',
      'N.O.C / G.O / Trade License Notarized Copy with English translation on letterhead pad',
      'Original Bank Statement for last 6 months (Minimum balance BDT 100,000)',
      'Bank Solvency Certificate',
      'Confirmed flight ticket reservation'
    ]
  },

  // 13. Sri Lanka - ৳4,000
  {
    id: 'srilanka-tourist-eta',
    country: 'Sri Lanka',
    visaType: 'Tourist',
    entryType: 'Tourist (ETA / E-Visa)',
    validity: '30 Days Double Entry',
    processingTime: '1–2 Working Days',
    passportValidity: 'Minimum 6 months validity from departure date',
    photoSpec: 'Recent passport size photo soft / scan copy with white background',
    embassyFeeBDT: 'BDT 3,000',
    serviceChargeBDT: 'BDT 1,000',
    totalEstimatedBDT: 'BDT 4,000',
    generalRequirements: [
      'Passport Soft / Scan Copy (Validity at least 06 months from date of departure)',
      'Recent Passport size photo Soft / Scan Copy with white background',
      'Confirmed flight ticket booking'
    ],
    notes: [
      'Electronic Travel Authorization (ETA) issued online with instant entry clearance.'
    ]
  },

  // 14. Additional Visa Price - ৳19,000 (Non-Refundable)
  {
    id: 'additional-visa-service',
    country: 'Additional Visa Option',
    visaType: 'Other',
    entryType: 'Specialized / Expedited Visa Assistance (Non-Refundable)',
    validity: 'Custom as per Destination Embassy',
    processingTime: 'Case-by-Case / Fast-Track',
    minBankBalance: 'Standard Embassy Verification',
    photoSpec: 'Standard Embassy Specifications',
    passportValidity: 'Minimum 6 months',
    embassyFeeBDT: 'BDT 14,000',
    serviceChargeBDT: 'BDT 5,000',
    totalEstimatedBDT: 'BDT 19,000 (Non-Refundable)',
    generalRequirements: [
      'Original Passport (Valid minimum 6 months from travel date)',
      'Photographs matching specific consulate criteria',
      'Complete financial documentation (6-month bank statement & solvency letter)',
      'Professional credentials (NOC / Trade license / Tax certificates)',
      'Tailored invitation letter or conference/business registration documents'
    ],
    notes: [
      'Specialized Visa Consultation & Priority Embassy Appointment Service.',
      'Strict Non-Refundable Policy: ৳19,000 fee is non-refundable regardless of the visa outcome or consulate processing times.'
    ],
    termsAndConditions: [
      'Additional Visa Price of ৳19,000 is 100% non-refundable under all circumstances.',
      'Visa granting decisions remain under the exclusive jurisdiction of the destination country Embassy or Immigration department.'
    ]
  },

  // 15. UAE / Dubai - ৳11,500
  {
    id: 'uae-dubai-tourist-evisa',
    country: 'United Arab Emirates (Dubai)',
    visaType: 'Tourist',
    entryType: '30-Day Tourist E-Visa',
    processingTime: '2–4 Working Days',
    validity: '30 Days Single Entry',
    passportValidity: 'Minimum 6 months validity',
    photoSpec: 'Passport-size white background photo scan',
    embassyFeeBDT: 'BDT 9,500',
    serviceChargeBDT: 'BDT 2,000',
    totalEstimatedBDT: 'BDT 11,500',
    generalRequirements: [
      'Passport clear scan copy (Validity minimum 6 months)',
      'Recent photo with white background (Soft copy)',
      'Confirmed flight ticket & hotel booking'
    ]
  },

  // 16. Vietnam - ৳5,500
  {
    id: 'vietnam-tourist-evisa',
    country: 'Vietnam',
    visaType: 'Tourist',
    entryType: 'Tourist E-Visa',
    processingTime: '3–5 Working Days',
    validity: '30 / 90 Days Single or Multiple Entry',
    passportValidity: 'Minimum 6 months validity',
    photoSpec: '4x6 cm white background soft copy',
    embassyFeeBDT: 'BDT 3,800',
    serviceChargeBDT: 'BDT 1,700',
    totalEstimatedBDT: 'BDT 5,500',
    generalRequirements: [
      'Passport scan copy (minimum 6 months validity)',
      'Recent 4x6 cm digital photo with white background',
      'Entry & exit port details'
    ]
  },

  // 17. Japan - ৳4,500
  {
    id: 'japan-tourist-sticker',
    country: 'Japan',
    visaType: 'Tourist',
    entryType: 'Tourist Sticker Visa',
    processingTime: '7–10 Working Days',
    validity: '90 Days Single Entry',
    minBankBalance: 'BDT 250,000 minimum balance',
    passportValidity: 'Minimum 6 months validity',
    photoSpec: '2x2 inch white background photo (2 copies)',
    embassyFeeBDT: 'BDT 2,500',
    serviceChargeBDT: 'BDT 2,000',
    totalEstimatedBDT: 'BDT 4,500',
    generalRequirements: [
      'Original Passport (minimum 6 months validity)',
      'Recent 2x2 inch photo with white background (2 copies)',
      'Bank statement (6 months) & solvency certificate',
      'NOC / Trade License & Visiting Card',
      'Day-by-day travel itinerary in Japan'
    ]
  }
];

export function getVisaRequirement(countryName: string, visaType?: string): VisaRequirementItem | null {
  if (!countryName) return null;
  const targetCountry = countryName.toLowerCase().trim();
  const targetType = (visaType || 'Tourist').toLowerCase().trim();

  // Special match for additional visa
  if (targetCountry.includes('additional')) {
    const add = OFFICIAL_VISA_REQUIREMENTS.find((v) => v.id === 'additional-visa-service');
    if (add) return add;
  }

  // Exact country + type match
  const exact = OFFICIAL_VISA_REQUIREMENTS.find(
    (v) => v.country.toLowerCase() === targetCountry && v.visaType.toLowerCase() === targetType
  );
  if (exact) return exact;

  // Partial match by country AND type
  const countryAndTypeMatch = OFFICIAL_VISA_REQUIREMENTS.find(
    (v) => (v.country.toLowerCase().includes(targetCountry) || targetCountry.includes(v.country.toLowerCase())) && v.visaType.toLowerCase() === targetType
  );
  if (countryAndTypeMatch) return countryAndTypeMatch;

  // Partial match by country
  const countryMatch = OFFICIAL_VISA_REQUIREMENTS.find(
    (v) => v.country.toLowerCase().includes(targetCountry) || targetCountry.includes(v.country.toLowerCase())
  );
  return countryMatch || null;
}

export function getVisaFeeForDestination(countryName: string, visaType?: string): string {
  if (!countryName) return 'BDT 5,000';
  const norm = countryName.toLowerCase();
  
  if (norm.includes('maldives') || norm.includes('nepal')) {
    return 'VOA Free / On Arrival';
  }

  if (norm.includes('additional')) {
    return 'BDT 19,000 (Non-Refundable)';
  }

  const req = getVisaRequirement(countryName, visaType);
  if (req && req.totalEstimatedBDT) {
    return req.totalEstimatedBDT;
  }
  
  if (norm.includes('china')) return 'BDT 10,000 – 17,500';
  if (norm.includes('india')) return 'BDT 1,500';
  if (norm.includes('indonesia') || norm.includes('bali')) return 'BDT 14,000';
  if (norm.includes('malaysia')) return 'BDT 5,000';
  if (norm.includes('singapore')) return 'BDT 6,500';
  if (norm.includes('sri lanka') || norm.includes('srilanka')) return 'BDT 4,000';
  if (norm.includes('thailand')) return 'BDT 6,250';
  if (norm.includes('dubai') || norm.includes('uae')) return 'BDT 11,500';
  if (norm.includes('vietnam')) return 'BDT 5,500';
  if (norm.includes('japan')) return 'BDT 4,500';

  return 'BDT 5,000 (Est.)';
}

export const VISA_REQUIREMENTS = OFFICIAL_VISA_REQUIREMENTS;

