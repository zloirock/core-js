---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [异步显式资源管理](https://github.com/tc39/proposal-async-explicit-resource-management)

:::note
只包含提案中内建的，`using` 语法需要转译支持。
:::

## 模块

- [`esnext.symbol.async-dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.async-dispose.js)
- [`esnext.async-disposable-stack.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-disposable-stack.constructor.js)
- [`esnext.async-iterator.async-dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.async-dispose.js)

## 类型

```ts
class Symbol {
  static asyncDispose: @@asyncDispose;
}
class AsyncDisposableStack {
  constructor(): AsyncDisposableStack;
  disposeAsync(): Promise<undefined>;
  use(value: AsyncDisposable | Disposable): value;
  adopt(value: object, onDispose: Function): value;
  defer(onDispose: Function): undefined;
  @@asyncDispose(): Promise<undefined>;
  @@toStringTag: 'AsyncDisposableStack';
}
class AsyncIterator {
  @@asyncDispose(): Promise<undefined>;
}
```

## 入口点

```
core-js/proposals/async-explicit-resource-management
core-js(-pure)/full/symbol/async-dispose
core-js(-pure)/full/async-disposable-stack
core-js(-pure)/full/async-iterator/async-dispose
```
