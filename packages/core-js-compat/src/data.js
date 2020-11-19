'use strict';
const data = {
  'es.symbol': {
    chrome: '49',
    edge: '15',
    firefox: '51',
    safari: '10.0',
  },
  'es.symbol.description': {
    chrome: '70',
    firefox: '63',
    safari: '12.1',
  },
  'es.symbol.async-iterator': {
    chrome: '63',
    firefox: '55',
    safari: '12.0',
  },
  'es.symbol.has-instance': {
    chrome: '50',
    edge: '15',
    firefox: '49',
    safari: '10.0',
  },
  'es.symbol.is-concat-spreadable': {
    chrome: '48',
    edge: '15',
    firefox: '48',
    safari: '10.0',
  },
  'es.symbol.iterator': {
    chrome: '41',
    edge: '13',
    firefox: '36',
    safari: '9.0',
  },
  'es.symbol.match': {
    chrome: '50',
    firefox: '40',
    safari: '10.0',
  },
  'es.symbol.match-all': {
    chrome: '73',
    firefox: '67',
    safari: '13',
  },
  'es.symbol.replace': {
    chrome: '50',
    firefox: '49',
    safari: '10.0',
  },
  'es.symbol.search': {
    chrome: '50',
    firefox: '49',
    safari: '10.0',
  },
  'es.symbol.species': {
    chrome: '51',
    edge: '13',
    firefox: '41',
    safari: '10.0',
  },
  'es.symbol.split': {
    chrome: '50',
    firefox: '49',
    safari: '10.0',
  },
  'es.symbol.to-primitive': {
    chrome: '47',
    edge: '15',
    firefox: '44',
    safari: '10.0',
  },
  'es.symbol.to-string-tag': {
    chrome: '49',
    edge: '15',
    firefox: '51',
    safari: '10.0',
  },
  'es.symbol.unscopables': {
    chrome: '41',
    edge: '13',
    firefox: '48',
    safari: '9.0',
  },
  'es.aggregate-error': {
    chrome: '85',
    firefox: '79',
    safari: '14.0',
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
    safari: '9.0',
  },
  'es.array.every': {
    chrome: '26',
    firefox: '4',
    ie: '9',
    safari: '8.0',
  },
  'es.array.fill': {
    chrome: '45',
    edge: '12',
    firefox: '48',
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
    safari: '9.0',
  },
  'es.array.find-index': {
    chrome: '45',
    edge: '13',
    firefox: '48',
    safari: '9.0',
  },
  'es.array.flat': {
    chrome: '69',
    firefox: '62',
    safari: '12.0',
  },
  'es.array.flat-map': {
    chrome: '69',
    firefox: '62',
    safari: '12.0',
  },
  'es.array.for-each': {
    chrome: '26',
    firefox: '4',
    ie: '9',
    safari: '8.0',
  },
  'es.array.from': {
    chrome: '51',
    edge: '15',
    firefox: '53',
    safari: '9.0',
  },
  'es.array.includes': {
    chrome: '53',
    edge: '14',
    firefox: '48',
    safari: '10.0',
  },
  'es.array.index-of': {
    chrome: '51',
    firefox: '4',
    ie: '9',
    safari: '8.0',
  },
  'es.array.is-array': {
    chrome: '5',
    firefox: '4',
    ie: '9',
    opera: '10.50',
    safari: '4.0',
  },
  'es.array.iterator': {
    chrome: '66',
    edge: '15',
    firefox: '60',
    safari: '10.0',
  },
  'es.array.join': {
    chrome: '26',
    edge: '13',
    firefox: '4',
    safari: '7.1',
  },
  'es.array.last-index-of': {
    chrome: '51',
    firefox: '4',
    ie: '9',
    safari: '8.0',
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
    safari: '9.0',
  },
  'es.array.reduce': {
    chrome: '83', // https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
    firefox: '4',
    ie: '9',
    node: '6.0', // ^^^
    safari: '8.0',
  },
  'es.array.reduce-right': {
    chrome: '83', // https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
    firefox: '4',
    ie: '9',
    node: '6.0', // ^^^
    safari: '8.0',
  },
  'es.array.reverse': {
    chrome: '1',
    firefox: '1',
    ie: '5.5',
    opera: '10.50',
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
    ie: '9',
    safari: '8.0',
  },
  'es.array.sort': {
    chrome: '63',
    firefox: '4',
    ie: '9',
    safari: '12.0',
  },
  'es.array.species': {
    chrome: '51',
    edge: '13',
    firefox: '48',
    safari: '10.0',
  },
  'es.array.splice': {
    chrome: '51',
    edge: '13',
    firefox: '49',
    safari: '10.0',
  },
  'es.array.unscopables.flat': {
    chrome: '73',
    firefox: '67',
    safari: '13',
  },
  'es.array.unscopables.flat-map': {
    chrome: '73',
    firefox: '67',
    safari: '13',
  },
  'es.array-buffer.constructor': {
    chrome: '26',
    edge: '14',
    firefox: '44',
    safari: '12.0',
  },
  'es.array-buffer.is-view': {
    chrome: '32',
    firefox: '29',
    ie: '11',
    safari: '7.1',
  },
  'es.array-buffer.slice': {
    chrome: '31',
    firefox: '46',
    ie: '11',
    safari: '12.1',
  },
  'es.data-view': {
    chrome: '26',
    firefox: '15',
    ie: '10',
    safari: '7.1',
  },
  'es.date.now': {
    chrome: '5',
    firefox: '2',
    ie: '9',
    opera: '10.50',
    safari: '4.0',
  },
  'es.date.to-iso-string': {
    chrome: '26',
    firefox: '7',
    ie: '9',
    safari: '7.1',
  },
  'es.date.to-json': {
    chrome: '26',
    firefox: '4',
    ie: '9',
    safari: '10.0',
  },
  'es.date.to-primitive': {
    chrome: '47',
    edge: '15',
    firefox: '44',
    safari: '10.0',
  },
  'es.date.to-string': {
    chrome: '5',
    firefox: '2',
    ie: '9',
    opera: '10.50',
    safari: '3.1',
  },
  'es.function.bind': {
    chrome: '7',
    firefox: '4',
    ie: '9',
    opera: '12',
    safari: '5.1',
  },
  'es.function.has-instance': {
    chrome: '51',
    edge: '15',
    firefox: '50',
    safari: '10.0',
  },
  'es.function.name': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    safari: '4.0',
  },
  'es.global-this': {
    chrome: '71',
    firefox: '65',
    safari: '12.1',
  },
  'es.json.stringify': {
    chrome: '72',
    firefox: '64',
    safari: '12.1',
  },
  'es.json.to-string-tag': {
    chrome: '50',
    edge: '15',
    firefox: '51',
    safari: '10.0',
  },
  'es.map': {
    chrome: '51',
    edge: '15',
    firefox: '53',
    safari: '10.0',
  },
  'es.math.acosh': {
    chrome: '54',
    edge: '13',
    firefox: '25',
    safari: '7.1',
  },
  'es.math.asinh': {
    chrome: '38',
    edge: '13',
    firefox: '25',
    safari: '7.1',
  },
  'es.math.atanh': {
    chrome: '38',
    edge: '13',
    firefox: '25',
    safari: '7.1',
  },
  'es.math.cbrt': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    safari: '7.1',
  },
  'es.math.clz32': {
    chrome: '38',
    edge: '12',
    firefox: '31',
    safari: '9.0',
  },
  'es.math.cosh': {
    chrome: '39',
    edge: '13',
    firefox: '25',
    safari: '7.1',
  },
  'es.math.expm1': {
    chrome: '39',
    edge: '13',
    firefox: '46',
    safari: '7.1',
  },
  'es.math.fround': {
    chrome: '38',
    edge: '12',
    firefox: '26',
    safari: '7.1',
  },
  'es.math.hypot': {
    // https://bugs.chromium.org/p/v8/issues/detail?id=9546
    chrome: '78', // '38',
    edge: '12',
    firefox: '27',
    safari: '7.1',
  },
  'es.math.imul': {
    chrome: '28',
    edge: '13',
    firefox: '20',
    safari: '9.0',
  },
  'es.math.log10': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    safari: '7.1',
  },
  'es.math.log1p': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    safari: '7.1',
  },
  'es.math.log2': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    safari: '7.1',
  },
  'es.math.sign': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    safari: '9.0',
  },
  'es.math.sinh': {
    chrome: '39',
    edge: '13',
    firefox: '25',
    safari: '7.1',
  },
  'es.math.tanh': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    safari: '7.1',
  },
  'es.math.to-string-tag': {
    chrome: '50',
    edge: '15',
    firefox: '51',
    safari: '10.0',
  },
  'es.math.trunc': {
    chrome: '38',
    edge: '12',
    firefox: '25',
    safari: '7.1',
  },
  'es.number.constructor': {
    chrome: '41',
    edge: '13',
    firefox: '46',
    safari: '9.0',
  },
  'es.number.epsilon': {
    chrome: '34',
    edge: '12',
    firefox: '25',
    safari: '9.0',
  },
  'es.number.is-finite': {
    android: '4.1',
    chrome: '19',
    edge: '12',
    firefox: '16',
    safari: '9.0',
  },
  'es.number.is-integer': {
    chrome: '34',
    edge: '12',
    firefox: '16',
    safari: '9.0',
  },
  'es.number.is-nan': {
    android: '4.1',
    chrome: '19',
    edge: '12',
    firefox: '15',
    safari: '9.0',
  },
  'es.number.is-safe-integer': {
    chrome: '34',
    edge: '12',
    firefox: '32',
    safari: '9.0',
  },
  'es.number.max-safe-integer': {
    chrome: '34',
    edge: '12',
    firefox: '31',
    safari: '9.0',
  },
  'es.number.min-safe-integer': {
    chrome: '34',
    edge: '12',
    firefox: '31',
    safari: '9.0',
  },
  'es.number.parse-float': {
    chrome: '35',
    edge: '13',
    firefox: '39',
    safari: '11.0',
  },
  'es.number.parse-int': {
    chrome: '35',
    edge: '13',
    firefox: '39',
    safari: '9.0',
  },
  'es.number.to-fixed': {
    chrome: '26',
    firefox: '4',
    safari: '7.1',
  },
  'es.number.to-precision': {
    chrome: '26',
    firefox: '4',
    ie: '8',
    safari: '7.1',
  },
  'es.object.assign': {
    chrome: '49',
    // order of operations bug
    // edge: '13',
    firefox: '36',
    safari: '9.0',
  },
  'es.object.create': {
    chrome: '5',
    firefox: '4',
    ie: '9',
    opera: '12',
    safari: '4.0',
  },
  'es.object.define-getter': {
    chrome: '62',
    edge: '16',
    firefox: '48',
    safari: '7.1',
  },
  'es.object.define-properties': {
    chrome: '5',
    firefox: '4',
    ie: '9',
    opera: '12',
    safari: '5.1',
  },
  'es.object.define-property': {
    chrome: '5',
    firefox: '4',
    ie: '9',
    opera: '12',
    safari: '5.1',
  },
  'es.object.define-setter': {
    chrome: '62',
    edge: '16',
    firefox: '48',
    safari: '7.1',
  },
  'es.object.entries': {
    chrome: '54',
    edge: '14',
    firefox: '47',
    safari: '10.1',
  },
  'es.object.freeze': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    safari: '9.0',
  },
  'es.object.from-entries': {
    chrome: '73',
    firefox: '63',
    safari: '12.1',
  },
  'es.object.get-own-property-descriptor': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    safari: '9.0',
  },
  'es.object.get-own-property-descriptors': {
    chrome: '54',
    edge: '15',
    firefox: '50',
    safari: '10.0',
  },
  'es.object.get-own-property-names': {
    chrome: '40',
    edge: '13',
    firefox: '34',
    safari: '9.0',
  },
  'es.object.get-prototype-of': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    safari: '9.0',
  },
  'es.object.is': {
    android: '4.1',
    chrome: '19',
    edge: '12',
    firefox: '22',
    safari: '9.0',
  },
  'es.object.is-extensible': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    safari: '9.0',
  },
  'es.object.is-frozen': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    safari: '9.0',
  },
  'es.object.is-sealed': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    safari: '9.0',
  },
  'es.object.keys': {
    chrome: '40',
    edge: '13',
    firefox: '35',
    safari: '9.0',
  },
  'es.object.lookup-getter': {
    chrome: '62',
    edge: '16',
    firefox: '48',
    safari: '7.1',
  },
  'es.object.lookup-setter': {
    chrome: '62',
    edge: '16',
    firefox: '48',
    safari: '7.1',
  },
  'es.object.prevent-extensions': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    safari: '9.0',
  },
  'es.object.seal': {
    chrome: '44',
    edge: '13',
    firefox: '35',
    safari: '9.0',
  },
  'es.object.set-prototype-of': {
    chrome: '34',
    firefox: '31',
    ie: '11',
    safari: '9.0',
  },
  'es.object.to-string': {
    chrome: '49',
    edge: '15',
    firefox: '51',
    safari: '10.0',
  },
  'es.object.values': {
    chrome: '54',
    edge: '14',
    firefox: '47',
    safari: '10.1',
  },
  'es.parse-float': {
    chrome: '35',
    firefox: '8',
    ie: '8',
    safari: '7.1',
  },
  'es.parse-int': {
    chrome: '35',
    firefox: '21',
    ie: '9',
    safari: '7.1',
  },
  'es.promise': {
    // V8 6.6 has a serious bug
    chrome: '67', // '51',
    firefox: '69',
    safari: '11.0',
  },
  'es.promise.all-settled': {
    chrome: '76',
    firefox: '71',
    safari: '13',
  },
  'es.promise.any': {
    chrome: '85',
    firefox: '79',
    safari: '14.0',
  },
  'es.promise.finally': {
    // V8 6.6 has a serious bug
    chrome: '67', // '63',
    firefox: '69',
    // Previous versions are non-generic
    // https://bugs.webkit.org/show_bug.cgi?id=200788
    ios: '13.2.3', // need to clarify the patch release, >13.0.0 && <= 13.2.3
    safari: '13.0.3', // need to clarify the patch release, >13.0.0 && <= 13.0.3
  },
  'es.reflect.apply': {
    chrome: '49',
    edge: '15',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.construct': {
    chrome: '49',
    edge: '15',
    firefox: '44',
    safari: '10.0',
  },
  'es.reflect.define-property': {
    chrome: '49',
    edge: '13',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.delete-property': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.get': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.get-own-property-descriptor': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.get-prototype-of': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.has': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.is-extensible': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.own-keys': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.prevent-extensions': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.set': {
    // MS Edge 17-18 Reflect.set allows setting the property to object
    // with non-writable property on the prototype
    // edge: '12',
    chrome: '49',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.set-prototype-of': {
    chrome: '49',
    edge: '12',
    firefox: '42',
    safari: '10.0',
  },
  'es.reflect.to-string-tag': {
    chrome: '86',
    firefox: '82',
    safari: '14.0',
  },
  'es.regexp.constructor': {
    chrome: '51',
    firefox: '49',
    safari: '10.0',
  },
  'es.regexp.exec': {
    chrome: '26',
    edge: '13',
    firefox: '44',
    safari: '10.0',
  },
  'es.regexp.flags': {
    chrome: '49',
    firefox: '37',
    safari: '9.0',
  },
  'es.regexp.sticky': {
    chrome: '49',
    edge: '13',
    firefox: '3',
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
    safari: '10.0',
  },
  'es.set': {
    chrome: '51',
    edge: '15',
    firefox: '53',
    safari: '10.0',
  },
  'es.string.code-point-at': {
    chrome: '41',
    edge: '13',
    firefox: '29',
    safari: '9.0',
  },
  'es.string.ends-with': {
    chrome: '51',
    firefox: '40',
    safari: '10.0',
  },
  'es.string.from-code-point': {
    chrome: '41',
    edge: '13',
    firefox: '29',
    safari: '9.0',
  },
  'es.string.includes': {
    chrome: '51',
    firefox: '40',
    safari: '10.0',
  },
  'es.string.iterator': {
    chrome: '41',
    edge: '13',
    firefox: '36',
    safari: '9.0',
  },
  'es.string.match': {
    chrome: '51',
    firefox: '49',
    safari: '10.0',
  },
  'es.string.match-all': {
    // Early implementations does not throw an error on non-global regex
    chrome: '80', // 73
    firefox: '73', // 67
    safari: '13.1', // 13
  },
  'es.string.pad-end': {
    chrome: '57',
    edge: '15',
    firefox: '48',
    safari: '11.0',
  },
  'es.string.pad-start': {
    chrome: '57',
    edge: '15',
    firefox: '48',
    safari: '11.0',
  },
  'es.string.raw': {
    chrome: '41',
    edge: '13',
    firefox: '34',
    safari: '9.0',
  },
  'es.string.repeat': {
    chrome: '41',
    edge: '13',
    firefox: '24',
    safari: '9.0',
  },
  'es.string.replace': {
    chrome: '64',
    firefox: '78',
    safari: '14.0',
  },
  'es.string.replace-all': {
    chrome: '85',
    firefox: '77',
    safari: '13.1',
  },
  'es.string.search': {
    chrome: '51',
    firefox: '49',
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
    safari: '10.0',
  },
  'es.string.trim': {
    chrome: '59',
    edge: '15',
    firefox: '52',
    safari: '12.1',
  },
  'es.string.trim-end': {
    chrome: '66',
    firefox: '61',
    safari: '12.1',
  },
  'es.string.trim-start': {
    chrome: '66',
    firefox: '61',
    safari: '12.0',
  },
  'es.string.anchor': {
    chrome: '5',
    edge: '12',
    firefox: '17',
    safari: '6.0',
  },
  'es.string.big': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    safari: '3.1',
  },
  'es.string.blink': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    safari: '3.1',
  },
  'es.string.bold': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    safari: '3.1',
  },
  'es.string.fixed': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    safari: '3.1',
  },
  'es.string.fontcolor': {
    chrome: '5',
    edge: '12',
    firefox: '17',
    safari: '6.0',
  },
  'es.string.fontsize': {
    chrome: '5',
    edge: '12',
    firefox: '17',
    safari: '6.0',
  },
  'es.string.italics': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    safari: '3.1',
  },
  'es.string.link': {
    chrome: '5',
    edge: '12',
    firefox: '17',
    safari: '6.0',
  },
  'es.string.small': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    safari: '3.1',
  },
  'es.string.strike': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    safari: '3.1',
  },
  'es.string.sub': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
    safari: '3.1',
  },
  'es.string.sup': {
    chrome: '5',
    edge: '12',
    firefox: '2',
    opera: '10.50',
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
  'es.typed-array.copy-within': {
    chrome: '45',
    edge: '13',
    firefox: '34',
    safari: '10.0',
  },
  'es.typed-array.every': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    safari: '10.0',
  },
  'es.typed-array.fill': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    safari: '10.0',
  },
  'es.typed-array.filter': {
    chrome: '45',
    edge: '13',
    firefox: '38',
    safari: '10.0',
  },
  'es.typed-array.find': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    safari: '10.0',
  },
  'es.typed-array.find-index': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    safari: '10.0',
  },
  'es.typed-array.for-each': {
    chrome: '45',
    edge: '13',
    firefox: '38',
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
    safari: '10.0',
  },
  'es.typed-array.index-of': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    safari: '10.0',
  },
  'es.typed-array.iterator': {
    chrome: '47',
    edge: '13',
    firefox: '37',
    safari: '10.0',
  },
  'es.typed-array.join': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    safari: '10.0',
  },
  'es.typed-array.last-index-of': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    safari: '10.0',
  },
  'es.typed-array.map': {
    chrome: '45',
    edge: '13',
    firefox: '38',
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
    safari: '10.0',
  },
  'es.typed-array.reduce-right': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    safari: '10.0',
  },
  'es.typed-array.reverse': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    safari: '10.0',
  },
  'es.typed-array.set': {
    chrome: '26',
    edge: '13',
    firefox: '15',
    safari: '7.1',
  },
  'es.typed-array.slice': {
    chrome: '45',
    edge: '13',
    firefox: '38',
    safari: '10.0',
  },
  'es.typed-array.some': {
    chrome: '45',
    edge: '13',
    firefox: '37',
    safari: '10.0',
  },
  'es.typed-array.sort': {
    chrome: '45',
    edge: '13',
    firefox: '46',
    safari: '10.0',
  },
  'es.typed-array.subarray': {
    chrome: '26',
    edge: '13',
    firefox: '15',
    safari: '7.1',
  },
  'es.typed-array.to-locale-string': {
    chrome: '45',
    firefox: '51',
    safari: '10.0',
  },
  'es.typed-array.to-string': {
    chrome: '51',
    edge: '13',
    firefox: '51',
    safari: '10.0',
  },
  'es.weak-map': {
    chrome: '51',
    edge: '15',
    firefox: '53',
    safari: '10.0',
  },
  'es.weak-set': {
    chrome: '51',
    edge: '15',
    firefox: '53',
    safari: '10.0',
  },
  'esnext.array.at': {
  },
  'esnext.array.filter-out': {
  },
  'esnext.array.find-last': {
  },
  'esnext.array.find-last-index': {
  },
  'esnext.array.is-template-object': {
  },
  'esnext.array.last-index': {
  },
  'esnext.array.last-item': {
  },
  'esnext.array.unique-by': {
  },
  'esnext.async-iterator.constructor': {
  },
  'esnext.async-iterator.as-indexed-pairs': {
  },
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
  'esnext.bigint.range': {
  },
  'esnext.composite-key': {
  },
  'esnext.composite-symbol': {
  },
  'esnext.iterator.constructor': {
  },
  'esnext.iterator.as-indexed-pairs': {
  },
  'esnext.iterator.drop': {
  },
  'esnext.iterator.every': {
  },
  'esnext.iterator.filter': {
  },
  'esnext.iterator.find': {
  },
  'esnext.iterator.flat-map': {
  },
  'esnext.iterator.for-each': {
  },
  'esnext.iterator.from': {
  },
  'esnext.iterator.map': {
  },
  'esnext.iterator.reduce': {
  },
  'esnext.iterator.some': {
  },
  'esnext.iterator.take': {
  },
  'esnext.iterator.to-array': {
  },
  'esnext.map.delete-all': {
  },
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
  'esnext.map.group-by': {
  },
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
  'esnext.math.clamp': {
  },
  'esnext.math.deg-per-rad': {
  },
  'esnext.math.degrees': {
  },
  'esnext.math.fscale': {
  },
  'esnext.math.rad-per-deg': {
  },
  'esnext.math.radians': {
  },
  'esnext.math.scale': {
  },
  'esnext.math.seeded-prng': {
  },
  'esnext.math.signbit': {
  },
  'esnext.number.from-string': {
  },
  'esnext.number.range': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.object.iterate-entries': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.object.iterate-keys': {
  },
  // TODO: Remove from `core-js@4`
  'esnext.object.iterate-values': {
  },
  'esnext.observable': {
  },
  'esnext.promise.try': {
  },
  'esnext.reflect.define-metadata': {
  },
  'esnext.reflect.delete-metadata': {
  },
  'esnext.reflect.get-metadata': {
  },
  'esnext.reflect.get-metadata-keys': {
  },
  'esnext.reflect.get-own-metadata': {
  },
  'esnext.reflect.get-own-metadata-keys': {
  },
  'esnext.reflect.has-metadata': {
  },
  'esnext.reflect.has-own-metadata': {
  },
  'esnext.reflect.metadata': {
  },
  'esnext.set.add-all': {
  },
  'esnext.set.delete-all': {
  },
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
  'esnext.set.intersection': {
  },
  'esnext.set.is-disjoint-from': {
  },
  'esnext.set.is-subset-of': {
  },
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
  'esnext.set.symmetric-difference': {
  },
  'esnext.set.union': {
  },
  'esnext.string.at': {
  },
  'esnext.string.code-points': {
  },
  'esnext.symbol.async-dispose': {
  },
  'esnext.symbol.dispose': {
  },
  'esnext.symbol.observable': {
  },
  'esnext.symbol.pattern-match': {
  },
  'esnext.typed-array.at': {
  },
  'esnext.typed-array.filter-out': {
  },
  'esnext.typed-array.find-last': {
  },
  'esnext.typed-array.find-last-index': {
  },
  'esnext.typed-array.unique-by': {
  },
  'esnext.weak-map.delete-all': {
  },
  'esnext.weak-map.from': {
  },
  'esnext.weak-map.of': {
  },
  'esnext.weak-map.emplace': {
  },
  'esnext.weak-set.add-all': {
  },
  'esnext.weak-set.delete-all': {
  },
  'esnext.weak-set.from': {
  },
  'esnext.weak-set.of': {
  },
  'web.dom-collections.for-each': {
    chrome: '58',
    edge: '16',
    firefox: '50',
    node: '0.0.1',
    safari: '10.0',
  },
  'web.dom-collections.iterator': {
    chrome: '66',
    firefox: '60',
    node: '0.0.1',
    safari: '13.1',
  },
  'web.immediate': {
    ie: '10',
    node: '0.9.1',
  },
  'web.queue-microtask': {
    chrome: '71',
    firefox: '69',
    // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
    node: '12.0', // '11.0',
    safari: '12.1',
  },
  'web.timers': {
    android: '1.5',
    chrome: '1',
    firefox: '1',
    ie: '10',
    node: '0.0.1',
    opera: '7',
    safari: '1.0',
  },
  'web.url': {
    chrome: '67',
    firefox: '57',
    node: '10.0',
  },
  'web.url.to-json': {
    chrome: '71',
    firefox: '57',
    node: '10.0',
  },
  'web.url-search-params': {
    chrome: '67',
    firefox: '57',
    node: '10.0',
  },
};

module.exports = data;
