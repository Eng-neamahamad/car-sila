export type CallStatus = 'ringing' | 'active' | 'declined' | 'ended' | 'missed';

export type CallView = {
  id: string;
  status: CallStatus;
  plate: string;
  car: string;
  createdAt: string;
  offer?: string;
  answer?: string;
  ice?: string[];
};

export type AudioPeer = {
  pc: RTCPeerConnection;
  stream: MediaStream;
  stop: () => void;
  mute: (value: boolean) => void;
  flush: () => void;
};

const fallbackIce: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }
];

let speaker: HTMLAudioElement | null = null;

export const unlockCallAudio = () => {
  if (!speaker) {
    speaker = document.createElement('audio');
    speaker.autoplay = true;
    speaker.volume = 1;
    speaker.setAttribute('playsinline', 'true');
    speaker.style.display = 'none';
    document.body.appendChild(speaker);
  }
  const playing = speaker.play();
  if (playing) void playing.catch(() => undefined);
  return speaker;
};

const loadIceServers = async () => {
  try {
    const response = await fetch('/api/calls/ice-servers');
    const data = await response.json() as { iceServers?: RTCIceServer[] };
    if (Array.isArray(data.iceServers) && data.iceServers.length) return data.iceServers;
  } catch {
    // The call still tries a direct path when the relay list cannot be loaded.
  }
  return fallbackIce;
};

export const startPeer = async (onIce: (candidate: string) => void): Promise<AudioPeer> => {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('mic_missing');
  const audio = unlockCallAudio();
  const mic = navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
  const servers = loadIceServers();
  let stream: MediaStream;
  try {
    stream = await mic;
  } catch {
    throw new Error('mic_blocked');
  }
  const pc = new RTCPeerConnection({ iceServers: await servers });
  stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));
  const pending: string[] = [];
  let ready = false;
  const hear = () => {
    const playing = audio.play();
    if (playing) void playing.catch(() => undefined);
  };
  pc.onicecandidate = (event) => {
    if (!event.candidate) return;
    const raw = JSON.stringify(event.candidate);
    if (ready) onIce(raw);
    else pending.push(raw);
  };
  pc.ontrack = (event) => {
    audio.srcObject = event.streams[0] || new MediaStream([event.track]);
    hear();
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'connected') hear();
  };
  return {
    pc,
    stream,
    stop() {
      stream.getTracks().forEach((track) => track.stop());
      pc.close();
      audio.srcObject = null;
    },
    mute(value: boolean) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !value;
      });
    },
    flush() {
      ready = true;
      pending.splice(0).forEach(onIce);
    }
  };
};

export const waitForIce = (pc: RTCPeerConnection) => new Promise<void>((resolve) => {
  if (pc.iceGatheringState === 'complete') {
    resolve();
    return;
  }
  const done = () => {
    if (pc.iceGatheringState !== 'complete') return;
    window.clearTimeout(timer);
    pc.removeEventListener('icegatheringstatechange', done);
    resolve();
  };
  const timer = window.setTimeout(() => {
    pc.removeEventListener('icegatheringstatechange', done);
    resolve();
  }, 2500);
  pc.addEventListener('icegatheringstatechange', done);
});

export const addIce = async (pc: RTCPeerConnection, seen: Set<string>, list: string[] = []) => {
  for (const raw of list) {
    if (seen.has(raw)) continue;
    seen.add(raw);
    try {
      await pc.addIceCandidate(JSON.parse(raw));
    } catch {
      seen.delete(raw);
    }
  }
};
