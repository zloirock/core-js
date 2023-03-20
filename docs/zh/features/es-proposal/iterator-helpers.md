---
category: feature
tag:
  - es-proposal
---

# [`Iterator` helper 函数](https://github.com/tc39/proposal-iterator-helpers)

:::note
这是一个 ECMAScript 提案，请不要把它与 Core-JS 提供的 helper 函数混淆。
:::

## 模块

- [`esnext.iterator.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.constructor.js)
- [`esnext.iterator.drop`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.drop.js)
- [`esnext.iterator.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.every.js)
- [`esnext.iterator.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.filter.js)
- [`esnext.iterator.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.find.js)
- [`esnext.iterator.flat-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.flat-map.js)
- [`esnext.iterator.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.for-each.js)
- [`esnext.iterator.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.from.js)
- [`esnext.iterator.indexed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.indexed.js)
- [`esnext.iterator.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.map.js)
- [`esnext.iterator.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.reduce.js)
- [`esnext.iterator.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.some.js)
- [`esnext.iterator.take`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.take.js)
- [`esnext.iterator.to-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.to-array.js)

## 类型

```ts
class Iterator {
  static from(iterable: Iterable<any> | Iterator<any>): Iterator<any>;
  drop(limit: uint): Iterator<any>;
  every(callbackfn: value: any => boolean): boolean;
  filter(callbackfn: value: any => boolean): Iterator<any>;
  find(callbackfn: value: any => boolean): any;
  flatMap(callbackfn: (value: any, couner: uint) => Iterable<any> | Iterator<any>): Iterator<any>;
  forEach(callbackfn: value => void): void;
  indexed(): Iterator<[index, any]>;
  map(callbackfn: value => any): Iterator<any>;
  reduce(callbackfn: (memo: any, value: any) => any, initialValue: any): any;
  some(callbackfn: value: any => boolean): boolean;
  take(limit: uint): Iterator<any>;
  toArray(): Array<any>;
  @@toStringTag: 'Iterator'
}
```

## 入口点

```
core-js/proposals/iterator-helpers
core-js(-pure)/full/async-iterator
core-js(-pure)/full/async-iterator/drop
core-js(-pure)/full/async-iterator/every
core-js(-pure)/full/async-iterator/filter
core-js(-pure)/full/async-iterator/find
core-js(-pure)/full/async-iterator/flat-map
core-js(-pure)/full/async-iterator/for-each
core-js(-pure)/full/async-iterator/from
core-js(-pure)/full/async-iterator/indexed
core-js(-pure)/full/async-iterator/map
core-js(-pure)/full/async-iterator/reduce
core-js(-pure)/full/async-iterator/some
core-js(-pure)/full/async-iterator/take
core-js(-pure)/full/async-iterator/to-array
core-js(-pure)/full/iterator
core-js(-pure)/full/iterator/drop
core-js(-pure)/full/iterator/every
core-js(-pure)/full/iterator/filter
core-js(-pure)/full/iterator/find
core-js(-pure)/full/iterator/flat-map
core-js(-pure)/full/iterator/for-each
core-js(-pure)/full/iterator/from
core-js(-pure)/full/iterator/indexed
core-js(-pure)/full/iterator/map
core-js(-pure)/full/iterator/reduce
core-js(-pure)/full/iterator/some
core-js(-pure)/full/iterator/take
core-js(-pure)/full/iterator/to-array
```

## 示例

[_示例_](https://is.gd/P7YLCq):

```js
[1, 2, 3, 4, 5, 6, 7]
  .values()
  .drop(1)
  .take(5)
  .filter((it) => it % 2)
  .map((it) => it ** 2)
  .toArray(); // => [9, 25]

Iterator.from({
  next: () => ({ done: Math.random() > 0.9, value: (Math.random() * 10) | 0 }),
}).toArray(); // => [7, 6, 3, 0, 2, 8]

await AsyncIterator.from([1, 2, 3, 4, 5, 6, 7])
  .drop(1)
  .take(5)
  .filter((it) => it % 2)
  .map((it) => it ** 2)
  .toArray(); // => [9, 25]

await [1, 2, 3]
  .values()
  .toAsync()
  .map(async (it) => it ** 2)
  .toArray(); // => [1, 4, 9]
```

## 注意事项

- 为了避免污染原型，在 `pure` 版本中，新的 `%IteratorPrototype%` 方法没有被加入到真正的 `%IteratorPrototype%` 中，它们只在 wrapper 中可用——使用 `AIterator.from([]).map(fn)` 代替 `[].values().map(fn)`。
