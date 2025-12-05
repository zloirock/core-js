/// <reference types="./symbol.d.ts" />

// Motivation: Symbol is replaced with our own

// proposal stage: 3
// https://github.com/tc39/proposal-explicit-resource-management

// For ensuring compatibility with TypeScript standard types, this code is based on:
// https://github.com/microsoft/TypeScript/blob/0a1aa6d6ebdfa16b82f4a6aaf282089b1d484e05/src/lib/esnext.disposable.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  export interface CoreJSDisposable {
    [CoreJSSymbol.dispose](): void;
  }

  var CoreJSDisposable: CoreJSDisposable;

  export interface CoreJSAsyncDisposable {
    [CoreJSSymbol.asyncDispose](): PromiseLike<void>;
  }

  var CoreJSAsyncDisposable: CoreJSAsyncDisposable;

  export interface CoreJSSuppressedError extends Error {
    error: any;
    suppressed: any;
  }

  export interface CoreJSSuppressedErrorConstructor {
    readonly prototype: CoreJSSuppressedError;

    new(error: any, suppressed: any, message?: string): CoreJSSuppressedError;

    (error: any, suppressed: any, message?: string): CoreJSSuppressedError;
  }

  var CoreJSSuppressedError: CoreJSSuppressedErrorConstructor;

  var CoreJSDisposableStack: CoreJSDisposableStackConstructor;

  export interface CoreJSDisposableStack {
    /**
     * Returns a value indicating whether this stack has been disposed.
     */
    readonly disposed: boolean;
    readonly [CoreJSSymbol.toStringTag]: string;

    /**
     * Disposes each resource in the stack in the reverse order that they were added.
     */
    dispose(): void;

    /**
     * Adds a disposable resource to the stack, returning the resource.
     * @param value The resource to add. `null` and `undefined` will not be added, but will be returned.
     * @returns The provided {@link value}.
     */
    use<T extends CoreJSDisposable | null | undefined>(value: T): T;

    /**
     * Adds a value and associated disposal callback as a resource to the stack.
     * @param value The value to add.
     * @param onDispose The callback to use in place of a `[CoreJSSymbol.dispose]()` method. Will be invoked with `value`
     * as the first parameter.
     * @returns The provided {@link value}.
     */
    adopt<T>(value: T, onDispose: (value: T) => void): T;

    /**
     * Adds a callback to be invoked when the stack is disposed.
     */
    defer(onDispose: () => void): void;

    /**
     * Move all resources out of this stack and into a new `DisposableStack`, and marks this stack as disposed.
     * @example
     * ```ts
     * class C {
     *   #res1: Disposable;
     *   #res2: Disposable;
     *   #disposables: DisposableStack;
     *   constructor() {
     *     // stack will be disposed when exiting constructor for any reason
     *     using stack = new DisposableStack();
     *
     *     // get first resource
     *     this.#res1 = stack.use(getResource1());
     *
     *     // get second resource. If this fails, both `stack` and `#res1` will be disposed.
     *     this.#res2 = stack.use(getResource2());
     *
     *     // all operations succeeded, move resources out of `stack` so that they aren't disposed
     *     // when constructor exits
     *     this.#disposables = stack.move();
     *   }
     *
     *   [CoreJSSymbol.dispose]() {
     *     this.#disposables.dispose();
     *   }
     * }
     * ```
     */
    move(): CoreJSDisposableStack;

    [CoreJSSymbol.dispose](): void;
  }

  export interface CoreJSDisposableStackConstructor {
    readonly prototype: CoreJSDisposableStack;

    new(): CoreJSDisposableStack;
  }

  var CoreJSAsyncDisposableStack: CoreJSAsyncDisposableStackConstructor;

  export interface CoreJSAsyncDisposableStack {

    /**
     * Returns a value indicating whether this stack has been disposed.
     */
    readonly disposed: boolean;
    readonly [CoreJSSymbol.toStringTag]: string;

    /**
     * Disposes each resource in the stack in the reverse order that they were added.
     */
    disposeAsync(): Promise<void>;

    /**
     * Adds a disposable resource to the stack, returning the resource.
     * @param value The resource to add. `null` and `undefined` will not be added, but will be returned.
     * @returns The provided {@link value}.
     */
    use<T extends CoreJSAsyncDisposable | CoreJSDisposable | null | undefined>(value: T): T;

    /**
     * Adds a value and associated disposal callback as a resource to the stack.
     * @param value The value to add.
     * @param onDisposeAsync The callback to use in place of a `[CoreJSSymbol.asyncDispose]()` method. Will be invoked with `value`
     * as the first parameter.
     * @returns The provided {@link value}.
     */
    adopt<T>(value: T, onDisposeAsync: (value: T) => PromiseLike<void> | void): T;

    /**
     * Adds a callback to be invoked when the stack is disposed.
     */
    defer(onDisposeAsync: () => PromiseLike<void> | void): void;

    /**
     * Move all resources out of this stack and into a new `DisposableStack`, and marks this stack as disposed.
     * @example
     * ```ts
     * class C {
     *   #res1: CoreJSDisposable;
     *   #res2: CoreJSDisposable;
     *   #disposables: CoreJSDisposableStack;
     *   constructor() {
     *     // stack will be disposed when exiting constructor for any reason
     *     using stack = new DisposableStack();
     *
     *     // get first resource
     *     this.#res1 = stack.use(getResource1());
     *
     *     // get second resource. If this fails, both `stack` and `#res1` will be disposed.
     *     this.#res2 = stack.use(getResource2());
     *
     *     // all operations succeeded, move resources out of `stack` so that they aren't disposed
     *     // when constructor exits
     *     this.#disposables = stack.move();
     *   }
     *
     *   [CoreJSSymbol.dispose]() {
     *     this.#disposables.dispose();
     *   }
     * }
     * ```
     */
    move(): CoreJSAsyncDisposableStack;

    [CoreJSSymbol.asyncDispose](): Promise<void>;
  }

  export interface CoreJSAsyncDisposableStackConstructor {

    readonly prototype: CoreJSAsyncDisposableStack;

    new(): CoreJSAsyncDisposableStack;
  }
}
