import { ok, strictEqual } from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { request } from 'node:http';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

if (process.env.RUN_SERVICE_DOCKER_TEST === '1') {
  const directory = await mkdtemp(join(tmpdir(), 'core-js-container-image-'));
  const image = `core-js-service-smoke-${ process.pid }`;
  let container;
  try {
    await writeFile(join(directory, 'manifest.json'), '{"modules":["es.array.at","es.object.group-by"]}');
    await $`docker build -f packages/core-js-service-container/Dockerfile -t ${ image } .`;
    await $`docker run --rm --entrypoint node ${ image } -e ${ `
      const fs = require('node:fs');
      const path = require('node:path');
      const root = '/app';
      if (process.getuid() === 0) throw Error('Container runs as root');
      if (fs.existsSync('/manifest.json')) throw Error('Application manifest baked into image');
      for (const name of ['tests', 'scripts', 'website', 'docs', 'package-lock.json',
        'packages/core-js-babel-plugin', 'packages/core-js-unplugin', 'node_modules/zx',
        'node_modules/eslint', 'node_modules/@babel/core',
        'packages/core-js/AGENTS.md', 'packages/core-js/package.tpl.json',
        'packages/core-js-pure', 'packages/core-js-compat/src',
        'packages/core-js-builder/README.md', 'packages/core-js-service/INVARIANTS.md',
        'packages/core-js-service-container/CLAUDE.md']) {
        if (fs.existsSync(path.join(root, name))) throw Error('Unexpected image file: ' + name);
      }
      for (const name of ['node_modules/rolldown', 'node_modules/@swc/core',
        'packages/core-js/modules/es.array.at.js', 'packages/core-js-compat/data.json']) {
        if (!fs.existsSync(path.join(root, name))) throw Error('Missing image file: ' + name);
      }
    ` }`;

    const socket = createServer();
    await new Promise((resolve, reject) => socket.once('error', reject).listen(0, '127.0.0.1', resolve));
    const { port } = socket.address();
    await new Promise((resolve, reject) => socket.close(error => error ? reject(error) : resolve()));
    const started = await $`docker run -d --rm -p ${ `127.0.0.1:${ port }:3000` } -e CORE_JS_MANIFEST_PATH=/manifest.json -v ${ `${ directory }/manifest.json:/manifest.json:ro` } ${ image }`;
    container = started.stdout.trim();

    function get(path, headers = {}) {
      return new Promise((resolve, reject) => {
        const client = request({ host: '127.0.0.1', port, path, headers }, response => {
          const chunks = [];
          response.on('data', chunk => chunks.push(chunk));
          response.on('end', () => resolve({ status: response.statusCode, headers: response.headers,
            body: Buffer.concat(chunks) }));
          response.on('error', reject);
        });
        client.on('error', reject);
        client.setTimeout(5000, () => client.destroy(new Error(`image request timed out: ${ path }`)));
        client.end();
      });
    }

    let ready;
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
      try {
        const status = await get('/status');
        if (status.status === 200 && JSON.parse(status.body).baselineReady) {
          ready = status;
          break;
        }
      } catch { /* The container may not have started listening yet. */ }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (!ready) {
      const logs = await $`docker logs ${ container }`.nothrow();
      throw new Error(`image baseline readiness timed out: ${ logs.stdout }${ logs.stderr }`);
    }
    strictEqual(JSON.parse(ready.body).state, 'ready');
    const script = await get('/polyfills.js', { 'accept-encoding': 'identity' });
    strictEqual(script.status, 200);
    const context = {};
    runInNewContext('delete Array.prototype.at', context);
    runInNewContext(script.body.toString(), context);
    strictEqual(runInNewContext('[1, 2, 3].at(-1)', context), 3);
    ok(script.headers.etag);
    const cached = await get('/polyfills.js', { 'accept-encoding': 'identity',
      'if-none-match': script.headers.etag });
    strictEqual(cached.status, 304);
  } finally {
    try {
      if (container) await $`docker stop ${ container }`.nothrow();
    } finally {
      try {
        await $`docker image rm ${ image }`.nothrow();
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    }
  }
}
