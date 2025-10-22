import 'core-js/full';

[1, 2, 3].filterReject((v, i, arr) => v > 1);
['a', 'b'].filterReject((v, i, arr) => v === 'a');
const arr: number[] = [1, 2, 3];
const res: number[] = arr.filterReject(function(v) { return v < 2; }, { foo: true });


(new Int8Array([1, 2, 3])).filterReject((v, i, arr) => v > 1);
(new Uint8Array([1, 2, 3])).filterReject((v, i, arr) => v > 1);
(new Uint8ClampedArray([1, 2, 3])).filterReject((v, i, arr) => v > 1);
(new Int16Array([1, 2, 3])).filterReject((v, i, arr) => v > 1);
(new Uint16Array([1, 2, 3])).filterReject((v, i, arr) => v > 1);
(new Int32Array([1, 2, 3])).filterReject((v, i, arr) => v > 1);
(new Uint32Array([1, 2, 3])).filterReject((v, i, arr) => v > 1);
(new Float32Array([1, 2, 3])).filterReject((v, i, arr) => v > 1);
(new Float64Array([1, 2, 3])).filterReject((v, i, arr) => v > 1);

(new BigInt64Array([BigInt(1), BigInt(2), BigInt(3)])).filterReject((v, i, arr) => v > BigInt(1));
(new BigUint64Array([BigInt(1), BigInt(2), BigInt(3)])).filterReject((v, i, arr) => v > BigInt(1));

// @ts-expect-error
[1, 2, 3].filterReject((x: string) => false);

// @ts-expect-error
(new Int8Array([1, 2, 3])).filterReject((x: string) => false);

// @ts-expect-error
(new Uint8Array([1, 2, 3])).filterReject((x: string) => false);

// @ts-expect-error
(new Uint8ClampedArray([1, 2, 3])).filterReject((x: string) => false);

// @ts-expect-error
(new Int16Array([1, 2, 3])).filterReject((x: string) => false);

// @ts-expect-error
(new Uint16Array([1, 2, 3])).filterReject((x: string) => false);

// @ts-expect-error
(new Int32Array([1, 2, 3])).filterReject((x: string) => false);

// @ts-expect-error
(new Uint32Array([1, 2, 3])).filterReject((x: string) => false);

// @ts-expect-error
(new Float32Array([1, 2, 3])).filterReject((x: string) => false);

// @ts-expect-error
(new Float64Array([1, 2, 3])).filterReject((x: string) => false);

// @ts-expect-error
(new BigInt64Array([BigInt(1), BigInt(2), BigInt(3)])).filterReject((x: number) => false);

// @ts-expect-error
(new BigUint64Array([BigInt(1), BigInt(2), BigInt(3)])).filterReject((x: number) => false);
