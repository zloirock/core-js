# Joint iteration
[Specification](https://tc39.es/proposal-joint-iteration/)\
[Proposal repo](https://github.com/tc39/proposal-joint-iteration)

## Modules
[`es.iterator.zip`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.zip.js), [`es.iterator.zip-keyed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.zip-keyed.js).

## Built-ins signatures
```ts
type ZipSource<T> = IterableObject<T> | Iterator<T>;

class Iterator {
  static zip(iterables: Iterable<ZipSource<value>>, options?: { mode?: 'shortest' | 'strict' = 'shortest' }): Iterator<Array<value>>;
  static zip(iterables: Iterable<ZipSource<value>>, options: {
    mode: 'longest', padding?: IterableObject<paddingValue>,
  }): Iterator<Array<value | paddingValue | undefined>>;
  static zipKeyed(iterables: Record<key, ZipSource<value> | undefined>, options?: {
    mode?: 'shortest' | 'strict' = 'shortest',
  }): Iterator<Partial<Record<key, value>>>;
  static zipKeyed(iterables: Record<key, ZipSource<value> | undefined>, options: {
    mode: 'longest', padding?: Partial<Record<key, paddingValue>>,
  }): Iterator<Partial<Record<key, value | paddingValue | undefined>>>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/joint-iteration
core-js(-pure)/es|stable|actual|full/iterator/zip
core-js(-pure)/es|stable|actual|full/iterator/zip-keyed
```

## Examples
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
