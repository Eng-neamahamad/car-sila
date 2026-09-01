import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Vehicle } from '../../types';
import {
  Download,
  Printer,
  ShieldCheck,
  Car,
  Copy,
  Check,
  FileDown,
  ExternalLink,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface QRStickerCardProps {
  vehicle?: Vehicle;
  size?: number;
  showActions?: boolean;
  onPrint?: () => void;
  compact?: boolean;
  compactQrOnly?: boolean;
}

export const QRStickerCard: React.FC<QRStickerCardProps> = ({
  vehicle: propVehicle,
  size = 180,
  showActions = true,
  onPrint,
  compact = false,
  compactQrOnly = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { language, setPrintModalVehicle, showToast, setActiveScanVehicle, setCurrentView } = useApp();

  // Safe fallback vehicle if undefined is passed
  const vehicle: Vehicle = propVehicle || {
    id: 'veh_demo_qr',
    ownerId: 'usr_owner_demo',
    ownerName: language === 'ar' ? 'مالك المركبة' : 'Vehicle Owner',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2024,
    color: language === 'ar' ? 'فضي معدني' : 'Metallic Silver',
    plateNumber: '77-99882',
    qrToken: 'SILA-DEMO-77998',
    status: 'active',
    scansCount: 1,
    reportsCount: 0,
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-01-01'
  };

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Compute accessible public scanning URL
  const getPublicScanUrl = (): string => {
    const token = vehicle?.qrToken || 'SILA-DEMO-77998';
    if (typeof window === 'undefined') return `http://localhost:5173/#scan=${token}`;
    return `${window.location.origin}/#scan=${token}`;
  };

  const scanUrl = getPublicScanUrl();

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        scanUrl,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'H'
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [vehicle?.qrToken, size, scanUrl]);

  // 1. Download PNG Image
  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `CAR-SILA-QR-${vehicle.plateNumber.replace(/\s+/g, '-')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    showToast(
      language === 'ar' ? 'تم تنزيل صورة رمز QR بنجاح!' : 'QR Code image downloaded successfully!',
      'success'
    );
  };

  // 2. Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!canvasRef.current) return;

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob && navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedImage(true);
          setTimeout(() => setCopiedImage(false), 2500);
          showToast(
            language === 'ar'
              ? 'تم نسخ صورة الرمز إلى الحافظة! يمكنك لصقها الآن في الواتساب أو أي برنامج.'
              : 'QR Image copied to clipboard! You can paste it anywhere.',
            'success'
          );
        } else {
          handleDownloadImage();
        }
      }, 'image/png');
    } catch (err) {
      console.error('Clipboard copy error:', err);
      handleDownloadImage();
    }
  };

  // 3. Export as PDF Sticker
  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // If we have cardRef, render high-res canvas
      if (cardRef.current) {
        const canvas = await html2canvas(cardRef.current, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');

        // A4 width: 210mm, height: 297mm
        const cardWidth = 120; // 12cm
        const cardHeight = (canvas.height * cardWidth) / canvas.width;
        const xPos = (210 - cardWidth) / 2;
        const yPos = 30;

        // Title on PDF
        pdf.setFontSize(16);
        pdf.setTextColor(15, 23, 42);
        pdf.text('CAR-SILA • Smart Vehicle Identification Sticker', 105, 20, { align: 'center' });

        // Add Card image
        pdf.addImage(imgData, 'PNG', xPos, yPos, cardWidth, cardHeight);

        // Footer instructions
        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        pdf.text(
          'Cut along the border and place this sticker visibly inside your car windshield.',
          105,
          yPos + cardHeight + 15,
          { align: 'center' }
        );
        pdf.text(
          `Generated for: ${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})`,
          105,
          yPos + cardHeight + 22,
          { align: 'center' }
        );

        pdf.save(`CAR-SILA-Sticker-${vehicle.plateNumber.replace(/\s+/g, '-')}.pdf`);
        showToast(
          language === 'ar' ? 'تم تنزيل ملف PDF جاهز للطباعة بنجاح!' : 'Print-ready PDF downloaded successfully!',
          'success'
        );
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      showToast(language === 'ar' ? 'فشل تصدير PDF' : 'PDF export failed', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 4. Copy Direct Scanning Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    showToast(
      language === 'ar' ? 'تم نسخ رابط البلاغ المباشر للمركبة!' : 'Vehicle report link copied to clipboard!',
      'info'
    );
  };

  if (compactQrOnly) {
    return (
      <div className="flex items-center justify-center bg-white">
        <canvas ref={canvasRef} className="rounded-xl" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-col items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <canvas ref={canvasRef} className="rounded-lg" />
        <span className="text-[11px] font-mono font-bold text-slate-700 mt-1.5">
          {vehicle.plateNumber}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center max-w-sm w-full space-y-3">
      {/* Visual Printable Card Target */}
      <div
        ref={cardRef}
        className="flex flex-col items-center bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-xl shadow-slate-200/50 w-full text-center relative overflow-hidden"
      >
        {/* Top subtle decorative strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

        {/* Sticker Header Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black mb-2.5 tracking-wide mt-1">
          <Car className="w-3.5 h-3.5 text-blue-600" />
          <span>CAR-SILA IDENTITY</span>
        </div>

        {/* Vehicle Info */}
        <h3 className="font-black text-slate-900 text-base leading-tight">
          {vehicle.brand} {vehicle.model}
        </h3>
        <div className="inline-block px-3 py-0.5 mt-1 rounded-lg bg-slate-100 border border-slate-300 text-slate-900 font-mono text-xs font-extrabold tracking-wider">
          {vehicle.plateNumber}
        </div>

        {/* QR Canvas */}
        <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl my-3.5 flex items-center justify-center shadow-inner">
          <canvas ref={canvasRef} className="rounded-xl shadow-sm" />
        </div>

        {/* Instructions */}
        <div className="space-y-1 mb-2">
          <p className="text-xs font-black text-slate-900 tracking-wider uppercase">
            {language === 'ar' ? 'امسح للاتصال بالمالك' : 'SCAN TO CONTACT OWNER'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
            {language === 'ar' ? 'بدون كشف رقم الهاتف • خصوصية تامة' : '100% Private • No Phone Number Needed'}
          </p>
        </div>

        {/* Security watermark footer */}
        <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400">
          Token: {vehicle.qrToken}
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      {showActions && (
        <div className="w-full space-y-2 pt-1">
          {/* Primary Quick Actions: PDF & Copy Image */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingPdf ? (language === 'ar' ? 'جارٍ التصدير...' : 'Exporting...') : (language === 'ar' ? 'سحب PDF للطباعة' : 'Export PDF')}</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all cursor-pointer"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-blue-400" />
                  <span>{language === 'ar' ? 'نسخ كصورة' : 'Copy Image'}</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Actions: Download PNG & Print Modal */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadImage}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>{language === 'ar' ? 'تحميل صورة PNG' : 'Save PNG'}</span>
            </button>

            <button
              onClick={() => {
                if (onPrint) onPrint();
                else setPrintModalVehicle(vehicle);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/30 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'نافذة الطباعة' : 'Print View'}</span>
            </button>
          </div>

          {/* Direct Scan Simulation Test Button */}
          <button
            onClick={() => {
              setActiveScanVehicle(vehicle);
              setCurrentView('qr-scan-flow');
              showToast(
                language === 'ar' ? 'تم فتح شاشة كتابة البلاغ للمركبة!' : 'Opened report screen for vehicle!',
                'info'
              );
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? '🔍 تجربة كتابة بلاغ الآن (وضع الزائر)' : '🔍 Test Scan & Report Now'}</span>
          </button>

          {/* Copy Direct URL Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 text-[11px] font-semibold transition-colors cursor-pointer border border-blue-200/60"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ar' ? 'تم نسخ الرابط المباشر!' : 'Direct Link Copied!'}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'نسخ رابط المسح المباشر' : 'Copy Direct Scan URL'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
