import {
  $prototype,
  $prototypeIterator,
  $virtual,
  $virtualIterator,
  $static,
  $staticWithContext,
  $patchableStatic,
  $namespace,
  $helper,
  $justImport,
  $instanceArray,
  $instanceNumber,
  $instanceString,
  $instanceFunction,
  $instanceDOMIterables,
  $instanceArrayString,
  $instanceArrayDOMIterables,
  $instanceRegExpFlags,
  $path,
} from './templates.mjs';

const PromiseWithPrototype = [
  'es.promise.constructor',
  'es.promise.catch',
  'es.promise.finally',
];

const MapWithPrototype = [
  'es.map.constructor',
  'es.map.species',
  'esnext.map.get-or-insert',
  'esnext.map.get-or-insert-computed',
];

const SetWithPrototype = [
  'es.set.constructor',
  'es.set.species',
  'es.set.difference',
  'es.set.intersection',
  'es.set.is-disjoint-from',
  'es.set.is-subset-of',
  'es.set.is-superset-of',
  'es.set.symmetric-difference',
  'es.set.union',
];

const WeakMapWithPrototype = [
  'es.weak-map.constructor',
  'esnext.weak-map.get-or-insert',
  'esnext.weak-map.get-or-insert-computed',
];

const WeakSetWithPrototype = [
  'es.weak-set.constructor',
];

const ArrayBufferPrototypeMethods = [
  'es.array-buffer.detached',
  'es.array-buffer.slice',
  'es.array-buffer.species',
  'es.array-buffer.to-string-tag',
  'es.array-buffer.transfer',
  'es.array-buffer.transfer-to-fixed-length',
];

const AsyncIteratorPrototypeMethods = [
  'es.async-iterator.async-dispose',
  'esnext.async-iterator.drop',
  'esnext.async-iterator.every',
  'esnext.async-iterator.filter',
  'esnext.async-iterator.find',
  'esnext.async-iterator.flat-map',
  'esnext.async-iterator.for-each',
  'esnext.async-iterator.map',
  'esnext.async-iterator.reduce',
  'esnext.async-iterator.some',
  'esnext.async-iterator.take',
  'esnext.async-iterator.to-array',
];

const IteratorPrototypeMethods = [
  'es.iterator.dispose',
  'es.iterator.drop',
  'es.iterator.every',
  'es.iterator.filter',
  'es.iterator.find',
  'es.iterator.flat-map',
  'es.iterator.for-each',
  'es.iterator.map',
  'es.iterator.reduce',
  'es.iterator.some',
  'es.iterator.take',
  'es.iterator.to-array',
  'esnext.iterator.to-async',
];

const TypedArrayPrototypeMethods = [
  'es.typed-array.at',
  'es.typed-array.copy-within',
  'es.typed-array.entries',
  'es.typed-array.every',
  'es.typed-array.fill',
  'es.typed-array.filter',
  'es.typed-array.find',
  'es.typed-array.find-index',
  'es.typed-array.find-last',
  'es.typed-array.find-last-index',
  'es.typed-array.for-each',
  'es.typed-array.includes',
  'es.typed-array.index-of',
  'es.typed-array.iterator',
  'es.typed-array.join',
  'es.typed-array.keys',
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
  'es.typed-array.to-reversed',
  'es.typed-array.to-sorted',
  'es.typed-array.to-string',
  'es.typed-array.values',
  'es.typed-array.with',
  'esnext.typed-array.filter-reject',
  'esnext.typed-array.unique-by',
];

const Uint8ArrayPrototypeMethods = [
  ...TypedArrayPrototypeMethods,
  'es.uint8-array.set-from-base64',
  'es.uint8-array.set-from-hex',
  'es.uint8-array.to-base64',
  'es.uint8-array.to-hex',
];

const TypedArrayMethods = [
  'es.typed-array.from',
  'es.typed-array.of',
  'es.uint8-array.from-base64',
  'es.uint8-array.from-hex',
  ...TypedArrayPrototypeMethods,
];

export const features = {
  'aggregate-error/index': {
    modules: [/^(?:es|esnext)\.aggregate-error\./],
    template: $namespace,
    name: 'AggregateError',
  },
  'aggregate-error/constructor': {
    modules: [/^(?:es|esnext)\.aggregate-error\./],
    template: $namespace,
    name: 'AggregateError',
  },
  'array/index': {
    modules: [/^(?:es|esnext)\.array\./],
    template: $namespace,
    name: 'Array',
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
    modules: ['es.array.entries'],
    template: $prototype({ namespace: 'Array', method: 'entries' }),
  },
  'array/virtual/entries': {
    modules: ['es.array.entries'],
    template: $virtual({ namespace: 'Array', method: 'entries' }),
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
  'array/from': {
    modules: ['es.array.from'],
    template: $static,
    namespace: 'Array',
    name: 'from',
  },
  'array/from-async': {
    modules: ['es.array.from-async'],
    template: $static,
    namespace: 'Array',
    name: 'fromAsync',
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
    template: $static,
    namespace: 'Array',
    name: 'isTemplateObject',
  },
  'array/iterator': {
    modules: ['es.array.iterator'],
    template: $prototypeIterator,
    source: '[]',
  },
  'array/virtual/iterator': {
    modules: ['es.array.iterator'],
    template: $virtualIterator,
    source: '[]',
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
    modules: ['es.array.keys'],
    template: $prototype({ namespace: 'Array', method: 'keys' }),
  },
  'array/virtual/keys': {
    modules: ['es.array.keys'],
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
    template: $static,
    namespace: 'Array',
    name: 'of',
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
    modules: ['es.array.values'],
    template: $prototype({ namespace: 'Array', method: 'values' }),
  },
  'array/virtual/values': {
    modules: ['es.array.values'],
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
  'array-buffer/index': {
    modules: [/^(?:es|esnext)\.array-buffer\./],
    template: $namespace,
    name: 'ArrayBuffer',
  },
  'array-buffer/constructor': {
    modules: ['es.array-buffer.constructor', ...ArrayBufferPrototypeMethods],
    template: $namespace,
    name: 'ArrayBuffer',
  },
  'array-buffer/is-view': {
    modules: ['es.array-buffer.is-view'],
    template: $static,
    namespace: 'ArrayBuffer',
    name: 'isView',
  },
  'array-buffer/detached': {
    modules: ['es.array-buffer.detached'],
    template: $justImport,
  },
  'array-buffer/slice': {
    modules: ['es.array-buffer.slice'],
    template: $justImport,
  },
  'array-buffer/transfer': {
    modules: ['es.array-buffer.transfer'],
    template: $justImport,
  },
  'array-buffer/transfer-to-fixed-length': {
    modules: ['es.array-buffer.transfer-to-fixed-length'],
    template: $justImport,
  },
  'async-disposable-stack/index': {
    modules: [/^(?:es|esnext)\.async-disposable-stack\./],
    template: $namespace,
    name: 'AsyncDisposableStack',
  },
  'async-disposable-stack/constructor': {
    modules: ['es.async-disposable-stack.constructor'],
    template: $namespace,
    name: 'AsyncDisposableStack',
  },
  'async-iterator/index': {
    modules: [/^(?:es|esnext)\.async-iterator\./],
    template: $namespace,
    name: 'AsyncIterator',
  },
  'async-iterator/constructor': {
    modules: ['esnext.async-iterator.constructor', ...AsyncIteratorPrototypeMethods],
    template: $namespace,
    name: 'AsyncIterator',
  },
  'async-iterator/from': {
    modules: ['esnext.async-iterator.from', ...AsyncIteratorPrototypeMethods],
    template: $static,
    namespace: 'AsyncIterator',
    name: 'from',
  },
  'async-iterator/drop': {
    modules: ['esnext.async-iterator.drop'],
    template: $prototype({ namespace: 'AsyncIterator', method: 'drop' }),
  },
  'async-iterator/virtual/drop': {
    modules: ['esnext.async-iterator.drop'],
    template: $virtual({ namespace: 'AsyncIterator', method: 'drop' }),
  },
  'async-iterator/every': {
    modules: ['esnext.async-iterator.every'],
    template: $prototype({ namespace: 'AsyncIterator', method: 'every' }),
  },
  'async-iterator/virtual/every': {
    modules: ['esnext.async-iterator.every'],
    template: $virtual({ namespace: 'AsyncIterator', method: 'every' }),
  },
  'async-iterator/filter': {
    modules: ['esnext.async-iterator.filter'],
    template: $prototype({ namespace: 'AsyncIterator', method: 'filter' }),
  },
  'async-iterator/virtual/filter': {
    modules: ['esnext.async-iterator.filter'],
    template: $virtual({ namespace: 'AsyncIterator', method: 'filter' }),
  },
  'async-iterator/find': {
    modules: ['esnext.async-iterator.find'],
    template: $prototype({ namespace: 'AsyncIterator', method: 'find' }),
  },
  'async-iterator/virtual/find': {
    modules: ['esnext.async-iterator.find'],
    template: $virtual({ namespace: 'AsyncIterator', method: 'find' }),
  },
  'async-iterator/flat-map': {
    modules: ['esnext.async-iterator.flat-map'],
    template: $prototype({ namespace: 'AsyncIterator', method: 'flatMap' }),
  },
  'async-iterator/virtual/flat-map': {
    modules: ['esnext.async-iterator.flat-map'],
    template: $virtual({ namespace: 'AsyncIterator', method: 'flatMap' }),
  },
  'async-iterator/for-each': {
    modules: ['esnext.async-iterator.for-each'],
    template: $prototype({ namespace: 'AsyncIterator', method: 'forEach' }),
  },
  'async-iterator/virtual/for-each': {
    modules: ['esnext.async-iterator.for-each'],
    template: $virtual({ namespace: 'AsyncIterator', method: 'forEach' }),
  },
  'async-iterator/map': {
    modules: ['esnext.async-iterator.map'],
    template: $prototype({ namespace: 'AsyncIterator', method: 'map' }),
  },
  'async-iterator/virtual/map': {
    modules: ['esnext.async-iterator.map'],
    template: $virtual({ namespace: 'AsyncIterator', method: 'map' }),
  },
  'async-iterator/reduce': {
    modules: ['esnext.async-iterator.reduce'],
    template: $prototype({ namespace: 'AsyncIterator', method: 'reduce' }),
  },
  'async-iterator/virtual/reduce': {
    modules: ['esnext.async-iterator.reduce'],
    template: $virtual({ namespace: 'AsyncIterator', method: 'reduce' }),
  },
  'async-iterator/some': {
    modules: ['esnext.async-iterator.some'],
    template: $prototype({ namespace: 'AsyncIterator', method: 'some' }),
  },
  'async-iterator/virtual/some': {
    modules: ['esnext.async-iterator.some'],
    template: $virtual({ namespace: 'AsyncIterator', method: 'some' }),
  },
  'async-iterator/take': {
    modules: ['esnext.async-iterator.take'],
    template: $prototype({ namespace: 'AsyncIterator', method: 'take' }),
  },
  'async-iterator/virtual/take': {
    modules: ['esnext.async-iterator.take'],
    template: $virtual({ namespace: 'AsyncIterator', method: 'take' }),
  },
  'async-iterator/to-array': {
    modules: ['esnext.async-iterator.to-array'],
    template: $prototype({ namespace: 'AsyncIterator', method: 'toArray' }),
  },
  'async-iterator/virtual/to-array': {
    modules: ['esnext.async-iterator.to-array'],
    template: $virtual({ namespace: 'AsyncIterator', method: 'toArray' }),
  },
  'data-view/index': {
    modules: [/^(?:es|esnext)\.data-view\./],
    template: $namespace,
    name: 'DataView',
  },
  'data-view/constructor': {
    modules: [/^(?:es|esnext)\.data-view\./],
    template: $namespace,
    name: 'DataView',
  },
  'data-view/get-float16': {
    modules: ['es.data-view.get-float16'],
    template: $justImport,
  },
  'data-view/get-uint8-clamped': {
    modules: ['esnext.data-view.get-uint8-clamped'],
    template: $justImport,
  },
  'data-view/set-float16': {
    modules: ['es.data-view.set-float16'],
    template: $justImport,
  },
  'data-view/set-uint8-clamped': {
    modules: ['esnext.data-view.set-uint8-clamped'],
    template: $justImport,
  },
  'date/index': {
    modules: [/^(?:es|esnext)\.date\./],
    template: $namespace,
    name: 'Date',
  },
  'date/to-json': {
    modules: ['es.date.to-json'],
    template: $prototype({ namespace: 'Date', method: 'toJSON' }),
  },
  'date/virtual/to-json': {
    modules: ['es.date.to-json'],
    template: $virtual({ namespace: 'Date', method: 'toJSON' }),
  },
  'disposable-stack/index': {
    modules: [/^(?:es|esnext)\.disposable-stack\./],
    template: $namespace,
    name: 'DisposableStack',
  },
  'disposable-stack/constructor': {
    modules: ['es.disposable-stack.constructor'],
    template: $namespace,
    name: 'DisposableStack',
  },
  'dom-collections/index': {
    modules: [/^web\.dom-collections\./],
    template: $justImport,
  },
  'dom-collections/entries': {
    modules: ['web.dom-collections.entries'],
    template: $justImport,
  },
  'dom-collections/for-each': {
    modules: ['web.dom-collections.for-each'],
    template: $justImport,
  },
  'dom-collections/iterator': {
    modules: ['web.dom-collections.iterator'],
    template: $justImport,
  },
  'dom-collections/keys': {
    modules: ['web.dom-collections.keys'],
    template: $justImport,
  },
  'dom-collections/values': {
    modules: ['web.dom-collections.values'],
    template: $justImport,
  },
  'dom-exception/index': {
    modules: [/^web\.dom-exception\./],
    template: $namespace,
    name: 'DOMException',
  },
  'dom-exception/constructor': {
    modules: [/^web\.dom-exception\./],
    template: $namespace,
    name: 'DOMException',
  },
  'error/index': {
    modules: [/^(?:es|esnext)\.error\./],
    template: $path,
  },
  'error/constructor': {
    modules: [/^(?:es|esnext)\.error\./],
    template: $path,
  },
  'error/is-error': {
    modules: ['es.error.is-error'],
    template: $static,
    namespace: 'Error',
    name: 'isError',
  },
  'function/index': {
    modules: [/^(?:es|esnext)\.function\./],
    template: $namespace,
    name: 'Function',
  },
  'function/demethodize': {
    modules: ['esnext.function.demethodize'],
    template: $prototype({ namespace: 'Function', method: 'demethodize' }),
  },
  'function/virtual/demethodize': {
    modules: ['esnext.function.demethodize'],
    template: $virtual({ namespace: 'Function', method: 'demethodize' }),
  },
  'function/name': {
    modules: ['es.function.name'],
    template: $justImport, // <- ???
  },
  'instance/at': {
    modules: ['es.array.at', 'es.string.at'],
    template: $instanceArrayString,
    name: 'at',
  },
  'instance/clamp': {
    name: 'clamp',
    modules: ['esnext.number.clamp'],
    template: $instanceNumber,
  },
  'instance/code-point-at': {
    modules: ['es.string.code-point-at'],
    template: $instanceString,
    name: 'codePointAt',
  },
  'instance/concat': {
    modules: ['es.array.concat'],
    template: $instanceArray,
    name: 'concat',
  },
  'instance/copy-within': {
    modules: ['es.array.copy-within'],
    template: $instanceArray,
    name: 'copyWithin',
  },
  'instance/demethodize': {
    modules: ['esnext.function.demethodize'],
    template: $instanceFunction,
    name: 'demethodize',
  },
  'instance/ends-with': {
    modules: ['es.string.ends-with'],
    template: $instanceString,
    name: 'endsWith',
  },
  'instance/entries': {
    modules: ['es.array.entries', 'web.dom-collections.entries'],
    template: $instanceArray,
    templateStable: $instanceArrayDOMIterables,
    name: 'entries',
  },
  'instance/fill': {
    modules: ['es.array.fill'],
    template: $instanceArray,
    name: 'fill',
  },
  'instance/filter': {
    modules: ['es.array.filter'],
    template: $instanceArray,
    name: 'filter',
  },
  'instance/filter-reject': {
    modules: ['esnext.array.filter-reject'],
    template: $instanceArray,
    name: 'filterReject',
  },
  'instance/find': {
    modules: ['es.array.find'],
    template: $instanceArray,
    name: 'find',
  },
  'instance/find-index': {
    modules: ['es.array.find-index'],
    template: $instanceArray,
    name: 'findIndex',
  },
  'instance/find-last': {
    modules: ['es.array.find-last'],
    template: $instanceArray,
    name: 'findLast',
  },
  'instance/find-last-index': {
    modules: ['es.array.find-last-index'],
    template: $instanceArray,
    name: 'findLastIndex',
  },
  'instance/flags': {
    modules: ['es.regexp.flags'],
    template: $instanceRegExpFlags,
    name: 'flags',
  },
  'instance/flat': {
    modules: ['es.array.flat'],
    template: $instanceArray,
    name: 'flat',
  },
  'instance/flat-map': {
    modules: ['es.array.flat-map'],
    template: $instanceArray,
    name: 'flatMap',
  },
  'instance/for-each': {
    modules: ['web.dom-collections.for-each'],
    template: $instanceDOMIterables,
    name: 'forEach',
  },
  'instance/includes': {
    modules: ['es.array.includes', 'es.string.includes'],
    template: $instanceArrayString,
    name: 'includes',
  },
  'instance/index-of': {
    modules: ['es.array.index-of'],
    template: $instanceArray,
    name: 'indexOf',
  },
  'instance/is-well-formed': {
    modules: ['es.string.is-well-formed'],
    template: $instanceString,
    name: 'isWellFormed',
  },
  'instance/keys': {
    modules: ['es.array.keys', 'web.dom-collections.keys'],
    template: $instanceArray,
    templateStable: $instanceArrayDOMIterables,
    name: 'keys',
  },
  'instance/last-index-of': {
    modules: ['es.array.last-index-of'],
    template: $instanceArray,
    name: 'lastIndexOf',
  },
  'instance/map': {
    modules: ['es.array.map'],
    template: $instanceArray,
    name: 'map',
  },
  'instance/match-all': {
    modules: ['es.string.match-all'],
    template: $instanceString,
    name: 'matchAll',
  },
  'instance/pad-end': {
    modules: ['es.string.pad-end'],
    template: $instanceString,
    name: 'padEnd',
  },
  'instance/pad-start': {
    modules: ['es.string.pad-start'],
    template: $instanceString,
    name: 'padStart',
  },
  'instance/push': {
    modules: ['es.array.push'],
    template: $instanceArray,
    name: 'push',
  },
  'instance/reduce': {
    modules: ['es.array.reduce'],
    template: $instanceArray,
    name: 'reduce',
  },
  'instance/reduce-right': {
    modules: ['es.array.reduce-right'],
    template: $instanceArray,
    name: 'reduceRight',
  },
  'instance/repeat': {
    modules: ['es.string.repeat'],
    template: $instanceString,
    name: 'repeat',
  },
  'instance/replace-all': {
    modules: ['es.string.replace-all'],
    template: $instanceString,
    name: 'replaceAll',
  },
  'instance/reverse': {
    modules: ['es.array.reverse'],
    template: $instanceArray,
    name: 'reverse',
  },
  'instance/slice': {
    modules: ['es.array.slice'],
    template: $instanceArray,
    name: 'slice',
  },
  'instance/sort': {
    modules: ['es.array.sort'],
    template: $instanceArray,
    name: 'sort',
  },
  'instance/splice': {
    modules: ['es.array.splice'],
    template: $instanceArray,
    name: 'splice',
  },
  'instance/starts-with': {
    modules: ['es.string.starts-with'],
    template: $instanceString,
    name: 'startsWith',
  },
  'instance/to-reversed': {
    modules: ['es.array.to-reversed'],
    template: $instanceArray,
    name: 'toReversed',
  },
  'instance/to-sorted': {
    modules: ['es.array.to-sorted'],
    template: $instanceArray,
    name: 'toSorted',
  },
  'instance/to-spliced': {
    modules: ['es.array.to-spliced'],
    template: $instanceArray,
    name: 'toSpliced',
  },
  'instance/to-well-formed': {
    modules: ['es.string.to-well-formed'],
    template: $instanceString,
    name: 'toWellFormed',
  },
  'instance/trim': {
    modules: ['es.string.trim'],
    template: $instanceString,
    name: 'trim',
  },
  'instance/trim-end': {
    modules: ['es.string.trim-end'],
    template: $instanceString,
    name: 'trimEnd',
  },
  'instance/trim-left': {
    modules: ['es.string.trim-left'],
    template: $instanceString,
    name: 'trimLeft',
  },
  'instance/trim-right': {
    modules: ['es.string.trim-right'],
    template: $instanceString,
    name: 'trimRight',
  },
  'instance/trim-start': {
    modules: ['es.string.trim-start'],
    template: $instanceString,
    name: 'trimStart',
  },
  'instance/unique-by': {
    modules: ['esnext.array.unique-by'],
    template: $instanceArray,
    name: 'uniqueBy',
  },
  'instance/unshift': {
    modules: ['es.array.unshift'],
    template: $instanceArray,
    name: 'unshift',
  },
  'instance/values': {
    modules: ['es.array.values', 'web.dom-collections.values'],
    template: $instanceArray,
    templateStable: $instanceArrayDOMIterables,
    name: 'values',
  },
  'instance/with': {
    modules: ['es.array.with'],
    template: $instanceArray,
    name: 'with',
  },
  'iterator/index': {
    modules: [/^(?:es|esnext)\.iterator\./],
    template: $namespace,
    name: 'Iterator',
  },
  'iterator/constructor': {
    modules: ['es.iterator.constructor', ...IteratorPrototypeMethods],
    template: $namespace,
    name: 'Iterator',
  },
  'iterator/concat': {
    modules: ['esnext.iterator.concat', ...IteratorPrototypeMethods],
    template: $static,
    namespace: 'Iterator',
    name: 'concat',
  },
  'iterator/from': {
    modules: ['es.iterator.from', ...IteratorPrototypeMethods],
    template: $static,
    namespace: 'Iterator',
    name: 'from',
  },
  'iterator/range': {
    modules: ['esnext.iterator.range'],
    template: $static,
    namespace: 'Iterator',
    name: 'range',
  },
  'iterator/zip': {
    modules: ['esnext.iterator.zip', ...IteratorPrototypeMethods],
    template: $static,
    namespace: 'Iterator',
    name: 'zip',
  },
  'iterator/zip-keyed': {
    modules: ['esnext.iterator.zip-keyed', ...IteratorPrototypeMethods],
    template: $static,
    namespace: 'Iterator',
    name: 'zipKeyed',
  },
  'iterator/chunks': {
    modules: ['esnext.iterator.chunks'],
    template: $prototype({ namespace: 'Iterator', method: 'chunks' }),
  },
  'iterator/virtual/chunks': {
    modules: ['esnext.iterator.chunks'],
    template: $virtual({ namespace: 'Iterator', method: 'chunks' }),
  },
  'iterator/drop': {
    modules: ['es.iterator.drop'],
    template: $prototype({ namespace: 'Iterator', method: 'drop' }),
  },
  'iterator/virtual/drop': {
    modules: ['es.iterator.drop'],
    template: $virtual({ namespace: 'Iterator', method: 'drop' }),
  },
  'iterator/every': {
    modules: ['es.iterator.every'],
    template: $prototype({ namespace: 'Iterator', method: 'every' }),
  },
  'iterator/virtual/every': {
    modules: ['es.iterator.every'],
    template: $virtual({ namespace: 'Iterator', method: 'every' }),
  },
  'iterator/filter': {
    modules: ['es.iterator.filter'],
    template: $prototype({ namespace: 'Iterator', method: 'filter' }),
  },
  'iterator/virtual/filter': {
    modules: ['es.iterator.filter'],
    template: $virtual({ namespace: 'Iterator', method: 'filter' }),
  },
  'iterator/find': {
    modules: ['es.iterator.find'],
    template: $prototype({ namespace: 'Iterator', method: 'find' }),
  },
  'iterator/virtual/find': {
    modules: ['es.iterator.find'],
    template: $virtual({ namespace: 'Iterator', method: 'find' }),
  },
  'iterator/flat-map': {
    modules: ['es.iterator.flat-map'],
    template: $prototype({ namespace: 'Iterator', method: 'flatMap' }),
  },
  'iterator/virtual/flat-map': {
    modules: ['es.iterator.flat-map'],
    template: $virtual({ namespace: 'Iterator', method: 'flatMap' }),
  },
  'iterator/for-each': {
    modules: ['es.iterator.for-each'],
    template: $prototype({ namespace: 'Iterator', method: 'forEach' }),
  },
  'iterator/virtual/for-each': {
    modules: ['es.iterator.for-each'],
    template: $virtual({ namespace: 'Iterator', method: 'forEach' }),
  },
  'iterator/map': {
    modules: ['es.iterator.map'],
    template: $prototype({ namespace: 'Iterator', method: 'map' }),
  },
  'iterator/virtual/map': {
    modules: ['es.iterator.map'],
    template: $virtual({ namespace: 'Iterator', method: 'map' }),
  },
  'iterator/reduce': {
    modules: ['es.iterator.reduce'],
    template: $prototype({ namespace: 'Iterator', method: 'reduce' }),
  },
  'iterator/virtual/reduce': {
    modules: ['es.iterator.reduce'],
    template: $virtual({ namespace: 'Iterator', method: 'reduce' }),
  },
  'iterator/some': {
    modules: ['es.iterator.some'],
    template: $prototype({ namespace: 'Iterator', method: 'some' }),
  },
  'iterator/virtual/some': {
    modules: ['es.iterator.some'],
    template: $virtual({ namespace: 'Iterator', method: 'some' }),
  },
  'iterator/take': {
    modules: ['es.iterator.take'],
    template: $prototype({ namespace: 'Iterator', method: 'take' }),
  },
  'iterator/virtual/take': {
    modules: ['es.iterator.take'],
    template: $virtual({ namespace: 'Iterator', method: 'take' }),
  },
  'iterator/to-array': {
    modules: ['es.iterator.to-array'],
    template: $prototype({ namespace: 'Iterator', method: 'toArray' }),
  },
  'iterator/virtual/to-array': {
    modules: ['es.iterator.to-array'],
    template: $virtual({ namespace: 'Iterator', method: 'toArray' }),
  },
  'iterator/to-async': {
    modules: ['esnext.iterator.to-async'],
    template: $prototype({ namespace: 'Iterator', method: 'toAsync' }),
  },
  'iterator/virtual/to-async': {
    modules: ['esnext.iterator.to-async'],
    template: $virtual({ namespace: 'Iterator', method: 'toAsync' }),
  },
  'iterator/windows': {
    modules: ['esnext.iterator.windows'],
    template: $prototype({ namespace: 'Iterator', method: 'windows' }),
  },
  'iterator/virtual/windows': {
    modules: ['esnext.iterator.windows'],
    template: $virtual({ namespace: 'Iterator', method: 'windows' }),
  },
  'json/index': {
    modules: [/^(?:es|esnext)\.json\./],
    template: $namespace,
    name: 'JSON',
  },
  'json/is-raw-json': {
    modules: ['esnext.json.is-raw-json'],
    template: $static,
    namespace: 'JSON',
    name: 'isRawJSON',
  },
  'json/parse': {
    modules: ['esnext.json.parse'],
    template: $static,
    namespace: 'JSON',
    name: 'parse',
  },
  'json/raw-json': {
    modules: ['esnext.json.raw-json'],
    template: $static,
    namespace: 'JSON',
    name: 'rawJSON',
  },
  'json/stringify': {
    modules: ['es.json.stringify'],
    template: $patchableStatic,
    namespace: 'JSON',
    name: 'stringify',
  },
  'map/index': {
    modules: [/^(?:es|esnext)\.map\./],
    template: $namespace,
    name: 'Map',
  },
  'map/constructor': {
    modules: [...MapWithPrototype],
    template: $namespace,
    name: 'Map',
  },
  'map/get-or-insert': {
    modules: ['esnext.map.get-or-insert'],
    template: $prototype({ namespace: 'Map', method: 'getOrInsert' }),
  },
  'map/virtual/get-or-insert': {
    modules: ['esnext.map.get-or-insert'],
    template: $virtual({ namespace: 'Map', method: 'getOrInsert' }),
  },
  'map/get-or-insert-computed': {
    modules: ['esnext.map.get-or-insert-computed'],
    template: $prototype({ namespace: 'Map', method: 'getOrInsertComputed' }),
  },
  'map/virtual/get-or-insert-computed': {
    modules: ['esnext.map.get-or-insert-computed'],
    template: $virtual({ namespace: 'Map', method: 'getOrInsertComputed' }),
  },
  'map/from': {
    modules: ['esnext.map.from', ...MapWithPrototype],
    necessary: ['esnext.map.from'],
    template: $static,
    namespace: 'Map',
    name: 'from',
  },
  'map/group-by': {
    modules: ['es.map.group-by', ...MapWithPrototype],
    template: $static,
    namespace: 'Map',
    name: 'groupBy',
  },
  'map/of': {
    modules: ['esnext.map.of', ...MapWithPrototype],
    necessary: ['esnext.map.of'],
    template: $static,
    namespace: 'Map',
    name: 'of',
  },
  'math/index': {
    modules: [/^(?:es|esnext)\.math\./],
    template: $namespace,
    name: 'Math',
  },
  'math/acosh': {
    modules: ['es.math.acosh'],
    template: $static,
    namespace: 'Math',
    name: 'acosh',
  },
  'math/asinh': {
    modules: ['es.math.asinh'],
    template: $static,
    namespace: 'Math',
    name: 'asinh',
  },
  'math/atanh': {
    modules: ['es.math.atanh'],
    template: $static,
    namespace: 'Math',
    name: 'atanh',
  },
  'math/cbrt': {
    modules: ['es.math.cbrt'],
    template: $static,
    namespace: 'Math',
    name: 'cbrt',
  },
  'math/clz32': {
    modules: ['es.math.clz32'],
    template: $static,
    namespace: 'Math',
    name: 'clz32',
  },
  'math/cosh': {
    modules: ['es.math.cosh'],
    template: $static,
    namespace: 'Math',
    name: 'cosh',
  },
  'math/expm1': {
    modules: ['es.math.expm1'],
    template: $static,
    namespace: 'Math',
    name: 'expm1',
  },
  'math/fround': {
    modules: ['es.math.fround'],
    template: $static,
    namespace: 'Math',
    name: 'fround',
  },
  'math/f16round': {
    modules: ['es.math.f16round'],
    template: $static,
    namespace: 'Math',
    name: 'f16round',
  },
  'math/hypot': {
    modules: ['es.math.hypot'],
    template: $static,
    namespace: 'Math',
    name: 'hypot',
  },
  'math/imul': {
    modules: ['es.math.imul'],
    template: $static,
    namespace: 'Math',
    name: 'imul',
  },
  'math/log10': {
    modules: ['es.math.log10'],
    template: $static,
    namespace: 'Math',
    name: 'log10',
  },
  'math/log1p': {
    modules: ['es.math.log1p'],
    template: $static,
    namespace: 'Math',
    name: 'log1p',
  },
  'math/log2': {
    modules: ['es.math.log2'],
    template: $static,
    namespace: 'Math',
    name: 'log2',
  },
  'math/sign': {
    modules: ['es.math.sign'],
    template: $static,
    namespace: 'Math',
    name: 'sign',
  },
  'math/sinh': {
    modules: ['es.math.sinh'],
    template: $static,
    namespace: 'Math',
    name: 'sinh',
  },
  'math/sum-precise': {
    modules: ['es.math.sum-precise'],
    template: $static,
    namespace: 'Math',
    name: 'sumPrecise',
  },
  'math/tanh': {
    modules: ['es.math.tanh'],
    template: $static,
    namespace: 'Math',
    name: 'tanh',
  },
  'math/trunc': {
    modules: ['es.math.trunc'],
    template: $static,
    namespace: 'Math',
    name: 'trunc',
  },
  'number/index': {
    modules: [/^(?:es|esnext)\.number\./],
    template: $namespace,
    name: 'Number',
  },
  'number/constructor': {
    modules: ['es.number.constructor'],
    template: $namespace,
    name: 'Number',
  },
  'number/clamp': {
    modules: ['esnext.number.clamp'],
    template: $prototype({ namespace: 'Number', method: 'clamp' }),
  },
  'number/virtual/clamp': {
    modules: ['esnext.number.clamp'],
    template: $virtual({ namespace: 'Number', method: 'clamp' }),
  },
  'number/epsilon': {
    modules: ['es.number.epsilon'],
    template: $static,
    namespace: 'Number',
    name: 'EPSILON',
  },
  'number/is-finite': {
    modules: ['es.number.is-finite'],
    template: $static,
    namespace: 'Number',
    name: 'isFinite',
  },
  'number/is-integer': {
    modules: ['es.number.is-integer'],
    template: $static,
    namespace: 'Number',
    name: 'isInteger',
  },
  'number/is-nan': {
    modules: ['es.number.is-nan'],
    template: $static,
    namespace: 'Number',
    name: 'isNaN',
  },
  'number/is-safe-integer': {
    modules: ['es.number.is-safe-integer'],
    template: $static,
    namespace: 'Number',
    name: 'isSafeInteger',
  },
  'number/max-safe-integer': {
    modules: ['es.number.max-safe-integer'],
    template: $static,
    namespace: 'Number',
    name: 'MAX_SAFE_INTEGER',
  },
  'number/min-safe-integer': {
    modules: ['es.number.min-safe-integer'],
    template: $static,
    namespace: 'Number',
    name: 'MIN_SAFE_INTEGER',
  },
  'number/parse-float': {
    modules: ['es.number.parse-float'],
    template: $static,
    namespace: 'Number',
    name: 'parseFloat',
  },
  'number/parse-int': {
    modules: ['es.number.parse-int'],
    template: $static,
    namespace: 'Number',
    name: 'parseInt',
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
  'object/index': {
    modules: [/^(?:es|esnext)\.object\./],
    template: $namespace,
    name: 'Object',
  },
  'object/assign': {
    modules: ['es.object.assign'],
    template: $static,
    namespace: 'Object',
    name: 'assign',
  },
  'object/create': {
    modules: [],
    enforce: true,
    template: $patchableStatic,
    namespace: 'Object',
    name: 'create',
  },
  'object/define-property': {
    modules: [],
    enforce: true,
    template: $patchableStatic,
    namespace: 'Object',
    name: 'defineProperty',
  },
  'object/define-properties': {
    modules: [],
    enforce: true,
    template: $patchableStatic,
    namespace: 'Object',
    name: 'defineProperties',
  },
  'object/define-getter': {
    modules: ['es.object.define-getter'],
    template: $prototype({ namespace: 'Object', method: '__defineGetter__' }),
  },
  'object/virtual/define-getter': {
    modules: ['es.object.define-getter'],
    template: $virtual({ namespace: 'Object', method: '__defineGetter__' }),
  },
  'object/define-setter': {
    modules: ['es.object.define-setter'],
    template: $prototype({ namespace: 'Object', method: '__defineSetter__' }),
  },
  'object/virtual/define-setter': {
    modules: ['es.object.define-setter'],
    template: $virtual({ namespace: 'Object', method: '__defineSetter__' }),
  },
  'object/entries': {
    modules: ['es.object.entries'],
    template: $static,
    namespace: 'Object',
    name: 'entries',
  },
  'object/freeze': {
    modules: ['es.object.freeze'],
    template: $static,
    namespace: 'Object',
    name: 'freeze',
  },
  'object/from-entries': {
    modules: ['es.object.from-entries'],
    template: $static,
    namespace: 'Object',
    name: 'fromEntries',
  },
  'object/get-own-property-descriptor': {
    modules: ['es.object.get-own-property-descriptor'],
    template: $patchableStatic,
    namespace: 'Object',
    name: 'getOwnPropertyDescriptor',
  },
  'object/get-own-property-descriptors': {
    modules: ['es.object.get-own-property-descriptors'],
    template: $static,
    namespace: 'Object',
    name: 'getOwnPropertyDescriptors',
  },
  'object/get-own-property-names': {
    modules: ['es.object.get-own-property-names'],
    template: $patchableStatic,
    namespace: 'Object',
    name: 'getOwnPropertyNames',
  },
  'object/get-own-property-symbols': {
    modules: ['es.object.get-own-property-symbols'],
    template: $static,
    namespace: 'Object',
    name: 'getOwnPropertySymbols',
  },
  'object/get-prototype-of': {
    modules: ['es.object.get-prototype-of'],
    template: $static,
    namespace: 'Object',
    name: 'getPrototypeOf',
  },
  'object/group-by': {
    modules: ['es.object.group-by'],
    template: $static,
    namespace: 'Object',
    name: 'groupBy',
  },
  'object/has-own': {
    modules: ['es.object.has-own'],
    template: $static,
    namespace: 'Object',
    name: 'hasOwn',
  },
  'object/is': {
    modules: ['es.object.is'],
    template: $static,
    namespace: 'Object',
    name: 'is',
  },
  'object/is-extensible': {
    modules: ['es.object.is-extensible'],
    template: $static,
    namespace: 'Object',
    name: 'isExtensible',
  },
  'object/is-frozen': {
    modules: ['es.object.is-frozen'],
    template: $static,
    namespace: 'Object',
    name: 'isFrozen',
  },
  'object/is-sealed': {
    modules: ['es.object.is-sealed'],
    template: $static,
    namespace: 'Object',
    name: 'isSealed',
  },
  'object/keys': {
    modules: ['es.object.keys'],
    template: $static,
    namespace: 'Object',
    name: 'keys',
  },
  'object/lookup-getter': {
    modules: ['es.object.lookup-getter'],
    template: $prototype({ namespace: 'Object', method: '__lookupGetter__' }),
  },
  'object/virtual/lookup-getter': {
    modules: ['es.object.lookup-getter'],
    template: $virtual({ namespace: 'Object', method: '__lookupGetter__' }),
  },
  'object/lookup-setter': {
    modules: ['es.object.lookup-setter'],
    template: $prototype({ namespace: 'Object', method: '__lookupSetter__' }),
  },
  'object/virtual/lookup-setter': {
    modules: ['es.object.lookup-setter'],
    template: $virtual({ namespace: 'Object', method: '__lookupSetter__' }),
  },
  'object/prevent-extensions': {
    modules: ['es.object.prevent-extensions'],
    template: $static,
    namespace: 'Object',
    name: 'preventExtensions',
  },
  'object/proto': {
    modules: ['es.object.proto'],
    template: $justImport,
  },
  'object/seal': {
    modules: ['es.object.seal'],
    template: $static,
    namespace: 'Object',
    name: 'seal',
  },
  'object/set-prototype-of': {
    modules: ['es.object.set-prototype-of'],
    template: $static,
    namespace: 'Object',
    name: 'setPrototypeOf',
  },
  'object/to-string': {
    modules: ['es.object.to-string'],
    template: $prototype({ namespace: 'Object', method: 'toString' }),
  },
  'object/virtual/to-string': {
    modules: ['es.object.to-string'],
    template: $virtual({ namespace: 'Object', method: 'toString' }),
  },
  'object/values': {
    modules: ['es.object.values'],
    template: $static,
    namespace: 'Object',
    name: 'values',
  },
  'promise/index': {
    modules: [/^(?:es|esnext)\.promise\./],
    template: $namespace,
    name: 'Promise',
  },
  'promise/constructor': {
    modules: [...PromiseWithPrototype],
    template: $namespace,
    name: 'Promise',
  },
  'promise/all': {
    modules: ['es.promise.all'],
    template: $staticWithContext,
    namespace: 'Promise',
    name: 'all',
  },
  'promise/all-settled': {
    modules: ['es.promise.all-settled'],
    template: $staticWithContext,
    namespace: 'Promise',
    name: 'allSettled',
  },
  'promise/any': {
    modules: ['es.promise.any'],
    template: $staticWithContext,
    namespace: 'Promise',
    name: 'any',
  },
  'promise/catch': {
    modules: ['es.promise.catch'],
    template: $prototype({ namespace: 'Promise', method: 'catch' }),
  },
  'promise/virtual/catch': {
    modules: ['es.promise.catch'],
    template: $virtual({ namespace: 'Promise', method: 'catch' }),
  },
  'promise/finally': {
    modules: ['es.promise.finally'],
    template: $prototype({ namespace: 'Promise', method: 'finally' }),
  },
  'promise/virtual/finally': {
    modules: ['es.promise.finally'],
    template: $virtual({ namespace: 'Promise', method: 'finally' }),
  },
  'promise/race': {
    modules: ['es.promise.race'],
    template: $staticWithContext,
    namespace: 'Promise',
    name: 'race',
  },
  'promise/reject': {
    modules: ['es.promise.reject'],
    template: $staticWithContext,
    namespace: 'Promise',
    name: 'reject',
  },
  'promise/resolve': {
    modules: ['es.promise.resolve'],
    template: $staticWithContext,
    namespace: 'Promise',
    name: 'resolve',
  },
  'promise/try': {
    modules: ['es.promise.try'],
    template: $staticWithContext,
    namespace: 'Promise',
    name: 'try',
  },
  'promise/with-resolvers': {
    modules: ['es.promise.with-resolvers'],
    template: $staticWithContext,
    namespace: 'Promise',
    name: 'withResolvers',
  },
  'reflect/index': {
    modules: [/^(?:es|esnext)\.reflect\./],
    template: $namespace,
    name: 'Reflect',
  },
  'reflect/apply': {
    modules: ['es.reflect.apply'],
    template: $static,
    namespace: 'Reflect',
    name: 'apply',
  },
  'reflect/construct': {
    modules: ['es.reflect.construct'],
    template: $static,
    namespace: 'Reflect',
    name: 'construct',
  },
  'reflect/define-property': {
    modules: ['es.reflect.define-property'],
    template: $static,
    namespace: 'Reflect',
    name: 'defineProperty',
  },
  'reflect/delete-property': {
    modules: ['es.reflect.delete-property'],
    template: $static,
    namespace: 'Reflect',
    name: 'deleteProperty',
  },
  'reflect/get-own-property-descriptor': {
    modules: ['es.reflect.get-own-property-descriptor'],
    template: $static,
    namespace: 'Reflect',
    name: 'getOwnPropertyDescriptor',
  },
  'reflect/get-prototype-of': {
    modules: ['es.reflect.get-prototype-of'],
    template: $static,
    namespace: 'Reflect',
    name: 'getPrototypeOf',
  },
  'reflect/get': {
    modules: ['es.reflect.get'],
    template: $static,
    namespace: 'Reflect',
    name: 'get',
  },
  'reflect/has': {
    modules: ['es.reflect.has'],
    template: $static,
    namespace: 'Reflect',
    name: 'has',
  },
  'reflect/is-extensible': {
    modules: ['es.reflect.is-extensible'],
    template: $static,
    namespace: 'Reflect',
    name: 'isExtensible',
  },
  'reflect/own-keys': {
    modules: ['es.reflect.own-keys'],
    template: $static,
    namespace: 'Reflect',
    name: 'ownKeys',
  },
  'reflect/prevent-extensions': {
    modules: ['es.reflect.prevent-extensions'],
    template: $static,
    namespace: 'Reflect',
    name: 'preventExtensions',
  },
  'reflect/set-prototype-of': {
    modules: ['es.reflect.set-prototype-of'],
    template: $static,
    namespace: 'Reflect',
    name: 'setPrototypeOf',
  },
  'reflect/set': {
    modules: ['es.reflect.set'],
    template: $static,
    namespace: 'Reflect',
    name: 'set',
  },
  'regexp/index': {
    modules: [/^(?:es|esnext)\.regexp\./, /^es\.string\.(?:match|replace|search|split)$/],
    template: $justImport,
  },
  'regexp/constructor': {
    modules: [/^es\.regexp\.(?:constructor|dot-all|sticky)$/],
    template: $justImport,
  },
  'regexp/escape': {
    modules: ['es.regexp.escape'],
    template: $static,
    namespace: 'RegExp',
    name: 'escape',
  },
  'regexp/dot-all': {
    modules: ['es.regexp.dot-all', 'es.regexp.constructor'],
    template: $justImport,
  },
  'regexp/flags': {
    modules: ['es.regexp.flags'],
    template: $helper,
    helper: 'regexp-get-flags',
  },
  'regexp/match': {
    modules: ['es.string.match'],
    template: $justImport,
  },
  'regexp/replace': {
    modules: ['es.string.replace'],
    template: $justImport,
  },
  'regexp/search': {
    modules: ['es.string.search'],
    template: $justImport,
  },
  'regexp/split': {
    modules: ['es.string.split'],
    template: $justImport,
  },
  'regexp/sticky': {
    modules: ['es.regexp.sticky', 'es.regexp.constructor'],
    template: $justImport,
  },
  'regexp/test': {
    modules: ['es.regexp.test'],
    template: $prototype({ namespace: 'RegExp', method: 'test' }),
  },
  'regexp/to-string': {
    modules: ['es.regexp.to-string'],
    template: $justImport,
  },
  'set/index': {
    modules: [/^(?:es|esnext)\.set\./],
    template: $namespace,
    name: 'Set',
  },
  'set/constructor': {
    modules: [...SetWithPrototype],
    template: $namespace,
    name: 'Set',
  },
  'set/difference': {
    modules: ['es.set.difference'],
    template: $prototype({ namespace: 'Set', method: 'difference' }),
  },
  'set/virtual/difference': {
    modules: ['es.set.difference'],
    template: $virtual({ namespace: 'Set', method: 'difference' }),
  },
  'set/from': {
    modules: ['esnext.set.from', ...SetWithPrototype],
    necessary: ['esnext.set.from'],
    template: $static,
    namespace: 'Set',
    name: 'from',
  },
  'set/intersection': {
    modules: ['es.set.intersection'],
    template: $prototype({ namespace: 'Set', method: 'intersection' }),
  },
  'set/virtual/intersection': {
    modules: ['es.set.intersection'],
    template: $virtual({ namespace: 'Set', method: 'intersection' }),
  },
  'set/is-disjoint-from': {
    modules: ['es.set.is-disjoint-from'],
    template: $prototype({ namespace: 'Set', method: 'isDisjointFrom' }),
  },
  'set/virtual/is-disjoint-from': {
    modules: ['es.set.is-disjoint-from'],
    template: $virtual({ namespace: 'Set', method: 'isDisjointFrom' }),
  },
  'set/is-subset-of': {
    modules: ['es.set.is-subset-of'],
    template: $prototype({ namespace: 'Set', method: 'isSubsetOf' }),
  },
  'set/virtual/is-subset-of': {
    modules: ['es.set.is-subset-of'],
    template: $virtual({ namespace: 'Set', method: 'isSubsetOf' }),
  },
  'set/is-superset-of': {
    modules: ['es.set.is-superset-of'],
    template: $prototype({ namespace: 'Set', method: 'isSupersetOf' }),
  },
  'set/virtual/is-superset-of': {
    modules: ['es.set.is-superset-of'],
    template: $virtual({ namespace: 'Set', method: 'isSupersetOf' }),
  },
  'set/of': {
    modules: ['esnext.set.of', ...SetWithPrototype],
    necessary: ['esnext.set.of'],
    template: $static,
    namespace: 'Set',
    name: 'of',
  },
  'set/symmetric-difference': {
    modules: ['es.set.symmetric-difference'],
    template: $prototype({ namespace: 'Set', method: 'symmetricDifference' }),
  },
  'set/virtual/symmetric-difference': {
    modules: ['es.set.symmetric-difference'],
    template: $virtual({ namespace: 'Set', method: 'symmetricDifference' }),
  },
  'set/union': {
    modules: ['es.set.union'],
    template: $prototype({ namespace: 'Set', method: 'union' }),
  },
  'set/virtual/union': {
    modules: ['es.set.union'],
    template: $virtual({ namespace: 'Set', method: 'union' }),
  },
  'string/index': {
    modules: [/^(?:es|esnext)\.string\./],
    template: $namespace,
    name: 'String',
  },
  'string/anchor': {
    modules: ['es.string.anchor'],
    template: $prototype({ namespace: 'String', method: 'anchor' }),
  },
  'string/virtual/anchor': {
    modules: ['es.string.anchor'],
    template: $virtual({ namespace: 'String', method: 'anchor' }),
  },
  'string/at': {
    modules: ['es.string.at'],
    template: $prototype({ namespace: 'String', method: 'at' }),
  },
  'string/virtual/at': {
    modules: ['es.string.at'],
    template: $virtual({ namespace: 'String', method: 'at' }),
  },
  'string/big': {
    modules: ['es.string.big'],
    template: $prototype({ namespace: 'String', method: 'big' }),
  },
  'string/virtual/big': {
    modules: ['es.string.big'],
    template: $virtual({ namespace: 'String', method: 'big' }),
  },
  'string/blink': {
    modules: ['es.string.blink'],
    template: $prototype({ namespace: 'String', method: 'blink' }),
  },
  'string/virtual/blink': {
    modules: ['es.string.blink'],
    template: $virtual({ namespace: 'String', method: 'blink' }),
  },
  'string/bold': {
    modules: ['es.string.bold'],
    template: $prototype({ namespace: 'String', method: 'bold' }),
  },
  'string/virtual/bold': {
    modules: ['es.string.bold'],
    template: $virtual({ namespace: 'String', method: 'bold' }),
  },
  'string/code-point-at': {
    modules: ['es.string.code-point-at'],
    template: $prototype({ namespace: 'String', method: 'codePointAt' }),
  },
  'string/virtual/code-point-at': {
    modules: ['es.string.code-point-at'],
    template: $virtual({ namespace: 'String', method: 'codePointAt' }),
  },
  'string/cooked': {
    modules: ['esnext.string.cooked'],
    template: $static,
    namespace: 'String',
    name: 'cooked',
  },
  'string/dedent': {
    modules: ['esnext.string.dedent'],
    template: $static,
    namespace: 'String',
    name: 'dedent',
  },
  'string/ends-with': {
    modules: ['es.string.ends-with'],
    template: $prototype({ namespace: 'String', method: 'endsWith' }),
  },
  'string/virtual/ends-with': {
    modules: ['es.string.ends-with'],
    template: $virtual({ namespace: 'String', method: 'endsWith' }),
  },
  'string/fixed': {
    modules: ['es.string.fixed'],
    template: $prototype({ namespace: 'String', method: 'fixed' }),
  },
  'string/virtual/fixed': {
    modules: ['es.string.fixed'],
    template: $virtual({ namespace: 'String', method: 'fixed' }),
  },
  'string/fontcolor': {
    modules: ['es.string.fontcolor'],
    template: $prototype({ namespace: 'String', method: 'fontcolor' }),
  },
  'string/virtual/fontcolor': {
    modules: ['es.string.fontcolor'],
    template: $virtual({ namespace: 'String', method: 'fontcolor' }),
  },
  'string/fontsize': {
    modules: ['es.string.fontsize'],
    template: $prototype({ namespace: 'String', method: 'fontsize' }),
  },
  'string/virtual/fontsize': {
    modules: ['es.string.fontsize'],
    template: $virtual({ namespace: 'String', method: 'fontsize' }),
  },
  'string/from-code-point': {
    modules: ['es.string.from-code-point'],
    template: $static,
    namespace: 'String',
    name: 'fromCodePoint',
  },
  'string/includes': {
    modules: ['es.string.includes'],
    template: $prototype({ namespace: 'String', method: 'includes' }),
  },
  'string/virtual/includes': {
    modules: ['es.string.includes'],
    template: $virtual({ namespace: 'String', method: 'includes' }),
  },
  'string/is-well-formed': {
    modules: ['es.string.is-well-formed'],
    template: $prototype({ namespace: 'String', method: 'isWellFormed' }),
  },
  'string/virtual/is-well-formed': {
    modules: ['es.string.is-well-formed'],
    template: $virtual({ namespace: 'String', method: 'isWellFormed' }),
  },
  'string/italics': {
    modules: ['es.string.italics'],
    template: $prototype({ namespace: 'String', method: 'italics' }),
  },
  'string/virtual/italics': {
    modules: ['es.string.italics'],
    template: $virtual({ namespace: 'String', method: 'italics' }),
  },
  'string/iterator': {
    modules: ['es.string.iterator'],
    template: $prototypeIterator,
    source: "''",
  },
  'string/virtual/iterator': {
    modules: ['es.string.iterator'],
    template: $virtualIterator,
    source: "''",
  },
  'string/link': {
    modules: ['es.string.link'],
    template: $prototype({ namespace: 'String', method: 'link' }),
  },
  'string/virtual/link': {
    modules: ['es.string.link'],
    template: $virtual({ namespace: 'String', method: 'link' }),
  },
  'string/match': {
    modules: ['es.string.match'],
    template: $prototype({ namespace: 'String', method: 'match' }),
  },
  'string/virtual/match': {
    modules: ['es.string.match'],
    template: $virtual({ namespace: 'String', method: 'match' }),
  },
  'string/match-all': {
    modules: ['es.string.match-all'],
    template: $prototype({ namespace: 'String', method: 'matchAll' }),
  },
  'string/virtual/match-all': {
    modules: ['es.string.match-all'],
    template: $virtual({ namespace: 'String', method: 'matchAll' }),
  },
  'string/pad-end': {
    modules: ['es.string.pad-end'],
    template: $prototype({ namespace: 'String', method: 'padEnd' }),
  },
  'string/virtual/pad-end': {
    modules: ['es.string.pad-end'],
    template: $virtual({ namespace: 'String', method: 'padEnd' }),
  },
  'string/pad-start': {
    modules: ['es.string.pad-start'],
    template: $prototype({ namespace: 'String', method: 'padStart' }),
  },
  'string/virtual/pad-start': {
    modules: ['es.string.pad-start'],
    template: $virtual({ namespace: 'String', method: 'padStart' }),
  },
  'string/raw': {
    modules: ['es.string.raw'],
    template: $static,
    namespace: 'String',
    name: 'raw',
  },
  'string/repeat': {
    modules: ['es.string.repeat'],
    template: $prototype({ namespace: 'String', method: 'repeat' }),
  },
  'string/virtual/repeat': {
    modules: ['es.string.repeat'],
    template: $virtual({ namespace: 'String', method: 'repeat' }),
  },
  'string/replace': {
    modules: ['es.string.replace'],
    template: $prototype({ namespace: 'String', method: 'replace' }),
  },
  'string/virtual/replace': {
    modules: ['es.string.replace'],
    template: $virtual({ namespace: 'String', method: 'replace' }),
  },
  'string/replace-all': {
    modules: ['es.string.replace-all'],
    template: $prototype({ namespace: 'String', method: 'replaceAll' }),
  },
  'string/virtual/replace-all': {
    modules: ['es.string.replace-all'],
    template: $virtual({ namespace: 'String', method: 'replaceAll' }),
  },
  'string/search': {
    modules: ['es.string.search'],
    template: $prototype({ namespace: 'String', method: 'search' }),
  },
  'string/virtual/search': {
    modules: ['es.string.search'],
    template: $virtual({ namespace: 'String', method: 'search' }),
  },
  'string/small': {
    modules: ['es.string.small'],
    template: $prototype({ namespace: 'String', method: 'small' }),
  },
  'string/virtual/small': {
    modules: ['es.string.small'],
    template: $virtual({ namespace: 'String', method: 'small' }),
  },
  'string/split': {
    modules: ['es.string.split'],
    template: $prototype({ namespace: 'String', method: 'split' }),
  },
  'string/virtual/split': {
    modules: ['es.string.split'],
    template: $virtual({ namespace: 'String', method: 'split' }),
  },
  'string/starts-with': {
    modules: ['es.string.starts-with'],
    template: $prototype({ namespace: 'String', method: 'startsWith' }),
  },
  'string/virtual/starts-with': {
    modules: ['es.string.starts-with'],
    template: $virtual({ namespace: 'String', method: 'startsWith' }),
  },
  'string/strike': {
    modules: ['es.string.strike'],
    template: $prototype({ namespace: 'String', method: 'strike' }),
  },
  'string/virtual/strike': {
    modules: ['es.string.strike'],
    template: $virtual({ namespace: 'String', method: 'strike' }),
  },
  'string/sub': {
    modules: ['es.string.sub'],
    template: $prototype({ namespace: 'String', method: 'sub' }),
  },
  'string/virtual/sub': {
    modules: ['es.string.sub'],
    template: $virtual({ namespace: 'String', method: 'sub' }),
  },
  'string/sup': {
    modules: ['es.string.sup'],
    template: $prototype({ namespace: 'String', method: 'sup' }),
  },
  'string/virtual/sup': {
    modules: ['es.string.sup'],
    template: $virtual({ namespace: 'String', method: 'sup' }),
  },
  'string/to-well-formed': {
    modules: ['es.string.to-well-formed'],
    template: $prototype({ namespace: 'String', method: 'toWellFormed' }),
  },
  'string/virtual/to-well-formed': {
    modules: ['es.string.to-well-formed'],
    template: $virtual({ namespace: 'String', method: 'toWellFormed' }),
  },
  'string/trim': {
    modules: ['es.string.trim'],
    template: $prototype({ namespace: 'String', method: 'trim' }),
  },
  'string/virtual/trim': {
    modules: ['es.string.trim'],
    template: $virtual({ namespace: 'String', method: 'trim' }),
  },
  'string/trim-end': {
    modules: ['es.string.trim-end'],
    template: $prototype({ namespace: 'String', method: 'trimEnd' }),
  },
  'string/virtual/trim-end': {
    modules: ['es.string.trim-end'],
    template: $virtual({ namespace: 'String', method: 'trimEnd' }),
  },
  'string/trim-left': {
    modules: ['es.string.trim-left'],
    template: $prototype({ namespace: 'String', method: 'trimLeft' }),
  },
  'string/virtual/trim-left': {
    modules: ['es.string.trim-left'],
    template: $virtual({ namespace: 'String', method: 'trimLeft' }),
  },
  'string/trim-right': {
    modules: ['es.string.trim-right'],
    template: $prototype({ namespace: 'String', method: 'trimRight' }),
  },
  'string/virtual/trim-right': {
    modules: ['es.string.trim-right'],
    template: $virtual({ namespace: 'String', method: 'trimRight' }),
  },
  'string/trim-start': {
    modules: ['es.string.trim-start'],
    template: $prototype({ namespace: 'String', method: 'trimStart' }),
  },
  'string/virtual/trim-start': {
    modules: ['es.string.trim-start'],
    template: $virtual({ namespace: 'String', method: 'trimStart' }),
  },
  'suppressed-error/index': {
    modules: [/^(?:es|esnext)\.suppressed-error\./],
    template: $namespace,
    name: 'SuppressedError',
  },
  'suppressed-error/constructor': {
    modules: [/^(?:es|esnext)\.suppressed-error\./],
    template: $namespace,
    name: 'SuppressedError',
  },
  'symbol/index': {
    modules: [/^(?:es|esnext)\.symbol\./],
    template: $namespace,
    name: 'Symbol',
  },
  'symbol/constructor': {
    modules: ['es.symbol.constructor', 'es.symbol.description'],
    template: $namespace,
    name: 'Symbol',
  },
  'symbol/async-dispose': {
    modules: ['es.symbol.async-dispose', 'es.async-iterator.async-dispose'],
    template: $static,
    namespace: 'Symbol',
    name: 'asyncDispose',
  },
  'symbol/async-iterator': {
    modules: ['es.symbol.async-iterator'],
    template: $static,
    namespace: 'Symbol',
    name: 'asyncIterator',
  },
  'symbol/custom-matcher': {
    modules: ['esnext.symbol.custom-matcher'],
    template: $static,
    namespace: 'Symbol',
    name: 'customMatcher',
  },
  'symbol/description': {
    modules: ['es.symbol.description'],
    template: $justImport,
  },
  'symbol/dispose': {
    modules: ['es.symbol.dispose', 'es.iterator.dispose'],
    template: $static,
    namespace: 'Symbol',
    name: 'dispose',
  },
  'symbol/for': {
    modules: ['es.symbol.for'],
    template: $static,
    namespace: 'Symbol',
    name: 'for',
  },
  'symbol/has-instance': {
    modules: ['es.symbol.has-instance', 'es.function.has-instance'],
    template: $static,
    namespace: 'Symbol',
    name: 'hasInstance',
  },
  'symbol/is-concat-spreadable': {
    modules: ['es.symbol.is-concat-spreadable'],
    template: $static,
    namespace: 'Symbol',
    name: 'isConcatSpreadable',
  },
  'symbol/is-registered-symbol': {
    modules: ['esnext.symbol.is-registered-symbol'],
    template: $static,
    namespace: 'Symbol',
    name: 'isRegisteredSymbol',
  },
  'symbol/is-well-known-symbol': {
    modules: ['esnext.symbol.is-well-known-symbol'],
    template: $static,
    namespace: 'Symbol',
    name: 'isWellKnownSymbol',
  },
  'symbol/iterator': {
    modules: ['es.symbol.iterator', 'es.array.iterator', 'es.string.iterator', 'web.dom-collections.iterator'],
    template: $static,
    namespace: 'Symbol',
    name: 'iterator',
  },
  'symbol/key-for': {
    modules: ['es.symbol.key-for'],
    template: $static,
    namespace: 'Symbol',
    name: 'keyFor',
  },
  'symbol/match': {
    modules: ['es.symbol.match'],
    template: $static,
    namespace: 'Symbol',
    name: 'match',
  },
  'symbol/match-all': {
    modules: ['es.symbol.match-all'],
    template: $static,
    namespace: 'Symbol',
    name: 'matchAll',
  },
  'symbol/metadata': {
    modules: ['esnext.symbol.metadata', 'esnext.function.metadata'],
    template: $static,
    namespace: 'Symbol',
    name: 'metadata',
  },
  'symbol/replace': {
    modules: ['es.symbol.replace'],
    template: $static,
    namespace: 'Symbol',
    name: 'replace',
  },
  'symbol/search': {
    modules: ['es.symbol.search'],
    template: $static,
    namespace: 'Symbol',
    name: 'search',
  },
  'symbol/species': {
    modules: ['es.symbol.species'],
    template: $static,
    namespace: 'Symbol',
    name: 'species',
  },
  'symbol/split': {
    modules: ['es.symbol.split'],
    template: $static,
    namespace: 'Symbol',
    name: 'split',
  },
  'symbol/to-primitive': {
    modules: ['es.symbol.to-primitive', 'es.date.to-primitive'],
    template: $static,
    namespace: 'Symbol',
    name: 'toPrimitive',
  },
  'symbol/to-string-tag': {
    modules: ['es.symbol.to-string-tag', 'es.object.to-string', 'es.json.to-string-tag', 'es.math.to-string-tag'],
    template: $static,
    namespace: 'Symbol',
    name: 'toStringTag',
  },
  'symbol/unscopables': {
    modules: ['es.symbol.unscopables'],
    template: $static,
    namespace: 'Symbol',
    name: 'unscopables',
  },
  'typed-array/index': {
    modules: [/^(?:es|esnext)\.typed-array\./],
    template: $path,
  },
  'typed-array/float32-array': {
    modules: ['es.typed-array.float32-array', ...TypedArrayMethods],
    template: $namespace,
    name: 'Float32Array',
  },
  'typed-array/float64-array': {
    modules: ['es.typed-array.float64-array', ...TypedArrayMethods],
    template: $namespace,
    name: 'Float64Array',
  },
  'typed-array/int8-array': {
    modules: ['es.typed-array.int8-array', ...TypedArrayMethods],
    template: $namespace,
    name: 'Int8Array',
  },
  'typed-array/int16-array': {
    modules: ['es.typed-array.int16-array', ...TypedArrayMethods],
    template: $namespace,
    name: 'Int16Array',
  },
  'typed-array/int32-array': {
    modules: ['es.typed-array.int32-array', ...TypedArrayMethods],
    template: $namespace,
    name: 'Int32Array',
  },
  'typed-array/uint8-array': {
    modules: ['es.typed-array.uint8-array', ...Uint8ArrayPrototypeMethods],
    template: $namespace,
    name: 'Uint8Array',
  },
  'typed-array/uint8-clamped-array': {
    modules: ['es.typed-array.uint8-clamped-array', ...TypedArrayMethods],
    template: $namespace,
    name: 'Uint8ClampedArray',
  },
  'typed-array/uint16-array': {
    modules: ['es.typed-array.uint16-array', ...TypedArrayMethods],
    template: $namespace,
    name: 'Uint16Array',
  },
  'typed-array/uint32-array': {
    modules: ['es.typed-array.uint32-array', ...TypedArrayMethods],
    template: $namespace,
    name: 'Uint32Array',
  },
  'typed-array/from': {
    modules: ['es.typed-array.from'],
    template: $justImport,
  },
  'typed-array/from-base64': {
    modules: ['es.uint8-array.from-base64'],
    template: $justImport,
  },
  'typed-array/from-hex': {
    modules: ['es.uint8-array.from-hex'],
    template: $justImport,
  },
  'typed-array/of': {
    modules: ['es.typed-array.of'],
    template: $justImport,
  },
  'typed-array/at': {
    modules: ['es.typed-array.at'],
    template: $justImport,
  },
  'typed-array/copy-within': {
    modules: ['es.typed-array.copy-within'],
    template: $justImport,
  },
  'typed-array/entries': {
    modules: ['es.typed-array.entries'],
    template: $justImport,
  },
  'typed-array/every': {
    modules: ['es.typed-array.every'],
    template: $justImport,
  },
  'typed-array/fill': {
    modules: ['es.typed-array.fill'],
    template: $justImport,
  },
  'typed-array/filter': {
    modules: ['es.typed-array.filter'],
    template: $justImport,
  },
  'typed-array/filter-reject': {
    modules: ['esnext.typed-array.filter-reject'],
    template: $justImport,
  },
  'typed-array/find': {
    modules: ['es.typed-array.find'],
    template: $justImport,
  },
  'typed-array/find-index': {
    modules: ['es.typed-array.find-index'],
    template: $justImport,
  },
  'typed-array/find-last': {
    modules: ['es.typed-array.find-last'],
    template: $justImport,
  },
  'typed-array/find-last-index': {
    modules: ['es.typed-array.find-last-index'],
    template: $justImport,
  },
  'typed-array/for-each': {
    modules: ['es.typed-array.for-each'],
    template: $justImport,
  },
  'typed-array/includes': {
    modules: ['es.typed-array.includes'],
    template: $justImport,
  },
  'typed-array/index-of': {
    modules: ['es.typed-array.index-of'],
    template: $justImport,
  },
  'typed-array/iterator': {
    modules: ['es.typed-array.iterator'],
    template: $justImport,
  },
  'typed-array/join': {
    modules: ['es.typed-array.join'],
    template: $justImport,
  },
  'typed-array/keys': {
    modules: ['es.typed-array.keys'],
    template: $justImport,
  },
  'typed-array/last-index-of': {
    modules: ['es.typed-array.last-index-of'],
    template: $justImport,
  },
  'typed-array/map': {
    modules: ['es.typed-array.map'],
    template: $justImport,
  },
  'typed-array/reduce': {
    modules: ['es.typed-array.reduce'],
    template: $justImport,
  },
  'typed-array/reduce-right': {
    modules: ['es.typed-array.reduce-right'],
    template: $justImport,
  },
  'typed-array/reverse': {
    modules: ['es.typed-array.reverse'],
    template: $justImport,
  },
  'typed-array/set': {
    modules: ['es.typed-array.set'],
    template: $justImport,
  },
  'typed-array/set-from-base64': {
    modules: ['es.uint8-array.set-from-base64'],
    template: $justImport,
  },
  'typed-array/set-from-hex': {
    modules: ['es.uint8-array.set-from-hex'],
    template: $justImport,
  },
  'typed-array/slice': {
    modules: ['es.typed-array.slice'],
    template: $justImport,
  },
  'typed-array/some': {
    modules: ['es.typed-array.some'],
    template: $justImport,
  },
  'typed-array/sort': {
    modules: ['es.typed-array.sort'],
    template: $justImport,
  },
  'typed-array/subarray': {
    modules: ['es.typed-array.subarray'],
    template: $justImport,
  },
  'typed-array/to-base64': {
    modules: ['es.uint8-array.to-base64'],
    template: $justImport,
  },
  'typed-array/to-hex': {
    modules: ['es.uint8-array.to-hex'],
    template: $justImport,
  },
  'typed-array/to-locale-string': {
    modules: ['es.typed-array.to-locale-string'],
    template: $justImport,
  },
  'typed-array/to-reversed': {
    modules: ['es.typed-array.to-reversed'],
    template: $justImport,
  },
  'typed-array/to-sorted': {
    modules: ['es.typed-array.to-sorted'],
    template: $justImport,
  },
  'typed-array/to-string': {
    modules: ['es.typed-array.to-string'],
    template: $justImport,
  },
  'typed-array/unique-by': {
    modules: ['esnext.typed-array.unique-by'],
    template: $justImport,
  },
  'typed-array/values': {
    modules: ['es.typed-array.values'],
    template: $justImport,
  },
  'typed-array/with': {
    modules: ['es.typed-array.with'],
    template: $justImport,
  },
  'url/index': {
    modules: [/^web\.url(?:-search-params)?\./],
    template: $namespace,
    name: 'URL',
  },
  'url/can-parse': {
    modules: ['web.url.can-parse'],
    template: $static,
    namespace: 'URL',
    name: 'canParse',
  },
  'url/parse': {
    modules: ['web.url.parse'],
    template: $static,
    namespace: 'URL',
    name: 'parse',
  },
  'url/to-json': { // <- ???
    modules: ['web.url.to-json'],
    template: $prototype({ namespace: 'URL', method: 'toJSON' }),
  },
  'url/virtual/to-json': {
    modules: ['web.url.to-json'],
    template: $virtual({ namespace: 'URL', method: 'toJSON' }),
  },
  'url-search-params/index': {
    modules: [/^web\.url-search-params\./],
    template: $namespace,
    name: 'URLSearchParams',
  },
  'weak-map/index': {
    modules: [/^(?:es|esnext)\.weak-map\./],
    template: $namespace,
    name: 'WeakMap',
  },
  'weak-map/constructor': {
    modules: [...WeakMapWithPrototype],
    template: $namespace,
    name: 'WeakMap',
  },
  'weak-map/from': {
    modules: ['esnext.weak-map.from', ...WeakMapWithPrototype],
    necessary: ['esnext.weak-map.from'],
    template: $static,
    namespace: 'WeakMap',
    name: 'from',
  },
  'weak-map/of': {
    modules: ['esnext.weak-map.of', ...WeakMapWithPrototype],
    necessary: ['esnext.weak-map.of'],
    template: $static,
    namespace: 'WeakMap',
    name: 'of',
  },
  'weak-map/get-or-insert': {
    modules: ['esnext.weak-map.get-or-insert'],
    template: $prototype({ namespace: 'WeakMap', method: 'getOrInsert' }),
  },
  'weak-map/virtual/get-or-insert': {
    modules: ['esnext.weak-map.get-or-insert'],
    template: $virtual({ namespace: 'WeakMap', method: 'getOrInsert' }),
  },
  'weak-map/get-or-insert-computed': {
    modules: ['esnext.weak-map.get-or-insert-computed'],
    template: $prototype({ namespace: 'WeakMap', method: 'getOrInsertComputed' }),
  },
  'weak-map/virtual/get-or-insert-computed': {
    modules: ['esnext.weak-map.get-or-insert-computed'],
    template: $virtual({ namespace: 'WeakMap', method: 'getOrInsertComputed' }),
  },
  'weak-set/index': {
    modules: [/^(?:es|esnext)\.weak-set\./],
    template: $namespace,
    name: 'WeakSet',
  },
  'weak-set/constructor': {
    modules: [...WeakSetWithPrototype],
    template: $namespace,
    name: 'WeakSet',
  },
  'weak-set/from': {
    modules: ['esnext.weak-set.from', ...WeakSetWithPrototype],
    necessary: ['esnext.weak-set.from'],
    template: $static,
    namespace: 'WeakSet',
    name: 'from',
  },
  'weak-set/of': {
    modules: ['esnext.weak-set.of', ...WeakSetWithPrototype],
    necessary: ['esnext.weak-set.of'],
    template: $static,
    namespace: 'WeakSet',
    name: 'of',
  },
  atob: {
    modules: ['web.atob'],
    template: $namespace,
    name: 'atob',
  },
  btoa: {
    modules: ['web.btoa'],
    template: $namespace,
    name: 'btoa',
  },
  'clear-immediate': {
    modules: ['web.clear-immediate'],
    template: $namespace,
    name: 'clearImmediate',
  },
  'global-this': {
    modules: ['es.global-this'],
    template: $namespace,
    name: 'globalThis',
  },
  'parse-float': {
    modules: ['es.parse-float'],
    template: $namespace,
    name: 'parseFloat',
  },
  'parse-int': {
    modules: ['es.parse-int'],
    template: $namespace,
    name: 'parseInt',
  },
  'queue-microtask': {
    modules: ['web.queue-microtask'],
    template: $namespace,
    name: 'queueMicrotask',
  },
  self: {
    modules: ['web.self'],
    template: $namespace,
    name: 'self',
  },
  'set-immediate': {
    modules: ['web.set-immediate'],
    template: $namespace,
    name: 'setImmediate',
  },
  'structured-clone': {
    modules: ['web.structured-clone'],
    template: $namespace,
    name: 'structuredClone',
  },
  'get-iterator': {
    modules: ['es.array.iterator', 'es.string.iterator', 'web.dom-collections.iterator'],
    template: $helper,
    helper: 'get-iterator',
  },
  'get-iterator-method': {
    modules: ['es.array.iterator', 'es.string.iterator', 'web.dom-collections.iterator'],
    template: $helper,
    helper: 'get-iterator-method',
  },
  'is-iterable': {
    modules: ['es.array.iterator', 'es.string.iterator', 'web.dom-collections.iterator'],
    template: $helper,
    helper: 'is-iterable',
  },
};

export const proposals = {
  'accessible-object-hasownproperty': {
    link: 'https://github.com/tc39/proposal-accessible-object-hasownproperty',
    stage: 4,
    modules: [
      'es.object.has-own',
    ],
  },
  'array-buffer-base64': {
    link: 'https://github.com/tc39/proposal-arraybuffer-base64',
    stage: 4,
    modules: [
      'es.uint8-array.from-base64',
      'es.uint8-array.from-hex',
      'es.uint8-array.set-from-base64',
      'es.uint8-array.set-from-hex',
      'es.uint8-array.to-base64',
      'es.uint8-array.to-hex',
    ],
  },
  'array-buffer-transfer': {
    link: 'https://github.com/tc39/proposal-arraybuffer-transfer',
    stage: 4,
    modules: [
      'es.array-buffer.detached',
      'es.array-buffer.transfer',
      'es.array-buffer.transfer-to-fixed-length',
    ],
  },
  'array-filtering': {
    link: 'https://github.com/tc39/proposal-array-filtering',
    stage: 1,
    modules: [
      'esnext.array.filter-reject',
      'esnext.typed-array.filter-reject',
    ],
  },
  'array-find-from-last': {
    link: 'https://github.com/tc39/proposal-array-find-from-last',
    stage: 4,
    modules: [
      'es.array.find-last',
      'es.array.find-last-index',
      'es.typed-array.find-last',
      'es.typed-array.find-last-index',
    ],
  },
  'array-flat-map': {
    link: 'https://github.com/tc39/proposal-flatMap',
    stage: 4,
    modules: [
      'es.array.flat',
      'es.array.flat-map',
      'es.array.unscopables.flat',
      'es.array.unscopables.flat-map',
    ],
  },
  'array-from-async': {
    link: 'https://github.com/tc39/proposal-array-from-async',
    stage: 4,
    modules: [
      'es.array.from-async',
    ],
  },
  'array-grouping': {
    link: 'https://github.com/tc39/proposal-array-grouping',
    stage: 4,
    modules: [
      'es.map.group-by',
      'es.object.group-by',
    ],
  },
  'array-includes': {
    link: 'https://github.com/tc39/proposal-Array.prototype.includes',
    stage: 4,
    modules: [
      'es.array.includes',
      'es.typed-array.includes',
    ],
  },
  'array-is-template-object': {
    link: 'https://github.com/tc39/proposal-array-is-template-object',
    stage: 2,
    modules: [
      'esnext.array.is-template-object',
    ],
  },
  'array-unique': {
    link: 'https://github.com/tc39/proposal-array-unique',
    stage: 1,
    modules: [
      'esnext.array.unique-by',
      'esnext.typed-array.unique-by',
    ],
  },
  'async-iteration': {
    link: 'https://github.com/tc39/proposal-async-iteration',
    stage: 4,
    modules: [
      'es.symbol.async-iterator',
    ],
  },
  'async-iterator-helpers': {
    link: 'https://github.com/tc39/proposal-async-iterator-helpers',
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
  'change-array-by-copy': {
    link: 'https://github.com/tc39/proposal-change-array-by-copy',
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
  'collection-of-from': {
    link: 'https://github.com/tc39/proposal-setmap-offrom',
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
  'data-view-get-set-uint8-clamped': {
    link: 'https://github.com/tc39/proposal-dataview-get-set-uint8clamped',
    stage: 1,
    modules: [
      'esnext.data-view.get-uint8-clamped',
      'esnext.data-view.set-uint8-clamped',
    ],
  },
  'decorator-metadata': {
    link: 'https://github.com/tc39/proposal-decorator-metadata',
    stage: 3,
    modules: [
      'esnext.function.metadata',
      'esnext.symbol.metadata',
    ],
  },
  'error-cause': {
    link: 'https://github.com/tc39/proposal-error-cause',
    stage: 4,
    modules: [
      'es.error.cause',
      'es.aggregate-error.cause',
    ],
  },
  'explicit-resource-management': {
    link: 'https://github.com/tc39/proposal-explicit-resource-management',
    stage: 4,
    modules: [
      'es.suppressed-error.constructor',
      'es.async-disposable-stack.constructor',
      'es.async-iterator.async-dispose',
      'es.disposable-stack.constructor',
      'es.iterator.dispose',
      'es.symbol.async-dispose',
      'es.symbol.dispose',
    ],
  },
  extractors: {
    link: 'https://github.com/tc39/proposal-extractors',
    stage: 1,
    modules: [
      'esnext.symbol.custom-matcher',
    ],
  },
  float16: {
    link: 'https://github.com/tc39/proposal-float16array',
    stage: 4,
    modules: [
      'es.data-view.get-float16',
      'es.data-view.set-float16',
      'es.math.f16round',
    ],
  },
  'function-demethodize': {
    link: 'https://github.com/js-choi/proposal-function-demethodize',
    stage: 0,
    modules: [
      'esnext.function.demethodize',
    ],
  },
  'global-this': {
    link: 'https://github.com/tc39/proposal-global',
    stage: 4,
    modules: [
      'es.global-this',
    ],
  },
  'is-error': {
    link: 'https://github.com/tc39/proposal-is-error',
    stage: 4,
    modules: [
      'es.error.is-error',
    ],
  },
  'iterator-helpers': {
    link: 'https://github.com/tc39/proposal-iterator-helpers',
    stage: 4,
    modules: [
      'es.iterator.constructor',
      'es.iterator.drop',
      'es.iterator.every',
      'es.iterator.filter',
      'es.iterator.find',
      'es.iterator.flat-map',
      'es.iterator.for-each',
      'es.iterator.from',
      'es.iterator.map',
      'es.iterator.reduce',
      'es.iterator.some',
      'es.iterator.take',
      'es.iterator.to-array',
    ],
  },
  'iterator-chunking': {
    link: 'https://github.com/tc39/proposal-iterator-chunking',
    stage: 2,
    modules: [
      'esnext.iterator.chunks',
      'esnext.iterator.windows',
    ],
  },
  'iterator-range': {
    link: 'https://github.com/tc39/proposal-Number.range',
    stage: 2,
    modules: [
      'es.iterator.constructor',
      'esnext.iterator.range',
    ],
  },
  'iterator-sequencing': {
    link: 'https://github.com/tc39/proposal-iterator-sequencing',
    stage: 3,
    modules: [
      'es.iterator.constructor',
      'esnext.iterator.concat',
    ],
  },
  'joint-iteration': {
    link: 'https://github.com/tc39/proposal-joint-iteration',
    stage: 2.7,
    modules: [
      'esnext.iterator.zip',
      'esnext.iterator.zip-keyed',
    ],
  },
  'json-parse-with-source': {
    link: 'https://github.com/tc39/proposal-json-parse-with-source',
    stage: 3,
    modules: [
      'esnext.json.is-raw-json',
      'esnext.json.parse',
      'esnext.json.raw-json',
    ],
  },
  'map-upsert': {
    link: 'https://github.com/tc39/proposal-upsert',
    stage: 3,
    modules: [
      'esnext.map.get-or-insert',
      'esnext.map.get-or-insert-computed',
      'esnext.weak-map.get-or-insert',
      'esnext.weak-map.get-or-insert-computed',
    ],
  },
  'math-clamp': {
    link: 'https://github.com/tc39/proposal-math-clamp',
    stage: 2,
    modules: [
      'esnext.number.clamp',
    ],
  },
  'math-sum': {
    link: 'https://github.com/tc39/proposal-math-sum',
    stage: 4,
    modules: [
      'es.math.sum-precise',
    ],
  },
  'object-from-entries': {
    link: 'https://github.com/tc39/proposal-object-from-entries',
    stage: 4,
    modules: [
      'es.object.from-entries',
    ],
  },
  'object-getownpropertydescriptors': {
    link: 'https://github.com/tc39/proposal-object-getownpropertydescriptors',
    stage: 4,
    modules: [
      'es.object.get-own-property-descriptors',
    ],
  },
  'object-values-entries': {
    link: 'https://github.com/tc39/proposal-object-values-entries',
    stage: 4,
    modules: [
      'es.object.entries',
      'es.object.values',
    ],
  },
  'pattern-matching': {
    link: 'https://github.com/tc39/proposal-pattern-matching',
    stage: 1,
    modules: [
      'esnext.symbol.custom-matcher',
    ],
  },
  'promise-all-settled': {
    link: 'https://github.com/tc39/proposal-promise-allSettled',
    stage: 4,
    modules: [
      'es.promise.all-settled',
    ],
  },
  'promise-any': {
    link: 'https://github.com/tc39/proposal-promise-any',
    stage: 4,
    modules: [
      'es.aggregate-error.constructor',
      'es.promise.any',
    ],
  },
  'promise-finally': {
    link: 'https://github.com/tc39/proposal-promise-finally',
    stage: 4,
    modules: [
      'es.promise.finally',
    ],
  },
  'promise-try': {
    link: 'https://github.com/tc39/proposal-promise-try',
    stage: 4,
    modules: [
      'es.promise.try',
    ],
  },
  'promise-with-resolvers': {
    link: 'https://github.com/tc39/proposal-promise-with-resolvers',
    stage: 4,
    modules: [
      'es.promise.with-resolvers',
    ],
  },
  'regexp-dotall-flag': {
    link: 'https://github.com/tc39/proposal-regexp-dotall-flag',
    stage: 4,
    modules: [
      'es.regexp.constructor',
      'es.regexp.dot-all',
      'es.regexp.exec',
      'es.regexp.flags',
    ],
  },
  'regexp-escaping': {
    link: 'https://github.com/tc39/proposal-regex-escaping',
    stage: 4,
    modules: [
      'es.regexp.escape',
    ],
  },
  'regexp-named-groups': {
    link: 'https://github.com/tc39/proposal-regexp-named-groups',
    stage: 4,
    modules: [
      'es.regexp.constructor',
      'es.regexp.exec',
      'es.string.replace',
    ],
  },
  'relative-indexing-method': {
    link: 'https://github.com/tc39/proposal-relative-indexing-method',
    stage: 4,
    modules: [
      'es.string.at',
      'es.array.at',
      'es.typed-array.at',
    ],
  },
  'set-methods': {
    link: 'https://github.com/tc39/proposal-set-methods',
    stage: 4,
    modules: [
      'es.set.difference',
      'es.set.intersection',
      'es.set.is-disjoint-from',
      'es.set.is-subset-of',
      'es.set.is-superset-of',
      'es.set.symmetric-difference',
      'es.set.union',
    ],
  },
  'string-cooked': {
    link: 'https://github.com/tc39/proposal-string-cooked',
    stage: 1,
    modules: [
      'esnext.string.cooked',
    ],
  },
  'string-dedent': {
    link: 'https://github.com/tc39/proposal-string-dedent',
    stage: 2,
    modules: [
      'esnext.string.dedent',
    ],
  },
  'string-left-right-trim': {
    link: 'https://github.com/tc39/proposal-string-left-right-trim',
    stage: 4,
    modules: [
      'es.string.trim-end',
      'es.string.trim-left',
      'es.string.trim-right',
      'es.string.trim-start',
    ],
  },
  'string-match-all': {
    link: 'https://github.com/tc39/proposal-string-matchall',
    stage: 4,
    modules: [
      'es.string.match-all',
    ],
  },
  'string-padding': {
    link: 'https://github.com/tc39/proposal-string-pad-start-end',
    stage: 4,
    modules: [
      'es.string.pad-end',
      'es.string.pad-start',
    ],
  },
  'string-replace-all': {
    link: 'https://github.com/tc39/proposal-string-replaceall',
    stage: 4,
    modules: [
      'es.string.replace-all',
    ],
  },
  'symbol-description': {
    link: 'https://github.com/tc39/proposal-Symbol-description',
    stage: 4,
    modules: [
      'es.symbol.description',
    ],
  },
  'symbol-predicates': {
    link: 'https://github.com/tc39/proposal-symbol-predicates',
    stage: 2,
    modules: [
      'esnext.symbol.is-registered-symbol',
      'esnext.symbol.is-well-known-symbol',
    ],
  },
  'well-formed-stringify': {
    link: 'https://github.com/tc39/proposal-well-formed-stringify',
    stage: 4,
    modules: [
      'es.json.stringify',
    ],
  },
  'well-formed-unicode-strings': {
    link: 'https://github.com/tc39/proposal-is-usv-string',
    stage: 4,
    modules: [
      'es.string.is-well-formed',
      'es.string.to-well-formed',
    ],
  },
};
