import { deepStrictEqual, notStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { request } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { gunzip } from 'node:zlib';
import fastify from 'fastify';
import createService from '@core-js/service';
import createLifecycle from '../../packages/core-js-service-container/lifecycle.js';
import createServer from '../../packages/core-js-service-container/server.js';

const decompress = promisify(gunzip);

async function listen(lifecycle) {
  const app = createServer({ lifecycle, fastify: fastify({ logger: false }) });
  await app.listen({ host: '127.0.0.1', port: 0 });
  const { port } = app.server.address();
  return {
    app,
    get(path, headers = {}, method = 'GET') {
      return new Promise((resolve, reject) => {
        const client = request({ host: '127.0.0.1', port, path, headers, method }, response => {
          const chunks = [];
          response.on('data', chunk => chunks.push(chunk));
          response.on('end', () => resolve({ status: response.statusCode, headers: response.headers,
            body: Buffer.concat(chunks) }));
          response.on('error', reject);
        });
        client.on('error', reject);
        client.end();
      });
    },
  };
}

const status = { state: 'started', baselineReady: false, fullyWarmed: false };
const requests = [];
const logs = [];
const lifecycle = {
  status: () => ({ ...status }),
  async serveScript(rawRequest, rawResponse) {
    requests.push(rawRequest);
    rawResponse.setHeader('content-type', 'text/javascript; charset=utf-8');
    rawResponse.setHeader('cache-control', 'private, no-cache');
    rawResponse.setHeader('vary', 'user-agent, accept-encoding');
    rawResponse.setHeader('etag', '"fixture-gzip"');
    rawResponse.setHeader('content-encoding', 'gzip');
    if (rawRequest.headers['if-none-match'] === '"fixture-gzip"') {
      rawResponse.statusCode = 304;
      rawResponse.end();
    } else {
      rawResponse.end(Buffer.from([0x1F, 0x8B, 0x08]));
    }
  },
};
const server = await listen(lifecycle);
try {
  deepStrictEqual(JSON.parse((await server.get('/status')).body), status, 'container-http-1 #1');
  strictEqual((await server.get('/status', {}, 'HEAD')).status, 404, 'container-http-2 #33');
  const unavailable = await server.get('/polyfills.js');
  strictEqual(unavailable.status, 503, 'container-http-1 #2');
  strictEqual(unavailable.headers['cache-control'], 'no-store', 'container-http-1 #3');
  strictEqual(requests.length, 0, 'container-http-1 #4');

  Object.assign(status, { state: 'error', errorCode: 'manifest_invalid' });
  deepStrictEqual(JSON.parse((await server.get('/status')).body), status, 'container-http-1 #5');
  strictEqual((await server.get('/polyfills.js')).status, 503, 'container-http-1 #6');

  Object.assign(status, { state: 'ready', baselineReady: true, fullyWarmed: false });
  delete status.errorCode;
  deepStrictEqual(JSON.parse((await server.get('/status')).body), status, 'container-http-1 #7');
  const script = await server.get('/polyfills.js', { 'user-agent': 'fixture', 'accept-encoding': 'gzip' });
  strictEqual(script.status, 200, 'container-http-2 #1');
  deepStrictEqual(script.body, Buffer.from([0x1F, 0x8B, 0x08]), 'container-http-2 #2');
  strictEqual(script.headers['content-encoding'], 'gzip', 'container-http-2 #3');
  strictEqual(script.headers.etag, '"fixture-gzip"', 'container-http-2 #4');
  strictEqual(script.headers['cache-control'], 'private, no-cache', 'container-http-2 #5');
  strictEqual(script.headers.vary, 'user-agent, accept-encoding', 'container-http-2 #6');
  strictEqual(requests[0].headers['user-agent'], 'fixture', 'container-http-2 #7');
  const cached = await server.get('/polyfills.js', { 'if-none-match': script.headers.etag });
  strictEqual(cached.status, 304, 'container-http-2 #8');
  strictEqual(cached.body.length, 0, 'container-http-2 #9');
  strictEqual((await server.get('/missing')).status, 404, 'container-http-2 #10');
  strictEqual((await server.get('/polyfills.js', {}, 'HEAD')).status, 404, 'container-http-2 #11');
  strictEqual((await server.get('/status', {}, 'POST')).status, 404, 'container-http-2 #34');
  strictEqual((await server.get('/polyfills.js', {}, 'POST')).status, 404, 'container-http-2 #35');
  strictEqual(requests.length, 2, 'container-http-2 #12');
  Object.assign(status, { state: 'ready', fullyWarmed: true });
  deepStrictEqual(JSON.parse((await server.get('/status')).body), status, 'container-http-1 #8');
  Object.assign(status, { state: 'error', fullyWarmed: false, errorCode: 'bundle_build_failed' });
  deepStrictEqual(JSON.parse((await server.get('/status')).body), status, 'container-http-1 #9');
  strictEqual((await server.get('/polyfills.js')).status, 200, 'container-http-1 #10');
} finally {
  await server.app.close();
}

const failed = await listen({
  status: () => ({ state: 'ready', baselineReady: true, fullyWarmed: false }),
  serveScript(rawRequest, response) { response.setHeader('etag', '"partial"'); throw new Error('disk failed'); },
});
failed.app.log.error = error => logs.push(error);
try {
  const response = await failed.get('/polyfills.js');
  strictEqual(response.status, 500, 'container-http-3 #1');
  strictEqual(response.headers['cache-control'], 'no-store', 'container-http-3 #2');
  strictEqual(response.headers.etag, undefined, 'container-http-3 #3');
  strictEqual(logs.length, 1, 'container-http-3 #4');
  strictEqual(logs[0].message, 'disk failed', 'container-http-3 #5');
  strictEqual((await failed.get('/status')).status, 200, 'container-http-3 #6');
} finally {
  await failed.app.close();
}

const partial = await listen({
  status: () => ({ state: 'ready', baselineReady: true, fullyWarmed: false }),
  serveScript(rawRequest, response) {
    response.write('incomplete');
    throw new Error('stream failed');
  },
});
partial.app.log.error = error => logs.push(error);
try {
  await new Promise((resolve, reject) => {
    const client = request({ host: '127.0.0.1', port: partial.app.server.address().port,
      path: '/polyfills.js' }, response => {
      response.on('aborted', resolve);
      response.on('error', error => error.code === 'ECONNRESET' ? resolve() : reject(error));
      response.on('end', () => reject(new Error('partial response completed')));
      response.resume();
    });
    client.on('error', error => error.code === 'ECONNRESET' ? resolve() : reject(error));
    client.end();
  });
  strictEqual(logs.at(-1).message, 'stream failed', 'container-http-3 #7');
  strictEqual((await partial.get('/status')).status, 200, 'container-http-3 #8');
} finally {
  await partial.app.close();
}

for (const sent of [false, true]) {
  const originalStderrWrite = process.stderr.write;
  const fallback = [];
  process.stderr.write = message => {
    fallback.push(message);
    return true;
  };
  const brokenLogger = await listen({
    status: () => ({ state: 'ready', baselineReady: true, fullyWarmed: false }),
    serveScript(rawRequest, response) {
      if (sent) response.write('incomplete');
      throw new Error('script failed');
    },
  });
  brokenLogger.app.log.error = () => { throw new Error('logger failed'); };
  try {
    if (sent) {
      await new Promise((resolve, reject) => {
        const client = request({ host: '127.0.0.1', port: brokenLogger.app.server.address().port,
          path: '/polyfills.js' }, response => {
          response.on('aborted', resolve);
          response.on('error', error => error.code === 'ECONNRESET' ? resolve() : reject(error));
          response.on('end', () => reject(new Error('partial response completed')));
          response.resume();
        });
        client.on('error', error => error.code === 'ECONNRESET' ? resolve() : reject(error));
        client.setTimeout(2000, () => client.destroy(new Error('response did not finish')));
        client.end();
      });
    } else {
      const response = await brokenLogger.get('/polyfills.js');
      strictEqual(response.status, 500, 'container-http-3 #9');
      strictEqual(response.headers['cache-control'], 'no-store', 'container-http-3 #10');
    }
    strictEqual((await brokenLogger.get('/status')).status, 200, 'container-http-3 #11');
    ok(fallback.some(message => message.includes('script failed')), 'container-http-3 #12');
    ok(fallback.some(message => message.includes('logger failed')), 'container-http-3 #13');
  } finally {
    process.stderr.write = originalStderrWrite;
    await brokenLogger.app.close();
  }
}

const directory = await mkdtemp(join(tmpdir(), 'core-js-container-http-'));
const chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/92.0.0.0 Safari/537.36';
const headers = { 'user-agent': chrome, 'accept-encoding': 'gzip' };
const releaseBuckets = Promise.withResolvers();
let service;
const real = createLifecycle({
  load: () => ['es.array.at', 'es.object.group-by'],
  createService(scope) {
    service = createService({ scope, delivery: 'fixed', route: '/', ignoreBrowserslistConfig: true,
      directory, targets: ['chrome 92', 'ie 11'], compression: { identity: true, gzip: true, br: false } });
    const build = service.bundles.put;
    service.bundles.put = async (...args) => {
      if (args[0] !== service.plan.baseline.bundleId) await releaseBuckets.promise;
      return build(...args);
    };
    return service;
  },
  log(error, detail) { throw new Error(`${ error }: ${ detail }`); },
});
const live = await listen(real);
try {
  strictEqual((await live.get('/polyfills.js')).status, 503, 'container-http-1 #11');
  const preparation = real.start();
  const initial = await live.get('/status');
  strictEqual(JSON.parse(initial.body).state, 'started', 'container-http-1 #12');
  const chosen = service.chooseBundle(headers);
  notStrictEqual(chosen, service.plan.baseline.bundleId, 'container-http-2 #25');
  // The real baseline build resolves before the first response is delegated.
  await service.start().ready;
  await new Promise(resolve => setImmediate(resolve));
  strictEqual(JSON.parse((await live.get('/status')).body).fullyWarmed, false, 'container-http-1 #13');
  const script = await live.get('/polyfills.js', headers);
  strictEqual(script.status, 200, 'container-http-2 #13');
  strictEqual(script.headers['cache-control'], 'private, no-cache', 'container-http-2 #14');
  strictEqual(script.headers.vary, 'user-agent, accept-encoding', 'container-http-2 #15');
  strictEqual(script.headers['content-encoding'], 'gzip', 'container-http-2 #16');
  strictEqual(script.body[0], 0x1F, 'container-http-2 #17');
  ok(script.headers.etag, 'container-http-2 #18');
  deepStrictEqual(script.body, await service.bundles.get(service.plan.baseline.bundleId, 'gzip'),
    'container-http-2 #31');
  const cached = await live.get('/polyfills.js', { ...headers, 'if-none-match': script.headers.etag });
  strictEqual(cached.status, 304, 'container-http-2 #19');
  strictEqual(cached.body.length, 0, 'container-http-2 #20');
  const identity = await live.get('/polyfills.js', { ...headers, 'accept-encoding': 'identity' });
  strictEqual(identity.status, 200, 'container-http-2 #21');
  notStrictEqual(identity.headers.etag, script.headers.etag, 'container-http-2 #22');
  ok(identity.body.includes(Buffer.from('core-js')), 'container-http-2 #23');
  releaseBuckets.resolve();
  await preparation;
  const warm = await live.get('/polyfills.js', { ...headers, 'if-none-match': script.headers.etag });
  strictEqual(warm.status, 200, 'container-http-2 #26');
  notStrictEqual(warm.headers.etag, script.headers.etag, 'container-http-2 #27');
  deepStrictEqual(warm.body, await service.bundles.get(chosen, 'gzip'), 'container-http-2 #32');
  const warmIdentity = await live.get('/polyfills.js', { ...headers, 'accept-encoding': 'identity' });
  notStrictEqual(warmIdentity.body.length, identity.body.length, 'container-http-2 #28');
  for (const [encoding, original] of [['identity', warmIdentity], ['gzip', warm]]) {
    const publicBytes = await service.bundles.get(chosen, encoding);
    new Uint8Array(publicBytes.buffer).fill(0);
    const afterEdit = await live.get('/polyfills.js', { ...headers, 'accept-encoding': encoding });
    deepStrictEqual(afterEdit.body, original.body, 'bundles-5 #3');
    strictEqual(afterEdit.headers.etag, original.headers.etag, 'bundles-5 #4');
  }
  strictEqual(JSON.parse((await live.get('/status')).body).fullyWarmed, true, 'container-http-1 #14');
  const nextService = createService({ scope: ['es.array.at', 'es.object.group-by', 'es.promise.all'],
    delivery: 'fixed', route: '/', ignoreBrowserslistConfig: true, directory,
    targets: ['chrome 92', 'ie 11'], compression: { identity: true, gzip: true, br: false } });
  await nextService.start().warmed;
  const replacement = await listen({ status: () => ({ state: 'ready', baselineReady: true, fullyWarmed: true }),
    serveScript: nextService.serveScript });
  try {
    const switched = await replacement.get('/polyfills.js', { ...headers, 'if-none-match': warm.headers.etag });
    strictEqual(switched.status, 200, 'container-http-2 #29');
    notStrictEqual(switched.headers.etag, warm.headers.etag, 'container-http-2 #30');
  } finally {
    await replacement.app.close();
  }
  // Rebuilding the same manifest and versions can replace the bytes under the same bundle ID.
  const updatedScript = 'var updated = true;';
  await service.bundles.put(chosen, { modules: await service.bundles.modules(chosen), script: updatedScript });
  const updated = await live.get('/polyfills.js', { ...headers, 'if-none-match': warm.headers.etag });
  strictEqual(updated.status, 200, 'serve-3 #10');
  notStrictEqual(updated.headers.etag, warm.headers.etag, 'serve-3 #11');
  strictEqual((await decompress(updated.body)).toString(), updatedScript, 'serve-3 #12');
  const revalidated = await live.get('/polyfills.js', { ...headers, 'if-none-match': updated.headers.etag });
  strictEqual(revalidated.status, 304, 'serve-3 #13');
  strictEqual((await live.get('/missing')).status, 404, 'container-http-2 #24');
} finally {
  await live.app.close();
  await rm(directory, { recursive: true, force: true });
}
