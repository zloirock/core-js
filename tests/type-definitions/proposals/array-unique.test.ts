import 'core-js/full';

function testTypedArrayUniqueBy<T>(
  arr: { uniqueBy(resolver?: PropertyKey | ((value: T) => any)): any },
  key: PropertyKey
) {
  arr.uniqueBy();
  arr.uniqueBy(key);
  arr.uniqueBy((x: T) => x);
  // @ts-expect-error
  arr.uniqueBy({});
  // @ts-expect-error
  arr.uniqueBy((x: T) => x['notExist']);
}

testTypedArrayUniqueBy([{ id: '1', bar: '1' }, { id: '2', bar: '2' }, { id: '3', bar: '2' }], 'bar');
testTypedArrayUniqueBy(new Int8Array([1, 2, 3]), 1);
testTypedArrayUniqueBy(new Uint8Array([1, 2, 3]), 1);
testTypedArrayUniqueBy(new Uint8ClampedArray([1, 2, 3]), 1);
testTypedArrayUniqueBy(new Int16Array([1, 2, 3]), 1);
testTypedArrayUniqueBy(new Uint16Array([1, 2, 3]), 1);
testTypedArrayUniqueBy(new Int32Array([1, 2, 3]), 1);
testTypedArrayUniqueBy(new Uint32Array([1, 2, 3]), 1);
testTypedArrayUniqueBy(new Float32Array([1.0, 2.2, 3.0]), 1);
testTypedArrayUniqueBy(new Float64Array([1.0, 2.2, 3.0]), 1);
testTypedArrayUniqueBy(new BigInt64Array([BigInt(1), BigInt(2), BigInt(3)]), 1);
testTypedArrayUniqueBy(new BigUint64Array([BigInt(1), BigInt(2), BigInt(3)]), 1);
