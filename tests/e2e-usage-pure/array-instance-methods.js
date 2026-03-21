// Array mutating methods and less common instance methods
QUnit.test('Array#push', assert => {
  const arr = [1, 2];
  assert.same(arr.push(3, 4), 4);
  assert.deepEqual(arr, [1, 2, 3, 4]);
});

QUnit.test('Array#unshift', assert => {
  const arr = [3, 4];
  assert.same(arr.unshift(1, 2), 4);
  assert.deepEqual(arr, [1, 2, 3, 4]);
});

QUnit.test('Array#splice', assert => {
  const arr = [1, 2, 3, 4, 5];
  const removed = arr.splice(1, 2);
  assert.deepEqual(removed, [2, 3]);
  assert.deepEqual(arr, [1, 4, 5]);
});

QUnit.test('Array#toSpliced', assert => {
  const arr = [1, 2, 3, 4];
  const result = arr.toSpliced(1, 2, 99);
  assert.deepEqual(result, [1, 99, 4]);
  assert.deepEqual(arr, [1, 2, 3, 4], 'original unchanged');
});

QUnit.test('Array#copyWithin', assert => {
  assert.deepEqual([1, 2, 3, 4, 5].copyWithin(0, 3), [4, 5, 3, 4, 5]);
});

QUnit.test('Array#sort', assert => {
  assert.deepEqual([3, 1, 2].sort(), [1, 2, 3]);
});

QUnit.test('Array#reverse', assert => {
  assert.deepEqual([1, 2, 3].reverse(), [3, 2, 1]);
});

QUnit.test('Array#indexOf / lastIndexOf', assert => {
  assert.same([1, 2, 3, 2].indexOf(2), 1);
  assert.same([1, 2, 3, 2].lastIndexOf(2), 3);
  assert.same([1, 2, 3].indexOf(4), -1);
});

QUnit.test('Array#slice', assert => {
  assert.deepEqual([1, 2, 3, 4].slice(1, 3), [2, 3]);
});

QUnit.test('Array#concat', assert => {
  assert.deepEqual([1, 2].concat([3, 4], [5]), [1, 2, 3, 4, 5]);
});

QUnit.test('Array#reduceRight', assert => {
  assert.same([1, 2, 3].reduceRight((a, b) => a + b, 0), 6);
  assert.same(['a', 'b', 'c'].reduceRight((a, b) => a + b), 'cba');
});

QUnit.test('Array#join', assert => {
  assert.same([1, 2, 3].join('-'), '1-2-3');
  assert.same([1, 2, 3].join(','), '1,2,3');
});

QUnit.test('Array#forEach', assert => {
  const result = [];
  [1, 2, 3].forEach(x => result.push(x * 2));
  assert.deepEqual(result, [2, 4, 6]);
});

QUnit.test('Array#map', assert => {
  assert.deepEqual([1, 2, 3].map(x => x * 2), [2, 4, 6]);
});

QUnit.test('Array#every / some', assert => {
  assert.true([2, 4, 6].every(x => x % 2 === 0));
  assert.false([2, 3, 6].every(x => x % 2 === 0));
  assert.true([1, 2, 3].some(x => x > 2));
  assert.false([1, 2, 3].some(x => x > 5));
});
