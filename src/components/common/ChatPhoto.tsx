import React, { useEffect, useState } from 'react';
import { api } from '../../data/api';

export const readChatPhoto = (text: string, photoReportId?: string) => {
  const match = text.match(/\[\[photo:([A-Za-z0-9_-]+)\]\]/);
  return {
    text: text.replace(/\s*\[\[photo:[A-Za-z0-9_-]+\]\]\s*/g, ' ').replace(/\s+/g, ' ').trim(),
    reportId: photoReportId || match?.[1] || ''
  };
};

export const ChatPhoto: React.FC<{ reportId?: string }> = ({ reportId }) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    if (!reportId) return;
    let gone = false;
    api<{ photo: string }>(`/api/reports/photo?id=${encodeURIComponent(reportId)}`)
      .then((data) => {
        if (!gone && data.photo) setSrc(data.photo);
      })
      .catch(() => undefined);
    return () => {
      gone = true;
    };
  }, [reportId]);

  if (!src) return null;
  return <img src={src} alt="" className="mt-2 max-h-56 w-full rounded-xl object-cover" />;
};
