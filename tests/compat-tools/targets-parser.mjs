import { deepEqual } from 'node:assert/strict';
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
  ['chrome_mobile', '61'],
  ['deno', '1.0'],
  ['edge', '16'],
  ['firefox', '60'],
  ['firefox_mobile', '60'],
  ['ios', '10.3'],
  ['node', '13.2'],
  ['opera', '48'],
  ['opera_mobile', '45'],
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
  ['chrome_mobile', '56'],
  ['firefox_mobile', '60'],
  ['ie', '11'],
  ['ios', '12.2'],
  ['opera_mobile', '40'],
  ['react_native', '0.70'],
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
  react_native: '0.70',
  random: 42,
}), new Map([
  ['android', '4.2'],
  ['bun', '0.1.1'],
  ['chrome', '61'],
  ['chrome_mobile', '56'],
  ['deno', '1.0'],
  ['edge', '16'],
  ['electron', '1'],
  ['firefox', '60'],
  ['firefox_mobile', '60'],
  ['ie', '8'],
  ['ios', '10.3'],
  ['node', '12.0'],
  ['opera', '48'],
  ['opera_mobile', '40'],
  ['quest', '4.0'],
  ['react_native', '0.70'],
  ['safari', '10.1'],
  ['samsung', '4'],
]), 'mixed');

deepEqual(targetsParser({
  esmodules: 'intersect',
  browsers: 'ie 11, chrome 56',
  chrome: 77,
}), new Map([
  ['chrome', '77'],
  ['ie', '11'],
]), 'targets.esmodules: intersect');

echo(chalk.green('targets parser tested'));
