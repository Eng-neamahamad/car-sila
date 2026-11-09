const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

export const startPhoneRing = (kind: 'incoming' | 'outgoing') => {
  if (!AudioCtx) return () => undefined;
  const context = new AudioCtx();
  let stopped = false;
  const burst = kind === 'incoming' ? 1 : 0.35;
  const pause = kind === 'incoming' ? 2000 : 3200;
  const volume = kind === 'incoming' ? 0.2 : 0.07;

  const play = () => {
    if (stopped || context.state === 'closed') return;
    const now = context.currentTime;
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.setValueAtTime(volume, now + burst);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + burst + 0.08);
    gain.connect(context.destination);
    for (const frequency of [440, 480]) {
      const tone = context.createOscillator();
      tone.type = 'sine';
      tone.frequency.value = frequency;
      tone.connect(gain);
      tone.start(now);
      tone.stop(now + burst + 0.1);
    }
  };

  const kick = () => {
    if (context.state === 'suspended') void context.resume().then(play).catch(() => undefined);
    else play();
  };

  kick();
  const timer = window.setInterval(kick, burst * 1000 + pause);
  window.addEventListener('pointerdown', kick);
  return () => {
    stopped = true;
    window.clearInterval(timer);
    window.removeEventListener('pointerdown', kick);
    void context.close().catch(() => undefined);
  };
};
