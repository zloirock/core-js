import promiseResolve from '@core-js/pure/full/promise/resolve';
import symbolDispose from '@core-js/pure/full/symbol/dispose';
import symbolAsyncDispose from '@core-js/pure/full/symbol/async-dispose';
import symbolToStringTag from '@core-js/pure/full/symbol/to-string-tag';
import iteratorRange from '@core-js/pure/full/iterator/range';
import asyncIteratorFrom from '@core-js/pure/full/async-iterator/from';
import $SuppressedError from '@core-js/pure/full/suppressed-error/constructor';
import $DisposableStack from '@core-js/pure/full/disposable-stack/constructor';
import $AsyncDisposableStack from '@core-js/pure/full/async-disposable-stack/constructor';
import { assertCoreJSPromiseLike } from '../../helpers.pure.js';

const d: symbol = symbolDispose;
const ad: symbol = symbolAsyncDispose;

// @ts-expect-error
const wrong: number = symbolDispose;

const objD = {
  [symbolDispose]() { /* empty */ },
};
objD[symbolDispose]();

const objAD = {
  [symbolAsyncDispose]() { return promiseResolve(); },
};
const p1 = objAD[symbolAsyncDispose]();
assertCoreJSPromiseLike<void>(p1);

const err1 = new $SuppressedError('err', 'suppressed', 'msg');
err1.error;
err1.suppressed;
const m1: string = err1.message;
const _: Error = err1;

const err2 = $SuppressedError(123, 456);
err2.error;
err2.suppressed;
err2.message;

// @ts-expect-error
new $SuppressedError(1, 2, 3, 4);

const objDS = new $DisposableStack();
const disposed: boolean = objDS.disposed;
objDS.dispose();
objDS.use(objD);
const ruse2: null = objDS.use(null);
const ruse3: undefined = objDS.use(undefined);
const radopt1: string = objDS.adopt('foo', (value: string) => { /* empty */ });
objDS.defer(() => { /* empty */ });
objDS.move();
objDS[symbolDispose]();
const rts1: string = objDS[symbolToStringTag];

// @ts-expect-error
objDS.dispose(1);
// @ts-expect-error
objDS.use('foo');
// @ts-expect-error
objDS.defer('bar');
// @ts-expect-error
objDS.move(1);
// @ts-expect-error
objDS[symbolToStringTag] = 'foo';

$AsyncDisposableStack.prototype;
const objADS = new $AsyncDisposableStack();
const disposedASD: boolean = objDS.disposed;
const rda = objADS.disposeAsync();
assertCoreJSPromiseLike<void>(rda);
objADS.use(objAD);
objADS.use(objD);
const ruseASD3: null = objADS.use(null);
const ruseASD4: undefined = objADS.use(undefined);
const radoptASD1: string = objADS.adopt('foo', (value: string) => { /* empty */ });
const radoptASD2: string = objADS.adopt('foo', async (value: string) => { /* empty */ });
const radoptASD3: string = objADS.adopt('foo', (value: string) => promiseResolve());
const radoptASD4: string = objADS.adopt('foo', async (value: string) => promiseResolve());
objADS.defer(() => { /* empty */ });
objADS.defer(async () => { /* empty */ });
objADS.defer(() => promiseResolve());
objADS.defer(async () => promiseResolve());
objADS.move();
objADS[symbolAsyncDispose]();
const rtsASD1: string = objADS[symbolToStringTag];

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

const iter = iteratorRange(1, 3);
iter[symbolDispose]();

const asyncIter = asyncIteratorFrom([1, 2, 3]);
asyncIter[symbolAsyncDispose]();
