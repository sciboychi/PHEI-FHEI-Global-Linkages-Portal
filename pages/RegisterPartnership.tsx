
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { partnershipService } from '../services/partnershipService';
import { REGIONS, CONTINENTS, SDG_LIST, COUNTRIES, getContinentForCountry } from '../constants';
import { PHEIType, AgreementType, ForeignPartnerType, AchieveCategory } from '../types';
import { 
  Save, ArrowLeft, Loader2, Globe, Building2, FileCheck, ShieldCheck, 
  Tag, CheckCircle2, ChevronDown, X, AlertCircle
} from 'lucide-react';
import { supabase } from '../services/supabase';
import DocumentUploader from '../components/DocumentUploader';
import SuccessView from '../components/SuccessView';

interface LinkageFormData {
  nameOfPHEI: string;
  typeOfPHEI: PHEIType;
  region: string;
  nameOfForeignInstitution: string;
  typeOfForeignPartner: ForeignPartnerType;
  country: string;
  continent: string;
  typeOfAgreement: AgreementType;
  field: string;
  dateSigned: string;
  yearSigned: number;
  agreement_path: string;
  cmo1_path: string;
  sdgs: number[];
  achieve_categories: AchieveCategory[];
}

const RegisterPartnership: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCountryList, setShowCountryList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, control, setValue, watch, trigger, formState: { errors } } = useForm<LinkageFormData>({
    defaultValues: {
      nameOfPHEI: '',
      typeOfPHEI: 'HEI',
      region: 'NCR',
      typeOfForeignPartner: 'University',
      continent: 'Asia',
      country: '',
      typeOfAgreement: 'MOU',
      yearSigned: new Date().getFullYear(),
      sdgs: [],
      achieve_categories: []
    }
  });

  const pheiName = watch('nameOfPHEI');
  const countryValue = watch('country');
  const selectedSDGs = watch('sdgs') || [];
  const selectedAchieve = watch('achieve_categories') || [];
  const agreementPath = watch('agreement_path');
  const cmo1Path = watch('cmo1_path');

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        const institutionName = user.user_metadata?.institution || '';
        setValue('nameOfPHEI', institutionName);
      }
    };
    loadUser();
  }, [setValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // INTEGRATED SUBMISSION FLOW
  const onSubmit = async (data: LinkageFormData) => {
    // 1. Mandatory Document Protocol Check
    if (!data.agreement_path || !data.cmo1_path) {
      alert("Transmission Blocked: Official MOU/MOA and CMO 1 Endorsement documents are mandatory for IAS audit.");
      return;
    }

    setLoading(true);
    try {
      // 2. Database Handshake (Includes insert into linkages and notifications)
      const { data: result, error } = await partnershipService.create(data);
      
      if (error) {
        // Log deep details for development/admin audit as requested
        console.log("CRITICAL SUBMISSION ERROR (PostgREST rejection):", JSON.stringify(error, null, 2));
        throw error;
      }

      // 3. Trigger Success Interface
      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Submission Process Failure:", err);
      alert(`Transmission failed. The CHED Central Matrix rejected the entry. Please verify that all required fields are filled correctly.`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.toLowerCase().includes((countryValue || '').toLowerCase())
  );

  const toggleSDG = (id: number) => {
    const current = selectedSDGs;
    // Keep as strings for the form, will be parsed in service to satisfy INTEGER[]
    const next = current.includes(id) ? current.filter(s => s !== id) : [...current, id];
    setValue('sdgs', next);
  };

  const toggleAchieve = (cat: AchieveCategory) => {
    const current = selectedAchieve;
    const next = current.includes(cat) ? current.filter(s => s !== cat) : [...current, cat];
    setValue('achieve_categories', next);
    setValue('field', next.join(', '));
  };

  const nextStep = async () => {
    const fieldsToValidate: any = {
      1: ['nameOfPHEI', 'region'],
      2: ['nameOfForeignInstitution', 'country'],
      3: ['agreement_path', 'cmo1_path', 'achieve_categories'],
    };
    
    const isValid = await trigger(fieldsToValidate[step]);
    if (isValid) setStep(prev => prev + 1);
  };

  const inputStyle = "w-full p-4 bg-white border border-gray-300 rounded-2xl focus:ring-4 focus:ring-[#0032a0]/10 focus:border-[#0032a0] outline-none transition-all font-bold text-sm text-black placeholder-gray-400 shadow-sm";
  const labelStyle = "block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col justify-center transition-all duration-700">
          {isSubmitted ? (
            <div className="animate-in fade-in zoom-in duration-500">
              {/* SUCCESS UI & TRANSITION to Institutional Submissions */}
              <SuccessView institutionName={pheiName} />
            </div>
          ) : (
            <>
              <div className="bg-[#0032a0] p-12 text-white relative">
                <ShieldCheck className="absolute top-12 right-12 text-white/10" size={120} />
                <h1 className="text-4xl font-black mb-3">Global Linkage Registration</h1>
                <p className="text-blue-100 opacity-80 text-sm font-medium tracking-wide uppercase">Official IAS Submission Portal</p>
              </div>

              <div className="p-12">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 font-bold text-sm hover:text-[#0032a0] mb-8 transition-colors">
                  <ArrowLeft size={16} /> Return to Profile
                </button>

                {/* Step Indicators */}
                <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
                  {[1, 2, 3, 4].map((s) => (
                    <React.Fragment key={s}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-all ${step >= s ? 'bg-[#0032a0] text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                        {step > s ? <CheckCircle2 size={20} /> : s}
                      </div>
                      {s < 4 && <div className={`h-1 w-20 rounded-full ${step > s ? 'bg-[#0032a0]' : 'bg-gray-100'}`} />}
                    </React.Fragment>
                  ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                  {step === 1 && (
                    <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center gap-2 mb-8 text-[#0032a0]">
                        <Building2 size={24} />
                        <h3 className="font-black uppercase tracking-widest text-sm">Institutional Identity</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                          <label className={labelStyle}>Verified PHEI Name</label>
                          <input readOnly {...register('nameOfPHEI')} className={`${inputStyle} bg-gray-100 border-gray-200 cursor-not-allowed`} />
                        </div>
                        <div>
                          <label className={labelStyle}>Institutional Type</label>
                          <select {...register('typeOfPHEI')} className={inputStyle}>
                            <option value="HEI">Private HEI</option>
                            <option value="SUC">SUC</option>
                            <option value="LUC">LUC</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelStyle}>Region</label>
                          <select {...register('region')} className={inputStyle}>
                            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="mt-12 flex justify-end">
                        <button type="button" onClick={nextStep} className="bg-[#0032a0] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Next Protocol &rarr;</button>
                      </div>
                    </section>
                  )}

                  {step === 2 && (
                    <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center gap-2 mb-8 text-[#c8102e]">
                        <Globe size={24} />
                        <h3 className="font-black uppercase tracking-widest text-sm">Foreign Partner Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                          <label className={labelStyle}>Name of Foreign Institution</label>
                          <input {...register('nameOfForeignInstitution', { required: true })} className={inputStyle} placeholder="Full Legal Name" />
                        </div>
                        <div className="relative" ref={dropdownRef}>
                          <label className={labelStyle}>Partner Country</label>
                          <input 
                            {...register('country', { required: true })}
                            className={inputStyle}
                            onFocus={() => setShowCountryList(true)}
                            onChange={(e) => {
                              setValue('country', e.target.value);
                              setShowCountryList(true);
                            }}
                          />
                          {showCountryList && filteredCountries.length > 0 && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl max-h-60 overflow-y-auto">
                              {filteredCountries.map(c => (
                                <div 
                                  key={c} 
                                  className="px-6 py-4 text-sm font-black text-black cursor-pointer hover:bg-blue-50 uppercase tracking-tight transition-colors" 
                                  onClick={() => { 
                                    setValue('country', c); 
                                    setValue('continent', getContinentForCountry(c)); 
                                    setShowCountryList(false); 
                                  }}
                                >
                                  {c}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className={labelStyle}>Continent</label>
                          <select {...register('continent')} className={inputStyle} readOnly>
                             {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="mt-12 flex justify-between">
                        <button type="button" onClick={() => setStep(1)} className="text-gray-400 font-black uppercase">Back</button>
                        <button type="button" onClick={nextStep} className="bg-[#0032a0] text-white px-10 py-4 rounded-2xl font-black uppercase">Next Protocol &rarr;</button>
                      </div>
                    </section>
                  )}

                  {step === 3 && (
                    <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center gap-2 mb-8 text-amber-500">
                        <FileCheck size={24} />
                        <h3 className="font-black uppercase tracking-widest text-sm">Evidence & Legal Instrument</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="md:col-span-2">
                          <label className={labelStyle}>ACHIEVE Areas (Strategic Alignment)</label>
                          <div className="flex flex-wrap gap-2">
                            {Object.values(AchieveCategory).map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => toggleAchieve(cat)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${selectedAchieve.includes(cat) ? 'bg-[#0032a0] text-white border-[#0032a0]' : 'bg-white text-gray-400 border-gray-100'}`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>

                        <DocumentUploader 
                          label="Upload Signed MOU/MOA (PDF/JPG)"
                          type="AGREEMENT"
                          value={agreementPath}
                          onChange={(val) => setValue('agreement_path', val)}
                          pheiName={pheiName}
                        />

                        <DocumentUploader 
                          label="Upload CMO 1 Endorsement"
                          type="CMO1"
                          value={cmo1Path}
                          onChange={(val) => setValue('cmo1_path', val)}
                          pheiName={pheiName}
                        />

                        <div>
                          <label className={labelStyle}>Type of Agreement</label>
                          <div className="flex gap-4">
                            {['MOU', 'MOA'].map(type => (
                              <button key={type} type="button" onClick={() => setValue('typeOfAgreement', type as AgreementType)} className={`flex-1 py-4 rounded-2xl font-black border-2 transition-all ${watch('typeOfAgreement') === type ? 'bg-[#0032a0] border-[#0032a0] text-white' : 'border-gray-100 text-gray-400'}`}>{type}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className={labelStyle}>Date Signed</label>
                          <input type="date" {...register('dateSigned', { required: true })} className={inputStyle} />
                        </div>
                      </div>
                      <div className="mt-12 flex justify-between">
                        <button type="button" onClick={() => setStep(2)} className="text-gray-400 font-black uppercase">Back</button>
                        <button type="button" onClick={nextStep} className="bg-[#0032a0] text-white px-10 py-4 rounded-2xl font-black uppercase">Next Protocol &rarr;</button>
                      </div>
                    </section>
                  )}

                  {step === 4 && (
                    <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center gap-2 mb-8 text-[#19486a]">
                        <Tag size={24} />
                        <h3 className="font-black uppercase tracking-widest text-sm">Final Submission & SDG Alignment</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-12">
                        {SDG_LIST.map((sdg) => (
                          <button key={sdg.id} type="button" onClick={() => toggleSDG(sdg.id)} className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-center transition-all ${selectedSDGs.includes(sdg.id) ? `${sdg.color} text-white border-transparent` : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                            <span className="text-[9px] font-black uppercase">{sdg.name}</span>
                            <span className="text-xl font-black opacity-30">{sdg.id}</span>
                          </button>
                        ))}
                      </div>

                      <div className="p-6 bg-red-50 rounded-3xl border border-red-100 mb-12">
                         <div className="flex items-center gap-3 text-[#c8102e] mb-2">
                           <AlertCircle size={20} />
                           <p className="text-xs font-black uppercase tracking-widest">Pre-Submission Confirmation</p>
                         </div>
                         <p className="text-[10px] font-bold text-red-700 leading-relaxed">
                           By submitting this linkage, you certify that all information is accurate and the attached MOU/MOA and CMO 1 are authentic. 
                           The CHED International Affairs Service (IAS) will verify these documents within 3-5 business days and approve your registration.
                         </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <button type="button" onClick={() => setStep(3)} className="text-gray-400 font-black uppercase tracking-widest">Back</button>
                        <button 
                          type="submit" 
                          disabled={loading || !agreementPath || !cmo1Path} 
                          className="bg-[#0032a0] hover:bg-[#00267a] text-white px-12 py-5 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl flex items-center gap-4 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                          {loading ? 'Transmitting Data...' : 'Submit Official Registration'}
                        </button>
                      </div>
                    </section>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPartnership;
