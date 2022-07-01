import { deepStrictEqual } from 'assert';
import targetsParser from 'core-js-compat/targets-parser.js';

deepStrictEqual(targetsParser('ie 11, chrome 56, ios 12.2'), new Map([
  ['chrome', '56'],
  ['ie', '11'],
  ['ios', '12.2-12.5'],
]), 'browserslist');

deepStrictEqual(targetsParser({
  ie: 11,
  chrome: 56,
  ios: '12.2',
}), new Map([
  ['chrome', '56'],
  ['ie', '11'],
  ['ios', '12.2'],
]), 'targets object');

deepStrictEqual(targetsParser({ browsers: 'ie 11, chrome 56, ios_saf 12.2' }), new Map([
  ['chrome', '56'],
  ['ie', '11'],
  ['ios', '12.2-12.5'],
]), 'targets.browsers');

deepStrictEqual(targetsParser({ esmodules: true }), new Map([
  ['android', '61'],
  ['chrome', '61'],
  ['deno', '1.0'],
  ['edge', '16'],
  ['firefox', '60'],
  ['ios', '10.3'],
  ['oculus', '5.0'],
  ['opera', '48'],
  ['opera_mobile', '45'],
  ['safari', '10.1'],
  ['samsung', '8.0'],
]), 'targets.esmodules');

deepStrictEqual(targetsParser({ node: 'current' }), new Map([
  ['node', String(process.versions.node)],
]), 'targets.node: current');

deepStrictEqual(targetsParser({ node: '13.2' }), new Map([
  ['node', '13.2'],
]), 'targets.node: version');

deepStrictEqual(targetsParser({
  ie_mob: 11,
  chromeandroid: 56,
  and_ff: 60,
  ios_saf: '12.2',
  op_mob: 40,
  op_mini: 1,
  random: 42,
}), new Map([
  ['chrome', '56'],
  ['firefox', '60'],
  ['ie', '11'],
  ['ios', '12.2'],
  ['opera_mobile', '40'],
]), 'normalization');

deepStrictEqual(targetsParser({
  esmodules: true,
  node: 'current',
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
  random: 42,
}), new Map([
  ['android', '4.2'],
  ['chrome', '56'],
  ['deno', '1.0'],
  ['edge', '13'],
  ['electron', '1'],
  ['firefox', '60'],
  ['ie', '8'],
  ['ios', '10.3'],
  ['node', String(process.versions.node)],
  ['oculus', '5.0'],
  ['opera', '48'],
  ['opera_mobile', '40'],
  ['safari', '5.1'],
  ['samsung', '4'],
]), 'mixed');

echo(chalk.green('targets parser tested'));
