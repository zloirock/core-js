import $Math from 'core-js/full/math';
import $MathIndex from 'core-js/full/math/index';
import $MathIndexJS from 'core-js/full/math/index.js';
import $Array from 'core-js/full/array';
import $ArrayIndex from 'core-js/full/array/index';
import $ArrayIndexJS from 'core-js/full/array/index.js';
import chunks from 'core-js/full/iterator/chunks';
import chunksJS from 'core-js/full/iterator/chunks.js';
import ESAsyncIterator from 'core-js/es/async-iterator';
import StableAsyncIterator from 'core-js/stable/async-iterator';
import ActualAsyncIterator from 'core-js/actual/async-iterator';
import FullAsyncIterator from 'core-js/full/async-iterator';

const esConstructor: typeof FullAsyncIterator = ESAsyncIterator;
const stableConstructor: typeof FullAsyncIterator = StableAsyncIterator;
const actualConstructor: typeof FullAsyncIterator = ActualAsyncIterator;
const asyncValues: AsyncIterator<number> = FullAsyncIterator.from([1, 2]);
const esPrototype: AsyncDisposable = ESAsyncIterator.prototype;
const stablePrototype: AsyncDisposable = StableAsyncIterator.prototype;
const actualPrototype: AsyncDisposable = ActualAsyncIterator.prototype;
const fullPrototype: AsyncDisposable = FullAsyncIterator.prototype;

$Math.f16round(7.9999999);
$MathIndex.f16round(7.9999999);
$MathIndexJS.f16round(7.9999999);

$Array.from([1, 2, 3]);
$ArrayIndex.from([1, 2, 3]);
$ArrayIndexJS.from([1, 2, 3]);

declare const num: Iterator<number>;
chunks(num, 2);
chunksJS(num, 2);
