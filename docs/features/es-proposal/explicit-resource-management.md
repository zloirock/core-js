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
interface SymbolConstructor {
  readonly dispose: unique symbol;
}
class DisposableStack {
  constructor();
  dispose(): void;
  use<T = Disposable>(value: T): T;
  adopt<T>(value: T, onDispose: (value: T) => void): T;
  defer(onDispose: Function): undefined;
  [Symbol.dispose](): undefined;
  [Symbol.toStringTag]: "DisposableStack";
}
class SuppressedError extends Error {
  constructor(error: any, suppressed: any, message?: string);
  error: any;
  suppressed: any;
  message: string;
  cause: any;
}
interface Iterator<T> {
  [Symbol.dispose](): void;
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
