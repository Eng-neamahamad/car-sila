import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QRStickerCard } from './QRStickerCard';
import logo from '../../assets/logo.png';
import {
  X,
  Printer,
  FileDown,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const PrintQRModal: React.FC = () => {
  const { printModalVehicle, setPrintModalVehicle, language, showToast } = useApp();
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  if (!printModalVehicle) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!printAreaRef.current) return;
    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(printAreaRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 140;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (210 - imgWidth) / 2;
      const y = 35;

      pdf.setFontSize(16);
      pdf.setTextColor(15, 23, 42);
      pdf.text('CAR-SILA • Windshield QR Sticker', 105, 22, { align: 'center' });

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        'Print and fix this sticker visibly on your vehicle windshield.',
        105,
        y + imgHeight + 15,
        { align: 'center' }
      );

      pdf.save(`CAR-SILA-${printModalVehicle.plateNumber.replace(/\s+/g, '-')}-Sticker.pdf`);
      showToast(
        language === 'ar' ? 'تم تنزيل ملف PDF بنجاح!' : 'PDF downloaded successfully!',
        'success'
      );
    } catch (error) {
      console.error('PDF error:', error);
      showToast(language === 'ar' ? 'حدث خطأ أثناء تنزيل PDF' : 'Error generating PDF', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleCopyImage = async () => {
    if (!printAreaRef.current) return;
    try {
      const canvas = await html2canvas(printAreaRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
          showToast(
            language === 'ar' ? 'تم نسخ الملصق كصورة للحافظة!' : 'Sticker copied as image to clipboard!',
            'success'
          );
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0a2430] rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-cyan-500/20 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setPrintModalVehicle(null)}
          className="absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors no-print cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 no-print text-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold mb-2">
            <Printer className="w-3.5 h-3.5" />
            {language === 'ar' ? 'خيارات الطباعة والتصدير' : 'Print & Export Sticker'}
          </div>
          <h3 className="text-xl font-black text-white">
            {language === 'ar' ? 'ملصق السيارة الذكي' : 'Smart Vehicle QR Sticker'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'ar'
              ? 'يمكنك سحب الملصق كملف PDF عالي الدقة، أو نسخه كصورة ولصقه مباشرة في أي مكان.'
              : 'Export as high-resolution PDF or copy directly as an image.'}
          </p>
        </div>

        <div
          ref={printAreaRef}
          className="p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center print:border-solid print:border-black print:bg-white my-4"
        >
          <div className="w-full max-w-xs bg-white p-6 rounded-2xl border-2 border-slate-300 shadow-md text-center space-y-3">
            <img src={logo} alt="CAR-SILA" className="h-14 w-auto object-contain mx-auto" />

            <div className="py-1 px-3 bg-slate-100 rounded-lg inline-block text-xs font-mono font-bold text-slate-900 border border-slate-200">
              {printModalVehicle.brand} {printModalVehicle.model} • {printModalVehicle.plateNumber}
            </div>

            <div className="flex justify-center my-2">
              <QRStickerCard
                vehicle={printModalVehicle}
                size={160}
                showActions={false}
                compact
              />
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1">
              <p className="text-xs font-black text-slate-900 tracking-wide uppercase">
                {language === 'ar' ? 'امسح للاتصال بالمالك' : 'SCAN TO CONTACT OWNER'}
              </p>
              <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                {language === 'ar' ? 'خصوصية تامة بدون رقم هاتف' : '100% Private • No Phone Needed'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 no-print pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingPdf ? (language === 'ar' ? 'جارٍ التصدير...' : 'Exporting...') : (language === 'ar' ? 'سحب PDF للطباعة' : 'Download PDF')}</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#041820] hover:bg-[#063040] text-white text-xs font-bold border border-cyan-500/20 shadow-md shadow-cyan-900/20 transition-all cursor-pointer"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-300" />
                  <span>{language === 'ar' ? 'نسخ كصورة' : 'Copy Image'}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'ar' ? 'طباعة عبر المتصفح' : 'Print Now'}</span>
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setPrintModalVehicle(null)}
              className="px-5 py-2 rounded-xl border border-cyan-500/30 text-slate-200 font-semibold text-xs hover:bg-white/5 transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};