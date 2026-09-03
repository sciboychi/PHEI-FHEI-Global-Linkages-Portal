
export type PHEIType = 'LUC' | 'SUC' | 'HEI';
export type AgreementType = 'MOU' | 'MOA';
export type PartnershipStatus = 'Approved' | 'Pending' | 'Expired' | 'Needs Revision' | 'Rejected';
export type ForeignPartnerType = 'University' | 'Organization' | 'Government' | 'Industry' | 'Network' | 'Other';

export enum AchieveCategory {
  AgricultureFood = 'Agriculture and Food Systems',
  HealthWelfare = 'Health and Welfare',
  NaturalSciences = 'Natural Sciences and Mathematics',
  EngineeringManufacturing = 'Engineering and Advanced Manufacturing',
  CreativeIndustries = 'Creative Industries',
  DigitalAI = 'Digital and AI Technologies',
  Tourism = 'Tourism',
  Energy = 'Energy',
  FinanceActuarial = 'Finance and Actuarial Sciences',
  InclusiveEducation = 'Inclusive Education'
}

export interface Partnership {
  id: string;
  pheiName: string;
  pheiType?: PHEIType;
  region?: string;
  country: string;
  foreignInstitution: string;
  foreignPartnerType?: ForeignPartnerType;
  field: string;
  yearSigned: number;
  dateSigned?: string;
  typeOfAgreement?: AgreementType;
  status: PartnershipStatus;
  continent?: string;
  achieveCategories: AchieveCategory[];
  remarks?: string;
  agreement_document_url?: string;
  cmo1_document_url?: string;
  document_url?: string;
  sdgs?: number[];
  registered_by?: string;
  createdAt?: string;
}

export type UserRole = 'CHED_ADMIN' | 'PHEI_USER';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  institution?: string;
  email?: string;
  needsPasswordReset?: boolean;
}

export interface Comment {
  id: string;
  partnership_id: string;
  user_id: string;
  author_name: string;
  author_role: UserRole;
  content: string;
  created_at: string;
}
