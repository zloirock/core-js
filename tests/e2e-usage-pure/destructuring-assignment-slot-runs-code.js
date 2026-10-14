// an assignment over an object literal whose claimed slot runs code - a call, a `new` - beside a reader the
// pattern keeps: a sibling key ahead or behind it, a second slot that runs code, a deeper level. the claim is
// served, and every slot still runs once, in source order, in a statement, an unbraced body and a discarded
// sequence element
QUnit.test('destructuring assignment: a claim over a slot that runs code beside a sibling key is served', assert => {
  const events = [];
  function make(label) {
    events.push(label);
    return [1, 2];
  }
  let at, other, includes, twin;
  // eslint-disable-next-line prefer-const -- the assignment is the host under test
  ({ y: { at }, o: other } = { y: make('y'), o: (events.push('o'), 1) });
  assert.same(at.call([5, 6], -1), 6, 'the claim reads the polyfilled method');
  assert.same(other, 1);
  // eslint-disable-next-line prefer-const -- the assignment is the host under test
  ({ z: twin, y: { includes } } = { z: make('z'), y: make('w') });
  assert.true(includes.call([5, 6], 6));
  assert.deepEqual(twin, [1, 2]);
  assert.deepEqual(events, ['y', 'o', 'z', 'w'], 'every slot runs once, in source order');
});

QUnit.test('destructuring assignment: unbraced and sequence hosts serve a claim over a slot that runs code', assert => {
  let calls = 0;
  function make() {
    calls++;
    return [1, 2];
  }
  let findLast, toSorted, guarded, kept;
  if (calls === 0) ({ y: { findLast }, o: guarded } = { y: make(), o: 2 });
  // eslint-disable-next-line @stylistic/no-extra-parens -- the discarded sequence element is the host under test
  const result = (({ x: { y: { toSorted } }, o: kept } = { x: { y: make() }, o: 3 }), 5);
  assert.same(findLast.call([1, 2, 3], item => item < 3), 2);
  assert.deepEqual(toSorted.call([2, 1]), [1, 2]);
  assert.deepEqual([guarded, kept, result, calls], [2, 3, 5, 2]);
});
