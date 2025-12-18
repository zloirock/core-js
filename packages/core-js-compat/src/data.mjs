export const data = {
  // TODO: Remove this module from `core-js@4` since it's split to modules listed below
  'es.symbol': {
    chrome: '49',
    edge: '15',
    firefox: '51',
    hermes: '0.1',
    rhino: '1.7.15',
    safari: '10.0',
  },
  'es.symbol.constructor': {
    chrome: '41',
    edge: '13',
    firefox: '36',
    hermes: '0.1',
    rhino: '1.7.14',
    safari: '9.0',
  },
  'es.symbol.description': {
    chrome: '70',
    firefox: '63',
    rhino: '1.8.0',
    safari: '12.1',
  },
  'es.symbol.async-dispose': {
    bun: '1.0.23',
    chrome: '127',
    deno: '1.38',
    firefox: '135',
    // Node 20.4.0 add `Symbol.asyncDispose`, but with incorrect descriptor
    // https://github.com/nodejs/node/issues/48699
    node: '20.5.0',
  },
  'es.symbol.async-iterator': {
    chrome: '63',
    firefox: '55',
    safari: '12.0',
  },
  'es.symbol.dispose': {
    bun: '1.0.23',
    chrome: '125',
    deno: '1.38',
    firefox: '135',
    // Node 20.4.0 add `Symbol.dispose`, but with incorrect descriptor
    // https://github.com/nodejs/node/issues/48699
    node: '20.5.0',
  },
  'es.symbol.for': {
    chrome: '41',
    edge: '13',
    firefox: '36',
    hermes: '0.1',
    rhino: '1.7.14',
    safari: '9.0',
  },
  'es.symbol.has-instance': {
    chrome: '50',
    edge: '15',
    firefox: '49',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.symbol.is-concat-spreadable': {
    chrome: '48',
    edge: '15',
    firefox: '48',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.symbol.iterator': {
    chrome: '41',
    edge: '13',
    firefox: '36',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.symbol.key-for': {
    chrome: '41',
    edge: '13',
    firefox: '36',
    hermes: '0.1',
    rhino: '1.7.14',
    safari: '9.0',
  },
  'es.symbol.match': {
    chrome: '50',
    firefox: '40',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.symbol.match-all': {
    chrome: '73',
    firefox: '67',
    hermes: '0.6',
    rhino: '1.8.0',
    safari: '13',
  },
  'es.symbol.replace': {
    chrome: '50',
    firefox: '49',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.symbol.search': {
    chrome: '50',
    firefox: '49',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.symbol.species': {
    chrome: '51',
    edge: '13',
    firefox: '41',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.symbol.split': {
    chrome: '50',
    firefox: '49',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.symbol.to-primitive': {
    chrome: '47',
    edge: '15',
    firefox: '44',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.symbol.to-string-tag': {
    chrome: '49',
    edge: '15',
    firefox: '51',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.symbol.unscopables': {
    chrome: '41',
    edge: '13',
    firefox: '48',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.error.cause': {
    chrome: '94',
    firefox: '91',
    hermes: '0.8',
    rhino: '1.8.0',
    safari: '15.0',
  },
  'es.error.is-error': {
    // early WebKit implementation bug
    // https://github.com/oven-sh/bun/issues/15821
    // bun: '1.1.39',
    chrome: '134',
    firefox: '138',
    // https://github.com/nodejs/node/issues/58134
    node: '24.3',
  },
  'es.error.to-string': {
    chrome: '33',
    firefox: '11',
    hermes: '0.1',
    ie: '9',
    rhino: '1.7.14',
    safari: '8.0',
  },
  // TODO: Remove this module from `core-js@4` since it's replaced to module below
  'es.aggregate-error': null,
  'es.aggregate-error.constructor': {
    chrome: '85',
    firefox: '79',
    hermes: '0.13',
    'react-native': '0.72',
    rhino: '1.8.0',
    safari: '14.0',
  },
  'es.aggregate-error.cause': {
    chrome: '94',
    firefox: '91',
    hermes: '0.13',
    'react-native': '0.72',
    rhino: '1.8.0',
    safari: '15.0',
  },
  'es.suppressed-error.constructor': {
    // Bun ~ 1.0.33 issues
    // https://github.com/oven-sh/bun/issues/9282
    // https://github.com/oven-sh/bun/issues/9283
    bun: '1.2.15', // '1.0.23',
    // reverted in https://issues.chromium.org/issues/42203506#comment25
    // disabled again in 135 and re-enabled in 136
    chrome: '136', // '134', // '133',
    deno: '2.2.10',
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1971000
    firefox: '141',
  },
  'es.array.at': {
    chrome: '92',
    firefox: '90',
    hermes: '0.13',
    'react-native': '0.71',
    rhino: '1.7.15',
    safari: '15.4',
  },
  'es.array.concat': {
    chrome: '51',
    edge: '15',
    firefox: '48',
    safari: '10.0',
  },
  'es.array.copy-within': {
    chrome: '45',
    edge: '12',
    firefox: '48',
    rhino: '1.8.0',
    safari: '9.0',
  },
  'es.array.every': {
    chrome: '26',
    firefox: '4',
    hermes: '0.1',
    ie: '9',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.array.fill': {
    chrome: '45',
    edge: '12',
    firefox: '48',
    rhino: '1.8.0',
    safari: '9.0',
  },
  'es.array.filter': {
    chrome: '51',
    edge: '15',
    firefox: '48',
    safari: '10.0',
  },
  'es.array.find': {
    chrome: '45',
    edge: '13',
    firefox: '48',
    rhino: '1.8.0',
    safari: '9.0',
  },
  'es.array.find-index': {
    chrome: '45',
    edge: '13',
    firefox: '48',
    rhino: '1.8.0',
    safari: '9.0',
  },
  'es.array.find-last': {
    chrome: '97',
    firefox: '104',
    hermes: '0.11',
    rhino: '1.8.0',
    safari: '15.4',
  },
  'es.array.find-last-index': {
    chrome: '97',
    firefox: '104',
    hermes: '0.11',
    rhino: '1.8.0',
    safari: '15.4',
  },
  'es.array.flat': {
    chrome: '69',
    firefox: '62',
    hermes: '0.4',
    rhino: '1.7.15',
    safari: '12.0',
  },
  'es.array.flat-map': {
    chrome: '69',
    firefox: '62',
    hermes: '0.4',
    rhino: '1.7.15',
    safari: '12.0',
  },
  'es.array.for-each': {
    chrome: '26',
    firefox: '4',
    hermes: '0.1',
    ie: '9',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.array.from': {
    chrome: '51',
    edge: '15',
    firefox: '53',
    hermes: '0.13',
    'react-native': '0.73',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.array.includes': {
    chrome: '53',
    edge: '14',
    // FF99-101 broken on sparse arrays
    firefox: '102', // '48',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.array.index-of': {
    chrome: '51',
    firefox: '47',
    hermes: '0.1',
    ie: '9',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.array.is-array': {
    chrome: '5',
    firefox: '4',
    hermes: '0.1',
    ie: '9',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '4.0',
  },
  'es.array.iterator': {
    chrome: '66',
    edge: '15',
    firefox: '60',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.array.join': {
    chrome: '26',
    edge: '13',
    firefox: '4',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.array.last-index-of': {
    chrome: '51',
    firefox: '47',
    hermes: '0.1',
    ie: '9',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.array.map': {
    chrome: '51',
    edge: '13',
    firefox: '50',
    safari: '10.0',
  },
  'es.array.of': {
    chrome: '45',
    edge: '13',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.array.push': {
    // bug with setting length
    chrome: '122', // '103',
    // edge: '15',
    firefox: '55',
    hermes: '0.2',
    // the same to Chrome bug fixed only in Safari 16
    safari: '16.0',
  },
  'es.array.reduce': {
    chrome: '83', // https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
    firefox: '4',
    hermes: '0.1',
    ie: '9',
    node: '6.0', // ^^^
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.array.reduce-right': {
    chrome: '83', // https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
    firefox: '4',
    hermes: '0.1',
    ie: '9',
    node: '6.0', // ^^^
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.array.reverse': {
    chrome: '1',
    firefox: '1',
    hermes: '0.1',
    ie: '5.5',
    opera: '10.50',
    rhino: '1.7.13',
    // safari 12.0 has a serious bug
    safari: '12.0.2',
  },
  'es.array.slice': {
    chrome: '51',
    edge: '13',
    firefox: '48',
    safari: '10.0',
  },
  'es.array.some': {
    chrome: '26',
    firefox: '4',
    hermes: '0.1',
    ie: '9',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.array.sort': {
    chrome: '70',
    firefox: '4',
    hermes: '0.10',
    rhino: '1.8.0',
    safari: '12.0',
  },
  'es.array.species': {
    chrome: '51',
    edge: '13',
    firefox: '48',
    rhino: '1.7.15',
    safari: '10.0',
  },
  'es.array.splice': {
    chrome: '51',
    edge: '13',
    firefox: '49',
    safari: '10.0',
  },
  'es.array.to-reversed': {
    chrome: '110',
    deno: '1.27',
    firefox: '115',
    hermes: '0.13',
    'react-native': '0.74',
    rhino: '1.8.0',
    safari: '16.0',
  },
  'es.array.to-sorted': {
    chrome: '110',
    deno: '1.27',
    firefox: '115',
    rhino: '1.8.0',
    safari: '16.0',
  },
  'es.array.to-spliced': {
    chrome: '110',
    deno: '1.27',
    firefox: '115',
    hermes: '0.13',
    'react-native': '0.74',
    rhino: '1.8.0',
    safari: '16.0',
  },
  'es.array.unscopables.flat': {
    chrome: '73',
    firefox: '67',
    rhino: '1.8.0',
    safari: '13',
  },
  'es.array.unscopables.flat-map': {
    chrome: '73',
    firefox: '67',
    rhino: '1.8.0',
    safari: '13',
  },
  'es.array.unshift': {
    chrome: '71',
    firefox: '23',
    hermes: '0.1',
    ie: '9',
    // bug with setting length fixed only in Safari 16
    safari: '16.0',
  },
  'es.array.with': {
    chrome: '110',
    deno: '1.27',
    // Incorrect exception thrown when index coercion fails
    firefox: '140', // '115',
    hermes: '0.13',
    'react-native': '0.74',
    rhino: '1.8.0',
    safari: '16.0',
  },
  'es.array-buffer.constructor': {
    chrome: '28',
    edge: '14',
    firefox: '44',
    hermes: '0.1',
    rhino: '1.8.0',
    safari: '12.0',
  },
  'es.array-buffer.is-view': {
    chrome: '32',
    firefox: '29',
    hermes: '0.1',
    ie: '11',
    safari: '7.1',
  },
  'es.array-buffer.slice': {
    chrome: '31',
    firefox: '46',
    hermes: '0.1',
    ie: '11',
    rhino: '1.7.13',
    safari: '12.1',
  },
  // TODO: Remove this module from `core-js@4` since it's replaced to module below
  'es.data-view': null,
  'es.data-view.constructor': {
    chrome: '26',
    firefox: '15',
    hermes: '0.1',
    ie: '10',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.data-view.get-float16': {
    bun: '1.1.23',
    chrome: '135',
    deno: '1.43',
    firefox: '129',
    safari: '18.2',
  },
  'es.data-view.set-float16': {
    bun: '1.1.23',
    chrome: '135',
    deno: '1.43',
    firefox: '129',
    safari: '18.2',
  },
  'es.array-buffer.detached': {
    bun: '1.0.19',
    chrome: '114',
    firefox: '122',
    safari: '17.4',
  },
  'es.array-buffer.transfer': {
    bun: '1.0.19',
    chrome: '114',
    firefox: '122',
    safari: '17.4',
  },
  'es.array-buffer.transfer-to-fixed-length': {
    bun: '1.0.19',
    chrome: '114',
    firefox: '122',
    safari: '17.4',
  },
  'es.date.get-year': {
    chrome: '1',
    firefox: '1',
    hermes: '0.1',
    ie: '9',
    opera: '3',
    rhino: '1.7.13',
    safari: '1',
  },
  // TODO: Remove from `core-js@4`
  'es.date.now': {
    chrome: '5',
    firefox: '2',
    hermes: '0.1',
    ie: '9',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '4.0',
  },
  'es.date.set-year': {
    chrome: '1',
    firefox: '1',
    hermes: '0.1',
    ie: '3',
    opera: '3',
    rhino: '1.7.13',
    safari: '1',
  },
  'es.date.to-gmt-string': {
    chrome: '1',
    firefox: '1',
    hermes: '0.1',
    ie: '3',
    opera: '3',
    rhino: '1.7.13',
    safari: '1',
  },
  'es.date.to-iso-string': {
    chrome: '26',
    firefox: '7',
    hermes: '0.1',
    ie: '9',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.date.to-json': {
    chrome: '26',
    firefox: '4',
    hermes: '0.1',
    ie: '9',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.date.to-primitive': {
    chrome: '47',
    edge: '15',
    firefox: '44',
    hermes: '0.1',
    rhino: '1.8.0',
    safari: '10.0',
  },
  // TODO: Remove from `core-js@4`
  'es.date.to-string': {
    chrome: '5',
    firefox: '2',
    hermes: '0.1',
    ie: '9',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '3.1',
  },
  'es.disposable-stack.constructor': {
    bun: '1.3.0',
    // reverted in https://issues.chromium.org/issues/42203506#comment25
    // disabled again in 135 and re-enabled in 136
    chrome: '136', // '134', // '133',
    deno: '2.2.10',
    firefox: '141',
  },
  'es.escape': {
    chrome: '1',
    firefox: '1',
    hermes: '0.1',
    ie: '3',
    opera: '3',
    rhino: '1.7.13',
    safari: '1',
  },
  'es.function.bind': {
    chrome: '7',
    firefox: '4',
    hermes: '0.1',
    ie: '9',
    opera: '12',
    rhino: '1.7.13',
    safari: '5.1',
  },
  'es.function.has-instance': {
    chrome: '51',
    edge: '15',
    firefox: '50',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.function.name': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    hermes: '0.1',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '4.0',
  },
  'es.global-this': {
    chrome: '71',
    firefox: '65',
    hermes: '0.2',
    rhino: '1.7.14',
    safari: '12.1',
  },
  'es.iterator.constructor': {
    bun: '1.1.31',
    chrome: '122',
    deno: '1.38.1',
    firefox: '131',
    safari: '18.4',
  },
  'es.iterator.concat': {
    firefox: '147',
  },
  'es.iterator.dispose': {
    bun: '1.3.0',
    // reverted in https://issues.chromium.org/issues/42203506#comment25
    // disabled again in 135 and re-enabled in 136
    chrome: '136', // '134', // '133',
    deno: '2.2.10',
    firefox: '135',
  },
  'es.iterator.drop': {
    // with changes related to the new iteration closing approach on early error
    // https://github.com/tc39/ecma262/pull/3467
    // https://bugs.webkit.org/show_bug.cgi?id=291195
    bun: '1.2.11', // '1.2.4', // '1.1.31',
    chrome: '135', // '122',
    deno: '2.2.5', // '1.38.1',
    firefox: '141', // '131',
    safari: '26.0', // 18.4',
  },
  'es.iterator.every': {
    // with changes related to the new iteration closing approach on early error
    // https://github.com/tc39/ecma262/pull/3467
    bun: '1.2.4', // '1.1.31',
    chrome: '135', // '122',
    deno: '2.2.5', // '1.38.1',
    firefox: '141', // '131',
    safari: '26.0', // 18.4',
  },
  'es.iterator.filter': {
    // with changes related to the new iteration closing approach on early error
    // https://github.com/tc39/ecma262/pull/3467
    bun: '1.2.4', // '1.1.31',
    chrome: '135', // '122',
    deno: '2.2.5', // '1.38.1',
    firefox: '141', // '131',
    safari: '26.0', // 18.4',
  },
  'es.iterator.find': {
    // with changes related to the new iteration closing approach on early error
    // https://github.com/tc39/ecma262/pull/3467
    bun: '1.2.4', // '1.1.31',
    chrome: '135', // '122',
    deno: '2.2.5', // '1.38.1',
    firefox: '141', // '131',
    safari: '26.0', // 18.4',
  },
  'es.iterator.flat-map': {
    // with changes related to the new iteration closing approach on early error
    // https://github.com/tc39/ecma262/pull/3467
    bun: '1.2.4', // '1.1.31',
    chrome: '135', // '122',
    deno: '2.2.5', // '1.38.1',
    firefox: '141', // '131',
    safari: '26.0', // 18.4',
  },
  'es.iterator.for-each': {
    // with changes related to the new iteration closing approach on early error
    // https://github.com/tc39/ecma262/pull/3467
    bun: '1.2.4', // '1.1.31',
    chrome: '135', // '122',
    deno: '2.2.5', // '1.38.1',
    firefox: '141', // '131',
    safari: '26.0', // 18.4',
  },
  'es.iterator.from': {
    // Because of a bug in wrapper validation https://bugs.webkit.org/show_bug.cgi?id=288714
    bun: '1.2.5',  // '1.1.31',
    chrome: '122',
    deno: '1.38.1',
    firefox: '131',
    // Because of a bug in wrapper validation https://bugs.webkit.org/show_bug.cgi?id=288714
    safari: '26.0', // 18.4',
  },
  'es.iterator.map': {
    // with changes related to the new iteration closing approach on early error
    // https://github.com/tc39/ecma262/pull/3467
    bun: '1.2.4', // '1.1.31',
    chrome: '135', // '122',
    deno: '2.2.5', // '1.38.1',
    firefox: '141', // '131',
    safari: '26.0', // 18.4',
  },
  'es.iterator.reduce': {
    // with changes related to the new iteration closing approach on early error
    // https://github.com/tc39/ecma262/pull/3467
    // due to bug that causes a throw when the initial parameter is `undefined`
    // https://bugs.webkit.org/show_bug.cgi?id=291651
    bun: '1.2.11', // '1.2.4', // '1.1.31',
    chrome: '135', // '122',
    deno: '2.2.5', // '1.38.1',
    firefox: '141', // '131',
    safari: '26.0', // 18.4',
  },
  'es.iterator.some': {
    // with changes related to the new iteration closing approach on early error
    // https://github.com/tc39/ecma262/pull/3467
    bun: '1.2.4', // '1.1.31',
    chrome: '135', // '122',
    deno: '2.2.5', // '1.38.1',
    firefox: '141', // '131',
    safari: '26.0', // 18.4',
  },
  'es.iterator.take': {
    // with changes related to the new iteration closing approach on early error
    // https://github.com/tc39/ecma262/pull/3467
    // https://bugs.webkit.org/show_bug.cgi?id=291195
    bun: '1.2.11', // '1.2.4', // '1.1.31',
    chrome: '135', // '122',
    deno: '2.2.5', // '1.38.1',
    firefox: '141', // '131',
    safari: '26.0', // 18.4',
  },
  'es.iterator.to-array': {
    bun: '1.1.31',
    chrome: '122',
    deno: '1.38.1',
    firefox: '131',
    safari: '18.4',
  },
  'es.json.is-raw-json': {
    bun: '1.1.43',
    chrome: '114',
    // enabled in 132 and disabled in 133 because of regression, https://bugzilla.mozilla.org/show_bug.cgi?id=1925334
    firefox: '135', // '132',
    safari: '18.4',
  },
  'es.json.parse': {
    bun: '1.1.43',
    chrome: '114',
    // enabled in 132 and disabled in 133 because of regression, https://bugzilla.mozilla.org/show_bug.cgi?id=1925334
    firefox: '135', // '132',
    safari: '18.4',
  },
  'es.json.raw-json': {
    bun: '1.1.43',
    chrome: '114',
    // enabled in 132 and disabled in 133 because of regression, https://bugzilla.mozilla.org/show_bug.cgi?id=1925334
    firefox: '135', // '132',
    safari: '18.4',
  },
  'es.json.stringify': {
    bun: '1.1.43',
    chrome: '114', // '72',
    firefox: '135', // '132', '64',
    // hermes: '0.13',
    // 'react-native': '0.72',
    // rhino: '1.8.0',
    safari: '18.4', // '12.1',
  },
  'es.json.to-string-tag': {
    chrome: '50',
    edge: '15',
    firefox: '51',
    hermes: '0.1',
    rhino: '1.7.15',
    safari: '10.0',
  },
  // TODO: Remove this module from `core-js@4` since it's replaced to module below
  'es.map': null,
  'es.map.constructor': {
    chrome: '51',
    edge: '15',
    firefox: '53',
    hermes: '0.13',
    'react-native': '0.73',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.map.group-by': {
    // https://bugs.webkit.org/show_bug.cgi?id=271524
    bun: '1.1.2', // '1.0.19',
    chrome: '117',
    firefox: '119',
    rhino: '1.8.0',
    // https://bugs.webkit.org/show_bug.cgi?id=271524
    safari: '18.0', // '17.4',
  },
  'es.math.acosh': {
    chrome: '54',
    edge: '13',
    firefox: '25',
    hermes: '0.1',
    safari: '7.1',
  },
  'es.math.asinh': {
    chrome: '38',
    edge: '13',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.atanh': {
    chrome: '38',
    edge: '13',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.cbrt': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.clz32': {
    chrome: '38',
    edge: '12',
    firefox: '31',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.math.cosh': {
    chrome: '39',
    edge: '13',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.expm1': {
    chrome: '39',
    edge: '13',
    firefox: '46',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.fround': {
    chrome: '38',
    edge: '12',
    firefox: '26',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.f16round': {
    bun: '1.1.23',
    chrome: '135',
    deno: '1.43',
    firefox: '129',
    safari: '18.2',
  },
  'es.math.hypot': {
    // https://bugs.chromium.org/p/v8/issues/detail?id=9546
    chrome: '78', // '38',
    edge: '12',
    firefox: '27',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.imul': {
    chrome: '28',
    edge: '13',
    firefox: '20',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.math.log10': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.log1p': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.log2': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.sign': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.math.sinh': {
    chrome: '39',
    edge: '13',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.sum-precise': {
    bun: '1.2.18',
    firefox: '137',
    safari: '26.2',
  },
  'es.math.tanh': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.math.to-string-tag': {
    chrome: '50',
    edge: '15',
    firefox: '51',
    hermes: '0.1',
    rhino: '1.7.15',
    safari: '10.0',
  },
  'es.math.trunc': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.number.constructor': {
    chrome: '41',
    edge: '13',
    firefox: '46',
    hermes: '0.5',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.number.epsilon': {
    chrome: '34',
    edge: '12',
    firefox: '25',
    hermes: '0.1',
    rhino: '1.7.14',
    safari: '9.0',
  },
  'es.number.is-finite': {
    android: '4.1',
    chrome: '19',
    edge: '12',
    firefox: '16',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.number.is-integer': {
    chrome: '34',
    edge: '12',
    firefox: '16',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.number.is-nan': {
    android: '4.1',
    chrome: '19',
    edge: '12',
    firefox: '15',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.number.is-safe-integer': {
    chrome: '34',
    edge: '12',
    firefox: '32',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.number.max-safe-integer': {
    chrome: '34',
    edge: '12',
    firefox: '31',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.number.min-safe-integer': {
    chrome: '34',
    edge: '12',
    firefox: '31',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.number.parse-float': {
    chrome: '35',
    firefox: '39',
    hermes: '0.1',
    rhino: '1.7.14',
    safari: '11.0',
  },
  'es.number.parse-int': {
    chrome: '35',
    firefox: '39',
    hermes: '0.1',
    rhino: '1.7.14',
    safari: '9.0',
  },
  'es.number.to-exponential': {
    chrome: '51',
    edge: '18',
    firefox: '87',
    hermes: '0.1',
    rhino: '1.7.14',
    safari: '11',
  },
  'es.number.to-fixed': {
    chrome: '26',
    firefox: '4',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.number.to-precision': {
    chrome: '26',
    firefox: '4',
    hermes: '0.1',
    ie: '8',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.object.assign': {
    chrome: '49',
    // order of operations bug
    // edge: '13',
    firefox: '36',
    hermes: '0.4',
    safari: '9.0',
  },
  // TODO: Remove from `core-js@4`
  'es.object.create': {
    chrome: '5',
    firefox: '4',
    hermes: '0.1',
    ie: '9',
    opera: '12',
    rhino: '1.7.13',
    safari: '4.0',
  },
  'es.object.define-getter': {
    chrome: '62',
    edge: '16',
    firefox: '48',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.object.define-properties': {
    chrome: '37',
    firefox: '4',
    hermes: '0.1',
    ie: '9',
    opera: '12',
    rhino: '1.7.13',
    safari: '5.1',
  },
  'es.object.define-property': {
    chrome: '37',
    firefox: '4',
    hermes: '0.1',
    ie: '9',
    opera: '12',
    rhino: '1.7.13',
    safari: '5.1',
  },
  'es.object.define-setter': {
    chrome: '62',
    edge: '16',
    firefox: '48',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.object.entries': {
    chrome: '54',
    edge: '14',
    firefox: '47',
    hermes: '0.1',
    rhino: '1.7.14',
    safari: '10.1',
  },
  'es.object.freeze': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.from-entries': {
    chrome: '73',
    firefox: '63',
    hermes: '0.4',
    rhino: '1.7.14',
    safari: '12.1',
  },
  'es.object.get-own-property-descriptor': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.get-own-property-descriptors': {
    chrome: '54',
    edge: '15',
    firefox: '50',
    hermes: '0.6',
    rhino: '1.7.15',
    safari: '10.0',
  },
  'es.object.get-own-property-names': {
    chrome: '40',
    edge: '13',
    firefox: '34',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.get-own-property-symbols': {
    chrome: '41',
    edge: '13',
    firefox: '36',
    hermes: '0.1',
    rhino: '1.7.14',
    safari: '9.0',
  },
  'es.object.get-prototype-of': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.group-by': {
    // https://bugs.webkit.org/show_bug.cgi?id=271524
    bun: '1.1.2', // '1.0.19',
    chrome: '117',
    firefox: '119',
    rhino: '1.8.0',
    // https://bugs.webkit.org/show_bug.cgi?id=271524
    safari: '18.0', // '17.4',
  },
  'es.object.has-own': {
    chrome: '93',
    firefox: '92',
    hermes: '0.10',
    rhino: '1.7.15',
    safari: '15.4',
  },
  'es.object.is': {
    android: '4.1',
    chrome: '19',
    edge: '12',
    firefox: '22',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.is-extensible': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.is-frozen': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.is-sealed': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.keys': {
    chrome: '40',
    edge: '13',
    firefox: '35',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.lookup-getter': {
    chrome: '62',
    edge: '16',
    firefox: '48',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.object.lookup-setter': {
    chrome: '62',
    edge: '16',
    firefox: '48',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.object.prevent-extensions': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.proto': {
    chrome: '5',
    deno: false,
    firefox: '2',
    hermes: '0.1',
    ie: '11',
    opera: '10.50',
    safari: '3.1',
  },
  'es.object.seal': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.set-prototype-of': {
    chrome: '34',
    firefox: '31',
    hermes: '0.1',
    ie: '11',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.object.to-string': {
    chrome: '49',
    edge: '15',
    firefox: '51',
    hermes: '0.1',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.object.values': {
    chrome: '54',
    edge: '14',
    firefox: '47',
    hermes: '0.1',
    rhino: '1.7.14',
    safari: '10.1',
  },
  'es.parse-float': {
    chrome: '35',
    edge: '74',
    firefox: '8',
    hermes: '0.1',
    ie: '8',
    rhino: '1.7.13',
    safari: '7.1',
  },
  'es.parse-int': {
    chrome: '35',
    edge: '74',
    firefox: '21',
    hermes: '0.1',
    ie: '9',
    rhino: '1.7.13',
    safari: '7.1',
  },
  // TODO: Remove this module from `core-js@4` since it's split to modules listed below
  'es.promise': {
    // V8 6.6 has a serious bug
    chrome: '67', // '51',
    // `unhandledrejection` event support was added in Deno@1.24
    deno: '1.24',
    firefox: '69',
    rhino: '1.7.14',
    safari: '11.0',
  },
  'es.promise.constructor': {
    // V8 6.6 has a serious bug
    chrome: '67', // '51',
    // `unhandledrejection` event support was added in Deno@1.24
    deno: '1.24',
    firefox: '69',
    rhino: '1.7.14',
    safari: '11.0',
  },
  'es.promise.all': {
    chrome: '67',
    // `unhandledrejection` event support was added in Deno@1.24
    deno: '1.24',
    firefox: '69',
    rhino: '1.7.14',
    safari: '11.0',
  },
  'es.promise.all-settled': {
    chrome: '76',
    // `unhandledrejection` event support was added in Deno@1.24
    deno: '1.24',
    firefox: '71',
    rhino: '1.7.15',
    safari: '13',
  },
  'es.promise.any': {
    chrome: '85',
    // `unhandledrejection` event support was added in Deno@1.24
    deno: '1.24',
    firefox: '79',
    rhino: '1.8.0',
    safari: '14.0',
  },
  'es.promise.catch': {
    chrome: '67',
    // `unhandledrejection` event support was added in Deno@1.24
    deno: '1.24',
    firefox: '69',
    rhino: '1.7.14',
    safari: '11.0',
  },
  'es.promise.finally': {
    // V8 6.6 has a serious bug
    chrome: '67', // '63',
    // `unhandledrejection` event support was added in Deno@1.24
    deno: '1.24',
    firefox: '69',
    // Previous versions are non-generic
    // https://bugs.webkit.org/show_bug.cgi?id=200788
    ios: '13.2.3', // need to clarify the patch release, >13.0.0 && <= 13.2.3
    rhino: '1.7.14',
    safari: '13.0.3', // need to clarify the patch release, >13.0.0 && <= 13.0.3
  },
  'es.promise.race': {
    chrome: '67',
    // `unhandledrejection` event support was added in Deno@1.24
    deno: '1.24',
    firefox: '69',
    rhino: '1.7.14',
    safari: '11.0',
  },
  'es.promise.reject': {
    chrome: '67',
    // `unhandledrejection` event support was added in Deno@1.24
    deno: '1.24',
    firefox: '69',
    rhino: '1.7.14',
    safari: '11.0',
  },
  'es.promise.resolve': {
    chrome: '67',
    // `unhandledrejection` event support was added in Deno@1.24
    deno: '1.24',
    firefox: '69',
    rhino: '1.7.14',
    safari: '11.0',
  },
  'es.promise.try': {
    bun: '1.1.22',
    chrome: '128',
    firefox: '134',
    safari: '18.2',
  },
  'es.promise.with-resolvers': {
    bun: '0.7.1',
    chrome: '119',
    firefox: '121',
    safari: '17.4',
  },
  'es.array.from-async': { // <- `Array#values` and `Promise` dependencies should be loaded before
    // https://bugs.webkit.org/show_bug.cgi?id=271703
    bun: '1.1.2', // '0.3.0',
    chrome: '121',
    deno: '1.38',
    firefox: '115',
    // https://bugs.webkit.org/show_bug.cgi?id=271703
    safari: '18.0', // '16.4',
  },
  'es.async-disposable-stack.constructor': { // `Promise` dependency should be loaded before
    bun: '1.3.0',
    // added in 133, reverted in 134, https://issues.chromium.org/issues/42203506#comment25
    // https://github.com/tc39/proposal-explicit-resource-management/issues/256, fixed in early 135
    chrome: '136',
    firefox: '141',
  },
  'es.async-iterator.async-dispose': { // `Promise` dependency should be loaded before
  },
  'es.reflect.apply': {
    chrome: '49',
    edge: '15',
    firefox: '42',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.reflect.construct': {
    chrome: '49',
    edge: '15',
    firefox: '44',
    hermes: '0.7',
    safari: '10.0',
  },
  'es.reflect.define-property': {
    chrome: '49',
    edge: '13',
    firefox: '42',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.reflect.delete-property': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.reflect.get': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.reflect.get-own-property-descriptor': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.reflect.get-prototype-of': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.reflect.has': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.reflect.is-extensible': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.reflect.own-keys': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.reflect.prevent-extensions': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.reflect.set': {
    // MS Edge 17-18 Reflect.set allows setting the property to object
    // with non-writable property on the prototype
    // edge: '12',
    chrome: '49',
    firefox: '42',
    hermes: '0.7',
    safari: '10.0',
  },
  'es.reflect.set-prototype-of': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '10.0',
  },
  'es.reflect.to-string-tag': {
    chrome: '86',
    firefox: '82',
    hermes: '0.7',
    rhino: '1.8.0',
    safari: '14.0',
  },
  'es.regexp.constructor': {
    chrome: '64',
    firefox: '78',
    safari: '11.1',
  },
  'es.regexp.escape': {
    bun: '1.1.22',
    chrome: '136',
    firefox: '134',
    safari: '18.2',
  },
  'es.regexp.dot-all': {
    chrome: '62',
    firefox: '78',
    hermes: '0.4',
    rhino: '1.7.15',
    safari: '11.1',
  },
  'es.regexp.exec': {
    chrome: '64',
    firefox: '78',
    hermes: '0.13',
    'react-native': '0.71',
    safari: '11.1',
  },
  'es.regexp.flags': {
    // modern V8 has a bug with the order getting of flags
    chrome: '111', // '62',
    firefox: '78',
    hermes: '0.4',
    safari: '11.1',
  },
  'es.regexp.sticky': {
    chrome: '49',
    edge: '13',
    firefox: '3',
    hermes: '0.3',
    rhino: '1.7.15',
    safari: '10.0',
  },
  'es.regexp.test': {
    chrome: '51',
    firefox: '46',
    safari: '10.0',
  },
  'es.regexp.to-string': {
    chrome: '50',
    firefox: '46',
    hermes: '0.1',
    rhino: '1.7.15',
    safari: '10.0',
  },
  // TODO: Remove this module from `core-js@4` since it's replaced to module below
  'es.set': null,
  'es.set.constructor': {
    chrome: '51',
    edge: '15',
    firefox: '53',
    hermes: '0.13',
    'react-native': '0.73',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'es.set.difference.v2': {
    // Bun 1.2.4 has a bug when `this` is updated while Set.prototype.difference is being executed
    // https://bugs.webkit.org/show_bug.cgi?id=288595
    bun: '1.2.5', // '1.1.1',
    // v8 ~ Chrome 122 does not properly work with set-like objects
    // https://bugs.chromium.org/p/v8/issues/detail?id=14559
    // v8 < Chrome 128 does not properly convert set-like objects Infinity size
    // https://issues.chromium.org/issues/351332634
    chrome: '128', // '122',
    firefox: '127',
    // https://github.com/nodejs/node/pull/54883
    node: '22.10',
    // safari 17 does not properly work with set-like objects
    // https://bugs.webkit.org/show_bug.cgi?id=267494
    // A WebKit bug occurs when `this` is updated while Set.prototype.difference is being executed
    // https://bugs.webkit.org/show_bug.cgi?id=288595
    safari: '26.0', // '18.0', // '17.0',
  },
  'es.set.intersection.v2': {
    bun: '1.1.1',
    // v8 ~ Chrome 122 does not properly work with set-like objects
    // https://bugs.chromium.org/p/v8/issues/detail?id=14559
    // v8 < Chrome 128 does not properly convert set-like objects Infinity size
    // https://issues.chromium.org/issues/351332634
    chrome: '128', // '122',
    firefox: '127',
    // https://github.com/nodejs/node/pull/54883
    node: '22.10',
    // safari 17 does not properly work with set-like objects
    // https://bugs.webkit.org/show_bug.cgi?id=267494
    safari: '18.0', // '17.0',
  },
  'es.set.is-disjoint-from.v2': {
    bun: '1.1.1',
    // v8 ~ Chrome 122 does not properly work with set-like objects
    // https://bugs.chromium.org/p/v8/issues/detail?id=14559
    // v8 < Chrome 128 does not properly convert set-like objects Infinity size
    // https://issues.chromium.org/issues/351332634
    chrome: '128', // '122',
    firefox: '127',
    // https://github.com/nodejs/node/pull/54883
    node: '22.10',
    // safari 17 does not properly work with set-like objects
    // https://bugs.webkit.org/show_bug.cgi?id=267494
    safari: '18.0', // '17.0',
  },
  'es.set.is-subset-of.v2': {
    bun: '1.1.1',
    // v8 ~ Chrome 122 does not properly work with set-like objects
    // https://bugs.chromium.org/p/v8/issues/detail?id=14559
    // v8 < Chrome 128 does not properly convert set-like objects Infinity size
    // https://issues.chromium.org/issues/351332634
    chrome: '128', // '122',
    firefox: '127',
    // https://github.com/nodejs/node/pull/54883
    node: '22.10',
    // safari 17 does not properly work with set-like objects
    // https://bugs.webkit.org/show_bug.cgi?id=267494
    safari: '18.0', // '17.0',
  },
  'es.set.is-superset-of.v2': {
    bun: '1.1.1',
    // v8 ~ Chrome 122 does not properly work with set-like objects
    // https://bugs.chromium.org/p/v8/issues/detail?id=14559
    // v8 < Chrome 128 does not properly convert set-like objects Infinity size
    // https://issues.chromium.org/issues/351332634
    chrome: '128', // '122',
    firefox: '127',
    // https://github.com/nodejs/node/pull/54883
    node: '22.10',
    // safari 17 does not properly work with set-like objects
    // https://bugs.webkit.org/show_bug.cgi?id=267494
    safari: '18.0', // '17.0',
  },
  'es.set.symmetric-difference.v2': {
    // Should get iterator record of a set-like object before cloning this
    // https://bugs.webkit.org/show_bug.cgi?id=289430
    bun: '1.2.5', // '1.1.1',
    // v8 ~ Chrome 122 does not properly work with set-like objects
    // https://bugs.chromium.org/p/v8/issues/detail?id=14559
    chrome: '123',
    firefox: '127',
    // safari 17 does not properly work with set-like objects
    // https://bugs.webkit.org/show_bug.cgi?id=267494
    // Should get iterator record of a set-like object before cloning this
    // https://bugs.webkit.org/show_bug.cgi?id=289430
    safari: '26.0', // '18.0', // '17.0',
  },
  'es.set.union.v2': {
    // Should get iterator record of a set-like object before cloning this
    // https://bugs.webkit.org/show_bug.cgi?id=289430
    bun: '1.2.5', // '1.1.1',
    // v8 ~ Chrome 122 does not properly work with set-like objects
    // https://bugs.chromium.org/p/v8/issues/detail?id=14559
    chrome: '123',
    firefox: '127',
    // safari 17 does not properly work with set-like objects
    // https://bugs.webkit.org/show_bug.cgi?id=267494
    // Should get iterator record of a set-like object before cloning this
    // https://bugs.webkit.org/show_bug.cgi?id=289430
    safari: '26.0', // '18.0', // '17.0',
  },
  'es.string.at-alternative': {
    chrome: '92',
    firefox: '90',
    hermes: '0.13',
    'react-native': '0.71',
    // rhino 1.8.0 tests shows as not supported
    // rhino: '1.7.15',
    safari: '15.4',
  },
  'es.string.code-point-at': {
    chrome: '41',
    edge: '13',
    firefox: '29',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.string.ends-with': {
    chrome: '51',
    firefox: '40',
    hermes: '0.1',
    rhino: '1.7.15',
    safari: '10.0',
  },
  'es.string.from-code-point': {
    chrome: '41',
    edge: '13',
    firefox: '29',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.string.includes': {
    chrome: '51',
    firefox: '40',
    hermes: '0.1',
    rhino: '1.7.15',
    safari: '10.0',
  },
  'es.string.is-well-formed': {
    bun: '0.4.0',
    chrome: '111',
    firefox: '119',
    rhino: '1.8.0',
    safari: '16.4',
  },
  'es.string.iterator': {
    chrome: '41',
    edge: '13',
    firefox: '36',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.string.match': {
    chrome: '51',
    firefox: '49',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.string.match-all': {
    // Early implementations does not throw an error on non-global regex
    chrome: '80',   // '73',
    firefox: '73',  // '67',
    hermes: '0.6',
    rhino: '1.8.0',
    safari: '13.1', // '13',
  },
  'es.string.pad-end': {
    chrome: '57',
    edge: '15',
    firefox: '48',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '11.0',
  },
  'es.string.pad-start': {
    chrome: '57',
    edge: '15',
    firefox: '48',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '11.0',
  },
  'es.string.raw': {
    chrome: '41',
    edge: '13',
    firefox: '34',
    hermes: '0.1',
    rhino: '1.7.14',
    safari: '9.0',
  },
  'es.string.repeat': {
    chrome: '41',
    edge: '13',
    firefox: '24',
    hermes: '0.1',
    rhino: '1.7.13',
    safari: '9.0',
  },
  'es.string.replace': {
    chrome: '64',
    firefox: '78',
    hermes: '0.13',
    'react-native': '0.71',
    safari: '14.0',
  },
  'es.string.replace-all': {
    chrome: '85',
    firefox: '77',
    hermes: '0.7',
    rhino: '1.7.15',
    safari: '13.1',
  },
  'es.string.search': {
    chrome: '51',
    firefox: '49',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.string.split': {
    chrome: '54',
    firefox: '49',
    safari: '10.0',
  },
  'es.string.starts-with': {
    chrome: '51',
    firefox: '40',
    hermes: '0.1',
    rhino: '1.7.15',
    safari: '10.0',
  },
  'es.string.substr': {
    chrome: '1',
    firefox: '1',
    hermes: '0.1',
    ie: '9',
    opera: '4',
    rhino: '1.7.13',
    safari: '1',
  },
  'es.string.to-well-formed': {
    // Safari ToString conversion bug
    // https://bugs.webkit.org/show_bug.cgi?id=251757
    bun: '0.5.7', // '0.4.0',
    chrome: '111',
    firefox: '119',
    rhino: '1.8.0',
    safari: '16.4',
  },
  'es.string.trim': {
    chrome: '59',
    edge: '15',
    firefox: '52',
    hermes: '0.1',
    rhino: '1.8.0',
    safari: '12.1',
  },
  'es.string.trim-end': {
    chrome: '66',
    firefox: '61',
    hermes: '0.3',
    safari: '12.1',
  },
  'es.string.trim-left': {
    chrome: '66',
    firefox: '61',
    hermes: '0.3',
    safari: '12.0',
  },
  'es.string.trim-right': {
    chrome: '66',
    firefox: '61',
    hermes: '0.3',
    safari: '12.1',
  },
  'es.string.trim-start': {
    chrome: '66',
    firefox: '61',
    hermes: '0.3',
    safari: '12.0',
  },
  'es.string.anchor': {
    chrome: '5',
    edge: '12',
    firefox: '17',
    rhino: '1.7.14',
    safari: '6.0',
  },
  'es.string.big': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '3.1',
  },
  'es.string.blink': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '3.1',
  },
  'es.string.bold': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '3.1',
  },
  'es.string.fixed': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '3.1',
  },
  'es.string.fontcolor': {
    chrome: '5',
    edge: '12',
    firefox: '17',
    rhino: '1.7.14',
    safari: '6.0',
  },
  'es.string.fontsize': {
    chrome: '5',
    edge: '12',
    firefox: '17',
    rhino: '1.7.14',
    safari: '6.0',
  },
  'es.string.italics': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '3.1',
  },
  'es.string.link': {
    chrome: '5',
    edge: '12',
    firefox: '17',
    rhino: '1.7.14',
    safari: '6.0',
  },
  'es.string.small': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '3.1',
  },
  'es.string.strike': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '3.1',
  },
  'es.string.sub': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '3.1',
  },
  'es.string.sup': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    rhino: '1.7.13',
    safari: '3.1',
  },
  'es.typed-array.float32-array': {
    chrome: '54',
    edge: '15',
    firefox: '55',
    safari: '14.0',
  },
  'es.typed-array.float64-array': {
    chrome: '54',
    edge: '15',
    firefox: '55',
    safari: '14.0',
  },
  'es.typed-array.int8-array': {
    chrome: '54',
    edge: '15',
    firefox: '55',
    safari: '14.0',
  },
  'es.typed-array.int16-array': {
    chrome: '54',
    edge: '15',
    firefox: '55',
    safari: '14.0',
  },
  'es.typed-array.int32-array': {
    chrome: '54',
    edge: '15',
    firefox: '55',
    safari: '14.0',
  },
  'es.typed-array.uint8-array': {
    chrome: '54',
    edge: '15',
    firefox: '55',
    safari: '14.0',
  },
  'es.typed-array.uint8-clamped-array': {
    chrome: '54',
    edge: '15',
    firefox: '55',
    safari: '14.0',
  },
  'es.typed-array.uint16-array': {
    chrome: '54',
    edge: '15',
    firefox: '55',
    safari: '14.0',
  },
  'es.typed-array.uint32-array': {
    chrome: '54',
    edge: '15',
    firefox: '55',
    safari: '14.0',
  },
  'es.typed-array.at': {
    chrome: '92',
    firefox: '90',
    hermes: '0.13',
    'react-native': '0.71',
    rhino: '1.7.15',
    safari: '15.4',
  },
  'es.typed-array.copy-within': {
    chrome: '45',
    edge: '13',
    firefox: '34',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.every': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.fill': {
    chrome: '58',
    firefox: '55',
    hermes: '0.1',
    safari: '14.1',
  },
  'es.typed-array.filter': {
    chrome: '45',
    edge: '13',
    firefox: '38',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.find': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.find-index': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.find-last': {
    chrome: '97',
    firefox: '104',
    hermes: '0.11',
    rhino: '1.8.0',
    safari: '15.4',
  },
  'es.typed-array.find-last-index': {
    chrome: '97',
    firefox: '104',
    hermes: '0.11',
    rhino: '1.8.0',
    safari: '15.4',
  },
  'es.typed-array.for-each': {
    chrome: '45',
    edge: '13',
    firefox: '38',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.from': {
    chrome: '54',
    edge: '15',
    firefox: '55',
    safari: '14.0',
  },
  'es.typed-array.includes': {
    chrome: '49',
    edge: '14',
    firefox: '43',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.index-of': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.iterator': {
    chrome: '51',
    edge: '13',
    firefox: '37',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.join': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.last-index-of': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.map': {
    chrome: '45',
    edge: '13',
    firefox: '38',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.of': {
    chrome: '54',
    edge: '15',
    firefox: '55',
    safari: '14.0',
  },
  'es.typed-array.reduce': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.reduce-right': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.reverse': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.set': {
    chrome: '95',   // '26',
    // edge: '13',  // proper in Chakra Edge 13, but buggy in Chromium < 95
    firefox: '54',  // '15',
    hermes: '0.1',
    safari: '14.1', // '7.1',
  },
  'es.typed-array.slice': {
    chrome: '45',
    edge: '13',
    firefox: '38',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.some': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.sort': {
    chrome: '74',
    firefox: '67',
    hermes: '0.10',
    // 10.0 - 14.0 accept incorrect arguments
    safari: '14.1',
  },
  'es.typed-array.subarray': {
    chrome: '26',
    edge: '13',
    firefox: '15',
    hermes: '0.1',
    safari: '7.1',
  },
  'es.typed-array.to-locale-string': {
    chrome: '45',
    firefox: '51',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.to-reversed': {
    chrome: '110',
    deno: '1.27',
    firefox: '115',
    rhino: '1.8.0',
    safari: '16.0',
  },
  'es.typed-array.to-sorted': {
    chrome: '110',
    deno: '1.27',
    firefox: '115',
    rhino: '1.8.0',
    safari: '16.0',
  },
  'es.typed-array.to-string': {
    chrome: '51',
    edge: '13',
    firefox: '51',
    hermes: '0.1',
    safari: '10.0',
  },
  'es.typed-array.with': {
    // It should truncate a negative fractional index to zero, but instead throws an error
    bun: '1.2.18', // '0.1.9',
    chrome: '110',
    deno: '1.27',
    firefox: '115',
    rhino: '1.8.0',
    // It should truncate a negative fractional index to zero, but instead throws an error
    safari: '26.0', // '16.4',
  },
  'es.uint8-array.from-base64': {
    // safari 18.2-26.1 bug: it doesn't throw an error on incorrect length of base64 string
    bun: '1.2.20', // '1.1.22',
    chrome: '140',
    firefox: '133',
    // safari 18.2-26.1 bug: it doesn't throw an error on incorrect length of base64 string
    safari: '26.2', // '18.2',
  },
  'es.uint8-array.from-hex': {
    bun: '1.1.22',
    chrome: '140',
    firefox: '133',
    safari: '18.2',
  },
  'es.uint8-array.set-from-base64': {
    // safari 18.2-26.1 bug: it doesn't throw an error on incorrect length of base64 string
    bun: '1.2.20', // '1.1.22',
    chrome: '140',
    firefox: '133',
    // safari 18.2-26.1 bug: it doesn't throw an error on incorrect length of base64 string
    safari: '26.2', // '18.2',
  },
  'es.uint8-array.set-from-hex': {
    bun: '1.1.22',
    chrome: '140',
    firefox: '133',
    safari: '18.2',
  },
  'es.uint8-array.to-base64': {
    bun: '1.1.22',
    chrome: '140',
    firefox: '133',
    safari: '18.2',
  },
  'es.uint8-array.to-hex': {
    bun: '1.1.22',
    chrome: '140',
    firefox: '133',
    safari: '18.2',
  },
  'es.unescape': {
    chrome: '1',
    firefox: '1',
    hermes: '0.1',
    ie: '3',
    opera: '3',
    rhino: '1.7.13',
    safari: '1',
  },
  // TODO: Remove this module from `core-js@4` since it's replaced to module below
  'es.weak-map': null,
  'es.weak-map.constructor': {
    chrome: '51',
    // adding frozen arrays to WeakMap unfreeze them
    // edge: '15',
    firefox: '53',
    hermes: '0.13',
    'react-native': '0.73',
    rhino: '1.7.13',
    safari: '10.0',
  },
  // TODO: Remove this module from `core-js@4` since it's replaced to module below
  'es.weak-set': null,
  'es.weak-set.constructor': {
    chrome: '51',
    edge: '15',
    firefox: '53',
    hermes: '0.13',
    'react-native': '0.73',
    rhino: '1.7.13',
    safari: '10.0',
  },
  // TODO: Remove from `core-js@4`
  'esnext.aggregate-error': null,
  // TODO: Remove from `core-js@4`
  'esnext.suppressed-error.constructor': null,
  // TODO: Remove from `core-js@4`
  'esnext.array.from-async': null,
  // TODO: Remove from `core-js@4`
  'esnext.array.at': null,
  // TODO: Remove from `core-js@4`
  'esnext.array.filter-out': {
  },
  'esnext.array.filter-reject': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.array.find-last': null,
  // TODO: Remove from `core-js@4`
  'esnext.array.find-last-index': null,
  'esnext.array.group': {
    // disabled from Bun 0.6.2
    // bun: '0.1.9',
    // https://github.com/tc39/proposal-array-grouping/issues/44#issuecomment-1306311107
    // chrome: '108',
    // safari: '16.4',
  },
  // TODO: Remove from `core-js@4`
  'esnext.array.group-by': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.array.group-by-to-map': {
  },
  'esnext.array.group-to-map': {
    // disabled from Bun 0.6.2
    // bun: '0.1.9',
    // https://github.com/tc39/proposal-array-grouping/issues/44#issuecomment-1306311107
    // chrome: '108',
    // safari: '16.4',
  },
  'esnext.array.is-template-object': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.array.last-index': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.array.last-item': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.array.to-reversed': null,
  // TODO: Remove from `core-js@4`
  'esnext.array.to-sorted': null,
  // TODO: Remove from `core-js@4`
  'esnext.array.to-spliced': null,
  'esnext.array.unique-by': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.array.with': null,
  // TODO: Remove from `core-js@4`
  'esnext.array-buffer.detached': null,
  // TODO: Remove from `core-js@4`
  'esnext.array-buffer.transfer': null,
  // TODO: Remove from `core-js@4`
  'esnext.array-buffer.transfer-to-fixed-length': null,
  // TODO: Remove from `core-js@4`
  'esnext.async-disposable-stack.constructor': null,
  'esnext.async-iterator.constructor': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.async-iterator.as-indexed-pairs': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.async-iterator.async-dispose': null,
  'esnext.async-iterator.drop': {
  },
  'esnext.async-iterator.every': {
  },
  'esnext.async-iterator.filter': {
  },
  'esnext.async-iterator.find': {
  },
  'esnext.async-iterator.flat-map': {
  },
  'esnext.async-iterator.for-each': {
  },
  'esnext.async-iterator.from': {
  },
  'esnext.async-iterator.indexed': {
  },
  'esnext.async-iterator.map': {
  },
  'esnext.async-iterator.reduce': {
  },
  'esnext.async-iterator.some': {
  },
  'esnext.async-iterator.take': {
  },
  'esnext.async-iterator.to-array': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.bigint.range': {
  },
  'esnext.composite-key': {
  },
  'esnext.composite-symbol': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.data-view.get-float16': null,
  'esnext.data-view.get-uint8-clamped': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.data-view.set-float16': null,
  'esnext.data-view.set-uint8-clamped': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.disposable-stack.constructor': null,
  // TODO: Remove from `core-js@4`
  'esnext.error.is-error': null,
  'esnext.function.demethodize': {
  },
  'esnext.function.is-callable': {
  },
  'esnext.function.is-constructor': {
  },
  'esnext.function.metadata': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.function.un-this': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.global-this': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.constructor': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.as-indexed-pairs': {
  },
  'esnext.iterator.chunks': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.iterator.concat': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.dispose': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.drop': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.every': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.filter': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.find': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.flat-map': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.for-each': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.from': null,
  'esnext.iterator.indexed': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.iterator.map': null,
  'esnext.iterator.range': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.iterator.reduce': null,
  'esnext.iterator.sliding': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.iterator.some': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.take': null,
  // TODO: Remove from `core-js@4`
  'esnext.iterator.to-array': null,
  'esnext.iterator.to-async': {
  },
  'esnext.iterator.windows': {
  },
  'esnext.iterator.zip': {
    firefox: '148',
  },
  'esnext.iterator.zip-keyed': {
    firefox: '148',
  },
  // TODO: Remove from `core-js@4`
  'esnext.json.is-raw-json': null,
  // TODO: Remove from `core-js@4`
  'esnext.json.parse': null,
  // TODO: Remove from `core-js@4`
  'esnext.json.raw-json': null,
  'esnext.map.delete-all': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.map.emplace': {
  },
  'esnext.map.every': {
  },
  'esnext.map.filter': {
  },
  'esnext.map.find': {
  },
  'esnext.map.find-key': {
  },
  'esnext.map.from': {
  },
  'esnext.map.get-or-insert': {
    bun: '1.2.20',
    chrome: '145',
    firefox: '144',
    safari: '26.2',
  },
  'esnext.map.get-or-insert-computed': {
    bun: '1.2.20',
    chrome: '145',
    firefox: '144',
    safari: '26.2',
  },
  // TODO: Remove from `core-js@4`
  'esnext.map.group-by': null,
  'esnext.map.includes': {
  },
  'esnext.map.key-by': {
  },
  'esnext.map.key-of': {
  },
  'esnext.map.map-keys': {
  },
  'esnext.map.map-values': {
  },
  'esnext.map.merge': {
  },
  'esnext.map.of': {
  },
  'esnext.map.reduce': {
  },
  'esnext.map.some': {
  },
  'esnext.map.update': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.map.update-or-insert': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.map.upsert': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.math.clamp': {
  },
  'esnext.math.deg-per-rad': {
  },
  'esnext.math.degrees': {
  },
  'esnext.math.fscale': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.math.f16round': null,
  // TODO: Remove from `core-js@4`
  'esnext.math.iaddh': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.math.imulh': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.math.isubh': {
  },
  'esnext.math.rad-per-deg': {
  },
  'esnext.math.radians': {
  },
  'esnext.math.scale': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.math.seeded-prng': {
  },
  'esnext.math.signbit': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.math.sum-precise': null,
  // TODO: Remove from `core-js@4`
  'esnext.math.umulh': {
  },
  'esnext.number.clamp': {
  },
  'esnext.number.from-string': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.number.range': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.object.has-own': null,
  // TODO: Remove from `core-js@4`
  'esnext.object.iterate-entries': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.object.iterate-keys': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.object.iterate-values': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.object.group-by': null,
  // TODO: Remove this module from `core-js@4` since it's split to modules listed below
  'esnext.observable': {
  },
  'esnext.observable.constructor': {
  },
  'esnext.observable.from': {
  },
  'esnext.observable.of': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.promise.all-settled': null,
  // TODO: Remove from `core-js@4`
  'esnext.promise.any': null,
  // TODO: Remove from `core-js@4`
  'esnext.promise.try': null,
  // TODO: Remove from `core-js@4`
  'esnext.promise.with-resolvers': null,
  // TODO: Remove from `core-js@4`
  'esnext.reflect.define-metadata': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.reflect.delete-metadata': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.reflect.get-metadata': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.reflect.get-metadata-keys': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.reflect.get-own-metadata': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.reflect.get-own-metadata-keys': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.reflect.has-metadata': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.reflect.has-own-metadata': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.reflect.metadata': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.regexp.escape': null,
  'esnext.set.add-all': {
  },
  'esnext.set.delete-all': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.set.difference.v2': null,
  // TODO: Remove from `core-js@4`
  'esnext.set.difference': {
  },
  'esnext.set.every': {
  },
  'esnext.set.filter': {
  },
  'esnext.set.find': {
  },
  'esnext.set.from': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.set.intersection.v2': null,
  // TODO: Remove from `core-js@4`
  'esnext.set.intersection': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.set.is-disjoint-from.v2': null,
  // TODO: Remove from `core-js@4`
  'esnext.set.is-disjoint-from': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.set.is-subset-of.v2': null,
  // TODO: Remove from `core-js@4`
  'esnext.set.is-subset-of': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.set.is-superset-of.v2': null,
  // TODO: Remove from `core-js@4`
  'esnext.set.is-superset-of': {
  },
  'esnext.set.join': {
  },
  'esnext.set.map': {
  },
  'esnext.set.of': {
  },
  'esnext.set.reduce': {
  },
  'esnext.set.some': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.set.symmetric-difference.v2': null,
  // TODO: Remove from `core-js@4`
  'esnext.set.symmetric-difference': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.set.union.v2': null,
  // TODO: Remove from `core-js@4`
  'esnext.set.union': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.string.at': {
  },
  'esnext.string.cooked': {
  },
  'esnext.string.code-points': {
  },
  'esnext.string.dedent': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.string.is-well-formed': null,
  // TODO: Remove from `core-js@4`
  'esnext.string.match-all': null,
  // TODO: Remove from `core-js@4`
  'esnext.string.replace-all': null,
  // TODO: Remove from `core-js@4`
  'esnext.string.to-well-formed': null,
  // TODO: Remove from `core-js@4`
  'esnext.symbol.async-dispose': null,
  'esnext.symbol.custom-matcher': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.symbol.dispose': null,
  'esnext.symbol.is-registered-symbol': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.symbol.is-registered': {
  },
  // We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
  'esnext.symbol.is-well-known-symbol': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.symbol.is-well-known': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.symbol.matcher': {
  },
  'esnext.symbol.metadata': {
    deno: '1.40.4',
  },
  // TODO: Remove from `core-js@4`
  'esnext.symbol.metadata-key': {
  },
  'esnext.symbol.observable': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.symbol.pattern-match': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.symbol.replace-all': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.typed-array.from-async': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.typed-array.at': null,
  // TODO: Remove from `core-js@4`
  'esnext.typed-array.filter-out': {
  },
  'esnext.typed-array.filter-reject': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.typed-array.find-last': null,
  // TODO: Remove from `core-js@4`
  'esnext.typed-array.find-last-index': null,
  // TODO: Remove from `core-js@4`
  'esnext.typed-array.group-by': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.typed-array.to-reversed': null,
  // TODO: Remove from `core-js@4`
  'esnext.typed-array.to-sorted': null,
  // TODO: Remove from `core-js@4`
  'esnext.typed-array.to-spliced': {
  },
  'esnext.typed-array.unique-by': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.typed-array.with': null,
  // TODO: Remove from `core-js@4`
  'esnext.uint8-array.from-base64': null,
  // TODO: Remove from `core-js@4`
  'esnext.uint8-array.from-hex': null,
  // TODO: Remove from `core-js@4`
  'esnext.uint8-array.set-from-base64': null,
  // TODO: Remove from `core-js@4`
  'esnext.uint8-array.set-from-hex': null,
  // TODO: Remove from `core-js@4`
  'esnext.uint8-array.to-base64': null,
  // TODO: Remove from `core-js@4`
  'esnext.uint8-array.to-hex': null,
  'esnext.weak-map.delete-all': {
  },
  'esnext.weak-map.from': {
  },
  'esnext.weak-map.of': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.weak-map.emplace': {
  },
  'esnext.weak-map.get-or-insert': {
    bun: '1.2.20',
    chrome: '145',
    firefox: '144',
    safari: '26.2',
  },
  'esnext.weak-map.get-or-insert-computed': {
    bun: '1.2.20',
    chrome: '145',
    firefox: '144',
    safari: '26.2',
  },
  // TODO: Remove from `core-js@4`
  'esnext.weak-map.upsert': {
  },
  'esnext.weak-set.add-all': {
  },
  'esnext.weak-set.delete-all': {
  },
  'esnext.weak-set.from': {
  },
  'esnext.weak-set.of': {
  },
  'web.atob': {
    bun: '0.1.1',
    chrome: '34',
    deno: '1.0',
    // older have wrong arity
    edge: '16', // '13',
    firefox: '27',
    hermes: '0.13',
    // https://github.com/nodejs/node/issues/41450
    // https://github.com/nodejs/node/issues/42530
    // https://github.com/nodejs/node/issues/42646
    node: '18.0', // '17.9', '17.5', '16.0',
    opera: '10.5',
    'react-native': '0.74',
    safari: '10.1',
  },
  'web.btoa': {
    bun: '0.1.1',
    chrome: '4',
    deno: '1.0',
    // older have wrong arity
    edge: '16', // ie: '10',
    // FF26- does not properly convert argument to string
    firefox: '27',
    // https://github.com/nodejs/node/issues/41450
    node: '17.5', // '16.0',
    opera: '10.5',
    safari: '3.0',
  },
  'web.clear-immediate': {
    bun: '0.1.7',
    deno: '2.4',
    ie: '10',
    node: '0.9.1',
  },
  'web.dom-collections.for-each': {
    bun: '0.1.1',
    chrome: '58',
    deno: '1.0',
    edge: '16',
    firefox: '50',
    hermes: '0.1',
    node: '0.0.1',
    rhino: '1.7.13',
    safari: '10.0',
  },
  'web.dom-collections.iterator': {
    bun: '0.1.1',
    chrome: '66',
    deno: '1.0',
    firefox: '60',
    hermes: '0.1',
    node: '0.0.1',
    rhino: '1.7.13',
    safari: '13.1',
  },
  'web.dom-exception.constructor': {
    bun: '0.1.1',
    chrome: '46',
    deno: '1.7',
    firefox: '37',
    node: '17.0',
    safari: '11.1',
  },
  'web.dom-exception.stack': {
    deno: '1.15',
    firefox: '37',
    node: '17.0',
  },
  'web.dom-exception.to-string-tag': {
    bun: '0.1.1',
    chrome: '49',
    deno: '1.7',
    firefox: '51',
    node: '17.0',
    safari: '11.1',
  },
  // TODO: Remove this module from `core-js@4` since it's split to submodules
  'web.immediate': {
    // https://github.com/oven-sh/bun/issues/1633
    bun: '0.4.0', // '0.1.7',
    deno: '2.4',
    ie: '10',
    node: '0.9.1',
  },
  'web.queue-microtask': {
    // wrong arity in Bun ~ 1.0.30, https://github.com/oven-sh/bun/issues/9249
    // bun: '0.1.1',
    chrome: '71',
    deno: '1.0',
    firefox: '69',
    // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
    node: '12.0', // '11.0',
    safari: '12.1',
  },
  'web.self': {
    bun: '1.0.22',
    chrome: '86',
    // https://github.com/denoland/deno/issues/15765
    // broken in Deno 1.45.3 again:
    // https://github.com/denoland/deno/issues/24683
    deno: '1.46.0', // '1.29.3',
    // fails in early Chrome-based Edge
    // edge: '12',
    firefox: '31',
    safari: '10',
  },
  'web.set-immediate': {
    // https://github.com/oven-sh/bun/issues/1633
    bun: '0.4.0', // '0.1.7',
    deno: '2.4',
    ie: '10',
    node: '0.9.1',
  },
  'web.set-interval': {
    android: '1.5',
    // https://github.com/oven-sh/bun/issues/1633
    bun: '0.4.0', // '0.1.1',
    chrome: '1',
    deno: '1.0',
    firefox: '1',
    hermes: '0.1',
    ie: '10',
    node: '0.0.1',
    opera: '7',
    rhino: '1.7.13',
    safari: '1.0',
  },
  'web.set-timeout': {
    android: '1.5',
    // https://github.com/oven-sh/bun/issues/1633
    bun: '0.4.0', // '0.1.1',
    chrome: '1',
    deno: '1.0',
    firefox: '1',
    hermes: '0.1',
    ie: '10',
    node: '0.0.1',
    opera: '7',
    rhino: '1.7.13',
    safari: '1.0',
  },
  'web.structured-clone': {
    // https://github.com/whatwg/html/pull/5749
    // deno: '1.14',
    // current FF implementation can't clone errors
    // firefox: '94',
    // node: '17.0',
  },
  // TODO: Remove this module from `core-js@4` since it's split to submodules
  'web.timers': {
    android: '1.5',
    // https://github.com/oven-sh/bun/issues/1633
    bun: '0.4.0', // '0.1.1',
    chrome: '1',
    deno: '1.0',
    firefox: '1',
    hermes: '0.1',
    ie: '10',
    node: '0.0.1',
    opera: '7',
    rhino: '1.7.13',
    safari: '1.0',
  },
  // TODO: Remove this module from `core-js@4` since it's replaced to module below
  'web.url': null,
  'web.url.constructor': {
    bun: '0.1.1',
    chrome: '67',
    deno: '1.0',
    firefox: '57',
    node: '10.0',
    safari: '14.0',
  },
  'web.url.can-parse': {
    // Bun < 1.1.0 bug
    // https://github.com/oven-sh/bun/issues/9250
    bun: '1.1.0', // '1.0.2',
    chrome: '120',
    deno: '1.33.2',
    firefox: '115',
    node: '20.1',
    safari: '17.0',
  },
  'web.url.parse': {
    bun: '1.1.4',
    chrome: '126',
    deno: '1.43',
    firefox: '126',
    node: '22.1',
    safari: '18.0',
  },
  'web.url.to-json': {
    bun: '0.1.1',
    chrome: '71',
    deno: '1.0',
    firefox: '57',
    node: '10.0',
    safari: '14.0',
  },
  // TODO: Remove this module from `core-js@4` since it's replaced to module below
  'web.url-search-params': null,
  'web.url-search-params.constructor': {
    bun: '0.1.1',
    chrome: '67',
    deno: '1.0',
    firefox: '57',
    node: '10.0',
    safari: '14.0',
  },
  'web.url-search-params.delete': {
    bun: '1.0.31',
    chrome: '118',
    deno: '1.35',
    firefox: '115',
    node: '20.2',
    safari: '17.0',
  },
  'web.url-search-params.has': {
    bun: '1.0.31',
    chrome: '118',
    deno: '1.35',
    firefox: '115',
    node: '20.2',
    safari: '17.0',
  },
  'web.url-search-params.size': {
    bun: '1.0.2',
    chrome: '113',
    deno: '1.32',
    firefox: '112',
    node: '19.8',
    safari: '17.0',
  },
};

export const renamed = new Map([
  // TODO: Clean in `core-js@4`
  ['es.aggregate-error', 'es.aggregate-error.constructor'],
  ['es.data-view', 'es.data-view.constructor'],
  ['es.map', 'es.map.constructor'],
  ['es.set', 'es.set.constructor'],
  ['es.weak-map', 'es.weak-map.constructor'],
  ['es.weak-set', 'es.weak-set.constructor'],
  ['esnext.aggregate-error', 'es.aggregate-error'],
  ['esnext.array.at', 'es.array.at'],
  ['esnext.array.find-last', 'es.array.find-last'],
  ['esnext.array.find-last-index', 'es.array.find-last-index'],
  ['esnext.array.from-async', 'es.array.from-async'],
  ['esnext.array.to-reversed', 'es.array.to-reversed'],
  ['esnext.array.to-sorted', 'es.array.to-sorted'],
  ['esnext.array.to-spliced', 'es.array.to-spliced'],
  ['esnext.array.with', 'es.array.with'],
  ['esnext.array-buffer.detached', 'es.array-buffer.detached'],
  ['esnext.array-buffer.transfer', 'es.array-buffer.transfer'],
  ['esnext.array-buffer.transfer-to-fixed-length', 'es.array-buffer.transfer-to-fixed-length'],
  ['esnext.async-disposable-stack.constructor', 'es.async-disposable-stack.constructor'],
  ['esnext.async-iterator.async-dispose', 'es.async-iterator.async-dispose'],
  ['esnext.data-view.get-float16', 'es.data-view.get-float16'],
  ['esnext.data-view.set-float16', 'es.data-view.set-float16'],
  ['esnext.disposable-stack.constructor', 'es.disposable-stack.constructor'],
  ['esnext.error.is-error', 'es.error.is-error'],
  ['esnext.global-this', 'es.global-this'],
  ['esnext.iterator.constructor', 'es.iterator.constructor'],
  ['esnext.iterator.concat', 'es.iterator.concat'],
  ['esnext.iterator.dispose', 'es.iterator.dispose'],
  ['esnext.iterator.drop', 'es.iterator.drop'],
  ['esnext.iterator.every', 'es.iterator.every'],
  ['esnext.iterator.filter', 'es.iterator.filter'],
  ['esnext.iterator.find', 'es.iterator.find'],
  ['esnext.iterator.flat-map', 'es.iterator.flat-map'],
  ['esnext.iterator.for-each', 'es.iterator.for-each'],
  ['esnext.iterator.from', 'es.iterator.from'],
  ['esnext.iterator.map', 'es.iterator.map'],
  ['esnext.iterator.reduce', 'es.iterator.reduce'],
  ['esnext.iterator.some', 'es.iterator.some'],
  ['esnext.iterator.take', 'es.iterator.take'],
  ['esnext.iterator.to-array', 'es.iterator.to-array'],
  ['esnext.json.is-raw-json', 'es.json.is-raw-json'],
  ['esnext.json.parse', 'es.json.parse'],
  ['esnext.json.raw-json', 'es.json.raw-json'],
  ['esnext.map.group-by', 'es.map.group-by'],
  ['esnext.math.f16round', 'es.math.f16round'],
  ['esnext.math.sum-precise', 'es.math.sum-precise'],
  ['esnext.object.has-own', 'es.object.has-own'],
  ['esnext.object.group-by', 'es.object.group-by'],
  ['esnext.promise.all-settled', 'es.promise.all-settled'],
  ['esnext.promise.any', 'es.promise.any'],
  ['esnext.promise.try', 'es.promise.try'],
  ['esnext.promise.with-resolvers', 'es.promise.with-resolvers'],
  ['esnext.regexp.escape', 'es.regexp.escape'],
  ['esnext.set.difference.v2', 'es.set.difference.v2'],
  ['esnext.set.intersection.v2', 'es.set.intersection.v2'],
  ['esnext.set.is-disjoint-from.v2', 'es.set.is-disjoint-from.v2'],
  ['esnext.set.is-subset-of.v2', 'es.set.is-subset-of.v2'],
  ['esnext.set.is-superset-of.v2', 'es.set.is-superset-of.v2'],
  ['esnext.set.symmetric-difference.v2', 'es.set.symmetric-difference.v2'],
  ['esnext.set.union.v2', 'es.set.union.v2'],
  ['esnext.string.is-well-formed', 'es.string.is-well-formed'],
  ['esnext.string.match-all', 'es.string.match-all'],
  ['esnext.string.replace-all', 'es.string.replace-all'],
  ['esnext.string.to-well-formed', 'es.string.to-well-formed'],
  ['esnext.suppressed-error.constructor', 'es.suppressed-error.constructor'],
  ['esnext.typed-array.at', 'es.typed-array.at'],
  ['esnext.symbol.async-dispose', 'es.symbol.async-dispose'],
  ['esnext.symbol.dispose', 'es.symbol.dispose'],
  ['esnext.typed-array.find-last', 'es.typed-array.find-last'],
  ['esnext.typed-array.find-last-index', 'es.typed-array.find-last-index'],
  ['esnext.typed-array.to-reversed', 'es.typed-array.to-reversed'],
  ['esnext.typed-array.to-sorted', 'es.typed-array.to-sorted'],
  ['esnext.typed-array.with', 'es.typed-array.with'],
  ['esnext.uint8-array.from-base64', 'es.uint8-array.from-base64'],
  ['esnext.uint8-array.from-hex', 'es.uint8-array.from-hex'],
  ['esnext.uint8-array.set-from-base64', 'es.uint8-array.set-from-base64'],
  ['esnext.uint8-array.set-from-hex', 'es.uint8-array.set-from-hex'],
  ['esnext.uint8-array.to-base64', 'es.uint8-array.to-base64'],
  ['esnext.uint8-array.to-hex', 'es.uint8-array.to-hex'],
  ['web.url', 'web.url.constructor'],
  ['web.url-search-params', 'web.url-search-params.constructor'],
]);

for (const [old, nw] of renamed) data[old] = data[nw];

export const dataWithIgnored = { ...data };

export const ignored = [
  // TODO: Clean in `core-js@4`
  'es.aggregate-error.constructor',
  'es.data-view.constructor',
  'es.map.constructor',
  'es.set.constructor',
  'es.string.trim-left',
  'es.string.trim-right',
  'es.symbol.constructor',
  'es.symbol.for',
  'es.symbol.key-for',
  'es.object.get-own-property-symbols',
  'es.promise.constructor',
  'es.promise.all',
  'es.promise.catch',
  'es.promise.race',
  'es.promise.reject',
  'es.promise.resolve',
  'es.weak-map.constructor',
  'es.weak-set.constructor',
  'esnext.observable.constructor',
  'esnext.observable.from',
  'esnext.observable.of',
  'web.clear-immediate',
  'web.set-immediate',
  'web.set-interval',
  'web.set-timeout',
  'web.url.constructor',
  'web.url-search-params.constructor',
];

for (const ignore of ignored) delete data[ignore];

export const modules = Object.keys(data);
