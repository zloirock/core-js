function read(flag) {
  let C;
  const own = { Map: { groupBy: 9 } };
  const source = { Map: C } = flag ? own : globalThis;
  return [source === (flag ? own : globalThis), C.groupBy];
}

QUnit.test('selected pattern: user and realm receivers keep their own statics', assert => {
  assert.deepEqual(read(true), [true, 9]);
  const [same, method] = read(false);
  assert.true(same);
  assert.deepEqual(method([7], value => value).get(7), [7]);
});
