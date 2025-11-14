import symbolDispose from '@core-js/pure/full/symbol/dispose';
import symbolAsyncDispose from '@core-js/pure/full/symbol/async-dispose';
import suppressedError from '@core-js/pure/full/suppressed-error/constructor';
import disposableStack from '@core-js/pure/full/disposable-stack/constructor';
import asyncDisposableStack from '@core-js/pure/full/async-disposable-stack/constructor';

const d: symbol = symbolDispose;
const ad: symbol = symbolAsyncDispose;

// @ts-expect-error
const wrong: number = symbolDispose;

const objD: Disposable = {
  [symbolDispose]() { /* empty */ }
};
objD[symbolDispose]();

const objAD: AsyncDisposable = {
  [symbolAsyncDispose]() { return Promise.resolve(); }
}
objAD[symbolAsyncDispose]();

const err1 = new suppressedError('err', 'suppressed', 'msg');
err1.error;
err1.suppressed;
const m1: string = err1.message;
const _: Error = err1;

const err2 = suppressedError(123, 456);
err2.error;
err2.suppressed;
err2.message;

// @ts-expect-error
new suppressedError(1, 2, 3, 4);

const protoDS: DisposableStack = disposableStack.prototype;
const objDS: DisposableStack = new disposableStack();
const disposed: boolean = objDS.disposed;
objDS.dispose();
const ruse1: Disposable = objDS.use(objD);
const ruse2: null = objDS.use(null);
const ruse3: undefined = objDS.use(undefined);
const radopt1: string = objDS.adopt('foo', (value: string) => { /* empty */ });
objDS.defer(() => { /* empty */ });
const rmove1: DisposableStack = objDS.move();
objDS[symbolDispose]();
const rts1: string = objDS[Symbol.toStringTag];

// @ts-expect-error
objDS.dispose(1);
// @ts-expect-error
objDS.use('foo');
// @ts-expect-error
objDS.defer('bar');
// @ts-expect-error
objDS.move(1);
// @ts-expect-error
objDS[Symbol.toStringTag] = 'foo';

const protoADS: AsyncDisposableStack = asyncDisposableStack.prototype;
const objADS: AsyncDisposableStack = new asyncDisposableStack();
const disposedASD: boolean = objDS.disposed;
const rda: Promise<void> = objADS.disposeAsync();
const ruseASD1: AsyncDisposable = objADS.use(objAD);
const ruseASD2: Disposable = objADS.use(objD);
const ruseASD3: null = objADS.use(null);
const ruseASD4: undefined = objADS.use(undefined);
const radoptASD1: string = objADS.adopt('foo', (value: string) => { /* empty */ });
const radoptASD2: string = objADS.adopt('foo', async (value: string) => { /* empty */ });
const radoptASD3: string = objADS.adopt('foo', (value: string) => Promise.resolve());
const radoptASD4: string = objADS.adopt('foo', async (value: string) => Promise.resolve());
objADS.defer(() => { /* empty */ });
objADS.defer(async () => { /* empty */ });
objADS.defer(() => Promise.resolve());
objADS.defer(async () => Promise.resolve());
const rmoveASD1: AsyncDisposableStack = objADS.move();
objADS[symbolAsyncDispose]();
const rtsASD1: string = objADS[Symbol.toStringTag];

// @ts-expect-error
objADS.disposeAsync(1).then();
// @ts-expect-error
objADS.use('foo').then();
// @ts-expect-error
objADS.defer('bar');
// @ts-expect-error
objADS.move(1);
// @ts-expect-error
objADS[Symbol.toStringTag] = 'foo';

declare const iter: IteratorObject<string, void, string>;
iter[symbolDispose]();

declare const asyncIter: AsyncIteratorObject<string, void, string>;
asyncIter[symbolAsyncDispose]();
