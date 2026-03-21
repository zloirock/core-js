// Set methods: intersection, union, difference, symmetricDifference, isSubsetOf, isSupersetOf, isDisjointFrom
QUnit.test('Set#intersection', assert => {
  assert.deepEqual(Array.from(new Set([1, 2, 3]).intersection(new Set([2, 3, 4]))), [2, 3]);
  assert.deepEqual(Array.from(new Set([1, 2, 3]).intersection(new Set([4, 5]))), []);
});

QUnit.test('Set#union', assert => {
  assert.deepEqual(Array.from(new Set([1, 2]).union(new Set([2, 3]))), [1, 2, 3]);
});

QUnit.test('Set#difference', assert => {
  assert.deepEqual(Array.from(new Set([1, 2, 3]).difference(new Set([2, 3, 4]))), [1]);
});

QUnit.test('Set#symmetricDifference', assert => {
  assert.deepEqual(Array.from(new Set([1, 2, 3]).symmetricDifference(new Set([2, 3, 4]))), [1, 4]);
});

QUnit.test('Set#isSubsetOf', assert => {
  assert.true(new Set([1, 2]).isSubsetOf(new Set([1, 2, 3])));
  assert.false(new Set([1, 4]).isSubsetOf(new Set([1, 2, 3])));
});

QUnit.test('Set#isSupersetOf', assert => {
  assert.true(new Set([1, 2, 3]).isSupersetOf(new Set([1, 2])));
  assert.false(new Set([1, 2]).isSupersetOf(new Set([1, 2, 3])));
});

QUnit.test('Set#isDisjointFrom', assert => {
  assert.true(new Set([1, 2]).isDisjointFrom(new Set([3, 4])));
  assert.false(new Set([1, 2]).isDisjointFrom(new Set([2, 3])));
});
