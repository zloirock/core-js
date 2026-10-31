# `Iterator` helpers
[Specification](https://tc39.es/proposal-iterator-helpers/)\
[Proposal repo](https://github.com/tc39/proposal-iterator-helpers)

## Modules
[`es.iterator.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.constructor.js), [`es.iterator.drop`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.drop.js), [`es.iterator.every`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.every.js), [`es.iterator.filter`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.filter.js), [`es.iterator.find`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.find.js), [`es.iterator.flat-map`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.flat-map.js), [`es.iterator.for-each`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.for-each.js), [`es.iterator.from`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.from.js), [`es.iterator.map`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.map.js), [`es.iterator.reduce`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.reduce.js), [`es.iterator.some`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.some.js), [`es.iterator.take`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.take.js) and [`es.iterator.to-array`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.to-array.js).

## Built-ins signatures
```ts
class Iterator {
  static from(iterable: Iterable<any> | Iterator<any>): Iterator<any>;
  drop(limit: uint): Iterator<any>;
  every(callbackfn: (value: any, counter: uint) => boolean): boolean;
  filter(callbackfn: (value: any, counter: uint) => boolean): Iterator<any>;
  find(callbackfn: (value: any, counter: uint) => boolean): any;
  flatMap(callbackfn: (value: any, counter: uint) => Iterable<any> | Iterator<any>): Iterator<any>;
  forEach(callbackfn: (value: any, counter: uint) => void): void;
  map(callbackfn: (value: any, counter: uint) => any): Iterator<any>;
  reduce(callbackfn: (memo: any, value: any, counter: uint) => any, initialValue?: any): any;
  some(callbackfn: (value: any, counter: uint) => boolean): boolean;
  take(limit: uint): Iterator<any>;
  toArray(): Array<any>;
  @@toStringTag: 'Iterator';
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/iterator-helpers
{ core-js, @core-js/pure }/es|stable|actual|full/iterator
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/drop
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/every
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/filter
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/find
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/flat-map
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/for-each
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/from
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/map
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/reduce
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/some
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/take
{ core-js, @core-js/pure }/es|stable|actual|full/iterator/to-array
```

## Examples
```js
[1, 2, 3, 4, 5, 6, 7].values()
  .drop(1)
  .take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]

Iterator.from({
  next: () => ({ done: Math.random() > 0.9, value: Math.random() * 10 | 0 }),
}).toArray(); // => [7, 6, 3, 0, 2, 8]
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/iterator-helpers`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/iterator-helpers.d.ts)
