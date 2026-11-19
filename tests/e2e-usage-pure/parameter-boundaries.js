// Later inert parameters and opted-out leaves must not hide enabled instance methods.
export function readOptions({ includes }, options = {}) {
  return [includes.call([3, 7], 7), options];
}
export function readRest({ at }, ...tail) {
  return [at.call([3, 7], -1), tail];
}
export function readSibling({
  at,
  // core-js-disable-next-line
  flat,
}) {
  return [at.call([3, 7], -1), flat];
}

QUnit.test('parameter boundaries: later defaults and rest retain enabled leaves', assert => {
  assert.deepEqual(readOptions([3, 7]), [true, {}]);
  assert.deepEqual(readOptions([3, 7], 9), [true, 9]);
  assert.deepEqual(readRest([3, 7], 11, 13), [7, [11, 13]]);
  assert.same(readOptions.length, 1);
  assert.same(readRest.length, 1);
  assert.notSame(readOptions([3, 7])[1], readOptions([3, 7])[1], 'each call creates its own default');
});

QUnit.test('parameter boundaries: an opted-out sibling reads its native slot once', assert => {
  const source = [3, 7];
  let reads = 0;
  Object.defineProperty(source, 'flat', { get() {
    reads++;
    return 9;
  } });
  assert.deepEqual(readSibling(source), [7, 9]);
  assert.same(reads, 1);
});
