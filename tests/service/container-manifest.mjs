import { deepStrictEqual, rejects } from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadManifest } from '../../packages/core-js-service-container/manifest.js';

const directory = await mkdtemp(join(tmpdir(), 'core-js-container-manifest-'));
const file = join(directory, 'manifest.json');

async function load(value) {
  await writeFile(file, JSON.stringify(value));
  return loadManifest(file);
}

try {
  deepStrictEqual(await load({ modules: [] }), [], 'container-manifest-1 #1');
  deepStrictEqual(await load({ modules: ['es.array.at', 'es.promise.all', 'es.array.at'] }),
    ['es.array.at', 'es.promise.all'], 'container-manifest-1 #2');
  deepStrictEqual(await load({ modules: ['es.promise.all', 'es.array.at', 'es.promise.all'] }),
    ['es.promise.all', 'es.array.at'], 'container-manifest-1 #3');

  await rejects(loadManifest(join(directory, 'missing.json')), 'container-manifest-2 #1');
  await rejects(loadManifest(directory), 'container-manifest-2 #2');
  await writeFile(file, '{ bad json');
  await rejects(loadManifest(file), 'container-manifest-2 #3');

  const invalid = [null, [], 'modules', {}, { modules: null }, { modules: 'es.array.at' },
    { modules: [], other: true }, { modules: [null] }, { modules: [1] },
    { modules: ['not.a.core-js.module'] }];
  for (const [index, value] of invalid.entries()) {
    await rejects(load(value), `container-manifest-2 #${ index + 4 }`);
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}
