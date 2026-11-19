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
