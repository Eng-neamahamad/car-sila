import { spawn } from 'node:child_process';
import net from 'node:net';

const busy = (port) => new Promise((resolve) => {
  const hosts = ['127.0.0.1', '::1'];
  let pending = hosts.length;
  let found = false;
  for (const host of hosts) {
    const socket = net.connect({ port, host });
    const done = (value) => {
      socket.removeAllListeners();
      socket.destroy();
      if (value) found = true;
      pending -= 1;
      if (pending === 0) resolve(found);
    };
    socket.setTimeout(400);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  }
});

if (await busy(5173) || await busy(8787)) {
  console.log('');
  console.log('السيرفر شغال أصلاً على http://localhost:5173');
  console.log('لا تشغّل نسخة ثانية. افتح هذا الرابط في المتصفح.');
  console.log('');
  process.exit(0);
}

const children = [
  spawn(process.execPath, ['server/index.js'], { stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', '5173', '--strictPort'], { stdio: 'inherit' })
];

const stop = () => {
  for (const child of children) child.kill();
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

for (const child of children) {
  child.on('exit', (code) => {
    stop();
    process.exit(code ?? 0);
  });
}
