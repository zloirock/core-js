import { deepStrictEqual, throws } from 'node:assert/strict';
import { settingsFrom } from '../../packages/core-js-service-container/settings.js';

deepStrictEqual(settingsFrom({ CORE_JS_MANIFEST_PATH: '/app/manifest.json' }), {
  manifestPath: '/app/manifest.json', host: '0.0.0.0', port: 3000,
}, 'container-settings-1 #1');
deepStrictEqual(settingsFrom({ CORE_JS_MANIFEST_PATH: 'manifest.json', HOST: 'localhost', PORT: '65535' }), {
  manifestPath: 'manifest.json', host: 'localhost', port: 65535,
}, 'container-settings-1 #2');
deepStrictEqual(settingsFrom({ CORE_JS_MANIFEST_PATH: 'manifest.json', PORT: '1' }), {
  manifestPath: 'manifest.json', host: '0.0.0.0', port: 1,
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
