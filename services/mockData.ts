
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
