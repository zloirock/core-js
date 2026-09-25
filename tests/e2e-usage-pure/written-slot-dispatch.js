// an instance method read off a container slot the file WROTE dispatches on the written value: the
// literal's element type is no longer what the slot holds, whichever spelling reads it - a member, a
// declared or reassigned pattern, a for-of head, a slot of a pattern alias, the literal a call yields
/* eslint-disable no-useless-assignment -- the pattern writes under test reassign their bindings */
QUnit.test('written slot dispatch: a call-yielded container written through its binding', assert => {
  function make() { return { a: [1, 2] }; }
  const w = make();
  w.a = 'ab';
  assert.same(w.a.at(-1), 'b');
  const { a } = w;
  assert.same(a.at(-1), 'b');
});

QUnit.test('written slot dispatch: a pattern write and a head over a written object slot', assert => {
  const w = { a: [1, 2] };
  w.a = 'cd';
  let a = [];
  ({ a } = w);
  assert.same(a.at(-1), 'd');
  let got = null;
  for (const { a: b } of [w]) got = b.at(-1);
  assert.same(got, 'd');
});

QUnit.test('written slot dispatch: array elements the file wrote', assert => {
  const w = [[1, 2]];
  w[0] = 'ef';
  const [a] = w;
  assert.same(a.at(-1), 'f');
  let b = [];
  [b] = w;
  assert.same(b.at(-1), 'f');
  let got = null;
  for (const [c] of [w]) got = c.at(-1);
  assert.same(got, 'f');
  const [x] = [w];
  const [d] = x;
  assert.same(d.at(-1), 'f');
});

QUnit.test('written slot dispatch: a written hop and a held getter literal', assert => {
  const box = { k: { a: [1, 2] } };
  box.k = { a: 'gh' };
  assert.same(box.k.a.at(-1), 'h');
  const source = { get fresh() { return { b: [1, 2] }; } };
  const held = source.fresh;
  held.b = 'ij';
  assert.same(held.b.at(-1), 'j');
});
