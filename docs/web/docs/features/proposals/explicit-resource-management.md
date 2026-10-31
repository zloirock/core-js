# Explicit resource management
[Specification](https://tc39.es/proposal-explicit-resource-management/)\
[Proposal repo](https://github.com/tc39/proposal-explicit-resource-management)

> [!NOTE]
> These are only built-ins for Explicit Resource Management; the `using` syntax requires [transpiler support](https://babeljs.io/docs/babel-plugin-transform-explicit-resource-management).

> [!WARNING]
> By default, `core-js` has no access to the real `%AsyncIteratorPrototype%`, so in engines without native support, async generator objects do not get `@@asyncDispose`. To fix it, set the `USE_FUNCTION_CONSTRUCTOR` option of `core-js/configurator` to `true` or pass `%AsyncIteratorPrototype%` to it as the `AsyncIteratorPrototype` option, see [`AsyncIterator` helpers caveats]({docs-version}/docs/features/proposals/async-iterator-helpers#h-caveats).

## Modules
[`es.async-disposable-stack.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.async-disposable-stack.constructor.js), [`es.async-iterator.async-dispose`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.async-iterator.async-dispose.js), [`es.disposable-stack.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.disposable-stack.constructor.js), [`es.iterator.dispose`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.iterator.dispose.js), [`es.suppressed-error.constructor`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.suppressed-error.constructor.js), [`es.symbol.async-dispose`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.async-dispose.js) and [`es.symbol.dispose`](https://github.com/zloirock/core-js/blob/v4/packages/core-js/modules/es.symbol.dispose.js).

## Built-ins signatures
```ts
class Symbol {
  static asyncDispose: @@asyncDispose;
  static dispose: @@dispose;
}

class DisposableStack {
  constructor(): DisposableStack;
  readonly attribute disposed: boolean;
  dispose(): undefined;
  use(value: Disposable | null | undefined): value;
  adopt(value: any, onDispose: Function): value;
  defer(onDispose: Function): undefined;
  move(): DisposableStack;
  @@dispose(): undefined;
  @@toStringTag: 'DisposableStack';
}

class AsyncDisposableStack {
  constructor(): AsyncDisposableStack;
  readonly attribute disposed: boolean;
  disposeAsync(): Promise<undefined>;
  use(value: AsyncDisposable | Disposable | null | undefined): value;
  adopt(value: any, onDispose: Function): value;
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
}

class Iterator {
  @@dispose(): undefined;
}

class AsyncIterator {
  @@asyncDispose(): Promise<undefined>;
}
```

## [Entry points]({docs-version}/docs/usage#h-entry-points)
```plaintext
core-js/proposals/explicit-resource-management
{ core-js, @core-js/pure }/es|stable|actual|full/async-disposable-stack
{ core-js, @core-js/pure }/es|stable|actual|full/async-disposable-stack/constructor
{ core-js, @core-js/pure }/es|stable|actual|full/async-iterator
{ core-js, @core-js/pure }/es|stable|actual|full/disposable-stack
{ core-js, @core-js/pure }/es|stable|actual|full/disposable-stack/constructor
{ core-js, @core-js/pure }/es|stable|actual|full/suppressed-error
{ core-js, @core-js/pure }/es|stable|actual|full/symbol/async-dispose
{ core-js, @core-js/pure }/es|stable|actual|full/symbol/dispose
```

## Examples
```js
const stack = new DisposableStack();
stack.use({
  [Symbol.dispose]() {
    console.log('resource disposed');
  },
});
stack.defer(() => console.log('deferred cleanup'));
stack.adopt(42, value => console.log(`${ value } released`));

stack.disposed; // => false
stack.dispose(); // -> '42 released', 'deferred cleanup', 'resource disposed'
stack.disposed; // => true

const failing = new DisposableStack();
failing.defer(() => {
  throw new Error('first');
});
failing.defer(() => {
  throw new Error('second');
});
try {
  failing.dispose();
} catch (error) {
  error instanceof SuppressedError; // => true
  error.error.message;              // => 'first'
  error.suppressed.message;         // => 'second'
}

const asyncStack = new AsyncDisposableStack();
asyncStack.defer(async () => console.log('async cleanup'));
await asyncStack.disposeAsync(); // -> 'async cleanup'

function * gen() {
  try {
    yield 1;
  } finally {
    console.log('iterator closed');
  }
}
const iterator = gen();
iterator.next();
iterator[Symbol.dispose](); // -> 'iterator closed'
```

## [TypeScript type definitions]({docs-version}/docs/typescript-type-definitions)
[`@core-js/types/proposals/explicit-resource-management`](https://github.com/zloirock/core-js/blob/v4/packages/core-js-types/src/base/proposals/explicit-resource-management.d.ts)
