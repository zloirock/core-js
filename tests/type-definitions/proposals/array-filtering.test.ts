import 'core-js/full';

function testFilterReject<TArr, TValue>(arr: TArr & { filterReject: any }, _: TValue) {
  const res: typeof arr = arr.filterReject((x: TValue) => false);

  arr.filterReject(function(value: TValue, index: number, target: typeof arr) {
    return false;
  });

  arr.filterReject(function(this: { test: string }, value: TValue) {
    return false;
  }, { test: 'hello' });
}

testFilterReject([1, 2, 3], 1);
testFilterReject(new Int8Array([1, 2]), 1);
testFilterReject(new Uint8Array([1, 2]), 1);
testFilterReject(new Uint8ClampedArray([1, 2]), 1);
testFilterReject(new Int16Array([1, 2]), 1);
testFilterReject(new Uint16Array([1, 2]), 1);
testFilterReject(new Int32Array([1, 2]), 1);
testFilterReject(new Uint32Array([1, 2]), 1);
testFilterReject(new Float32Array([1, 2]), 1);
testFilterReject(new Float64Array([1, 2]), 1);
testFilterReject(new BigInt64Array([BigInt(1), BigInt(2)]), BigInt(1));
testFilterReject(new BigUint64Array([BigInt(1), BigInt(2)]), BigInt(1));

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
