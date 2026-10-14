/* eslint-disable @stylistic/one-var-declaration-per-line -- a declarator beside the destructure is the split host under test */
// A write in the sequence prefix of a destructure init runs before the pattern binds anything. A
// rewrite consuming the whole pattern lifts that prefix out of the declaration, and every later read
// resolves what the write left: the written constructor's statics, the written value's own methods,
// a compound write's result. A module of its own: a write of a name or a member slot is contagious
// for the whole file, so its neighbours here would answer for it.
QUnit.test('lifted init prefix: a written constructor alias reads the written statics', assert => {
  let x = Array;
  (() => {
    const { from } = (x = Map, Array);
    return from;
  })();
  assert.same(typeof x.from, 'undefined');
  assert.same(typeof x.groupBy, 'function');
});

QUnit.test('lifted init prefix: a written member keeps its written value type', assert => {
  const slot = { written: [1, 2] };
  let of;
  // eslint-disable-next-line prefer-const -- the assignment form is the host under test
  ({ of } = (slot.written = 'ab', Array));
  assert.same(slot.written.at(-1), 'b');
  assert.deepEqual(of(2), [2]);
});

QUnit.test('lifted init prefix: a compound write in a split declaration stays resolvable', assert => {
  const tail = 3;
  let list = [1, 2];
  const size = 1, { from: make } = (list += tail, Array);
  assert.true(list.includes('3'));
  let rows = [3, 4];
  const count = 2, { of: build } = (rows ||= null, Array);
  assert.same(rows.at(1), 4);
  assert.deepEqual([make([5]), build(6), size, count], [[5], [6], 1, 2]);
});
