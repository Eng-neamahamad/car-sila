import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Car, X, Plus } from 'lucide-react';

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
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2024);
  const [color, setColor] = useState('White');
  const [plateNumber, setPlateNumber] = useState('');

  if (!addVehicleModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim() || !plateNumber.trim()) return;

    addVehicle({
      brand,
      model: model.trim(),
      year: Number(year) || 2024,
      color: color.trim() || 'White',
      plateNumber: plateNumber.trim(),
      status: 'active'
    });

    setModel('');
    setPlateNumber('');
    setAddVehicleModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className={`rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border relative overflow-hidden text-start transition-colors ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close button */}
        <button
          type="button"
          onClick={() => setAddVehicleModalOpen(false)}
          className={`absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 rounded-full transition-colors cursor-pointer ${
            theme === 'dark' 
              ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold mb-2">
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
              className={`w-full p-2.5 rounded-xl text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="Toyota">Toyota (تويوتا)</option>
              <option value="Hyundai">Hyundai (هيونداي)</option>
              <option value="Kia">Kia (كيا)</option>
              <option value="Mercedes-Benz">Mercedes-Benz (مرسيدس)</option>
              <option value="BMW">BMW (بي إم دبليو)</option>
              <option value="Volkswagen">Volkswagen (فولكس فاجن)</option>
              <option value="Audi">Audi (أودي)</option>
              <option value="Honda">Honda (هوندا)</option>
              <option value="Nissan">Nissan (نيسان)</option>
              <option value="Ford">Ford (فورد)</option>
              <option value="Chevrolet">Chevrolet (شيفروليه)</option>
              <option value="Mazda">Mazda (مازدا)</option>
              <option value="Lexus">Lexus (لكزس)</option>
              <option value="Land Rover">Land Rover (لاند روفر)</option>
              <option value="Other">ماركة أخرى / Other</option>
            </select>
          </div>

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
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
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
                className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
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
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
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
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-sm font-mono tracking-wider border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Buttons */}
          <div className={`pt-4 flex items-center justify-end gap-3 border-t ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <button
              type="button"
              onClick={() => setAddVehicleModalOpen(false)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
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