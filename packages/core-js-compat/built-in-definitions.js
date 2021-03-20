'use strict';
const entries = require('@core-js/compat/entries');

function map(object) {
  return new Map(Object.entries(object));
}

function set(array) {
  return new Set(array);
}

function def(entry, globalEntryOrModules = null) {
  if (globalEntryOrModules === null) globalEntryOrModules = entry;
  const modules = Array.isArray(globalEntryOrModules)
    ? globalEntryOrModules
    : entries[`core-js/full/${ entry }`];
  return { entry, modules };
}

const CommonIterators = [
  'es.array.iterator',
  'es.string.iterator',
  'web.dom-collections.iterator',
];

const CommonIteratorsWithTag = [
  'es.object.to-string',
  ...CommonIterators,
];

const TypedArrayDependencies = [
  'es.array.iterator',
  'es.array-buffer.slice',
  'es.map',
  'es.object.to-string',
  'es.typed-array.copy-within',
  'es.typed-array.every',
  'es.typed-array.fill',
  'es.typed-array.filter',
  'es.typed-array.find',
  'es.typed-array.find-index',
  'es.typed-array.for-each',
  'es.typed-array.includes',
  'es.typed-array.index-of',
  'es.typed-array.iterator',
  'es.typed-array.join',
  'es.typed-array.last-index-of',
  'es.typed-array.map',
  'es.typed-array.reduce',
  'es.typed-array.reduce-right',
  'es.typed-array.reverse',
  'es.typed-array.set',
  'es.typed-array.slice',
  'es.typed-array.some',
  'es.typed-array.sort',
  'es.typed-array.subarray',
  'es.typed-array.to-locale-string',
  'es.typed-array.to-string',
  'esnext.typed-array.at',
  'esnext.typed-array.filter-out',
  'esnext.typed-array.find-last',
  'esnext.typed-array.find-last-index',
  'esnext.typed-array.unique-by',
];

const TypedArrayStaticMethods = map({
  from: def(null, [
    'es.typed-array.from',
    ...TypedArrayDependencies,
  ]),
  of: def(null, [
    'es.typed-array.of',
    ...TypedArrayDependencies,
  ]),
});

const PromiseDependencies = [
  'es.promise.constructor',
  'es.object.to-string',
];

const URLSearchParamsDependencies = [
  'web.url',
  ...CommonIteratorsWithTag,
];

const BuiltIns = map({
  AggregateError: def('aggregate-error'),
  ArrayBuffer: def(null, [
    'es.array-buffer.constructor',
    'es.array-buffer.slice',
    'es.object.to-string',
  ]),
  DataView: def(null, [
    'es.data-view',
    'es.array-buffer.slice',
    'es.object.to-string',
  ]),
  Map: def('map', [
    'es.map',
    'esnext.map.delete-all',
    'esnext.map.emplace',
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
    ...CommonIteratorsWithTag,
  ]),
  Number: def(null, ['es.number.constructor']),
  Observable: def('observable', [
    'esnext.observable',
    'esnext.symbol.observable',
    'es.object.to-string',
    ...CommonIteratorsWithTag,
  ]),
  Promise: def('promise', PromiseDependencies),
  RegExp: def(null, [
    'es.regexp.constructor',
    'es.regexp.exec',
    'es.regexp.to-string',
  ]),
  Set: def('set', [
    'es.set',
    'esnext.set.add-all',
    'esnext.set.delete-all',
    'esnext.set.difference',
    'esnext.set.every',
    'esnext.set.filter',
    'esnext.set.find',
    'esnext.set.intersection',
    'esnext.set.is-disjoint-from',
    'esnext.set.is-subset-of',
    'esnext.set.is-superset-of',
    'esnext.set.join',
    'esnext.set.map',
    'esnext.set.reduce',
    'esnext.set.some',
    'esnext.set.symmetric-difference',
    'esnext.set.union',
    ...CommonIteratorsWithTag,
  ]),
  Symbol: def('symbol', [
    'es.symbol',
    'es.symbol.description',
    'es.object.to-string',
  ]),
  URL: def('url', [
    'web.url',
    ...URLSearchParamsDependencies,
  ]),
  URLSearchParams: def('url-search-params', URLSearchParamsDependencies),
  WeakMap: def('weak-map', [
    'es.weak-map',
    'esnext.weak-map.emplace',
    'esnext.weak-map.delete-all',
    ...CommonIteratorsWithTag,
  ]),
  WeakSet: def('weak-set', [
    'es.weak-set',
    'esnext.weak-set.add-all',
    'esnext.weak-set.delete-all',
    ...CommonIteratorsWithTag,
  ]),
  Int8Array: def(null, [
    'es.typed-array.int8-array',
    ...TypedArrayDependencies,
  ]),
  Int16Array: def(null, [
    'es.typed-array.int16-array',
    ...TypedArrayDependencies,
  ]),
  Int32Array: def(null, [
    'es.typed-array.int32-array',
    ...TypedArrayDependencies,
  ]),
  Uint8Array: def(null, [
    'es.typed-array.uint8-array',
    ...TypedArrayDependencies,
  ]),
  Uint16Array: def(null, [
    'es.typed-array.uint16-array',
    ...TypedArrayDependencies,
  ]),
  Uint32Array: def(null, [
    'es.typed-array.uint32-array',
    ...TypedArrayDependencies,
  ]),
  Uint8ClampedArray: def(null, [
    'es.typed-array.uint8-clamped-array',
    ...TypedArrayDependencies,
  ]),
  Float32Array: def(null, [
    'es.typed-array.float32-array',
    ...TypedArrayDependencies,
  ]),
  Float64Array: def(null, [
    'es.typed-array.float64-array',
    ...TypedArrayDependencies,
  ]),
  clearImmediate: def('clear-immediate'),
  compositeKey: def('composite-key'),
  compositeSymbol: def('composite-symbol'),
  fetch: def(null, PromiseDependencies),
  globalThis: def('global-this'),
  parseFloat: def('parse-float'),
  parseInt: def('parse-int'),
  queueMicrotask: def('queue-microtask'),
  setTimeout: def('set-timeout'),
  setInterval: def('set-interval'),
  setImmediate: def('set-immediate'),
});

const InstanceProperties = map({
  at: def('instance/at'),
  anchor: def(null, ['es.string.anchor']),
  big: def(null, ['es.string.big']),
  blink: def(null, ['es.string.blink']),
  bold: def(null, ['es.string.bold']),
  catch: def(null, [
    'es.promise.catch',
    ...PromiseDependencies,
  ]),
  codePointAt: def('instance/code-point-at'),
  codePoints: def('instance/code-points'),
  concat: def('instance/concat'),
  copyWithin: def('instance/copy-within'),
  description: def(null, [
    'es.symbol',
    'es.symbol.description',
  ]),
  endsWith: def('instance/ends-with'),
  entries: def('instance/entries'),
  every: def('instance/every'),
  exec: def(null, ['es.regexp.exec']),
  fill: def('instance/fill'),
  filter: def('instance/filter'),
  filterOut: def('instance/filter-out'),
  finally: def(null, [
    'es.promise.finally',
    ...PromiseDependencies,
  ]),
  find: def('instance/find'),
  findIndex: def('instance/find-index'),
  findLast: def('instance/find-last'),
  findLastIndex: def('instance/find-last-index'),
  fixed: def(null, ['es.string.fixed']),
  flags: def('instance/flags'),
  flat: def('instance/flat'),
  flatMap: def('instance/flat-map'),
  fontcolor: def(null, ['es.string.fontcolor']),
  fontsize: def(null, ['es.string.fontsize']),
  forEach: def('instance/includes'),
  includes: def('instance/includes'),
  indexOf: def('instance/index-of'),
  italics: def(null, ['es.string.italics']),
  join: def(null, ['es.array.join']),
  keys: def('instance/keys'),
  lastIndex: def(null, ['esnext.array.last-index']),
  lastIndexOf: def('instance/last-index-of'),
  lastItem: def(null, ['esnext.array.last-item']),
  link: def(null, ['es.string.link']),
  match: def(null, ['es.string.match', 'es.regexp.exec']),
  matchAll: def('instance/match-all'),
  map: def('instance/map'),
  name: def(null, ['es.function.name']),
  padEnd: def('instance/pad-end'),
  padStart: def('instance/pad-start'),
  reduce: def('instance/reduce'),
  reduceRight: def('instance/reduce-right'),
  repeat: def('instance/repeat'),
  replace: def(null, [
    'es.string.replace',
    'es.regexp.exec',
  ]),
  replaceAll: def('instance/replace-all'),
  reverse: def('instance/reverse'),
  search: def(null, [
    'es.string.search',
    'es.regexp.exec',
  ]),
  slice: def('instance/slice'),
  small: def(null, ['es.string.small']),
  some: def('instance/some'),
  sort: def('instance/sort'),
  splice: def('instance/splice'),
  split: def(null, [
    'es.string.split',
    'es.regexp.exec',
  ]),
  startsWith: def('instance/starts-with'),
  strike: def(null, ['es.string.strike']),
  sticky: def(null, ['es.regexp.sticky']),
  sub: def(null, ['es.string.sub']),
  sup: def(null, ['es.string.sup']),
  test: def(null, [
    'es.regexp.exec',
    'es.regexp.test',
  ]),
  toFixed: def(null, ['es.number.to-fixed']),
  toISOString: def(null, ['es.date.to-iso-string']),
  toJSON: def(null, [
    'es.date.to-json',
    'web.url.to-json',
  ]),
  toPrecision: def(null, ['es.number.to-precision']),
  toString: def(null, [
    'es.object.to-string',
    'es.regexp.to-string',
  ]),
  trim: def('instance/trim'),
  trimEnd: def('instance/trim-end'),
  trimLeft: def('instance/trim-left'),
  trimRight: def('instance/trim-right'),
  trimStart: def('instance/trim-start'),
  uniqueBy: def('instance/unique-by'),
  values: def('instance/values'),
  __defineGetter__: def(null, ['es.object.define-getter']),
  __defineSetter__: def(null, ['es.object.define-setter']),
  __lookupGetter__: def(null, ['es.object.lookup-getter']),
  __lookupSetter__: def(null, ['es.object.lookup-setter']),
});

const StaticProperties = map({
  Array: map({
    from: def('array/from'),
    of: def('array/of'),
  }),
  BigInt: map({
    range: def('bigint/range'),
  }),
  JSON: map({
    stringify: def('json/stringify'),
  }),
  Object: map({
    assign: def('object/assign'),
    entries: def('object/entries'),
    freeze: def('object/freeze'),
    fromEntries: def('object/from-entries'),
    getOwnPropertyDescriptor: def('object/get-own-property-descriptor'),
    getOwnPropertyDescriptors: def('object/get-own-property-descriptors'),
    getOwnPropertyNames: def('object/get-own-property-names'),
    getOwnPropertySymbols: def('object/get-own-property-symbols'),
    getPrototypeOf: def('object/get-prototype-of'),
    is: def('object/is'),
    isExtensible: def('object/is-extensible'),
    isFrozen: def('object/is-frozen'),
    isSealed: def('object/is-sealed'),
    keys: def('object/keys'),
    preventExtensions: def('object/prevent-extensions'),
    seal: def('object/seal'),
    setPrototypeOf: def('object/set-prototype-of'),
    values: def('object/values'),
  }),
  Math: map({
    DEG_PER_RAD: def('math/deg-per-rad'),
    RAD_PER_DEG: def('math/rad-per-deg'),
    acosh: def('math/acosh'),
    asinh: def('math/asinh'),
    atanh: def('math/atanh'),
    cbrt: def('math/cbrt'),
    clamp: def('math/clamp'),
    clz32: def('math/clz32'),
    cosh: def('math/cosh'),
    degrees: def('math/degrees'),
    expm1: def('math/expm1'),
    fround: def('math/fround'),
    fscale: def('math/fscale'),
    hypot: def('math/hypot'),
    imul: def('math/imul'),
    log1p: def('math/log1p'),
    log10: def('math/log10'),
    log2: def('math/log2'),
    radians: def('math/radians'),
    scale: def('math/scale'),
    sign: def('math/sign'),
    signbit: def('math/signbit'),
    sinh: def('math/sinh'),
    tanh: def('math/tanh'),
    trunc: def('math/trunc'),
  }),
  String: map({
    fromCodePoint: def('string/from-code-point'),
    raw: def('string/raw'),
  }),
  Number: map({
    EPSILON: def('number/epsilon'),
    MIN_SAFE_INTEGER: def('number/min-safe-integer'),
    MAX_SAFE_INTEGER: def('number/max-safe-integer'),
    fromString: def('number/from-string'),
    isFinite: def('number/is-finite'),
    isInteger: def('number/is-integer'),
    isSafeInteger: def('number/is-safe-integer'),
    isNaN: def('number/is-nan'),
    parseFloat: def('number/parse-float'),
    parseInt: def('number/parse-int'),
    range: def('number/range'),
  }),
  Map: map({
    from: def('map/from'),
    groupBy: def('map/group-by'),
    keyBy: def('map/key-by'),
    of: def('map/of'),
  }),
  Set: map({
    from: def('set/from'),
    of: def('set/of'),
  }),
  WeakMap: map({
    from: def('weak-map/from'),
    of: def('weak-map/of'),
  }),
  WeakSet: map({
    from: def('weak-set/from'),
    of: def('weak-set/of'),
  }),
  Promise: map({
    all: def('promise/all'),
    allSettled: def('promise/all-settled'),
    any: def('promise/any'),
    race: def('promise/race'),
    try: def('promise/try'),
  }),
  Reflect: map({
    apply: def('reflect/apply'),
    construct: def('reflect/construct'),
    defineMetadata: def('reflect/define-metadata'),
    defineProperty: def('reflect/define-property'),
    deleteMetadata: def('reflect/delete-metadata'),
    deleteProperty: def('reflect/delete-property'),
    get: def('reflect/get'),
    getMetadata: def('reflect/get-metadata'),
    getMetadataKeys: def('reflect/reflect.get-metadata-keys'),
    getOwnMetadata: def('reflect/get-own-metadata'),
    getOwnMetadataKeys: def('reflect/get-own-metadata-keys'),
    getOwnPropertyDescriptor: def('reflect/get-own-property-descriptor'),
    getPrototypeOf: def('reflect/get-prototype-of'),
    has: def('reflect/has'),
    hasMetadata: def('reflect/has-metadata'),
    hasOwnMetadata: def('reflect/has-own-metadata'),
    isExtensible: def('reflect/is-extensible'),
    metadata: def('reflect/metadata'),
    ownKeys: def('reflect/own-keys'),
    preventExtensions: def('reflect/prevent-extensions'),
    set: def('reflect/set'),
    setPrototypeOf: def('reflect/set-prototype-of'),
  }),
  Symbol: map({
    asyncDispose: def('symbol/async-dispose'),
    asyncIterator: def('symbol/async-iterator'),
    dispose: def('symbol/dispose'),
    for: def('symbol/for', 'symbol'), // ???
    hasInstance: def('symbol/has-instance'),
    isConcatSpreadable: def('symbol/is-concat-spreadable'),
    iterator: def('symbol/iterator'),
    keyFor: def('symbol/key-for', 'symbol'), // ???
    match: def('symbol/match'),
    matchAll: def('symbol/match-all'),
    observable: def('symbol/observable'),
    replace: def('symbol/replace'),
    search: def('symbol/search'),
    species: def('symbol/species'),
    split: def('symbol/split'),
    toPrimitive: def('symbol/to-primitive'),
    toStringTag: def('symbol/to-string-tag'),
    unscopables: def('symbol/unscopables'),
  }),
  ArrayBuffer: map({
    isView: def(null, ['es.array-buffer.is-view']), // ???
  }),
  Int8Array: TypedArrayStaticMethods,
  Int16Array: TypedArrayStaticMethods,
  Int32Array: TypedArrayStaticMethods,
  Uint8Array: TypedArrayStaticMethods,
  Uint16Array: TypedArrayStaticMethods,
  Uint32Array: TypedArrayStaticMethods,
  Uint8ClampedArray: TypedArrayStaticMethods,
  Float32Array: TypedArrayStaticMethods,
  Float64Array: TypedArrayStaticMethods,
});

const CommonInstanceDependencies = set([
  'es.object.to-string',
  'es.object.define-getter',
  'es.object.define-setter',
  'es.object.lookup-getter',
  'es.object.lookup-setter',
  'es.regexp.exec',
]);

const PossibleGlobalObjects = set([
  'global',
  'globalThis',
  'self',
  'window',
]);

module.exports = {
  BuiltIns,
  StaticProperties,
  InstanceProperties,
  CommonIterators,
  PromiseDependencies,
  CommonInstanceDependencies,
  PossibleGlobalObjects,
};
