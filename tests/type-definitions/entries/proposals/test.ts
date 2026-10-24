import '@core-js/types/proposals/array-flat-map';
import '@core-js/types/proposals/array-from-async';
import '@core-js/types/proposals/async-iterator-helpers';

const flatMappedArr: number[] = [1, 2, 3].flatMap(x => [x, x * 2]);

const fromAsync: Promise<number[]> = Array.fromAsync([1, 2, 3]);
const asyncIteratorArray: Promise<number[]> = AsyncIterator.from([1, 2, 3]).toArray();
