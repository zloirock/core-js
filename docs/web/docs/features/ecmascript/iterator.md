# ECMAScript: Iterator
## Modules 
[`es.iterator.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.constructor.js), [`es.iterator.concat`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.concat.js), [`es.iterator.dispose`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.dispose.js), [`es.iterator.drop`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.drop.js), [`es.iterator.every`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.every.js), [`es.iterator.filter`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.filter.js), [`es.iterator.find`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.find.js), [`es.iterator.flat-map`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.flat-map.js), [`es.iterator.for-each`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.for-each.js), [`es.iterator.from`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.from.js), [`es.iterator.map`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.map.js), [`es.iterator.reduce`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.reduce.js), [`es.iterator.some`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.some.js), [`es.iterator.take`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.take.js), [`es.iterator.to-array`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.to-array.js)

## Built-ins signatures
```ts
class Iterator {
  static concat(...items: Array<IterableObject>): Iterator<any>;
  static from(iterable: Iterable<any> | Iterator<any>): Iterator<any>;
  drop(limit: uint): Iterator<any>;
  every(callbackfn: (value: any, counter: uint) => boolean): boolean;
  filter(callbackfn: (value: any, counter: uint) => boolean): Iterator<any>;
  find(callbackfn: (value: any, counter: uint) => boolean)): any;
  flatMap(callbackfn: (value: any, counter: uint) => Iterable<any> | Iterator<any>): Iterator<any>;
  forEach(callbackfn: (value: any, counter: uint) => void): void;
  map(callbackfn: (value: any, counter: uint) => any): Iterator<any>;
  reduce(callbackfn: (memo: any, value: any, counter: uint) => any, initialValue: any): any;
  some(callbackfn: (value: any, counter: uint) => boolean): boolean;
  take(limit: uint): Iterator<any>;
  toArray(): Array<any>;
  @@dispose(): undefined;
  @@toStringTag: 'Iterator'
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js(-pure)/es|stable|actual|full/iterator
core-js(-pure)/es|stable|actual|full/iterator/concat
core-js(-pure)/es|stable|actual|full/iterator/drop
core-js(-pure)/es|stable|actual|full/iterator/every
core-js(-pure)/es|stable|actual|full/iterator/filter
core-js(-pure)/es|stable|actual|full/iterator/find
core-js(-pure)/es|stable|actual|full/iterator/flat-map
core-js(-pure)/es|stable|actual|full/iterator/for-each
core-js(-pure)/es|stable|actual|full/iterator/from
core-js(-pure)/es|stable|actual|full/iterator/map
core-js(-pure)/es|stable|actual|full/iterator/reduce
core-js(-pure)/es|stable|actual|full/iterator/some
core-js(-pure)/es|stable|actual|full/iterator/take
core-js(-pure)/es|stable|actual|full/iterator/to-array
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

Iterator.concat([0, 1].values(), [2, 3], function * () {
  yield 4;
  yield 5;
}()).toArray(); // => [0, 1, 2, 3, 4, 5]
```

> [!WARNING]
> - For preventing prototype pollution, in the `pure` version, new `%IteratorPrototype%` methods are not added to the real `%IteratorPrototype%`, they are available only on wrappers - instead of `[].values().map(fn)` use `Iterator.from([]).map(fn)`.
