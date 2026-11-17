import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

if (process.env.RUN_SERVICE_DOCKER_TEST === '1') {
  const directory = await mkdtemp(join(tmpdir(), 'core-js-container-image-'));
  const image = `core-js-service-smoke-${ process.pid }`;
  const volume = `${ image }-cache`;
  const cacheRoot = '/var/cache/core-js';
  const manifestPath = join(directory, 'manifest.json');
  let container;
  try {
    const readme = await readFile('packages/core-js-service-container/README.md', 'utf8');
    const [, example] = readme.split('```json\n', 2);
    ok(example, 'container README must show a manifest');
    const [manifest] = example.split('\n```', 1);
    await writeFile(manifestPath, manifest);
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
        'packages/core-js/modules/es.array.from.js', 'packages/core-js-compat/data.json']) {
        if (!fs.existsSync(path.join(root, name))) throw Error('Missing image file: ' + name);
      }
    ` }`;

    const inspected = await $`docker image inspect --format '{{.Id}}' ${ image }`;
    const imageDigest = inspected.stdout.trim();
    const cacheDirectory = `${ cacheRoot }/${ imageDigest.slice('sha256:'.length) }`;

    function get(port, path, headers = {}) {
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

    async function start() {
      const started = await $`docker run -d --rm -p 127.0.0.1::3000 \
        -e CORE_JS_MANIFEST_PATH=/manifest.json -e ${ `CORE_JS_CACHE_DIR=${ cacheRoot }` } \
        -e ${ `CORE_JS_IMAGE_DIGEST=${ imageDigest }` } -v ${ `${ manifestPath }:/manifest.json:ro` } \
        -v ${ `${ volume }:${ cacheRoot }` } ${ imageDigest }`;
      container = started.stdout.trim();
      const published = await $`docker port ${ container } 3000/tcp`;
      const port = Number(published.stdout.trim().split(':').at(-1));

      let failure = 'timed out';
      const deadline = Date.now() + 60000;
      while (Date.now() < deadline) {
        try {
          const status = await get(port, '/status');
          const state = JSON.parse(status.body);
          if (status.status === 200 && state.fullyWarmed) return port;
          if (status.status === 200 && state.state === 'error') {
            failure = state.errorCode;
            break;
          }
        } catch { /* The container may not have started listening yet. */ }
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      const logs = await $`docker logs ${ container }`.nothrow();
      throw new Error(`image warm-up failed: ${ failure }\n${ logs.stdout }${ logs.stderr }`);
    }

    async function stop() {
      await $`docker stop ${ container }`;
      container = undefined;
    }

    async function cachedFiles() {
      const { stdout } = await $`docker exec ${ container } node -e ${ `
        const { readdirSync, statSync } = require('node:fs');
        const { join } = require('node:path');
        const root = process.argv[1];
        const files = readdirSync(root, { recursive: true }).filter(file => /\\.js(?:\\.gz)?$|\\.json$/.test(file));
        console.log(JSON.stringify(Object.fromEntries(files.map(file => {
          const { ino, mtimeNs } = statSync(join(root, file), { bigint: true });
          return [file, ino + ':' + mtimeNs];
        }))));
      ` } ${ cacheDirectory }`;
      return JSON.parse(stdout);
    }

    const port = await start();
    const headers = { 'accept-encoding': 'identity' };
    const script = await get(port, '/polyfills.js', headers);
    strictEqual(script.status, 200);
    const context = {};
    runInNewContext('delete Array.from; delete this.Promise;', context);
    runInNewContext(script.body.toString(), context);
    strictEqual(runInNewContext('Array.from({ 0: 3, length: 1 })[0]', context), 3);
    strictEqual(runInNewContext('typeof Promise', context), 'function');
    ok(script.headers.etag);
    const cached = await get(port, '/polyfills.js', { ...headers, 'if-none-match': script.headers.etag });
    strictEqual(cached.status, 304);

    const originalFiles = await cachedFiles();
    const missing = Object.keys(originalFiles).find(file => file.endsWith('.js.gz'));
    ok(missing, 'container-cache-1 #1: a fresh container writes bundles to the volume');
    await stop();

    const { modules } = JSON.parse(manifest);
    await writeFile(manifestPath, JSON.stringify({ modules: modules.toReversed() }));
    const restartedPort = await start();
    deepStrictEqual(await cachedFiles(), originalFiles, 'container-cache-1 #2');
    const restartedScript = await get(restartedPort, '/polyfills.js', headers);
    strictEqual(restartedScript.status, 200, 'container-cache-1 #3');
    deepStrictEqual(restartedScript.body, script.body, 'container-cache-1 #4');
    strictEqual(restartedScript.headers.etag, script.headers.etag, 'container-cache-1 #5');

    await $`docker exec ${ container } rm ${ `${ cacheDirectory }/${ missing }` }`;
    await stop();
    await start();
    const repairedFiles = await cachedFiles();
    deepStrictEqual(Object.keys(repairedFiles).toSorted(), Object.keys(originalFiles).toSorted(), 'container-cache-1 #6');
    const changed = Object.keys(repairedFiles).filter(file => repairedFiles[file] !== originalFiles[file]);
    const stem = missing.slice(0, -'.js.gz'.length);
    ok(changed.includes(missing) && changed.every(file => file.startsWith(`${ stem }.`)), 'container-cache-1 #7');
  } finally {
    try {
      if (container) await $`docker stop ${ container }`.nothrow();
    } finally {
      try {
        await $`docker volume rm ${ volume }`.nothrow();
        await $`docker image rm ${ image }`.nothrow();
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    }
  }
}
