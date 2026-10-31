QUnit.test('nested declaration receiver keeps prefix, getter and defaults in order', assert => {
  const effects = [];
  const source = { get data() {
    effects.push('get');
    return undefined;
  } };
  const lead = (effects.push('lead'), 1);
  const { data: { at = (effects.push('leaf-default'), null) } = (effects.push('default'), Array.from('ab')) }
    = (effects.push('prefix'), source);
  assert.same(lead, 1);
  assert.same(at.call('cd', -1), 'd');
  assert.deepEqual(effects, ['lead', 'prefix', 'get', 'default']);
});

QUnit.test('nested declaration shares one computed receiver with a surviving sibling', assert => {
  const effects = [];
  function source() {
    effects.push('source');
    return { get data() {
      effects.push('data');
      return [1, 2];
    }, other: 3 };
  }
  const lead = (effects.push('lead'), 1),
        { data: { at }, other } = source();
  assert.same(lead + other, 4);
  assert.same(at.call([5, 6], -1), 6);
  assert.deepEqual(effects, ['lead', 'source', 'data']);
});

QUnit.test('nested declaration uses the user receiver even with namespace-shaped keys', assert => {
  const source = { Array: { prototype: 'ab' } };
  const { Array: { prototype: { at } } } = source;
  assert.same(at.call('cd', -1), 'd');
  function read() {
    const { data: { at: method } } = this;
    return method.call(this.data, -1);
  }
  assert.same(read.call({ data: 'ef' }), 'f');
});

QUnit.test('nested declaration iterator reads the source hop once', assert => {
  let reads = 0;
  const rows = [3, 4];
  const source = { get data() {
    reads++;
    return rows;
  } };
  const { data: { [Symbol.iterator]: iterator } } = source;
  assert.same(iterator.call(rows).next().value, 3);
  assert.same(reads, 1);
});
