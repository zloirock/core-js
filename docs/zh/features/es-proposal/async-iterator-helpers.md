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
class Iterator<T> {
  toAsync(): AsyncIterator<T>;
}

class AsyncIterator<T> {
  static from<U>(
    iterable: AsyncIterable<U> | Iterable<U> | AsyncIterator<U>
  ): AsyncIterator<U>;
  drop(limit: number): AsyncIterator<T>;
  every(
    callbackfn: (value: T, couner: number) => Promise<boolean>
  ): Promise<boolean>;
  filter(
    callbackfn: (value: T, couner: number) => Promise<boolean>
  ): AsyncIterator<T>;
  find(callbackfn: (value: T, couner: number) => Promise<boolean>): Promise<T>;
  flatMap<U>(
    callbackfn: (
      value: T,
      couner: number
    ) => AsyncIterable<U> | Iterable<U> | AsyncIterator<U>
  ): AsyncIterator<U>;
  forEach(
    callbackfn: (value: T, couner: number) => Promise<void>
  ): Promise<void>;
  map<U>(
    callbackfn: (value: T, couner: number) => Promise<U>
  ): AsyncIterator<U>;
  reduce<U>(
    callbackfn: (memo: U, value: T, couner: Promise<number>) => U,
    initialValue: U
  ): Promise<U>;
  some(callbackfn: (value: T, couner: number) => boolean): Promise<boolean>;
  take(limit: number): AsyncIterator<T>;
  toArray(): Promise<Array<T>>;
  [Symbol.toStringTag]: "AsyncIterator";
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

- 作为一个替代方案，你可以向`core-js/configurator`传递一个对象，该对象将被视为`%AsyncIteratorPrototype%`：

```js
const configurator = require("core-js/configurator");
const { getPrototypeOf } = Object;

configurator({
  AsyncIteratorPrototype: getPrototypeOf(
    getPrototypeOf(
      getPrototypeOf(
        (async function* () {
          /* empty */
        })()
      )
    )
  ),
});

require("core-js/actual/async-iterator");

(async function* () {
  /* empty */
})() instanceof AsyncIterator; // => true
```
