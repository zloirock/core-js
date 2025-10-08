# Joint iteration
[Specification](https://tc39.es/proposal-joint-iteration/)\
[Proposal repo](https://github.com/tc39/proposal-joint-iteration)

## Modules
[`esnext.iterator.zip`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.zip.js), [`esnext.iterator.zip-keyed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.zip-keyed.js)

## Built-ins signatures
```ts
class Iterator {
  zip<T extends readonly Iterable<unknown>[]>(
    iterables: T,
    options?: {
      mode?: 'shortest' | 'longest' | 'strict';
      padding?: { [K in keyof T]?: T[K] extends Iterable<infer U> ? U : never };
    }
  ): IterableIterator<{ [K in keyof T]: T[K] extends Iterable<infer U> ? U : never }>;
  zipKeyed<K extends PropertyKey, V extends Record<K, Iterable<unknown>>>(
    iterables: V,
    options?: {
      mode?: 'shortest' | 'longest' | 'strict';
      padding?: { [P in keyof V]?: V[P] extends Iterable<infer U> ? U : never };
    }
  ): IterableIterator<{ [P in keyof V]: V[P] extends Iterable<infer U> ? U : never }>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```ts
core-js/proposals/joint-iteration
core-js(-pure)/full/iterator/zip
core-js(-pure)/full/iterator/zip-keyed
```

## Example
```js
Iterator.zip([
  [0, 1, 2],
  [3, 4, 5],
]).toArray();  // => [[0, 3], [1, 4], [2, 5]]

Iterator.zipKeyed({
  a: [0, 1, 2],
  b: [3, 4, 5, 6],
  c: [7, 8, 9],
}, {
  mode: 'longest',
  padding: { c: 10 },
}).toArray();
/* =>
[
  { a: 0,         b: 3, c: 7  },
  { a: 1,         b: 4, c: 8  },
  { a: 2,         b: 5, c: 9  },
  { a: undefined, b: 6, c: 10 },
];
 */
```
