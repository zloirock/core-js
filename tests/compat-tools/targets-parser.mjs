import { deepEqual, throws } from 'node:assert/strict';
import targetsParser from '@core-js/compat/targets-parser.js';

deepEqual(targetsParser('ie 11, chrome 56, ios 12.2'), new Map([
  ['chrome', '56'],
  ['ie', '11'],
  ['ios', '12.2-12.5'],
]), 'browserslist');

deepEqual(targetsParser('baseline 2022 or not and_chr <= 999 or not and_ff <= 999 or ios 15.3 or ie 11'), new Map([
  ['chrome', '108'],
  ['edge', '108'],
  ['firefox', '108'],
  ['ie', '11'],
  ['ios', '15.2-15.3'],
  ['safari', '16.0'],
]), 'browserslist with baseline');

deepEqual(targetsParser({
  ie: 11,
  chrome: 56,
  ios: '12.2',
}), new Map([
  ['chrome', '56'],
  ['ie', '11'],
  ['ios', '12.2'],
]), 'targets object');

deepEqual(targetsParser({ browsers: 'ie 11, chrome 56, ios_saf 12.2' }), new Map([
  ['chrome', '56'],
  ['ie', '11'],
  ['ios', '12.2-12.5'],
]), 'targets.browsers');

deepEqual(targetsParser({ esmodules: true }), new Map([
  ['android', '61'],
  ['bun', '0.1.1'],
  ['chrome', '61'],
  ['chrome-android', '61'],
  ['deno', '1.0'],
  ['edge', '16'],
  ['firefox', '60'],
  ['firefox-android', '60'],
  ['ios', '10.3'],
  ['node', '13.2'],
  ['opera', '48'],
  ['opera-android', '45'],
  ['quest', '4.0'],
  ['safari', '10.1'],
  ['samsung', '8.0'],
]), 'targets.esmodules');

deepEqual(targetsParser({ node: 'current' }), new Map([
  ['node', process.versions.node],
]), 'targets.node: current');

deepEqual(targetsParser({ node: '14.0' }), new Map([
  ['node', '14.0'],
]), 'targets.node: version');

deepEqual(targetsParser({
  ie_mob: 11,
  chromeandroid: 56,
  and_ff: 60,
  ios_saf: '12.2',
  op_mob: 40,
  op_mini: 1,
  react: '0.70',
  random: 42,
}), new Map([
  ['chrome-android', '56'],
  ['firefox-android', '60'],
  ['ie', '11'],
  ['ios', '12.2'],
  ['opera-android', '40'],
  ['react-native', '0.70'],
]), 'normalization');

deepEqual(targetsParser({
  esmodules: true,
  node: '12.0',
  browsers: 'edge 13, safari 5.1, ios 13',
  android: '4.2',
  chrome: 77,
  electron: 1,
  ie: 8,
  samsung: 4,
  ie_mob: 11,
  chromeandroid: 56,
  and_ff: 65,
  ios_saf: '12.2',
  op_mob: 40,
  'react-native': '0.70',
  random: 42,
}), new Map([
  ['android', '4.2'],
  ['bun', '0.1.1'],
  ['chrome', '61'],
  ['chrome-android', '56'],
  ['deno', '1.0'],
  ['edge', '16'],
  ['electron', '1'],
  ['firefox', '60'],
  ['firefox-android', '60'],
  ['ie', '8'],
  ['ios', '10.3'],
  ['node', '12.0'],
  ['opera', '48'],
  ['opera-android', '40'],
  ['quest', '4.0'],
  ['react-native', '0.70'],
  ['safari', '10.1'],
  ['samsung', '4'],
]), 'mixed');

deepEqual(targetsParser({
  esmodules: 'intersect',
  browsers: 'ie 11, chrome 56',
  chrome: 77,
}), new Map([
  ['chrome', '61'],
]), 'targets.esmodules: intersect, ie removed, chrome raised to esmodules minimum');

deepEqual(targetsParser({
  esmodules: 'intersect',
  browsers: 'chrome 56, firefox 50, safari 10',
}), new Map([
  ['chrome', '61'],
  ['firefox', '60'],
  ['safari', '10.1'],
]), 'targets.esmodules: intersect, versions raised to esmodules minimum');

deepEqual(targetsParser({
  esmodules: 'intersect',
  browsers: 'chrome 80, firefox 70',
}), new Map([
  ['chrome', '80'],
  ['firefox', '70'],
]), 'targets.esmodules: intersect, versions above esmodules minimum unchanged');

// "latest" / Safari Technology Preview keywords map to a sentinel above any real version
deepEqual(targetsParser({ safari: 'TP' }), new Map([
  ['safari', '999999'],
]), 'safari: TP -> latest sentinel');

deepEqual(targetsParser({ safari: 'tp' }), new Map([
  ['safari', '999999'],
]), 'safari: tp (lowercase) -> latest sentinel');

deepEqual(targetsParser({ safari: 'latest' }), new Map([
  ['safari', '999999'],
]), 'safari: latest -> latest sentinel');

deepEqual(targetsParser({ chrome: 'LATEST' }), new Map([
  ['chrome', '999999'],
]), 'chrome: LATEST (uppercase) -> latest sentinel');

deepEqual(targetsParser('safari TP'), new Map([
  ['safari', '999999'],
]), 'browserslist query "safari TP" -> latest sentinel');

deepEqual(targetsParser({ safari: 'TP', ie: 11 }), new Map([
  ['ie', '11'],
  ['safari', '999999'],
]), 'mixed: TP coexists with numeric versions');

throws(() => targetsParser({ safari: 'no!' }), {
  name: 'RangeError',
  message: /Invalid version "no!" for "safari"/,
}, 'unknown non-numeric version -> clear error');

throws(() => targetsParser({ chrome: 'beta' }), {
  name: 'RangeError',
  message: /Invalid version "beta" for "chrome"/,
}, 'unknown non-numeric version on different engine -> clear error');

const TRACKED_ENGINES = new Set([
  'android',
  'bun',
  'chrome',
  'chrome-android',
  'deno',
  'edge',
  'electron',
  'firefox',
  'firefox-android',
  'hermes',
  'ie',
  'ios',
  'node',
  'opera',
  'opera-android',
  'quest',
  'react-native',
  'rhino',
  'safari',
  'samsung',
]);

// browserslist queries that include engines we don't track must not throw on their
// non-numeric versions (e.g. `op_mini all`); they should be silently filtered
const defaults = targetsParser('defaults');
if (!(defaults instanceof Map)) throw new Error('targetsParser("defaults") should return a Map');
for (const [engine] of defaults) {
  if (!TRACKED_ENGINES.has(engine)) throw new Error(`targetsParser("defaults") returned untracked engine ${ engine }`);
}

throws(() => targetsParser({ safari: 'no!', op_mini: 'all' }), {
  name: 'RangeError',
  message: /Invalid version "no!" for "safari"/,
}, 'untracked engine filtered, but tracked engine still validated');

echo(chalk.green('targets parser tested'));
