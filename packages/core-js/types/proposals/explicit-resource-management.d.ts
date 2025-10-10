// proposal stage: 3
// https://github.com/tc39/proposal-explicit-resource-management
// https://github.com/microsoft/TypeScript/blob/0a1aa6d6ebdfa16b82f4a6aaf282089b1d484e05/src/lib/esnext.disposable.d.ts
interface SymbolConstructor {
  readonly dispose: unique symbol;

  readonly asyncDispose: unique symbol;
}

interface Disposable {
  [Symbol.dispose](): void;
}

interface AsyncDisposable {
  [Symbol.asyncDispose](): PromiseLike<void>;
}

interface SuppressedError extends Error {
  error: any;
  suppressed: any;
}

interface SuppressedErrorConstructor {
  new (error: any, suppressed: any, message?: string): SuppressedError;
  (error: any, suppressed: any, message?: string): SuppressedError;
  readonly prototype: SuppressedError;
}

declare var SuppressedError: SuppressedErrorConstructor;

interface DisposableStack {
  readonly disposed: boolean;

  dispose(): void;

  use<T extends Disposable | null | undefined>(value: T): T;

  adopt<T>(value: T, onDispose: (value: T) => void): T;

  defer(onDispose: () => void): void;

  move(): DisposableStack;

  [Symbol.dispose](): void;

  readonly [Symbol.toStringTag]: string;
}

interface DisposableStackConstructor {
  new (): DisposableStack;
  readonly prototype: DisposableStack;
}
declare var DisposableStack: DisposableStackConstructor;

interface AsyncDisposableStack {
  readonly disposed: boolean;

  disposeAsync(): Promise<void>;

  use<T extends AsyncDisposable | Disposable | null | undefined>(value: T): T;

  adopt<T>(value: T, onDisposeAsync: (value: T) => PromiseLike<void> | void): T;

  defer(onDisposeAsync: () => PromiseLike<void> | void): void;

  move(): AsyncDisposableStack;

  [Symbol.asyncDispose](): Promise<void>;

  readonly [Symbol.toStringTag]: string;
}

interface AsyncDisposableStackConstructor {
  new (): AsyncDisposableStack;

  readonly prototype: AsyncDisposableStack;
}
declare var AsyncDisposableStack: AsyncDisposableStackConstructor;

interface IteratorObject<T, TReturn, TNext> extends Disposable {
}

interface AsyncIteratorObject<T, TReturn, TNext> extends AsyncDisposable {
}
