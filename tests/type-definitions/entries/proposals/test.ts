import '@core-js/types/proposals/array-flat-map';
import '@core-js/types/proposals/array-from-async';
import '@core-js/types/proposals/async-iterator-helpers';
import '@core-js/types/proposals/number-clamp';
import '@core-js/types/proposals/object-get-own-property-descriptors';

const flatMappedArr: number[] = [1, 2, 3].flatMap(x => [x, x * 2]);

const fromAsync: Promise<number[]> = Array.fromAsync([1, 2, 3]);
const asyncIteratorArray: Promise<number[]> = AsyncIterator.from([1, 2, 3]).toArray();

const clamped: number = (5).clamp(0, 10);
const descriptor: TypedPropertyDescriptor<number> = Object.getOwnPropertyDescriptors({ a: 1 }).a;
