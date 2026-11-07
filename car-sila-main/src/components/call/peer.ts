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

export const startPeer = async (onIce: (candidate: string) => void): Promise<AudioPeer> => {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('mic_missing');
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch {
    throw new Error('mic_blocked');
  }
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }]
  });
  stream.getAudioTracks().forEach((track) => pc.addTrack(track, stream));
  const pending: string[] = [];
  let ready = false;
  pc.onicecandidate = (event) => {
    if (!event.candidate) return;
    const raw = JSON.stringify(event.candidate);
    if (ready) onIce(raw);
    else pending.push(raw);
  };
  const audio = new Audio();
  audio.autoplay = true;
  pc.ontrack = (event) => {
    audio.srcObject = event.streams[0] || new MediaStream([event.track]);
    void audio.play().catch(() => undefined);
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
