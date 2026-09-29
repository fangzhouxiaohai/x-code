// Dev orchestrator: starts the Vite dev server, waits for it, then launches Electron.
import { spawn } from 'node:child_process';
import http from 'node:http';

const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

function waitForServer(url, tries = 60) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const req = http.get(url, () => resolve());
      req.on('error', () => {
        if (n <= 0) return reject(new Error('vite dev server did not start'));
        setTimeout(() => attempt(n - 1), 500);
      });
    };
    attempt(tries);
  });
}

try {
  await waitForServer('http://localhost:5173');
  const electron = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, VITE_DEV_SERVER_URL: 'http://localhost:5173' },
  });
  electron.on('exit', () => {
    vite.kill('SIGTERM');
    process.exit(0);
  });
} catch (err) {
  console.error(err);
  vite.kill('SIGTERM');
  process.exit(1);
}

process.on('SIGINT', () => {
  vite.kill('SIGTERM');
  process.exit(0);
});
