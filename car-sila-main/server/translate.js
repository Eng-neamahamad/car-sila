const arabicLetters = (text) => (text.match(/[\u0600-\u06FF]/g) || []).length;
const latinLetters = (text) => (text.match(/[A-Za-z]/g) || []).length;

const detect = (text) => {
  const arabic = arabicLetters(text);
  const latin = latinLetters(text);
  if (arabic + latin < 2) return '';
  return arabic > latin ? 'ar' : 'en';
};

const google = async (text, from, to) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error('translate failed');
  const data = await response.json();
  const translated = (Array.isArray(data?.[0]) ? data[0] : []).map((part) => part?.[0] || '').join('').trim();
  if (!translated) throw new Error('empty translation');
  return translated;
};

const memory = async (text, from, to) => {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error('translate failed');
  const data = await response.json();
  const translated = String(data?.responseData?.translatedText || '').trim();
  if (!translated || /MYMEMORY WARNING/i.test(translated) || translated === text) throw new Error('empty translation');
  return translated;
};

const translatePair = async (text, from, to) => {
  const translation = await google(text, from, to).catch(() => memory(text, from, to));
  if (!translation || translation === text) return null;
  return { translation, from, to };
};

export const translateInto = async (text, preferred) => {
  const from = detect(String(text || ''));
  if (!from) return null;
  const wanted = preferred === 'en' || preferred === 'ar' ? preferred : '';
  const to = wanted && wanted !== from ? wanted : (from === 'ar' ? 'en' : 'ar');
  try {
    return await translatePair(text, from, to);
  } catch {
    return null;
  }
};

export const unpackText = (raw) => {
  const value = String(raw ?? '');
  if (value.startsWith('{"v":1,')) {
    try {
      const data = JSON.parse(value);
      if (data?.text) {
        return {
          text: String(data.text),
          translation: data.translation ? String(data.translation) : '',
          from: data.from === 'ar' || data.from === 'en' ? data.from : '',
          to: data.to === 'ar' || data.to === 'en' ? data.to : ''
        };
      }
    } catch {
      // Older rows are plain text.
    }
  }
  return { text: value, translation: '', from: '', to: '' };
};
