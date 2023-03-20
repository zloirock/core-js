---
category: feature
tag:
  - es-proposal
---

# [`AsyncIterator` helper 函数](https://github.com/tc39/proposal-async-iterator-helpers)

## 模块

- [`esnext.async-iterator.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.constructor.js)
- [`esnext.async-iterator.drop`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.drop.js)
- [`esnext.async-iterator.every`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.every.js)
- [`esnext.async-iterator.filter`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.filter.js)
- [`esnext.async-iterator.find`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.find.js)
- [`esnext.async-iterator.flat-map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.flat-map.js)
- [`esnext.async-iterator.for-each`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.for-each.js)
- [`esnext.async-iterator.from`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.from.js)
- [`esnext.async-iterator.indexed`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.indexed.js)
- [`esnext.async-iterator.map`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.map.js)
- [`esnext.async-iterator.reduce`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.reduce.js)
- [`esnext.async-iterator.some`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.some.js)
- [`esnext.async-iterator.take`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.take.js)
- [`esnext.async-iterator.to-array`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.to-array.js)
- [`esnext.iterator.to-async`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.to-async.js)

## 类型

```ts
class Iterator {
  toAsync(): AsyncIterator<any>;
}

class AsyncIterator {
  static from(iterable: AsyncIterable<any> | Iterable<any> | AsyncIterator<any>): AsyncIterator<any>;
  drop(limit: uint): AsyncIterator<any>;
  every(async callbackfn: (value: any, couner: uint) => boolean): Promise<boolean>;
  filter(async callbackfn: (value: any, couner: uint) => boolean): AsyncIterator<any>;
  find(async callbackfn: (value: any, couner: uint) => boolean)): Promise<any>;
  flatMap(async callbackfn: (value: any, couner: uint) => AsyncIterable<any> | Iterable<any> | AsyncIterator<any>): AsyncIterator<any>;
  forEach(async callbackfn: (value: any, couner: uint) => void): Promise<void>;
  map(async callbackfn: (value: any, couner: uint) => any): AsyncIterator<any>;
  reduce(async callbackfn: (memo: any, value: any, couner: uint) => any, initialValue: any): Promise<any>;
  some(async callbackfn: (value: any, couner: uint) => boolean): Promise<boolean>;
  take(limit: uint): AsyncIterator<any>;
  toArray(): Promise<Array>;
  @@toStringTag: 'AsyncIterator'
}
```

## 入口点

```
core-js/proposals/async-iterator-helpers
core-js(-pure)/actual|full/async-iterator
core-js(-pure)/actual|full/async-iterator/drop
core-js(-pure)/actual|full/async-iterator/every
core-js(-pure)/actual|full/async-iterator/filter
core-js(-pure)/actual|full/async-iterator/find
core-js(-pure)/actual|full/async-iterator/flat-map
core-js(-pure)/actual|full/async-iterator/for-each
core-js(-pure)/actual|full/async-iterator/from
core-js(-pure)/actual|full/async-iterator/indexed
core-js(-pure)/actual|full/async-iterator/map
core-js(-pure)/actual|full/async-iterator/reduce
core-js(-pure)/actual|full/async-iterator/some
core-js(-pure)/actual|full/async-iterator/take
core-js(-pure)/actual|full/async-iterator/to-array
```

## 示例

[_示例_](https://tinyurl.com/28tet4ek)

```js
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

- 为了避免污染原型，在 `pure` 版本中，新的 `%AsyncIteratorPrototype%` 方法没有被加入到真正的 `%AsyncIteratorPrototype%` 中，它们只在 wrapper 中可用——使用 `AsyncIterator.from([]).map(fn)` 代替 `[].values().toAsync().map(fn)`。
- 现在我们只能在异步生成器语法中使用真正的 `%AsyncIteratorPrototype%`。所以为了库和老浏览器的兼容性，我们必须使用 `Function` 构造器。但是，这破坏了与 CSP 的兼容性。所以如果你想使用真正的 `%AsyncIteratorPrototype%`，请在 `core-js/configurator` 中把`USE_FUNCTION_CONSTRUCTOR` 选项设为 `true`：

```js
const configurator = require("core-js/configurator");
configurator({ USE_FUNCTION_CONSTRUCTOR: true });
require("core-js/actual/async-iterator");
(async function* () {
  /* empty */
})() instanceof AsyncIterator; // => true
```
