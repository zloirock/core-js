QUnit.test('deferred destructuring keeps initializer and key child rewrites', assert => {
  const effects = [];
  const before = (effects.push('before'), 0),
        { [(effects.push(Array.from('k')[0]), 'at')]: method } = (effects.push('init'), Array.from([4, 7])),
        after = (effects.push('after'), 1);
  assert.deepEqual([before, method.call([4, 7], -1), after], [0, 7, 1]);
  assert.deepEqual(effects, ['before', 'init', 'k', 'after']);
});

QUnit.test('deferred sibling claims keep their captured receiver after a key write', assert => {
  const effects = [];
  let values = [4, 7];
  const original = values;
  const { [(effects.push('key'), values = { at() { return 'changed'; } }, 'at')]: method,
          [(effects.push('second'), 'includes')]: contains, length } = values,
        after = (effects.push('after'), 1);
  assert.deepEqual([method.call(original, -1), contains.call(original, 4), length, after], [7, true, 2, 1]);
  assert.deepEqual(effects, ['key', 'second', 'after']);
  assert.same(values.at(), 'changed');
});

QUnit.test('deferred assignment claims retain a throwing residual after both writes', assert => {
  const effects = [];
  const failure = {};
  const source = {
    at() { return 7; },
    includes() { return true; },
    get tail() { effects.push('tail'); throw failure; },
  };
  let method, contains, tail;
  assert.throws(() => {
    ({ [(effects.push('first'), 'at')]: method,
      [(effects.push('second'), 'includes')]: contains, tail } = source);
  }, error => error === failure);
  assert.deepEqual([method(), contains(), tail], [7, true, undefined]);
  assert.deepEqual(effects, ['first', 'second', 'tail']);
});
