import functionNamespace from '@core-js/pure/es/function';
import dataViewConstructor from '@core-js/pure/es/data-view/constructor';
import dataView from '@core-js/pure/es/data-view';
import arrayBufferConstructor from '@core-js/pure/es/array-buffer/constructor';
import isView from '@core-js/pure/es/array-buffer/is-view';
import arrayBuffer from '@core-js/pure/es/array-buffer';
import typedConstructors from '@core-js/pure/es/typed-array/constructors';
import typedArrays from '@core-js/pure/es/typed-array';
import bareRoot from '@core-js/pure';
import indexRoot from '@core-js/pure/index';
import jsRoot from '@core-js/pure/index.js';
import $Math from '@core-js/pure/full/math';
import $MathIndex from '@core-js/pure/full/math/index';
import $MathIndexJS from '@core-js/pure/full/math/index.js';
import $Array from '@core-js/pure/full/array';
import $ArrayIndex from '@core-js/pure/full/array/index';
import $ArrayIndexJS from '@core-js/pure/full/array/index.js';
import chunks from '@core-js/pure/full/iterator/chunks';
import chunksJS from '@core-js/pure/full/iterator/chunks.js';
import ESAsyncIterator from '@core-js/pure/es/async-iterator';
import StableAsyncIterator from '@core-js/pure/stable/async-iterator';
import ActualAsyncIterator from '@core-js/pure/actual/async-iterator';
import FullAsyncIterator from '@core-js/pure/full/async-iterator';

const esConstructor: typeof FullAsyncIterator = ESAsyncIterator;
const stableConstructor: typeof FullAsyncIterator = StableAsyncIterator;
const actualConstructor: typeof FullAsyncIterator = ActualAsyncIterator;
const asyncValues: AsyncIterator<number> = FullAsyncIterator.from([1, 2]);
const esPrototype: CoreJS.CoreJSAsyncDisposable = ESAsyncIterator.prototype;
const stablePrototype: CoreJS.CoreJSAsyncDisposable = StableAsyncIterator.prototype;
const actualPrototype: CoreJS.CoreJSAsyncDisposable = ActualAsyncIterator.prototype;
const fullPrototype: CoreJS.CoreJSAsyncDisposable = FullAsyncIterator.prototype;

$Math.f16round(7.9999999);
$MathIndex.f16round(7.9999999);
$MathIndexJS.f16round(7.9999999);

$Array.from([1, 2, 3]);
$ArrayIndex.from([1, 2, 3]);
$ArrayIndexJS.from([1, 2, 3]);

declare const num: Iterator<number>;
chunks(num, 2);
chunksJS(num, 2);

const sameRoot: typeof indexRoot = bareRoot;
const sameIndex: typeof jsRoot = bareRoot;

// @ts-expect-error This helper only ships in full.
import esmap from '@core-js/pure/es/async-iterator/map';
// @ts-expect-error This helper only ships in full.
import esflatmap from '@core-js/pure/es/async-iterator/flat-map';
// @ts-expect-error This helper only ships in full.
import esreduce from '@core-js/pure/es/async-iterator/reduce';
// @ts-expect-error This helper only ships in full.
import stablemap from '@core-js/pure/stable/async-iterator/map';
// @ts-expect-error This helper only ships in full.
import stableflatmap from '@core-js/pure/stable/async-iterator/flat-map';
// @ts-expect-error This helper only ships in full.
import stablereduce from '@core-js/pure/stable/async-iterator/reduce';
// @ts-expect-error This helper only ships in full.
import actualmap from '@core-js/pure/actual/async-iterator/map';
// @ts-expect-error This helper only ships in full.
import actualflatmap from '@core-js/pure/actual/async-iterator/flat-map';
// @ts-expect-error This helper only ships in full.
import actualreduce from '@core-js/pure/actual/async-iterator/reduce';

const rootPromise: Promise<number[]> = bareRoot.Promise.all([1]);
// @ts-expect-error The pure root does not expose arbitrary globals.
bareRoot.eval('0');
bareRoot.RegExp.escape('a+');
const prototypeMatch = bareRoot.StringPrototype.matchAll.call('a', /a/);
bareRoot.Array.from([1]);
bareRoot.Array.map([1], value => value * 2);
// @ts-expect-error The pure Array container exposes individual methods.
new bareRoot.Array(1);
typedArrays.Array.keys([1]);
typedConstructors.Object.toString({});
// @ts-expect-error This path does not export the native typed array constructors.
new typedArrays.Uint32Array(2);
const absentArrayBuffer: undefined = arrayBuffer;
const absentArrayBufferConstructor: undefined = arrayBufferConstructor;
const hostIsView: typeof ArrayBuffer.isView | undefined = isView;
if (isView) {
  const view: boolean = isView(new Uint8Array(1));
}
// @ts-expect-error The host may not provide ArrayBuffer.isView.
isView(new Uint8Array(1));
const absentDataView: undefined = dataView;
const absentDataViewConstructor: undefined = dataViewConstructor;
const absentFunctionNamespace: undefined = functionNamespace;
