'use strict';
const { deepStrictEqual } = require('assert');
const targetsParser = require('@core-js/compat/targets-parser');

// browserslist
deepStrictEqual(targetsParser('ie 11, chrome 56, ios 12.2'), new Map([
  ['chrome', '56'],
  ['ie', '11'],
  ['ios', '12.2-12.4'],
]));

// targets object
deepStrictEqual(targetsParser({
  ie: 11,
  chrome: 56,
  ios: '12.2',
}), new Map([
  ['chrome', '56'],
  ['ie', '11'],
  ['ios', '12.2'],
]));

// targets.browsers
deepStrictEqual(targetsParser({ browsers: 'ie 11, chrome 56, ios_saf 12.2' }), new Map([
  ['chrome', '56'],
  ['ie', '11'],
  ['ios', '12.2-12.4'],
]));

// targets.esmodules
deepStrictEqual(targetsParser({ esmodules: true }), new Map([
  ['android', '61'],
  ['chrome', '61'],
  ['edge', '16'],
  ['firefox', '60'],
  ['ios', '10.3'],
  ['opera', '48'],
  ['opera_mobile', '45'],
  ['safari', '10.1'],
  ['samsung', '8.0'],
]));

// targets.node: current
deepStrictEqual(targetsParser({ node: 'current' }), new Map([
  ['node', String(process.versions.node)],
]));

// targets.node: version
deepStrictEqual(targetsParser({ node: '13.2' }), new Map([
  ['node', '13.2'],
]));

// normalization
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
]));

// mixed
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
  ['edge', '13'],
  ['electron', '1'],
  ['firefox', '60'],
  ['ie', '8'],
  ['ios', '10.3'],
  ['node', String(process.versions.node)],
  ['opera', '48'],
  ['opera_mobile', '40'],
  ['safari', '5.1'],
  ['samsung', '4'],
]));

// eslint-disable-next-line no-console -- output
console.log('\u001B[32mtargets parser tested\u001B[0m');
