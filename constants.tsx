
import React from 'react';
import { AchieveCategory } from './types';

export const COLORS = {
  BLUE: '#0032a0',
  RED: '#c8102e',
  YELLOW: '#fdda25',
};

export const SDG_LIST = [
  { id: 1, name: "No Poverty", color: "bg-[#e5243b]" },
  { id: 2, name: "Zero Hunger", color: "bg-[#dda63a]" },
  { id: 3, name: "Good Health", color: "bg-[#4c9f38]" },
  { id: 4, name: "Quality Education", color: "bg-[#c5192d]" },
  { id: 5, name: "Gender Equality", color: "bg-[#ff3a21]" },
  { id: 6, name: "Clean Water", color: "bg-[#26bde2]" },
  { id: 7, name: "Affordable Energy", color: "bg-[#fcc30b]" },
  { id: 8, name: "Decent Work", color: "bg-[#a21942]" },
  { id: 9, name: "Industry & Innovation", color: "bg-[#fd6925]" },
  { id: 10, name: "Reduced Inequality", color: "bg-[#dd1367]" },
  { id: 11, name: "Sustainable Cities", color: "bg-[#fd9d24]" },
  { id: 12, name: "Responsible Consumption", color: "bg-[#bf8b2e]" },
  { id: 13, name: "Climate Action", color: "bg-[#3f7e44]" },
  { id: 14, name: "Life Below Water", color: "bg-[#0a97d9]" },
  { id: 15, name: "Life on Land", color: "bg-[#56c02b]" },
  { id: 16, name: "Peace & Justice", color: "bg-[#00689d]" },
  { id: 17, name: "Partnerships", color: "bg-[#19486a]" },
];

export const ACHIEVE_MAP: Record<string, AchieveCategory> = {
  'Agriculture': AchieveCategory.AgricultureFood,
  'Food Systems': AchieveCategory.AgricultureFood,
  'Medicine': AchieveCategory.HealthWelfare,
  'Public Health': AchieveCategory.HealthWelfare,
  'Mathematics': AchieveCategory.NaturalSciences,
  'Biology': AchieveCategory.NaturalSciences,
  'Engineering': AchieveCategory.EngineeringManufacturing,
  'Manufacturing': AchieveCategory.EngineeringManufacturing,
  'Arts': AchieveCategory.CreativeIndustries,
  'Creative': AchieveCategory.CreativeIndustries,
  'Computer Science': AchieveCategory.DigitalAI,
  'AI': AchieveCategory.DigitalAI,
  'Technology': AchieveCategory.DigitalAI,
  'Tourism': AchieveCategory.Tourism,
  'Renewable': AchieveCategory.Energy,
  'Finance': AchieveCategory.FinanceActuarial,
  'Actuarial': AchieveCategory.FinanceActuarial,
  'Inclusive': AchieveCategory.InclusiveEducation,
  'Special Ed': AchieveCategory.InclusiveEducation,
};

export const ACHIEVE_COLORS: Record<AchieveCategory, string> = {
  [AchieveCategory.AgricultureFood]: 'bg-green-100 text-green-800 border-green-200',
  [AchieveCategory.HealthWelfare]: 'bg-red-100 text-red-800 border-red-200',
  [AchieveCategory.NaturalSciences]: 'bg-blue-100 text-blue-800 border-blue-200',
  [AchieveCategory.EngineeringManufacturing]: 'bg-gray-100 text-gray-800 border-gray-200',
  [AchieveCategory.CreativeIndustries]: 'bg-purple-100 text-purple-800 border-purple-200',
  [AchieveCategory.DigitalAI]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [AchieveCategory.Tourism]: 'bg-amber-100 text-amber-800 border-amber-200',
  [AchieveCategory.Energy]: 'bg-orange-100 text-orange-800 border-orange-200',
  [AchieveCategory.FinanceActuarial]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [AchieveCategory.InclusiveEducation]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

export const CONTINENTS = ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania', 'Antarctica'];
export const REGIONS = ['Region I', 'Region II', 'Region III', 'Region IV-A', 'Region IV-B', 'Region V', 'Region VI', 'Region VII', 'Region VIII', 'Region IX', 'Region X', 'Region XI', 'Region XII', 'Region XIII', 'NCR', 'CAR', 'BARMM'];

export const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Holy See", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

// Enhanced mapping for better auto-continent intelligence
export const COUNTRY_TO_CONTINENT: Record<string, string> = {
  // Asia
  "Singapore": "Asia", "Japan": "Asia", "South Korea": "Asia", "China": "Asia", "Vietnam": "Asia", "Thailand": "Asia", "Indonesia": "Asia", "Malaysia": "Asia", "Philippines": "Asia", "India": "Asia", "Cambodia": "Asia", "Laos": "Asia", "Brunei": "Asia", "Taiwan": "Asia", "Israel": "Asia", "Saudi Arabia": "Asia", "UAE": "Asia", "United Arab Emirates": "Asia", "Qatar": "Asia",
  // Europe
  "United Kingdom": "Europe", "Germany": "Europe", "France": "Europe", "Italy": "Europe", "Spain": "Europe", "Netherlands": "Europe", "Belgium": "Europe", "Switzerland": "Europe", "Sweden": "Europe", "Norway": "Europe", "Denmark": "Europe", "Finland": "Europe", "Austria": "Europe", "Poland": "Europe", "Portugal": "Europe", "Russia": "Europe",
  // North America
  "USA": "North America", "United States": "North America", "Canada": "North America", "Mexico": "North America", "Cuba": "North America", "Jamaica": "North America",
  // South America
  "Brazil": "South America", "Argentina": "South America", "Chile": "South America", "Colombia": "South America", "Peru": "South America", "Ecuador": "South America",
  // Oceania
  "Australia": "Oceania", "New Zealand": "Oceania", "Fiji": "Oceania", "Papua New Guinea": "Oceania",
  // Africa
  "Egypt": "Africa", "South Africa": "Africa", "Nigeria": "Africa", "Kenya": "Africa", "Morocco": "Africa", "Ethiopia": "Africa", "Ghana": "Africa"
};

export const getContinentForCountry = (country: string): string => {
  return COUNTRY_TO_CONTINENT[country] || "Asia"; // Default to Asia given the portal's high volume of ASEAN/Asian linkages
};
