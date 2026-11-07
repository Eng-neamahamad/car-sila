import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Car, X, Plus } from 'lucide-react';

const BRAND_GROUPS = [
  {
    en: 'Japanese',
    ar: 'يابانية',
    brands: [
      ['Toyota', 'تويوتا'],
      ['Honda', 'هوندا'],
      ['Nissan', 'نيسان'],
      ['Mazda', 'مازدا'],
      ['Mitsubishi', 'ميتسوبيشي'],
      ['Subaru', 'سوبارو']
    ]
  },
  {
    en: 'Korean',
    ar: 'كورية',
    brands: [
      ['Hyundai', 'هيونداي'],
      ['Kia', 'كيا'],
      ['Genesis', 'جينيسيس']
    ]
  },
  {
    en: 'German and European',
    ar: 'ألمانية وأوروبية',
    brands: [
      ['Mercedes-Benz', 'مرسيدس-بنز'],
      ['BMW', 'بي إم دبليو'],
      ['Audi', 'أودي'],
      ['Volkswagen', 'فولكس فاجن'],
      ['Skoda', 'سكودا']
    ]
  },
  {
    en: 'American',
    ar: 'أمريكية',
    brands: [
      ['Ford', 'فورد'],
      ['Chevrolet', 'شيفروليه'],
      ['GMC', 'جي إم سي'],
      ['Jeep', 'جيب'],
      ['Tesla', 'تسلا']
    ]
  }
] as const;

const PLATE_PATTERN = /^(?=.*[\p{L}\p{N}])[\p{L}\p{N} -]{3,15}$/u;

export const AddVehicleModal: React.FC = () => {
  const {
    addVehicleModalOpen,
    setAddVehicleModalOpen,
    addVehicle,
    language,
    theme,
    t
  } = useApp();

  const [brand, setBrand] = useState('Toyota');
  const [customBrand, setCustomBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2024);
  const [color, setColor] = useState('White');
  const [plateNumber, setPlateNumber] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!addVehicleModalOpen) return null;

  const text = (ar: string, en: string) => (language === 'ar' ? ar : en);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosenBrand = brand === 'Other' ? customBrand.trim() : brand;
    const plate = plateNumber.trim();
    if (!chosenBrand || chosenBrand === 'Other') {
      setFormError(text('اكتب اسم الماركة في خيار أخرى', 'Type the brand name under Other'));
      return;
    }
    if (!model.trim()) {
      setFormError(text('اكتب موديل السيارة', 'Enter the vehicle model'));
      return;
    }
    if (!Number.isInteger(year) || year < 1990 || year > 2027) {
      setFormError(text('سنة الصنع لازم تكون بين 1990 و 2027', 'The year must be between 1990 and 2027'));
      return;
    }
    if (!PLATE_PATTERN.test(plate)) {
      setFormError(text(
        'رقم اللوحة من 3 إلى 15 حرفاً أو رقماً، ويمشي مع 22-12345 أو ABC-123. بدون ! @ # %',
        'Use 3 to 15 letters or numbers, such as 22-12345 or ABC-123. No ! @ # %'
      ));
      return;
    }
    setFormError('');
    setSaving(true);
    const saved = await addVehicle({
      brand: chosenBrand,
      model: model.trim(),
      year,
      color: color.trim() || 'White',
      plateNumber: plate,
      status: 'active'
    });
    setSaving(false);
    if (!saved) return;
    setModel('');
    setPlateNumber('');
    setCustomBrand('');
    setBrand('Toyota');
    setAddVehicleModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className={`rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border relative text-start transition-colors ${
        theme === 'dark' ? 'bg-[#0a2430] border-cyan-500/20 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close button */}
        <button
          type="button"
          onClick={() => setAddVehicleModalOpen(false)}
          className={`absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 rounded-full transition-colors cursor-pointer ${
            theme === 'dark' 
              ? 'text-slate-400 hover:text-white hover:bg-white/10' 
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold mb-2">
            <Car className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مركبة جديدة' : 'New Vehicle'}</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            {language === 'ar' ? 'إضافة سيارة جديدة' : 'Register a Vehicle'}
          </h3>
          <p className={`text-xs mt-1 font-medium ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {language === 'ar' 
              ? 'سيتم توليد كود وملصق QR ذكي ومشفر لسيارتك فوراً.' 
              : 'A unique encrypted CAR-SILA QR identity will be generated automatically.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Brand */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {language === 'ar' ? 'ماركة السيارة (Brand)' : 'Vehicle Brand'}
            </label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                theme === 'dark'
                  ? 'bg-[#041820] border-cyan-500/20 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              {BRAND_GROUPS.map((group) => (
                <optgroup key={group.en} label={language === 'ar' ? group.ar : group.en}>
                  {group.brands.map(([value, arabic]) => (
                    <option key={value} value={value}>{value} ({arabic})</option>
                  ))}
                </optgroup>
              ))}
              <option value="Other">{language === 'ar' ? 'أخرى / Other' : 'Other / أخرى'}</option>
            </select>
          </div>

          {brand === 'Other' && (
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {text('اسم الماركة', 'Brand name')}
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                placeholder={text('مثال: BYD أو بيجو', 'e.g. BYD or Peugeot')}
                className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  theme === 'dark'
                    ? 'bg-[#041820] border-cyan-500/20 text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
          )}

          {/* Model */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {language === 'ar' ? 'الموديل (Model)' : 'Model'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'ar' ? 'مثال: Corolla, Tucson, C200, Elantra' : 'e.g. Corolla, Tucson, C200'}
              maxLength={40}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                theme === 'dark'
                  ? 'bg-[#041820] border-cyan-500/20 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Year & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {language === 'ar' ? 'سنة الصنع' : 'Year'}
              </label>
              <input
                type="number"
                min="1990"
                max="2027"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  theme === 'dark'
                    ? 'bg-[#041820] border-cyan-500/20 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {language === 'ar' ? 'اللون' : 'Color'}
              </label>
              <input
                type="text"
                required
                placeholder={language === 'ar' ? 'أبيض، أسود، فضي...' : 'White, Black, Silver...'}
                maxLength={30}
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                  theme === 'dark'
                    ? 'bg-[#041820] border-cyan-500/20 text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Plate Number */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {language === 'ar' ? 'رقم اللوحة (Plate Number)' : 'Plate Number'}
            </label>
            <input
              type="text"
              required
              placeholder={language === 'ar' ? 'مثال: 22-12345 أو 6-9876-ط' : 'e.g. 22-12345 or ABC-123'}
              maxLength={15}
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm font-mono tracking-wider border focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
                theme === 'dark'
                  ? 'bg-[#041820] border-cyan-500/20 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            <p className={`text-[11px] mt-1.5 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {text('من 3 إلى 15 حرفاً أو رقماً. مثال: 22-12345 أو ABC-123 أو لوحة عربية.', '3 to 15 letters or numbers. Example: 22-12345, ABC-123, or an Arabic plate.')}
            </p>
          </div>

          {formError && <p className="text-xs font-bold text-red-500">{formError}</p>}

          {/* Buttons */}
          <div className={`pt-4 flex items-center justify-end gap-3 border-t ${
            theme === 'dark' ? 'border-cyan-500/15' : 'border-slate-100'
          }`}>
            <button
              type="button"
              onClick={() => setAddVehicleModalOpen(false)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-cyan-500/20 text-slate-300 hover:bg-white/5'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'حفظ وتوليد الرمز' : t('addVehicle')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};