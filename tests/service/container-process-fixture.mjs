import fs from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { mock } from 'node:test';
import { startContainer } from '../../packages/core-js-service-container/index.js';

const disappearingManifest = process.env.CONTAINER_DISAPPEARING_MANIFEST;
if (disappearingManifest) {
  const { readFile } = fs;
  const fault = mock.method(fs, 'readFile', async (path, ...options) => {
    if (path === disappearingManifest) {
      fault.mock.restore();
      syncBuiltinESMExports();
      const target = await fs.realpath(path);
      await fs.rename(target, `${ target }.hidden`);
    }
    return readFile(path, ...options);
  });
  syncBuiltinESMExports();
}

process.on('SIGINT', () => process.send('shutdown received'));
await startContainer({
  createService() {
    if (process.env.CONTAINER_PLAN_FAILURE) throw new Error('fixture plan failure');
    return {
      start() { return { ready: Promise.resolve(), warmed: Promise.resolve({ failed: [] }) }; },
      async serveScript(request, response) {
        if (process.env.CONTAINER_REQUEST_FAILURE) {
          if (process.env.CONTAINER_REQUEST_FAILURE === 'after_headers') response.write('incomplete');
          throw new Error('fixture script failed');
        }
        process.send('accepted');
        await new Promise(resolve => process.once('message', resolve));
        response.end('accepted request completed');
      },
    };
  },
});
