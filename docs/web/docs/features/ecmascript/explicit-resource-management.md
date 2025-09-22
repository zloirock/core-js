# ECMAScript: Explicit Resource Management
> [!NOTE]
> This is only built-ins for this Explicit Resource Management, `using` syntax support requires [transpiler support](https://babeljs.io/docs/babel-plugin-syntax-explicit-resource-management).

## Modules 
[`es.disposable-stack.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.disposable-stack.constructor.js), [`es.iterator.dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.iterator.dispose.js), [`es.async-disposable-stack.constructor`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/es.async-disposable-stack.constructor.js), [`es.async-iterator.async-dispose`](https://github.com/zloirock/core-js/blob/master/packages/core-js/modules/esnext.async-iterator.async-dispose.js).

## Built-ins signatures
```ts
class Symbol {
  static asyncDispose: @@asyncDispose;
  static dispose: @@dispose;
}

class DisposableStack {
  constructor(): DisposableStack;
  dispose(): undefined;
  use(value: Disposable): value;
  adopt(value: object, onDispose: Function): value;
  defer(onDispose: Function): undefined;
  move(): DisposableStack;
  @@dispose(): undefined;
  @@toStringTag: 'DisposableStack';
}

class AsyncDisposableStack {
  constructor(): AsyncDisposableStack;
  disposeAsync(): Promise<undefined>;
  use(value: AsyncDisposable | Disposable): value;
  adopt(value: object, onDispose: Function): value;
  defer(onDispose: Function): undefined;
  move(): AsyncDisposableStack;
  @@asyncDispose(): Promise<undefined>;
  @@toStringTag: 'AsyncDisposableStack';
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

class AsyncIterator {
  @@asyncDispose(): Promise<undefined>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```
core-js(-pure)/es|stable|actual|full/disposable-stack
core-js(-pure)/es|stable|actual|full/async-disposable-stack
core-js(-pure)/es|stable|actual|full/iterator/dispose
core-js(-pure)/es|stable|actual|full/async-iterator/async-dispose
```
