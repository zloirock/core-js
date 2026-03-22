// Iterator helpers: static + prototype methods
QUnit.test('Iterator.from', assert => {
  const it = Iterator.from([1, 2, 3]);
  assert.true(it instanceof Iterator);
  assert.deepEqual(Array.from(it), [1, 2, 3]);
});

QUnit.test('Iterator.from + Iterator#map', assert => {
  assert.deepEqual(Array.from(Iterator.from([1, 2, 3]).map(x => x * 2)), [2, 4, 6]);
});

QUnit.test('Iterator.from + Iterator#filter', assert => {
  assert.deepEqual(Array.from(Iterator.from([1, 2, 3, 4]).filter(x => x % 2)), [1, 3]);
});

QUnit.test('Iterator.from + Iterator#take', assert => {
  assert.deepEqual(Array.from(Iterator.from([1, 2, 3, 4, 5]).take(3)), [1, 2, 3]);
});

QUnit.test('Iterator.from + Iterator#drop', assert => {
  assert.deepEqual(Array.from(Iterator.from([1, 2, 3, 4, 5]).drop(2)), [3, 4, 5]);
});

QUnit.test('Iterator.from + Iterator#flatMap', assert => {
  assert.deepEqual(Array.from(Iterator.from([1, 2, 3]).flatMap(x => [x, x])), [1, 1, 2, 2, 3, 3]);
});

QUnit.test('Iterator.from + Iterator#forEach', assert => {
  const result = [];
  Iterator.from([1, 2, 3]).forEach(x => result.push(x));
  assert.deepEqual(result, [1, 2, 3]);
});

QUnit.test('Iterator.from + Iterator#find', assert => {
  assert.same(Iterator.from([1, 2, 3]).find(x => x > 1), 2);
});

QUnit.test('Iterator.from + Iterator#every', assert => {
  assert.true(Iterator.from([2, 4, 6]).every(x => x % 2 === 0));
  assert.false(Iterator.from([2, 3, 6]).every(x => x % 2 === 0));
});

QUnit.test('Iterator.from + Iterator#some', assert => {
  assert.true(Iterator.from([1, 2, 3]).some(x => x > 2));
  assert.false(Iterator.from([1, 2, 3]).some(x => x > 5));
});

QUnit.test('Iterator.from + Iterator#reduce', assert => {
  assert.same(Iterator.from([1, 2, 3]).reduce((a, b) => a + b, 0), 6);
});

QUnit.test('Iterator.from + Iterator#toArray', assert => {
  assert.deepEqual(Iterator.from([1, 2, 3]).toArray(), [1, 2, 3]);
});

QUnit.test('Iterator.from + Iterator#includes', assert => {
  assert.true(Iterator.from([1, 2, 3]).includes(2));
  assert.false(Iterator.from([1, 2, 3]).includes(4));
});

QUnit.test('Iterator.from + Iterator#join', assert => {
  assert.same(Iterator.from([1, 2, 3]).join('-'), '1-2-3');
  // eslint-disable-next-line unicorn/require-array-join-separator -- testing
  assert.same(Iterator.from([1, 2, 3]).join(), '1,2,3');
});

QUnit.test('Iterator.from + Iterator#chunks', assert => {
  assert.deepEqual(Array.from(Iterator.from([1, 2, 3, 4, 5]).chunks(2)), [[1, 2], [3, 4], [5]]);
});

QUnit.test('Iterator.from + Iterator#windows', assert => {
  assert.deepEqual(Array.from(Iterator.from([1, 2, 3, 4]).windows(2)), [[1, 2], [2, 3], [3, 4]]);
});

QUnit.test('Iterator.from + Iterator#toAsync', assert => {
  const async = assert.async();
  Iterator.from([1, 2, 3]).toAsync().toArray().then(arr => {
    assert.deepEqual(arr, [1, 2, 3]);
    async();
  });
});

QUnit.test('Iterator.concat', assert => {
  assert.deepEqual(Array.from(Iterator.concat([1, 2], [3, 4])), [1, 2, 3, 4]);
});
