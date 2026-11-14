QUnit.test('a captured instance keeps its value after its source becomes a constructor', assert => {
  let current = 'ab';
  const captured = current;
  current = Map;
  const { at } = captured;
  assert.same(captured.at(0), 'a');
  assert.same(at.call(captured, -1), 'b');
  assert.same(captured?.at(0), 'a');
  assert.same(typeof current, 'function');
});

QUnit.test('a written or escaped literal slot reads its live instance', assert => {
  const written = { value: Object };
  written.value = Function('return [3, 7]')();
  assert.same(written.value.at(-1), 7);
  const escaped = { value: Object };
  Function('box', 'box.value = "ab"')(escaped);
  assert.same(escaped.value.at(0), 'a');
  // eslint-disable-next-line sonarjs/prefer-object-literal -- The slot must be filled after creation.
  const source = {};
  source.list = [3];
  const { list: { entries } = Object } = source;
  assert.deepEqual(entries.call(source.list).next().value, [0, 3]);
});

QUnit.test('a hoisted writer supplies the constructor read before its declaration', assert => {
  let P = null;
  initialize();
  assert.same(typeof P.resolve, 'function');
  const result = P.resolve(17);
  function initialize() { P = Promise; }
  return result.then(value => assert.same(value, 17));
});
