// a pattern WRITE reads a container slot the way a declarator does: a slot written after the literal
// holds the replacement, so the binding the write updates lands on it - never on the constructor the
// literal spells, polyfilled or not. a slot DEFAULT over a container reached through a name is no
// certain default either: the file may have written the slot through that name since. every test
// reads a static of its own, and every reassigned binding starts on a global the reaching-value route
// resolves
/* eslint-disable no-useless-assignment -- each binding is reassigned through the pattern WRITE under test */
QUnit.test('mutated-statics: a written object slot wins on the pattern-write route', assert => {
  const box = { a: Array };
  box.a = { from: () => 'WRITTEN-KEY' };
  let A = Math;
  ({ a: A } = box);
  assert.same(A.from([1]), 'WRITTEN-KEY');
});

QUnit.test('mutated-statics: a written array index wins on the pattern-write route', assert => {
  const list = [Array];
  list[0] = { of: () => 'WRITTEN-INDEX' };
  let A = Math;
  [A] = list;
  assert.same(A.of(1), 'WRITTEN-INDEX');
});

QUnit.test('mutated-statics: a slot handed out to a writer wins on the pattern-write route', assert => {
  const bag = { s: String };
  (function put(target) { target.s = { raw: () => 'HANDED' }; })(bag);
  let S = Math;
  ({ s: S } = bag);
  assert.same(S.raw`x`, 'HANDED');
});

QUnit.test('mutated-statics: a written nested slot wins on the pattern-write route', assert => {
  const deep = { k: { o: Object } };
  deep.k.o = { groupBy: () => 'NESTED' };
  let O = Math;
  ({ k: { o: O } } = deep);
  assert.same(O.groupBy([], it => it), 'NESTED');
});

QUnit.test('mutated-statics: a default over a written held container is no certain default', assert => {
  const held = [];
  held[0] = { fromEntries: () => 'HELD-INDEX' };
  const [E = Object] = held;
  assert.same(E.fromEntries([]), 'HELD-INDEX');
  function make() { return {}; }
  const made = make();
  made.k = { hasOwn: () => 'HELD-CALL' };
  const { k: H = Object } = made;
  assert.same(H.hasOwn({}, 'k'), 'HELD-CALL');
});
