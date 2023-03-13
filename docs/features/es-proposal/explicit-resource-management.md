---
category: feature
tag:
  - es-proposal
  - missing-example
---

# [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management)

:::note
This is only built-ins for this proposal, `using` syntax support requires transpiler support.
:::

## Modules

- [`esnext.symbol.dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.symbol.dispose.js)
- [`esnext.disposable-stack.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.disposable-stack.constructor.js)
- [`esnext.suppressed-error.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.suppressed-error.constructor.js)
- [`esnext.iterator.dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.iterator.dispose.js)

## Types

```ts
class Symbol {
  static dispose: @@dispose;
}
class DisposableStack {
  constructor(): DisposableStack;
  dispose(): undefined;
  use(value: Disposable): value;
  adopt(value: object, onDispose: Function): value;
  defer(onDispose: Function): undefined;
  @@dispose(): undefined;
  @@toStringTag: 'DisposableStack';
}
class SuppressedError extends Error {
  constructor(error: any, suppressed: any, message?: string): SuppressedError;
  error: any;
  suppressed: any;
  message: string;
  cause: any;
}
class Iterator {
  @@dispose(): undefined;
}
```

## Entry points

```
core-js/proposals/explicit-resource-management
core-js(-pure)/actual|full/symbol/dispose
core-js(-pure)/actual|full/disposable-stack
core-js(-pure)/actual|full/suppressed-error
core-js(-pure)/actual|full/iterator/dispose
```
