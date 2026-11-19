const log = [];

function read() {
  let C;
  // eslint-disable-next-line no-useless-assignment -- the overwritten capture exercises reaching-write ordering
  const realm = { [(log.push('key'), 'Map')]: C } = (log.push('rhs'), globalThis);
  C = { groupBy: 9 };
  return [realm === globalThis, C.groupBy];
}

QUnit.test('captured constructor: a later user write replaces the constructor', assert => {
  assert.deepEqual(read(), [true, 9]);
  assert.deepEqual(log, ['rhs', 'key']);
});
