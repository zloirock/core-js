import { deepStrictEqual, throws } from 'node:assert/strict';
import { join } from 'node:path';
import { settingsFrom } from '../../packages/core-js-service-container/settings.js';

deepStrictEqual(settingsFrom({ CORE_JS_MANIFEST_PATH: '/app/manifest.json' }), {
  manifestPath: '/app/manifest.json', cacheDirectory: null, host: '0.0.0.0', port: 3000,
}, 'container-settings-1 #1');
deepStrictEqual(settingsFrom({ CORE_JS_MANIFEST_PATH: 'manifest.json', HOST: 'localhost', PORT: '65535' }), {
  manifestPath: 'manifest.json', cacheDirectory: null, host: 'localhost', port: 65535,
}, 'container-settings-1 #2');
deepStrictEqual(settingsFrom({ CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: '1' }), {
  manifestPath: 'manifest.json', cacheDirectory: null, host: '0.0.0.0', port: 1,
}, 'container-settings-1 #3');

for (const [label, env] of [
  ['container-settings-2 #1', {}],
  ['container-settings-2 #2', { CORE_JS_MANIFEST_PATH: '' }],
  ['container-settings-2 #3', { CORE_JS_MANIFEST_PATH: 12 }],
  ['container-settings-2 #4', { CORE_JS_MANIFEST_PATH: 'manifest.json', HOST: '' }],
  ['container-settings-2 #5', { CORE_JS_MANIFEST_PATH: 'manifest.json', HOST: 12 }],
  ['container-settings-2 #6', { CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: '0' }],
  ['container-settings-2 #7', { CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: '65536' }],
  ['container-settings-2 #8', { CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: '3.1' }],
  ['container-settings-2 #9', { CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: 'abc' }],
  ['container-settings-2 #10', { CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: ' 3000' }],
  ['container-settings-2 #11', { CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: '3000 ' }],
  ['container-settings-2 #12', { CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: '-1' }],
  ['container-settings-2 #13', { CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: '01' }],
  ['container-settings-2 #14', { CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: 3000 }],
  ['container-settings-2 #15', { CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: '' }],
]) {
  throws(() => settingsFrom(env), TypeError, label);
}

const cache = { CORE_JS_MANIFEST_PATH: 'manifest.json', CORE_JS_CACHE_DIR: '/var/cache/core-js' };
const digest = 'a'.repeat(64);
deepStrictEqual(settingsFrom({ ...cache, CORE_JS_IMAGE_DIGEST: `sha256:${ digest }` }), {
  manifestPath: 'manifest.json', cacheDirectory: join(cache.CORE_JS_CACHE_DIR, digest), host: '0.0.0.0', port: 3000,
}, 'container-settings-3 #1');
throws(() => settingsFrom(cache), /CORE_JS_IMAGE_DIGEST/, 'container-settings-3 #2');
throws(() => settingsFrom({ ...cache, CORE_JS_IMAGE_DIGEST: `sha256:../${ digest }` }),
  /CORE_JS_IMAGE_DIGEST/, 'container-settings-3 #3');
throws(() => settingsFrom({ ...cache, CORE_JS_CACHE_DIR: '', CORE_JS_IMAGE_DIGEST: `sha256:${ digest }` }),
  /CORE_JS_CACHE_DIR/, 'container-settings-3 #4');

const versioned = { CORE_JS_RELEASES_DIR: 'deploy/releases' };
deepStrictEqual(settingsFrom(versioned), {
  releases: { directory: 'deploy/releases', retentionSeconds: 604800 },
  cacheDirectory: null, host: '0.0.0.0', port: 3000,
}, 'container-releases-1 #1');
deepStrictEqual(settingsFrom({ ...versioned, CORE_JS_RELEASE_RETENTION_SECONDS: '1' }).releases,
  { directory: 'deploy/releases', retentionSeconds: 1 }, 'container-releases-1 #2');
throws(() => settingsFrom({ ...versioned, ...cache }), /CORE_JS_MANIFEST_PATH/, 'container-releases-1 #3');
throws(() => settingsFrom({ CORE_JS_RELEASES_DIR: '' }), /CORE_JS_RELEASES_DIR/, 'container-releases-1 #4');
throws(() => settingsFrom({ ...cache, CORE_JS_RELEASE_RETENTION_SECONDS: '1' }),
  /CORE_JS_RELEASES_DIR/, 'container-releases-1 #5');

for (const value of ['', '0', '-1', '01', '1e3', ' 60', '9007199254740992', 60]) {
  throws(() => settingsFrom({ ...versioned, CORE_JS_RELEASE_RETENTION_SECONDS: value }),
    /CORE_JS_RELEASE_RETENTION_SECONDS/, `container-releases-1 #6: ${ value }`);
}
