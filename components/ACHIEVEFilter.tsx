
import React from 'react';
import { AchieveCategory } from '../types';
import { ACHIEVE_COLORS } from '../constants';
import { Info } from 'lucide-react';

interface ACHIEVEFilterProps {
  selected: AchieveCategory[];
  onChange: (categories: AchieveCategory[]) => void;
}

const ACHIEVEFilter: React.FC<ACHIEVEFilterProps> = ({ selected, onChange }) => {
  const toggle = (cat: AchieveCategory) => {
    if (selected.includes(cat)) {
      onChange(selected.filter(c => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#0032a0] flex items-center gap-2">
          ACHIEVE Priority Areas
          <span className="text-gray-400 group relative">
            <Info size={16} />
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
              Filtering by CHED's strategic development goals for internationalization.
            </div>
          </span>
        </h3>
        <button 
          onClick={() => onChange([])}
          className="text-xs text-blue-600 font-semibold hover:underline"
        >
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.values(AchieveCategory).map((cat) => {
          const isSelected = selected.includes(cat);
          const colorClass = ACHIEVE_COLORS[cat];
          const abbreviation = cat.charAt(0);

          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200 ${
                isSelected 
                  ? `${colorClass} ring-2 ring-offset-1 ring-blue-500` 
                  : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg flex-shrink-0 ${
                isSelected ? 'bg-white/40' : 'bg-gray-200'
              }`}>
                {abbreviation}
              </div>
              <span className="text-xs font-bold leading-tight uppercase tracking-tight">
                {cat}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ACHIEVEFilter;
