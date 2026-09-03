
import { Partnership, PHEIType, AgreementType, PartnershipStatus, AchieveCategory } from '../types';
import { ACHIEVE_MAP } from '../constants';

// Add export keyword to pheiNames to resolve import error in UserManagement.tsx
export const pheiNames = [
  'University of the Philippines', 'Ateneo de Manila University', 'De La Salle University',
  'University of Santo Tomas', 'Polytechnic University of the Philippines',
  'Mapua University', 'Silliman University', 'Cebu Normal University',
  'Batangas State University', 'Mindanao State University'
];

const fheiNames = [
  'National University of Singapore', 'University of Tokyo', 'Harvard University',
  'Oxford University', 'Australian National University', 'Technical University of Munich',
  'Tsinghua University', 'Seoul National University', 'University of British Columbia'
];

const countries = ['Singapore', 'Japan', 'USA', 'UK', 'Australia', 'Germany', 'China', 'South Korea', 'Canada', 'France'];
const fields = Object.keys(ACHIEVE_MAP);

export const generatePartnerships = (count: number): Partnership[] => {
  return Array.from({ length: count }, (_, i) => {
    const field = fields[Math.floor(Math.random() * fields.length)];
    const phei = pheiNames[Math.floor(Math.random() * pheiNames.length)];
    const fhei = fheiNames[Math.floor(Math.random() * fheiNames.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    
    // Assign ACHIEVE categories based on field
    const achieveCategories = [ACHIEVE_MAP[field]];
    
    // Fix: Removed reference to non-existent property AchieveCategory.InnovationResearch.
    // Instead, we optionally add another random valid category to simulate multi-disciplinary linkages.
    if (Math.random() > 0.7) {
      const allCategories = Object.values(AchieveCategory);
      const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
      if (!achieveCategories.includes(randomCategory)) {
        achieveCategories.push(randomCategory);
      }
    }

    // Fix: Using correct property names 'pheiName' and 'foreignInstitution' to match Partnership interface
    // Also removed properties like 'dateSubmitted', 'typeOfPHEI', etc. which are not in the Partnership type
    return {
      id: `p-${i}`,
      pheiName: phei,
      country: country,
      foreignInstitution: fhei,
      field: field,
      yearSigned: 2023,
      // Fix: Changed invalid 'Active' to 'Approved' to match PartnershipStatus type definition
      status: ['Approved', 'Pending', 'Approved', 'Approved'][Math.floor(Math.random() * 4)] as PartnershipStatus,
      continent: 'Asia',
      achieveCategories: achieveCategories
    };
  });
};

export const MOCK_PARTNERSHIPS = generatePartnerships(200); // 200 for demo performance, easily scalable

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  institution_name: string;
  role: 'PHEI_USER' | 'CHED_ADMIN';
  created_at: string;
}

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: 'user-ched-1',
    email: 'admin@ched.gov.ph',
    full_name: 'Director Maria Elena Santos',
    institution_name: 'CHED IAS - Central Office',
    role: 'CHED_ADMIN',
    created_at: '2024-01-15T08:00:00.000Z'
  },
  {
    id: 'user-ched-2',
    email: 'r.deguzman@ched.gov.ph',
    full_name: 'Atty. Ronald De Guzman',
    institution_name: 'Legal & International Affairs Division',
    role: 'CHED_ADMIN',
    created_at: '2024-02-10T09:30:00.000Z'
  },
  {
    id: 'user-ched-3',
    email: 'f.reyes@ched.gov.ph',
    full_name: 'Dr. Francisca Reyes',
    institution_name: 'International Affairs Staff',
    role: 'CHED_ADMIN',
    created_at: '2024-03-01T10:15:00.000Z'
  },
  {
    id: 'user-ched-4',
    email: 'p.mendoza@ched.gov.ph',
    full_name: 'Engr. Paolo Mendoza',
    institution_name: 'Linkages & Recognition Division',
    role: 'CHED_ADMIN',
    created_at: '2024-04-12T11:45:00.000Z'
  },
  {
    id: 'user-phei-1',
    email: 'j.delacruz@up.edu.ph',
    full_name: 'Juan Dela Cruz',
    institution_name: 'University of the Philippines',
    role: 'PHEI_USER',
    created_at: '2024-01-20T14:20:00.000Z'
  },
  {
    id: 'user-phei-2',
    email: 'm.santos@ateneo.edu',
    full_name: 'Maria Clara Santos',
    institution_name: 'Ateneo de Manila University',
    role: 'PHEI_USER',
    created_at: '2024-02-05T13:10:00.000Z'
  },
  {
    id: 'user-phei-3',
    email: 'j.rizal@dlsu.edu.ph',
    full_name: 'Jose Rizal',
    institution_name: 'De La Salle University',
    role: 'PHEI_USER',
    created_at: '2024-02-18T16:00:00.000Z'
  },
  {
    id: 'user-phei-4',
    email: 'a.luna@ust.edu.ph',
    full_name: 'Antonio Luna',
    institution_name: 'University of Santo Tomas',
    role: 'PHEI_USER',
    created_at: '2024-03-11T08:45:00.000Z'
  },
  {
    id: 'user-phei-5',
    email: 'g.silang@pup.edu.ph',
    full_name: 'Gabriela Silang',
    institution_name: 'Polytechnic University of the Philippines',
    role: 'PHEI_USER',
    created_at: '2024-03-25T15:30:00.000Z'
  },
  {
    id: 'user-phei-6',
    email: 'e.aguinaldo@mapua.edu.ph',
    full_name: 'Emilio Aguinaldo',
    institution_name: 'Mapua University',
    role: 'PHEI_USER',
    created_at: '2024-04-02T10:00:00.000Z'
  },
  {
    id: 'user-phei-7',
    email: 't.magbanua@su.edu.ph',
    full_name: 'Teresa Magbanua',
    institution_name: 'Silliman University',
    role: 'PHEI_USER',
    created_at: '2024-04-18T14:15:00.000Z'
  },
  {
    id: 'user-phei-8',
    email: 'a.mabini@batstate-u.edu.ph',
    full_name: 'Apolinario Mabini',
    institution_name: 'Batangas State University',
    role: 'PHEI_USER',
    created_at: '2024-05-01T09:00:00.000Z'
  },
  {
    id: 'user-phei-9',
    email: 'm.aquino@msu.edu.ph',
    full_name: 'Melchora Aquino',
    institution_name: 'Mindanao State University',
    role: 'PHEI_USER',
    created_at: '2024-05-15T11:20:00.000Z'
  },
  {
    id: 'user-phei-10',
    email: 'a.bonifacio@cnu.edu.ph',
    full_name: 'Andres Bonifacio',
    institution_name: 'Cebu Normal University',
    role: 'PHEI_USER',
    created_at: '2024-06-01T13:40:00.000Z'
  }
];
