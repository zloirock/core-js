import { $prototype, $virtual, $static, $namespace, $helper, $justImport } from './templates.mjs';

export const features = {
  'array/index': {
    modules: [/^(?:es|esnext)\.array\./],
    template: $namespace({ namespace: 'Array' }),
  },
  'array/at': {
    modules: ['es.array.at'],
    template: $prototype({ namespace: 'Array', method: 'at' }),
  },
  'array/virtual/at': {
    modules: ['es.array.at'],
    template: $virtual({ namespace: 'Array', method: 'at' }),
  },
  'array/concat': {
    modules: ['es.array.concat'],
    template: $prototype({ namespace: 'Array', method: 'concat' }),
  },
  'array/virtual/concat': {
    modules: ['es.array.concat'],
    template: $virtual({ namespace: 'Array', method: 'concat' }),
  },
  'array/copy-within': {
    modules: ['es.array.copy-within'],
    template: $prototype({ namespace: 'Array', method: 'copyWithin' }),
  },
  'array/virtual/copy-within': {
    modules: ['es.array.copy-within'],
    template: $virtual({ namespace: 'Array', method: 'copyWithin' }),
  },
  'array/entries': {
    modules: ['es.array.iterator'],
    template: $prototype({ namespace: 'Array', method: 'entries' }),
  },
  'array/virtual/entries': {
    modules: ['es.array.iterator'],
    template: $virtual({ namespace: 'Array', method: 'entries' }),
  },
  'array/every': {
    modules: ['es.array.every'],
    template: $prototype({ namespace: 'Array', method: 'every' }),
  },
  'array/virtual/every': {
    modules: ['es.array.every'],
    template: $virtual({ namespace: 'Array', method: 'every' }),
  },
  'array/fill': {
    modules: ['es.array.fill'],
    template: $prototype({ namespace: 'Array', method: 'fill' }),
  },
  'array/virtual/fill': {
    modules: ['es.array.fill'],
    template: $virtual({ namespace: 'Array', method: 'fill' }),
  },
  'array/filter': {
    modules: ['es.array.filter'],
    template: $prototype({ namespace: 'Array', method: 'filter' }),
  },
  'array/virtual/filter': {
    modules: ['es.array.filter'],
    template: $virtual({ namespace: 'Array', method: 'filter' }),
  },
  'array/filter-reject': {
    modules: ['esnext.array.filter-reject'],
    template: $prototype({ namespace: 'Array', method: 'filterReject' }),
  },
  'array/virtual/filter-reject': {
    modules: ['esnext.array.filter-reject'],
    template: $virtual({ namespace: 'Array', method: 'filterReject' }),
  },
  'array/find': {
    modules: ['es.array.find'],
    template: $prototype({ namespace: 'Array', method: 'find' }),
  },
  'array/virtual/find': {
    modules: ['es.array.find'],
    template: $virtual({ namespace: 'Array', method: 'find' }),
  },
  'array/find-index': {
    modules: ['es.array.find-index'],
    template: $prototype({ namespace: 'Array', method: 'findIndex' }),
  },
  'array/virtual/find-index': {
    modules: ['es.array.find-index'],
    template: $virtual({ namespace: 'Array', method: 'findIndex' }),
  },
  'array/find-last': {
    modules: ['es.array.find-last'],
    template: $prototype({ namespace: 'Array', method: 'findLast' }),
  },
  'array/virtual/find-last': {
    modules: ['es.array.find-last'],
    template: $virtual({ namespace: 'Array', method: 'findLast' }),
  },
  'array/find-last-index': {
    modules: ['es.array.find-last-index'],
    template: $prototype({ namespace: 'Array', method: 'findLastIndex' }),
  },
  'array/virtual/find-last-index': {
    modules: ['es.array.find-last-index'],
    template: $virtual({ namespace: 'Array', method: 'findLastIndex' }),
  },
  'array/flat': {
    modules: ['es.array.flat', 'es.array.unscopables.flat'],
    template: $prototype({ namespace: 'Array', method: 'flat' }),
  },
  'array/virtual/flat': {
    modules: ['es.array.flat', 'es.array.unscopables.flat'],
    template: $virtual({ namespace: 'Array', method: 'flat' }),
  },
  'array/flat-map': {
    modules: ['es.array.flat-map', 'es.array.unscopables.flat-map'],
    template: $prototype({ namespace: 'Array', method: 'flatMap' }),
  },
  'array/virtual/flat-map': {
    modules: ['es.array.flat-map', 'es.array.unscopables.flat-map'],
    template: $virtual({ namespace: 'Array', method: 'flatMap' }),
  },
  'array/for-each': {
    modules: ['es.array.for-each'],
    template: $prototype({ namespace: 'Array', method: 'forEach' }),
  },
  'array/virtual/for-each': {
    modules: ['es.array.for-each'],
    template: $virtual({ namespace: 'Array', method: 'forEach' }),
  },
  'array/from': {
    modules: ['es.array.from'],
    template: $static({ namespace: 'Array', method: 'from' }),
  },
  'array/from-async': {
    modules: ['esnext.array.from-async'],
    template: $static({ namespace: 'Array', method: 'fromAsync' }),
  },
  'array/includes': {
    modules: ['es.array.includes'],
    template: $prototype({ namespace: 'Array', method: 'includes' }),
  },
  'array/virtual/includes': {
    modules: ['es.array.includes'],
    template: $virtual({ namespace: 'Array', method: 'includes' }),
  },
  'array/index-of': {
    modules: ['es.array.index-of'],
    template: $prototype({ namespace: 'Array', method: 'indexOf' }),
  },
  'array/virtual/index-of': {
    modules: ['es.array.index-of'],
    template: $virtual({ namespace: 'Array', method: 'indexOf' }),
  },
  'array/is-template-object': {
    modules: ['esnext.array.is-template-object'],
    template: $static({ namespace: 'Array', method: 'isTemplateObject' }),
  },
  'array/iterator': {
    modules: ['es.array.iterator'],
    template: $prototype({ namespace: 'Array', method: 'values' }),
  },
  'array/virtual/iterator': {
    modules: ['es.array.iterator'],
    template: $virtual({ namespace: 'Array', method: 'values' }),
  },
  'array/join': {
    modules: ['es.array.join'],
    template: $prototype({ namespace: 'Array', method: 'join' }),
  },
  'array/virtual/join': {
    modules: ['es.array.join'],
    template: $virtual({ namespace: 'Array', method: 'join' }),
  },
  'array/keys': {
    modules: ['es.array.iterator'],
    template: $prototype({ namespace: 'Array', method: 'keys' }),
  },
  'array/virtual/keys': {
    modules: ['es.array.iterator'],
    template: $virtual({ namespace: 'Array', method: 'keys' }),
  },
  'array/last-index-of': {
    modules: ['es.array.last-index-of'],
    template: $prototype({ namespace: 'Array', method: 'lastIndexOf' }),
  },
  'array/virtual/last-index-of': {
    modules: ['es.array.last-index-of'],
    template: $virtual({ namespace: 'Array', method: 'lastIndexOf' }),
  },
  'array/map': {
    modules: ['es.array.map'],
    template: $prototype({ namespace: 'Array', method: 'map' }),
  },
  'array/virtual/map': {
    modules: ['es.array.map'],
    template: $virtual({ namespace: 'Array', method: 'map' }),
  },
  'array/of': {
    modules: ['es.array.of'],
    template: $static({ namespace: 'Array', method: 'of' }),
  },
  'array/push': {
    modules: ['es.array.push'],
    template: $prototype({ namespace: 'Array', method: 'push' }),
  },
  'array/virtual/push': {
    modules: ['es.array.push'],
    template: $virtual({ namespace: 'Array', method: 'push' }),
  },
  'array/reduce': {
    modules: ['es.array.reduce'],
    template: $prototype({ namespace: 'Array', method: 'reduce' }),
  },
  'array/virtual/reduce': {
    modules: ['es.array.reduce'],
    template: $virtual({ namespace: 'Array', method: 'reduce' }),
  },
  'array/reduce-right': {
    modules: ['es.array.reduce-right'],
    template: $prototype({ namespace: 'Array', method: 'reduceRight' }),
  },
  'array/virtual/reduce-right': {
    modules: ['es.array.reduce-right'],
    template: $virtual({ namespace: 'Array', method: 'reduceRight' }),
  },
  'array/reverse': {
    modules: ['es.array.reverse'],
    template: $prototype({ namespace: 'Array', method: 'reverse' }),
  },
  'array/virtual/reverse': {
    modules: ['es.array.reverse'],
    template: $virtual({ namespace: 'Array', method: 'reverse' }),
  },
  'array/slice': {
    modules: ['es.array.slice'],
    template: $prototype({ namespace: 'Array', method: 'slice' }),
  },
  'array/virtual/slice': {
    modules: ['es.array.slice'],
    template: $virtual({ namespace: 'Array', method: 'slice' }),
  },
  'array/some': {
    modules: ['es.array.some'],
    template: $prototype({ namespace: 'Array', method: 'some' }),
  },
  'array/virtual/some': {
    modules: ['es.array.some'],
    template: $virtual({ namespace: 'Array', method: 'some' }),
  },
  'array/sort': {
    modules: ['es.array.sort'],
    template: $prototype({ namespace: 'Array', method: 'sort' }),
  },
  'array/virtual/sort': {
    modules: ['es.array.sort'],
    template: $virtual({ namespace: 'Array', method: 'sort' }),
  },
  'array/splice': {
    modules: ['es.array.splice'],
    template: $prototype({ namespace: 'Array', method: 'splice' }),
  },
  'array/virtual/splice': {
    modules: ['es.array.splice'],
    template: $virtual({ namespace: 'Array', method: 'splice' }),
  },
  'array/to-reversed': {
    modules: ['es.array.to-reversed'],
    template: $prototype({ namespace: 'Array', method: 'toReversed' }),
  },
  'array/virtual/to-reversed': {
    modules: ['es.array.to-reversed'],
    template: $virtual({ namespace: 'Array', method: 'toReversed' }),
  },
  'array/to-sorted': {
    modules: ['es.array.to-sorted'],
    template: $prototype({ namespace: 'Array', method: 'toSorted' }),
  },
  'array/virtual/to-sorted': {
    modules: ['es.array.to-sorted'],
    template: $virtual({ namespace: 'Array', method: 'toSorted' }),
  },
  'array/to-spliced': {
    modules: ['es.array.to-spliced'],
    template: $prototype({ namespace: 'Array', method: 'toSpliced' }),
  },
  'array/virtual/to-spliced': {
    modules: ['es.array.to-spliced'],
    template: $virtual({ namespace: 'Array', method: 'toSpliced' }),
  },
  'array/unshift': {
    modules: ['es.array.unshift'],
    template: $prototype({ namespace: 'Array', method: 'unshift' }),
  },
  'array/virtual/unshift': {
    modules: ['es.array.unshift'],
    template: $virtual({ namespace: 'Array', method: 'unshift' }),
  },
  'array/unique-by': {
    modules: ['esnext.array.unique-by'],
    template: $prototype({ namespace: 'Array', method: 'uniqueBy' }),
  },
  'array/virtual/unique-by': {
    modules: ['esnext.array.unique-by'],
    template: $virtual({ namespace: 'Array', method: 'uniqueBy' }),
  },
  'array/values': {
    modules: ['es.array.iterator'],
    template: $prototype({ namespace: 'Array', method: 'values' }),
  },
  'array/virtual/values': {
    modules: ['es.array.iterator'],
    template: $virtual({ namespace: 'Array', method: 'values' }),
  },
  'array/with': {
    modules: ['es.array.with'],
    template: $prototype({ namespace: 'Array', method: 'with' }),
  },
  'array/virtual/with': {
    modules: ['es.array.with'],
    template: $virtual({ namespace: 'Array', method: 'with' }),
  },
  'function/index': {
    modules: [/^(?:es|esnext)\.function\./],
    template: $namespace({ namespace: 'Function' }),
  },
  'function/demethodize': {
    modules: ['esnext.function.demethodize'],
    template: $prototype({ namespace: 'Function', method: 'demethodize' }),
  },
  'function/virtual/demethodize': {
    modules: ['esnext.function.demethodize'],
    template: $virtual({ namespace: 'Function', method: 'demethodize' }),
  },
  // 'function/has-instance' ???
  'function/is-callable': {
    modules: ['esnext.function.is-callable'],
    template: $static({ namespace: 'Function', method: 'isCallable' }),
  },
  'function/is-constructor': {
    modules: ['esnext.function.is-constructor'],
    template: $static({ namespace: 'Function', method: 'isConstructor' }),
  },
  // 'function/metadata' ???
  'function/name': {
    modules: ['es.function.name'],
    template: $justImport, // <- ???
  },
  'math/index': {
    modules: [/^(?:es|esnext)\.math\./],
    template: $namespace({ namespace: 'Math' }),
  },
  'math/acosh': {
    modules: ['es.math.acosh'],
    template: $static({ namespace: 'Math', method: 'acosh' }),
  },
  'math/asinh': {
    modules: ['es.math.asinh'],
    template: $static({ namespace: 'Math', method: 'asinh' }),
  },
  'math/atanh': {
    modules: ['es.math.atanh'],
    template: $static({ namespace: 'Math', method: 'atanh' }),
  },
  'math/cbrt': {
    modules: ['es.math.cbrt'],
    template: $static({ namespace: 'Math', method: 'cbrt' }),
  },
  'math/clamp': {
    modules: ['esnext.math.clamp'],
    template: $static({ namespace: 'Math', method: 'clamp' }),
  },
  'math/clz32': {
    modules: ['es.math.clz32'],
    template: $static({ namespace: 'Math', method: 'clz32' }),
  },
  'math/cosh': {
    modules: ['es.math.cosh'],
    template: $static({ namespace: 'Math', method: 'cosh' }),
  },
  'math/deg-per-rad': {
    modules: ['esnext.math.deg-per-rad'],
    template: $static({ namespace: 'Math', method: 'DEG_PER_RAD' }),
  },
  'math/degrees': {
    modules: ['esnext.math.degrees'],
    template: $static({ namespace: 'Math', method: 'degrees' }),
  },
  'math/expm1': {
    modules: ['es.math.expm1'],
    template: $static({ namespace: 'Math', method: 'expm1' }),
  },
  'math/fround': {
    modules: ['es.math.fround'],
    template: $static({ namespace: 'Math', method: 'fround' }),
  },
  'math/fscale': {
    modules: ['esnext.math.fscale'],
    template: $static({ namespace: 'Math', method: 'fscale' }),
  },
  'math/f16round': {
    modules: ['esnext.math.f16round'],
    template: $static({ namespace: 'Math', method: 'f16round' }),
  },
  'math/hypot': {
    modules: ['es.math.hypot'],
    template: $static({ namespace: 'Math', method: 'hypot' }),
  },
  'math/imul': {
    modules: ['es.math.imul'],
    template: $static({ namespace: 'Math', method: 'imul' }),
  },
  'math/log10': {
    modules: ['es.math.log10'],
    template: $static({ namespace: 'Math', method: 'log10' }),
  },
  'math/log1p': {
    modules: ['es.math.log1p'],
    template: $static({ namespace: 'Math', method: 'log1p' }),
  },
  'math/log2': {
    modules: ['es.math.log2'],
    template: $static({ namespace: 'Math', method: 'log2' }),
  },
  'math/rad-per-deg': {
    modules: ['esnext.math.rad-per-deg'],
    template: $static({ namespace: 'Math', method: 'RAD_PER_DEG' }),
  },
  'math/radians': {
    modules: ['esnext.math.radians'],
    template: $static({ namespace: 'Math', method: 'radians' }),
  },
  'math/scale': {
    modules: ['esnext.math.scale'],
    template: $static({ namespace: 'Math', method: 'scale' }),
  },
  'math/sign': {
    modules: ['es.math.sign'],
    template: $static({ namespace: 'Math', method: 'sign' }),
  },
  'math/signbit': {
    modules: ['esnext.math.signbit'],
    template: $static({ namespace: 'Math', method: 'signbit' }),
  },
  'math/sinh': {
    modules: ['es.math.sinh'],
    template: $static({ namespace: 'Math', method: 'sinh' }),
  },
  'math/tanh': {
    modules: ['es.math.tanh'],
    template: $static({ namespace: 'Math', method: 'tanh' }),
  },
  // 'math/to-string-tag' ???
  'math/trunc': {
    modules: ['es.math.trunc'],
    template: $static({ namespace: 'Math', method: 'trunc' }),
  },
  'number/index': {
    modules: [/^(?:es|esnext)\.number\./],
    template: $namespace({ namespace: 'Number' }),
  },
  'number/constructor': {
    modules: ['es.number.constructor'],
    template: $namespace({ namespace: 'Number' }),
  },
  'number/epsilon': {
    modules: ['es.number.epsilon'],
    template: $static({ namespace: 'Number', method: 'EPSILON' }),
  },
  'number/from-string': {
    modules: ['esnext.number.from-string'],
    template: $static({ namespace: 'Number', method: 'fromString' }),
  },
  'number/is-finite': {
    modules: ['es.number.is-finite'],
    template: $static({ namespace: 'Number', method: 'isFinite' }),
  },
  'number/is-integer': {
    modules: ['es.number.is-integer'],
    template: $static({ namespace: 'Number', method: 'isInteger' }),
  },
  'number/is-nan': {
    modules: ['es.number.is-nan'],
    template: $static({ namespace: 'Number', method: 'isNaN' }),
  },
  'number/is-safe-integer': {
    modules: ['es.number.is-safe-integer'],
    template: $static({ namespace: 'Number', method: 'isSafeInteger' }),
  },
  'number/max-safe-integer': {
    modules: ['es.number.max-safe-integer'],
    template: $static({ namespace: 'Number', method: 'MAX_SAFE_INTEGER' }),
  },
  'number/min-safe-integer': {
    modules: ['es.number.min-safe-integer'],
    template: $static({ namespace: 'Number', method: 'MIN_SAFE_INTEGER' }),
  },
  'number/parse-float': {
    modules: ['es.number.parse-float'],
    template: $static({ namespace: 'Number', method: 'parseFloat' }),
  },
  'number/parse-int': {
    modules: ['es.number.parse-int'],
    template: $static({ namespace: 'Number', method: 'parseInt' }),
  },
  'number/to-exponential': {
    modules: ['es.number.to-exponential'],
    template: $prototype({ namespace: 'Number', method: 'toExponential' }),
  },
  'number/virtual/to-exponential': {
    modules: ['es.number.to-exponential'],
    template: $virtual({ namespace: 'Number', method: 'toExponential' }),
  },
  'number/to-fixed': {
    modules: ['es.number.to-fixed'],
    template: $prototype({ namespace: 'Number', method: 'toFixed' }),
  },
  'number/virtual/to-fixed': {
    modules: ['es.number.to-fixed'],
    template: $virtual({ namespace: 'Number', method: 'toFixed' }),
  },
  'number/to-precision': {
    modules: ['es.number.to-precision'],
    template: $prototype({ namespace: 'Number', method: 'toPrecision' }),
  },
  'number/virtual/to-precision': {
    modules: ['es.number.to-precision'],
    template: $virtual({ namespace: 'Number', method: 'toPrecision' }),
  },
  'reflect/index': {
    modules: [/^(?:es|esnext)\.reflect\./],
    template: $namespace({ namespace: 'Reflect' }),
  },
  'reflect/apply': {
    modules: ['es.reflect.apply'],
    template: $static({ namespace: 'Reflect', method: 'apply' }),
  },
  'reflect/construct': {
    modules: ['es.reflect.construct'],
    template: $static({ namespace: 'Reflect', method: 'construct' }),
  },
  'reflect/define-property': {
    modules: ['es.reflect.define-property'],
    template: $static({ namespace: 'Reflect', method: 'defineProperty' }),
  },
  'reflect/delete-property': {
    modules: ['es.reflect.delete-property'],
    template: $static({ namespace: 'Reflect', method: 'deleteProperty' }),
  },
  'reflect/get-own-property-descriptor': {
    modules: ['es.reflect.get-own-property-descriptor'],
    template: $static({ namespace: 'Reflect', method: 'getOwnPropertyDescriptor' }),
  },
  'reflect/get-prototype-of': {
    modules: ['es.reflect.get-prototype-of'],
    template: $static({ namespace: 'Reflect', method: 'getPrototypeOf' }),
  },
  'reflect/get': {
    modules: ['es.reflect.get'],
    template: $static({ namespace: 'Reflect', method: 'get' }),
  },
  'reflect/has': {
    modules: ['es.reflect.has'],
    template: $static({ namespace: 'Reflect', method: 'has' }),
  },
  'reflect/is-extensible': {
    modules: ['es.reflect.is-extensible'],
    template: $static({ namespace: 'Reflect', method: 'isExtensible' }),
  },
  'reflect/own-keys': {
    modules: ['es.reflect.own-keys'],
    template: $static({ namespace: 'Reflect', method: 'ownKeys' }),
  },
  'reflect/prevent-extensions': {
    modules: ['es.reflect.prevent-extensions'],
    template: $static({ namespace: 'Reflect', method: 'preventExtensions' }),
  },
  'reflect/set-prototype-of': {
    modules: ['es.reflect.set-prototype-of'],
    template: $static({ namespace: 'Reflect', method: 'setPrototypeOf' }),
  },
  'reflect/set': {
    modules: ['es.reflect.set'],
    template: $static({ namespace: 'Reflect', method: 'set' }),
  },
  // 'reflect/to-string-tag' ???
  'get-iterator': {
    modules: ['es.array.iterator', 'es.string.iterator', 'web.dom-collections.iterator'],
    template: $helper({ name: 'get-iterator' }),
  },
  'get-iterator-method': {
    modules: ['es.array.iterator', 'es.string.iterator', 'web.dom-collections.iterator'],
    template: $helper({ name: 'get-iterator-method' }),
  },
  'is-iterable': {
    modules: ['es.array.iterator', 'es.string.iterator', 'web.dom-collections.iterator'],
    template: $helper({ name: 'is-iterable' }),
  },
};

export const proposals = {
  // https://github.com/tc39/proposal-accessible-object-hasownproperty
  'accessible-object-hasownproperty': {
    stage: 4,
    modules: [
      'es.object.has-own',
    ],
  },
  // https://github.com/tc39/proposal-arraybuffer-transfer
  'array-buffer-transfer': {
    stage: 3,
    modules: [
      'esnext.array-buffer.detached',
      'esnext.array-buffer.transfer',
      'esnext.array-buffer.transfer-to-fixed-length',
    ],
  },
  // https://github.com/tc39/proposal-array-filtering
  'array-filtering': {
    stage: 1,
    modules: [
      'esnext.array.filter-reject',
      'esnext.typed-array.filter-reject',
    ],
  },
  // https://github.com/tc39/proposal-array-find-from-last
  'array-find-from-last': {
    stage: 4,
    modules: [
      'es.array.find-last',
      'es.array.find-last-index',
      'es.typed-array.find-last',
      'es.typed-array.find-last-index',
    ],
  },
  // https://github.com/tc39/proposal-flatMap
  'array-flat-map': {
    stage: 4,
    modules: [
      'es.array.flat',
      'es.array.flat-map',
      'es.array.unscopables.flat',
      'es.array.unscopables.flat-map',
    ],
  },
  // https://github.com/tc39/proposal-array-from-async
  'array-from-async': {
    stage: 3,
    modules: [
      'esnext.array.from-async',
    ],
  },
  // https://github.com/tc39/proposal-array-grouping
  'array-grouping': {
    stage: 3,
    modules: [
      'esnext.map.group-by',
      'esnext.object.group-by',
    ],
  },
  // https://github.com/tc39/proposal-Array.prototype.includes
  'array-includes': {
    stage: 4,
    modules: [
      'es.array.includes',
      'es.typed-array.includes',
    ],
  },
  // https://github.com/tc39/proposal-array-is-template-object
  'array-is-template-object': {
    stage: 2,
    modules: [
      'esnext.array.is-template-object',
    ],
  },
  // https://github.com/tc39/proposal-array-unique
  'array-unique': {
    stage: 1,
    modules: [
      'esnext.array.unique-by',
      'esnext.typed-array.unique-by',
    ],
  },
  // https://github.com/tc39/proposal-async-iteration
  'async-iteration': {
    stage: 4,
    modules: [
      'es.symbol.async-iterator',
    ],
  },
  // https://github.com/tc39/proposal-async-iterator-helpers
  'async-iterator-helpers': {
    stage: 2,
    modules: [
      'esnext.async-iterator.constructor',
      'esnext.async-iterator.drop',
      'esnext.async-iterator.every',
      'esnext.async-iterator.filter',
      'esnext.async-iterator.find',
      'esnext.async-iterator.flat-map',
      'esnext.async-iterator.for-each',
      'esnext.async-iterator.from',
      'esnext.async-iterator.map',
      'esnext.async-iterator.reduce',
      'esnext.async-iterator.some',
      'esnext.async-iterator.take',
      'esnext.async-iterator.to-array',
      'esnext.iterator.to-async',
    ],
  },
  // https://github.com/tc39/proposal-change-array-by-copy
  'change-array-by-copy': {
    stage: 4,
    modules: [
      'es.array.to-reversed',
      'es.array.to-sorted',
      'es.array.to-spliced',
      'es.array.with',
      'es.typed-array.to-reversed',
      'es.typed-array.to-sorted',
      'es.typed-array.with',
    ],
  },
  // https://github.com/tc39/proposal-collection-methods
  'collection-methods': {
    stage: 1,
    modules: [
      'esnext.map.group-by',
      'esnext.map.key-by',
      'esnext.map.delete-all',
      'esnext.map.every',
      'esnext.map.filter',
      'esnext.map.find',
      'esnext.map.find-key',
      'esnext.map.includes',
      'esnext.map.key-of',
      'esnext.map.map-keys',
      'esnext.map.map-values',
      'esnext.map.merge',
      'esnext.map.reduce',
      'esnext.map.some',
      'esnext.map.update',
      'esnext.set.add-all',
      'esnext.set.delete-all',
      'esnext.set.every',
      'esnext.set.filter',
      'esnext.set.find',
      'esnext.set.join',
      'esnext.set.map',
      'esnext.set.reduce',
      'esnext.set.some',
      'esnext.weak-map.delete-all',
      'esnext.weak-set.add-all',
      'esnext.weak-set.delete-all',
    ],
  },
  // https://github.com/tc39/proposal-setmap-offrom
  'collection-of-from': {
    stage: 1,
    modules: [
      'esnext.map.from',
      'esnext.map.of',
      'esnext.set.from',
      'esnext.set.of',
      'esnext.weak-map.from',
      'esnext.weak-map.of',
      'esnext.weak-set.from',
      'esnext.weak-set.of',
    ],
  },
  // https://github.com/tc39/proposal-dataview-get-set-uint8clamped
  'data-view-get-set-uint8-clamped': {
    stage: 1,
    modules: [
      'esnext.data-view.get-uint8-clamped',
      'esnext.data-view.set-uint8-clamped',
    ],
  },
  // https://github.com/tc39/proposal-decorator-metadata
  'decorator-metadata': {
    stage: 3,
    modules: [
      'esnext.function.metadata',
      'esnext.symbol.metadata',
    ],
  },
  // https://github.com/tc39/proposal-error-cause
  'error-cause': {
    stage: 4,
    modules: [
      'es.error.cause',
      'es.aggregate-error.cause',
    ],
  },
  // https://github.com/tc39/proposal-explicit-resource-management
  'explicit-resource-management': {
    stage: 3,
    modules: [
      'esnext.suppressed-error.constructor',
      'esnext.async-disposable-stack.constructor',
      'esnext.async-iterator.async-dispose',
      'esnext.disposable-stack.constructor',
      'esnext.iterator.dispose',
      'esnext.symbol.async-dispose',
      'esnext.symbol.dispose',
    ],
  },
  // https://github.com/tc39/proposal-float16array
  float16: {
    stage: 3,
    modules: [
      'esnext.data-view.get-float16',
      'esnext.data-view.set-float16',
      'esnext.math.f16round',
    ],
  },
  // https://github.com/js-choi/proposal-function-demethodize
  'function-demethodize': {
    stage: 0,
    modules: [
      'esnext.function.demethodize',
    ],
  },
  // https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md
  'function-is-callable-is-constructor': {
    stage: 0,
    modules: [
      'esnext.function.is-callable',
      'esnext.function.is-constructor',
    ],
  },
  // https://github.com/tc39/proposal-global
  'global-this': {
    stage: 4,
    modules: [
      'es.global-this',
    ],
  },
  // https://github.com/tc39/proposal-iterator-helpers
  'iterator-helpers': {
    stage: 3,
    modules: [
      'esnext.iterator.constructor',
      'esnext.iterator.drop',
      'esnext.iterator.every',
      'esnext.iterator.filter',
      'esnext.iterator.find',
      'esnext.iterator.flat-map',
      'esnext.iterator.for-each',
      'esnext.iterator.from',
      'esnext.iterator.map',
      'esnext.iterator.reduce',
      'esnext.iterator.some',
      'esnext.iterator.take',
      'esnext.iterator.to-array',
    ],
  },
  // https://github.com/tc39/proposal-Number.range
  'iterator-range': {
    stage: 2,
    modules: [
      'esnext.iterator.constructor',
      'esnext.iterator.range',
    ],
  },
  // https://github.com/tc39/proposal-json-parse-with-source
  'json-parse-with-source': {
    stage: 3,
    modules: [
      'esnext.json.is-raw-json',
      'esnext.json.parse',
      'esnext.json.raw-json',
    ],
  },
  // https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
  'keys-composition': {
    stage: 1,
    modules: [
      'esnext.composite-key',
      'esnext.composite-symbol',
    ],
  },
  // https://github.com/tc39/proposal-upsert
  'map-emplace': {
    stage: 2,
    modules: [
      'esnext.map.emplace',
      'esnext.weak-map.emplace',
    ],
  },
  // https://github.com/rwaldron/proposal-math-extensions
  'math-extensions': {
    stage: 1,
    modules: [
      'esnext.math.clamp',
      'esnext.math.deg-per-rad',
      'esnext.math.degrees',
      'esnext.math.fscale',
      'esnext.math.rad-per-deg',
      'esnext.math.radians',
      'esnext.math.scale',
    ],
  },
  // https://github.com/tc39/proposal-Math.signbit
  'math-signbit': {
    stage: 1,
    modules: [
      'esnext.math.signbit',
    ],
  },
  // https://github.com/tc39/proposal-number-fromstring
  'number-from-string': {
    stage: 1,
    modules: [
      'esnext.number.from-string',
    ],
  },
  // https://github.com/tc39/proposal-object-from-entries
  'object-from-entries': {
    stage: 4,
    modules: [
      'es.object.from-entries',
    ],
  },
  // https://github.com/tc39/proposal-object-getownpropertydescriptors
  'object-getownpropertydescriptors': {
    stage: 4,
    modules: [
      'es.object.get-own-property-descriptors',
    ],
  },
  // https://github.com/tc39/proposal-object-values-entries
  'object-values-entries': {
    stage: 4,
    modules: [
      'es.object.entries',
      'es.object.values',
    ],
  },
  // https://github.com/tc39/proposal-pattern-matching
  'pattern-matching': {
    stage: 1,
    modules: [
      'esnext.symbol.matcher',
    ],
  },
  // https://github.com/tc39/proposal-promise-allSettled
  'promise-all-settled': {
    stage: 4,
    modules: [
      'es.promise.all-settled',
    ],
  },
  // https://github.com/tc39/proposal-promise-any
  'promise-any': {
    stage: 4,
    modules: [
      'es.aggregate-error.constructor',
      'es.promise.any',
    ],
  },
  // https://github.com/tc39/proposal-promise-finally
  'promise-finally': {
    stage: 4,
    modules: [
      'es.promise.finally',
    ],
  },
  // https://github.com/tc39/proposal-promise-with-resolvers
  'promise-with-resolvers': {
    stage: 3,
    modules: [
      'esnext.promise.with-resolvers',
    ],
  },
  // https://github.com/tc39/proposal-regexp-dotall-flag
  'regexp-dotall-flag': {
    stage: 4,
    modules: [
      'es.regexp.constructor',
      'es.regexp.dot-all',
      'es.regexp.exec',
      'es.regexp.flags',
    ],
  },
  // https://github.com/tc39/proposal-regex-escaping
  'regexp-escaping': {
    stage: 2,
    modules: [
      'esnext.regexp.escape',
    ],
  },
  // https://github.com/tc39/proposal-regexp-named-groups
  'regexp-named-groups': {
    stage: 4,
    modules: [
      'es.regexp.constructor',
      'es.regexp.exec',
      'es.string.replace',
    ],
  },
  // https://github.com/tc39/proposal-relative-indexing-method
  'relative-indexing-method': {
    stage: 4,
    modules: [
      'es.string.at',
      'es.array.at',
      'es.typed-array.at',
    ],
  },
  // https://github.com/tc39/proposal-set-methods
  'set-methods': {
    stage: 3,
    modules: [
      'esnext.set.difference',
      'esnext.set.intersection',
      'esnext.set.is-disjoint-from',
      'esnext.set.is-subset-of',
      'esnext.set.is-superset-of',
      'esnext.set.symmetric-difference',
      'esnext.set.union',
    ],
  },
  // https://github.com/tc39/proposal-string-prototype-codepoints
  'string-code-points': {
    stage: 1,
    modules: [
      'esnext.string.code-points',
    ],
  },
  // https://github.com/bathos/proposal-string-cooked
  'string-cooked': {
    stage: 1,
    modules: [
      'esnext.string.cooked',
    ],
  },
  // https://github.com/tc39/proposal-string-dedent
  'string-dedent': {
    stage: 2,
    modules: [
      'esnext.string.dedent',
    ],
  },
  // https://github.com/tc39/proposal-string-left-right-trim
  'string-left-right-trim': {
    stage: 4,
    modules: [
      'es.string.trim-end',
      'es.string.trim-left',
      'es.string.trim-right',
      'es.string.trim-start',
    ],
  },
  // https://github.com/tc39/proposal-string-matchall
  'string-match-all': {
    stage: 4,
    modules: [
      'es.string.match-all',
    ],
  },
  // https://github.com/tc39/proposal-string-pad-start-end
  'string-padding': {
    stage: 4,
    modules: [
      'es.string.pad-end',
      'es.string.pad-start',
    ],
  },
  // https://github.com/tc39/proposal-string-replaceall
  'string-replace-all': {
    stage: 4,
    modules: [
      'es.string.replace-all',
    ],
  },
  // https://github.com/tc39/proposal-Symbol-description
  'symbol-description': {
    stage: 4,
    modules: [
      'es.symbol.description',
    ],
  },
  // https://github.com/tc39/proposal-symbol-predicates
  'symbol-predicates': {
    stage: 2,
    modules: [
      'esnext.symbol.is-registered-symbol',
      'esnext.symbol.is-well-known-symbol',
    ],
  },
  // https://github.com/tc39/proposal-well-formed-stringify
  'well-formed-stringify': {
    stage: 4,
    modules: [
      'es.json.stringify',
    ],
  },
  // https://github.com/tc39/proposal-is-usv-string
  'well-formed-unicode-strings': {
    stage: 4,
    modules: [
      'es.string.is-well-formed',
      'es.string.to-well-formed',
    ],
  },
};
