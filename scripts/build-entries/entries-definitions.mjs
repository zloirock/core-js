import {
  $prototype,
  $virtual,
  $static,
  $staticWithContext,
  $patchableStatic,
  $namespace,
  $helper,
  $justImport,
} from './templates.mjs';

export const features = {
  'aggregate-error/index': {
    modules: [/^(?:es|esnext)\.aggregate-error\./],
    template: $namespace({ name: 'AggregateError' }),
  },
  'array/index': {
    modules: [/^(?:es|esnext)\.array\./],
    template: $namespace({ name: 'Array' }),
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
  'async-iterator/index': {
    modules: [/^(?:es|esnext)\.async-iterator\./],
    template: $namespace({ name: 'AsyncIterator' }),
  },
  'async-disposable-stack/index': {
    modules: [/^(?:es|esnext)\.async-disposable-stack\./],
    template: $namespace({ name: 'AsyncDisposableStack' }),
  },
  // 'async-iterator/async-dispose' ???
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
  'async-iterator/from': {
    modules: ['esnext.async-iterator.from'],
    template: $static({ namespace: 'AsyncIterator', method: 'from' }),
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
  'date/index': {
    modules: [/^(?:es|esnext)\.date\./],
    template: $namespace({ name: 'Date' }),
  },
  'date/get-year': {
    modules: ['es.date.get-year'],
    template: $prototype({ namespace: 'Date', method: 'getYear' }),
  },
  'date/virtual/get-year': {
    modules: ['es.date.get-year'],
    template: $virtual({ namespace: 'Date', method: 'getYear' }),
  },
  'date/set-year': {
    modules: ['es.date.set-year'],
    template: $prototype({ namespace: 'Date', method: 'setYear' }),
  },
  'date/virtual/set-year': {
    modules: ['es.date.set-year'],
    template: $virtual({ namespace: 'Date', method: 'setYear' }),
  },
  'date/to-gmt-string': {
    modules: ['es.date.to-gmt-string'],
    template: $prototype({ namespace: 'Date', method: 'toGMTString' }),
  },
  'date/virtual/to-gmt-string': {
    modules: ['es.date.to-gmt-string'],
    template: $virtual({ namespace: 'Date', method: 'toGMTString' }),
  },
  'date/to-iso-string': {
    modules: ['es.date.to-iso-string'],
    template: $prototype({ namespace: 'Date', method: 'toISOString' }),
  },
  'date/virtual/to-iso-string': {
    modules: ['es.date.to-iso-string'],
    template: $virtual({ namespace: 'Date', method: 'toISOString' }),
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
    template: $namespace({ name: 'DisposableStack' }),
  },
  // date/to-primitive ???
  'dom-exception/index': {
    modules: [/^web\.dom-exception\./],
    template: $namespace({ name: 'DOMException' }),
  },
  'error/index': { // < - path ??
    modules: [/^(?:es|esnext)\.error\./],
    template: $namespace({ name: 'Error' }),
  },
  'error/to-string': {
    modules: ['es.error.to-string'],
    template: $prototype({ namespace: 'Error', method: 'toString' }),
  },
  'error/virtual/to-string': {
    modules: ['es.error.to-string'],
    template: $virtual({ namespace: 'Error', method: 'toString' }),
  },
  'function/index': {
    modules: [/^(?:es|esnext)\.function\./],
    template: $namespace({ name: 'Function' }),
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
  'iterator/index': {
    modules: [/^(?:es|esnext)\.iterator\./],
    template: $namespace({ name: 'Iterator' }),
  },
  // 'iterator/dispose' ???
  'iterator/drop': {
    modules: ['esnext.iterator.drop'],
    template: $prototype({ namespace: 'Iterator', method: 'drop' }),
  },
  'iterator/virtual/drop': {
    modules: ['esnext.iterator.drop'],
    template: $virtual({ namespace: 'Iterator', method: 'drop' }),
  },
  'iterator/every': {
    modules: ['esnext.iterator.every'],
    template: $prototype({ namespace: 'Iterator', method: 'every' }),
  },
  'iterator/virtual/every': {
    modules: ['esnext.iterator.every'],
    template: $virtual({ namespace: 'Iterator', method: 'every' }),
  },
  'iterator/filter': {
    modules: ['esnext.iterator.filter'],
    template: $prototype({ namespace: 'Iterator', method: 'filter' }),
  },
  'iterator/virtual/filter': {
    modules: ['esnext.iterator.filter'],
    template: $virtual({ namespace: 'Iterator', method: 'filter' }),
  },
  'iterator/find': {
    modules: ['esnext.iterator.find'],
    template: $prototype({ namespace: 'Iterator', method: 'find' }),
  },
  'iterator/virtual/find': {
    modules: ['esnext.iterator.find'],
    template: $virtual({ namespace: 'Iterator', method: 'find' }),
  },
  'iterator/flat-map': {
    modules: ['esnext.iterator.flat-map'],
    template: $prototype({ namespace: 'Iterator', method: 'flatMap' }),
  },
  'iterator/virtual/flat-map': {
    modules: ['esnext.iterator.flat-map'],
    template: $virtual({ namespace: 'Iterator', method: 'flatMap' }),
  },
  'iterator/for-each': {
    modules: ['esnext.iterator.for-each'],
    template: $prototype({ namespace: 'Iterator', method: 'forEach' }),
  },
  'iterator/virtual/for-each': {
    modules: ['esnext.iterator.for-each'],
    template: $virtual({ namespace: 'Iterator', method: 'forEach' }),
  },
  'iterator/from': {
    modules: ['esnext.iterator.from'],
    template: $static({ namespace: 'Iterator', method: 'from' }),
  },
  'iterator/map': {
    modules: ['esnext.iterator.map'],
    template: $prototype({ namespace: 'Iterator', method: 'map' }),
  },
  'iterator/virtual/map': {
    modules: ['esnext.iterator.map'],
    template: $virtual({ namespace: 'Iterator', method: 'map' }),
  },
  'iterator/range': {
    modules: ['esnext.iterator.range'],
    template: $static({ namespace: 'Iterator', method: 'range' }),
  },
  'iterator/reduce': {
    modules: ['esnext.iterator.reduce'],
    template: $prototype({ namespace: 'Iterator', method: 'reduce' }),
  },
  'iterator/virtual/reduce': {
    modules: ['esnext.iterator.reduce'],
    template: $virtual({ namespace: 'Iterator', method: 'reduce' }),
  },
  'iterator/some': {
    modules: ['esnext.iterator.some'],
    template: $prototype({ namespace: 'Iterator', method: 'some' }),
  },
  'iterator/virtual/some': {
    modules: ['esnext.iterator.some'],
    template: $virtual({ namespace: 'Iterator', method: 'some' }),
  },
  'iterator/take': {
    modules: ['esnext.iterator.take'],
    template: $prototype({ namespace: 'Iterator', method: 'take' }),
  },
  'iterator/virtual/take': {
    modules: ['esnext.iterator.take'],
    template: $virtual({ namespace: 'Iterator', method: 'take' }),
  },
  'iterator/to-array': {
    modules: ['esnext.iterator.to-array'],
    template: $prototype({ namespace: 'Iterator', method: 'toArray' }),
  },
  'iterator/virtual/to-array': {
    modules: ['esnext.iterator.to-array'],
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
  'json/index': {
    modules: [/^(?:es|esnext)\.json\./],
    template: $namespace({ name: 'JSON' }),
  },
  'json/is-raw-json': {
    modules: ['esnext.json.is-raw-json'],
    template: $static({ namespace: 'JSON', method: 'isRawJSON' }),
  },
  'json/parse': {
    modules: ['esnext.json.parse'],
    template: $static({ namespace: 'JSON', method: 'parse' }),
  },
  'json/raw-json': {
    modules: ['esnext.json.raw-json'],
    template: $static({ namespace: 'JSON', method: 'rawJSON' }),
  },
  'json/stringify': {
    modules: ['es.json.stringify'],
    template: $patchableStatic({ namespace: 'JSON', method: 'stringify' }),
  },
  'map/index': {
    modules: [/^(?:es|esnext)\.map\./],
    template: $namespace({ name: 'Map' }),
  },
  'map/delete-all': {
    modules: ['esnext.map.delete-all'],
    template: $prototype({ namespace: 'Map', method: 'deleteAll' }),
  },
  'map/virtual/delete-all': {
    modules: ['esnext.map.delete-all'],
    template: $virtual({ namespace: 'Map', method: 'deleteAll' }),
  },
  'map/emplace': {
    modules: ['esnext.map.emplace'],
    template: $prototype({ namespace: 'Map', method: 'emplace' }),
  },
  'map/virtual/emplace': {
    modules: ['esnext.map.emplace'],
    template: $virtual({ namespace: 'Map', method: 'emplace' }),
  },
  'map/every': {
    modules: ['esnext.map.every'],
    template: $prototype({ namespace: 'Map', method: 'every' }),
  },
  'map/virtual/every': {
    modules: ['esnext.map.every'],
    template: $virtual({ namespace: 'Map', method: 'every' }),
  },
  'map/filter': {
    modules: ['esnext.map.filter'],
    template: $prototype({ namespace: 'Map', method: 'filter' }),
  },
  'map/virtual/filter': {
    modules: ['esnext.map.filter'],
    template: $virtual({ namespace: 'Map', method: 'filter' }),
  },
  'map/find': {
    modules: ['esnext.map.find'],
    template: $prototype({ namespace: 'Map', method: 'find' }),
  },
  'map/virtual/find': {
    modules: ['esnext.map.find'],
    template: $virtual({ namespace: 'Map', method: 'find' }),
  },
  'map/find-key': {
    modules: ['esnext.map.find-key'],
    template: $prototype({ namespace: 'Map', method: 'findKey' }),
  },
  'map/virtual/find-key': {
    modules: ['esnext.map.find-key'],
    template: $virtual({ namespace: 'Map', method: 'findKey' }),
  },
  'map/from': {
    modules: ['esnext.map.from'],
    template: $staticWithContext({ namespace: 'Map', method: 'from' }),
  },
  'map/group-by': {
    modules: ['es.map.group-by'],
    template: $static({ namespace: 'Map', method: 'groupBy' }),
  },
  'map/includes': {
    modules: ['esnext.map.includes'],
    template: $prototype({ namespace: 'Map', method: 'includes' }),
  },
  'map/virtual/includes': {
    modules: ['esnext.map.includes'],
    template: $virtual({ namespace: 'Map', method: 'includes' }),
  },
  'map/key-by': {
    modules: ['esnext.map.key-by', 'es.map.constructor'],
    template: $staticWithContext({ namespace: 'Map', method: 'keyBy' }),
  },
  'map/key-of': {
    modules: ['esnext.map.key-of'],
    template: $prototype({ namespace: 'Map', method: 'keyOf' }),
  },
  'map/virtual/key-of': {
    modules: ['esnext.map.key-of'],
    template: $virtual({ namespace: 'Map', method: 'keyOf' }),
  },
  'map/map-keys': {
    modules: ['esnext.map.map-keys'],
    template: $prototype({ namespace: 'Map', method: 'mapKeys' }),
  },
  'map/virtual/map-keys': {
    modules: ['esnext.map.map-keys'],
    template: $virtual({ namespace: 'Map', method: 'mapKeys' }),
  },
  'map/map-values': {
    modules: ['esnext.map.map-values'],
    template: $prototype({ namespace: 'Map', method: 'mapValues' }),
  },
  'map/virtual/map-values': {
    modules: ['esnext.map.map-values'],
    template: $virtual({ namespace: 'Map', method: 'mapValues' }),
  },
  'map/merge': {
    modules: ['esnext.map.merge'],
    template: $prototype({ namespace: 'Map', method: 'merge' }),
  },
  'map/virtual/merge': {
    modules: ['esnext.map.merge'],
    template: $virtual({ namespace: 'Map', method: 'merge' }),
  },
  'map/of': {
    modules: ['esnext.map.of'],
    template: $staticWithContext({ namespace: 'Map', method: 'of' }),
  },
  'map/reduce': {
    modules: ['esnext.map.reduce'],
    template: $prototype({ namespace: 'Map', method: 'reduce' }),
  },
  'map/virtual/reduce': {
    modules: ['esnext.map.reduce'],
    template: $virtual({ namespace: 'Map', method: 'reduce' }),
  },
  'map/some': {
    modules: ['esnext.map.some'],
    template: $prototype({ namespace: 'Map', method: 'some' }),
  },
  'map/virtual/some': {
    modules: ['esnext.map.some'],
    template: $virtual({ namespace: 'Map', method: 'some' }),
  },
  'map/update': {
    modules: ['esnext.map.update'],
    template: $prototype({ namespace: 'Map', method: 'update' }),
  },
  'map/virtual/update': {
    modules: ['esnext.map.update'],
    template: $virtual({ namespace: 'Map', method: 'update' }),
  },
  'math/index': {
    modules: [/^(?:es|esnext)\.math\./],
    template: $namespace({ name: 'Math' }),
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
    template: $namespace({ name: 'Number' }),
  },
  'number/constructor': {
    modules: ['es.number.constructor'],
    template: $namespace({ name: 'Number' }),
  },
  'number/epsilon': {
    modules: ['es.number.epsilon'],
    template: $static({ namespace: 'Number', method: 'EPSILON' }),
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
  'object/index': {
    modules: [/^(?:es|esnext)\.object\./],
    template: $namespace({ name: 'Object' }),
  },
  'object/assign': {
    modules: ['es.object.assign'],
    template: $static({ namespace: 'Object', method: 'assign' }),
  },
  'object/create': {
    modules: [],
    template: $patchableStatic({ namespace: 'Object', method: 'create' }),
    enforce: true,
  },
  'object/define-property': {
    modules: ['es.object.define-property'],
    template: $patchableStatic({ namespace: 'Object', method: 'defineProperty' }),
  },
  'object/define-properties': {
    modules: ['es.object.define-properties'],
    template: $patchableStatic({ namespace: 'Object', method: 'defineProperties' }),
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
    template: $static({ namespace: 'Object', method: 'entries' }),
  },
  'object/freeze': {
    modules: ['es.object.freeze'],
    template: $static({ namespace: 'Object', method: 'freeze' }),
  },
  'object/from-entries': {
    modules: ['es.object.from-entries'],
    template: $static({ namespace: 'Object', method: 'fromEntries' }),
  },
  'object/get-own-property-descriptor': {
    modules: ['es.object.get-own-property-descriptor'],
    template: $patchableStatic({ namespace: 'Object', method: 'getOwnPropertyDescriptor' }),
  },
  'object/get-own-property-descriptors': {
    modules: ['es.object.get-own-property-descriptors'],
    template: $static({ namespace: 'Object', method: 'getOwnPropertyDescriptors' }),
  },
  'object/get-own-property-names': {
    modules: ['es.object.get-own-property-names'],
    template: $patchableStatic({ namespace: 'Object', method: 'getOwnPropertyNames' }),
  },
  'object/get-own-property-symbols': {
    modules: ['es.object.get-own-property-symbols'],
    template: $static({ namespace: 'Object', method: 'getOwnPropertySymbols' }),
  },
  'object/get-prototype-of': {
    modules: ['es.object.get-prototype-of'],
    template: $static({ namespace: 'Object', method: 'getPrototypeOf' }),
  },
  'object/group-by': {
    modules: ['es.object.group-by'],
    template: $static({ namespace: 'Object', method: 'groupBy' }),
  },
  'object/has-own': {
    modules: ['es.object.has-own'],
    template: $static({ namespace: 'Object', method: 'hasOwn' }),
  },
  'object/is': {
    modules: ['es.object.is'],
    template: $static({ namespace: 'Object', method: 'is' }),
  },
  'object/is-extensible': {
    modules: ['es.object.is-extensible'],
    template: $static({ namespace: 'Object', method: 'isExtensible' }),
  },
  'object/is-frozen': {
    modules: ['es.object.is-frozen'],
    template: $static({ namespace: 'Object', method: 'isFrozen' }),
  },
  'object/is-sealed': {
    modules: ['es.object.is-sealed'],
    template: $static({ namespace: 'Object', method: 'isSealed' }),
  },
  'object/keys': {
    modules: ['es.object.keys'],
    template: $static({ namespace: 'Object', method: 'keys' }),
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
    template: $static({ namespace: 'Object', method: 'preventExtensions' }),
  },
  'object/proto': {
    modules: ['es.object.proto'],
    template: $justImport,
  },
  'object/seal': {
    modules: ['es.object.seal'],
    template: $static({ namespace: 'Object', method: 'seal' }),
  },
  'object/set-prototype-of': {
    modules: ['es.object.set-prototype-of'],
    template: $static({ namespace: 'Object', method: 'setPrototypeOf' }),
  },
  'object/to-string': { // <- !!!
    modules: ['es.object.to-string'],
    template: $prototype({ namespace: 'Object', method: 'toString' }),
  },
  'object/virtual/to-string': { // <- !!!
    modules: ['es.object.to-string'],
    template: $virtual({ namespace: 'Object', method: 'toString' }),
  },
  'object/values': {
    modules: ['es.object.values'],
    template: $static({ namespace: 'Object', method: 'values' }),
  },
  'promise/index': {
    modules: [/^(?:es|esnext)\.promise\./],
    template: $namespace({ name: 'Promise' }),
  },
  'promise/all': {
    modules: ['es.promise.constructor', 'es.promise.all'],
    template: $staticWithContext({ namespace: 'Promise', method: 'all' }),
  },
  'promise/all-settled': {
    modules: ['es.promise.constructor', 'es.promise.all-settled'],
    template: $staticWithContext({ namespace: 'Promise', method: 'allSettled' }),
  },
  'promise/any': {
    modules: ['es.promise.constructor', 'es.promise.any'],
    template: $staticWithContext({ namespace: 'Promise', method: 'any' }),
  },
  'promise/catch': {
    modules: ['es.promise.constructor', 'es.promise.catch'],
    template: $prototype({ namespace: 'Promise', method: 'catch' }),
  },
  'promise/virtual/catch': {
    modules: ['es.promise.constructor', 'es.promise.catch'],
    template: $virtual({ namespace: 'Promise', method: 'catch' }),
  },
  'promise/finally': {
    modules: ['es.promise.constructor', 'es.promise.finally'],
    template: $prototype({ namespace: 'Promise', method: 'finally' }),
  },
  'promise/virtual/finally': {
    modules: ['es.promise.constructor', 'es.promise.finally'],
    template: $virtual({ namespace: 'Promise', method: 'finally' }),
  },
  'promise/race': {
    modules: ['es.promise.constructor', 'es.promise.race'],
    template: $staticWithContext({ namespace: 'Promise', method: 'race' }),
  },
  'promise/reject': {
    modules: ['es.promise.constructor', 'es.promise.reject'],
    template: $staticWithContext({ namespace: 'Promise', method: 'reject' }),
  },
  'promise/resolve': {
    modules: ['es.promise.constructor', 'es.promise.resolve'],
    template: $staticWithContext({ namespace: 'Promise', method: 'resolve' }),
  },
  'reflect/index': {
    modules: [/^(?:es|esnext)\.reflect\./],
    template: $namespace({ name: 'Reflect' }),
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
  'set/index': {
    modules: [/^(?:es|esnext)\.set\./],
    template: $namespace({ name: 'Set' }),
  },
  'set/add-all': {
    modules: ['esnext.set.add-all'],
    template: $prototype({ namespace: 'Set', method: 'addAll' }),
  },
  'set/virtual/add-all': {
    modules: ['esnext.set.add-all'],
    template: $virtual({ namespace: 'Set', method: 'addAll' }),
  },
  'set/delete-all': {
    modules: ['esnext.set.delete-all'],
    template: $prototype({ namespace: 'Set', method: 'deleteAll' }),
  },
  'set/virtual/delete-all': {
    modules: ['esnext.set.delete-all'],
    template: $virtual({ namespace: 'Set', method: 'deleteAll' }),
  },
  'set/difference': {
    modules: ['esnext.set.difference'],
    template: $prototype({ namespace: 'Set', method: 'difference' }),
  },
  'set/virtual/difference': {
    modules: ['esnext.set.difference'],
    template: $virtual({ namespace: 'Set', method: 'difference' }),
  },
  'set/every': {
    modules: ['esnext.set.every'],
    template: $prototype({ namespace: 'Set', method: 'every' }),
  },
  'set/virtual/every': {
    modules: ['esnext.set.every'],
    template: $virtual({ namespace: 'Set', method: 'every' }),
  },
  'set/filter': {
    modules: ['esnext.set.filter'],
    template: $prototype({ namespace: 'Set', method: 'filter' }),
  },
  'set/virtual/filter': {
    modules: ['esnext.set.filter'],
    template: $virtual({ namespace: 'Set', method: 'filter' }),
  },
  'set/find': {
    modules: ['esnext.set.find'],
    template: $prototype({ namespace: 'Set', method: 'find' }),
  },
  'set/virtual/find': {
    modules: ['esnext.set.find'],
    template: $virtual({ namespace: 'Set', method: 'find' }),
  },
  'set/from': {
    modules: ['esnext.set.from'],
    template: $staticWithContext({ namespace: 'Set', method: 'from' }),
  },
  'set/intersection': {
    modules: ['esnext.set.intersection'],
    template: $prototype({ namespace: 'Set', method: 'intersection' }),
  },
  'set/virtual/intersection': {
    modules: ['esnext.set.intersection'],
    template: $virtual({ namespace: 'Set', method: 'intersection' }),
  },
  'set/is-disjoint-from': {
    modules: ['esnext.set.is-disjoint-from'],
    template: $prototype({ namespace: 'Set', method: 'isDisjointFrom' }),
  },
  'set/virtual/is-disjoint-from': {
    modules: ['esnext.set.is-disjoint-from'],
    template: $virtual({ namespace: 'Set', method: 'isDisjointFrom' }),
  },
  'set/is-subset-of': {
    modules: ['esnext.set.is-subset-of'],
    template: $prototype({ namespace: 'Set', method: 'isSubsetOf' }),
  },
  'set/virtual/is-subset-of': {
    modules: ['esnext.set.is-subset-of'],
    template: $virtual({ namespace: 'Set', method: 'isSubsetOf' }),
  },
  'set/is-superset-of': {
    modules: ['esnext.set.is-superset-of'],
    template: $prototype({ namespace: 'Set', method: 'isSupersetOf' }),
  },
  'set/virtual/is-superset-of': {
    modules: ['esnext.set.is-superset-of'],
    template: $virtual({ namespace: 'Set', method: 'isSupersetOf' }),
  },
  'set/join': {
    modules: ['esnext.set.join'],
    template: $prototype({ namespace: 'Set', method: 'join' }),
  },
  'set/virtual/join': {
    modules: ['esnext.set.join'],
    template: $virtual({ namespace: 'Set', method: 'join' }),
  },
  'set/map': {
    modules: ['esnext.set.map'],
    template: $prototype({ namespace: 'Set', method: 'map' }),
  },
  'set/virtual/map': {
    modules: ['esnext.set.map'],
    template: $virtual({ namespace: 'Set', method: 'map' }),
  },
  'set/of': {
    modules: ['esnext.set.of'],
    template: $staticWithContext({ namespace: 'Set', method: 'of' }),
  },
  'set/reduce': {
    modules: ['esnext.set.reduce'],
    template: $prototype({ namespace: 'Set', method: 'reduce' }),
  },
  'set/virtual/reduce': {
    modules: ['esnext.set.reduce'],
    template: $virtual({ namespace: 'Set', method: 'reduce' }),
  },
  'set/some': {
    modules: ['esnext.set.some'],
    template: $prototype({ namespace: 'Set', method: 'some' }),
  },
  'set/virtual/some': {
    modules: ['esnext.set.some'],
    template: $virtual({ namespace: 'Set', method: 'some' }),
  },
  'set/symmetric-difference': {
    modules: ['esnext.set.symmetric-difference'],
    template: $prototype({ namespace: 'Set', method: 'symmetricDifference' }),
  },
  'set/virtual/symmetric-difference': {
    modules: ['esnext.set.symmetric-difference'],
    template: $virtual({ namespace: 'Set', method: 'symmetricDifference' }),
  },
  'set/union': {
    modules: ['esnext.set.union'],
    template: $prototype({ namespace: 'Set', method: 'union' }),
  },
  'set/virtual/union': {
    modules: ['esnext.set.union'],
    template: $virtual({ namespace: 'Set', method: 'union' }),
  },
  'string/index': {
    modules: [/^(?:es|esnext)\.string\./],
    template: $namespace({ name: 'String' }),
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
  'string/code-points': {
    modules: ['esnext.string.code-points'],
    template: $prototype({ namespace: 'String', method: 'codePoints' }),
  },
  'string/virtual/code-points': {
    modules: ['esnext.string.code-points'],
    template: $virtual({ namespace: 'String', method: 'codePoints' }),
  },
  'string/cooked': {
    modules: ['esnext.string.cooked'],
    template: $static({ namespace: 'String', method: 'cooked' }),
  },
  'string/dedent': {
    modules: ['esnext.string.dedent'],
    template: $static({ namespace: 'String', method: 'dedent' }),
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
    template: $static({ namespace: 'String', method: 'fromCodePoint' }),
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
  // string/iterator !!!
  // string/virtual/iterator !!!
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
    template: $static({ namespace: 'String', method: 'raw' }),
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
  'string/substr': {
    modules: ['es.string.substr'],
    template: $prototype({ namespace: 'String', method: 'substr' }),
  },
  'string/virtual/substr': {
    modules: ['es.string.substr'],
    template: $virtual({ namespace: 'String', method: 'substr' }),
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
    template: $namespace({ name: 'SuppressedError' }),
  },
  'url/index': {
    modules: [/^web\.url\./],
    template: $namespace({ name: 'URL' }),
  },
  'url/can-parse': {
    modules: ['web.url.can-parse'],
    template: $static({ namespace: 'URL', method: 'canParse' }),
  },
  'url/to-json': { // <- ???
    modules: ['web.url.to-json'],
    template: $prototype({ namespace: 'URL', method: 'toJSON' }),
  },
  'url/virtual/to-json': {
    modules: ['web.url.to-json'],
    template: $virtual({ namespace: 'URL', method: 'toJSON' }),
  },
  'url-search-params/index': { // <- O_o
    modules: [/^web\.url-search-params\./],
    template: $namespace({ name: 'URLSearchParams' }),
  },
  'weak-map/index': {
    modules: [/^(?:es|esnext)\.weak-map\./],
    template: $namespace({ name: 'WeakMap' }),
  },
  'weak-map/delete-all': {
    modules: ['esnext.weak-map.delete-all'],
    template: $prototype({ namespace: 'WeakMap', method: 'deleteAll' }),
  },
  'weak-map/virtual/delete-all': {
    modules: ['esnext.weak-map.delete-all'],
    template: $virtual({ namespace: 'WeakMap', method: 'deleteAll' }),
  },
  'weak-map/emplace': {
    modules: ['esnext.weak-map.emplace'],
    template: $prototype({ namespace: 'WeakMap', method: 'emplace' }),
  },
  'weak-map/virtual/emplace': {
    modules: ['esnext.weak-map.emplace'],
    template: $virtual({ namespace: 'WeakMap', method: 'emplace' }),
  },
  'weak-map/from': {
    modules: ['esnext.weak-map.from'],
    template: $staticWithContext({ namespace: 'WeakMap', method: 'from' }),
  },
  'weak-map/of': {
    modules: ['esnext.weak-map.of'],
    template: $staticWithContext({ namespace: 'WeakMap', method: 'of' }),
  },
  'weak-set/index': {
    modules: [/^(?:es|esnext)\.weak-set\./],
    template: $namespace({ name: 'WeakSet' }),
  },
  'weak-set/add-all': {
    modules: ['esnext.weak-set.add-all'],
    template: $prototype({ namespace: 'WeakSet', method: 'addAll' }),
  },
  'weak-set/virtual/add-all': {
    modules: ['esnext.weak-set.add-all'],
    template: $virtual({ namespace: 'WeakSet', method: 'addAll' }),
  },
  'weak-set/delete-all': {
    modules: ['esnext.weak-set.delete-all'],
    template: $prototype({ namespace: 'WeakSet', method: 'deleteAll' }),
  },
  'weak-set/virtual/delete-all': {
    modules: ['esnext.weak-set.delete-all'],
    template: $virtual({ namespace: 'WeakSet', method: 'deleteAll' }),
  },
  'weak-set/from': {
    modules: ['esnext.weak-set.from'],
    template: $staticWithContext({ namespace: 'WeakSet', method: 'from' }),
  },
  'weak-set/of': {
    modules: ['esnext.weak-set.of'],
    template: $staticWithContext({ namespace: 'WeakSet', method: 'of' }),
  },
  atob: {
    modules: ['web.atob'],
    template: $namespace({ name: 'atob' }),
  },
  btoa: {
    modules: ['web.btoa'],
    template: $namespace({ name: 'btoa' }),
  },
  'clear-immediate': {
    modules: ['web.clear-immediate'],
    template: $namespace({ name: 'clearImmediate' }),
  },
  'composite-key': {
    modules: ['esnext.composite-key'],
    template: $namespace({ name: 'compositeKey' }),
  },
  'composite-symbol': {
    modules: ['esnext.composite-symbol'],
    template: $namespace({ name: 'compositeSymbol' }),
  },
  escape: {
    modules: ['es.escape'],
    template: $namespace({ name: 'escape' }),
  },
  'global-this': {
    modules: ['es.global-this'],
    template: $namespace({ name: 'globalThis' }),
  },
  'parse-float': {
    modules: ['es.parse-float'],
    template: $namespace({ name: 'parseFloat' }),
  },
  'parse-int': {
    modules: ['es.parse-int'],
    template: $namespace({ name: 'parseInt' }),
  },
  'queue-microtask': {
    modules: ['web.queue-microtask'],
    template: $namespace({ name: 'queueMicrotask' }),
  },
  self: {
    modules: ['web.self'],
    template: $namespace({ name: 'self' }),
  },
  'set-immediate': {
    modules: ['web.set-immediate'],
    template: $namespace({ name: 'setImmediate' }),
  },
  'set-interval': {
    modules: ['web.set-interval'],
    template: $namespace({ name: 'setInterval' }),
  },
  'set-timeout': {
    modules: ['web.set-timeout'],
    template: $namespace({ name: 'setTimeout' }),
  },
  'structured-clone': {
    modules: ['web.structured-clone'],
    template: $namespace({ name: 'structuredClone' }),
  },
  unescape: {
    modules: ['es.unescape'],
    template: $namespace({ name: 'unescape' }),
  },
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
    stage: 4,
    modules: [
      'es.map.group-by',
      'es.object.group-by',
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
    stage: 4,
    modules: [
      'es.promise.with-resolvers',
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
