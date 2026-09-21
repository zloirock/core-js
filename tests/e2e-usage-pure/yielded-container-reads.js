// A call whose callee returns its parameter inside a container literal yields that literal per
// call: a read through the slot lands on the argument, reached by name, inline, stored or as a tag.
QUnit.test('yielded containers: a slot read resolves to the argument of its own call', assert => {
  const log = [];
  function box(v) { return [v]; }
  function wrap(s, v) {
    log.push(s.length);
    return { held: v };
  }
  const held = box(Map);
  assert.deepEqual(box(Map)[0].groupBy([1, 2, 3], v => v % 2).get(1), [1, 3]);
  assert.deepEqual(held[0].groupBy([1, 2], v => v % 2).get(0), [2]);
  assert.deepEqual(box(Object)[0].groupBy([1, 2, 3], v => v % 2)[0], [2]);
  assert.deepEqual((function (v) { return { at: v }; })(Array).at.of(4, 5), [4, 5]);
  assert.deepEqual(wrap`${ Map }`.held.groupBy([1, 2, 3], v => v % 2).get(1), [1, 3]);
  assert.deepEqual(log, [2]);
});

QUnit.test('yielded containers: a slot read through a receiver invoker resolves the same way', assert => {
  function box(v) { return [v]; }
  assert.deepEqual(box.call(null, Map)[0].groupBy([1, 2], v => v % 2).get(1), [1]);
  assert.deepEqual(box.apply(null, [Object])[0].groupBy([1, 2], v => v % 2)[1], [1]);
  assert.deepEqual(Reflect.apply(box, null, [Array])[0].of(6), [6]);
});

QUnit.test('yielded containers: a key the census cannot fold keeps every static reachable', assert => {
  function box(v) { return [v]; }
  const nested = { a: [Map] };
  const key = 'x'.length - 1;
  assert.deepEqual(box(Map)[key].groupBy([1, 2, 3], v => v % 2).get(1), [1, 3]);
  assert.same(typeof [Promise][key].withResolvers().resolve, 'function');
  assert.deepEqual(nested.a[key].groupBy([1, 2], v => v % 2).get(0), [2]);
});

QUnit.test('yielded containers: a callee that keeps its argument hands back the written object', assert => {
  // the replacement is a USER object, so the row reads the same in a realm with nothing native: what
  // it separates is the literal the call site spells from the object the callee actually hands back
  const replacement = { groupBy: () => 'REPLACED' };
  function viaMember(box, key, value) {
    box[key] = value;
    return box;
  }
  function viaBuiltin(box, key, value) {
    Object.defineProperty(box, key, { value, configurable: true });
    return box;
  }
  function viaAlias(box, key, value) {
    const alias = box;
    alias[key] = value;
    return box;
  }
  assert.same(viaMember({ M: Array }, 'M', replacement).M.groupBy(), 'REPLACED');
  assert.same(viaBuiltin({ M: Array }, 'M', replacement).M.groupBy(), 'REPLACED');
  assert.same(viaAlias({ M: Array }, 'M', replacement).M.groupBy(), 'REPLACED');
  // ... while a callee keeping no other reference hands back the literal the call site spells
  function clean(box) { return box; }
  assert.deepEqual(clean({ A: Array }).A.of(3), [3]);
});
