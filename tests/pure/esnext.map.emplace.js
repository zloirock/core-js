import Map from 'core-js-pure/full/map';

QUnit.test('Map#emplace', assert => {
  const { emplace } = Map.prototype;
  assert.isFunction(emplace);
  assert.arity(emplace, 2);
  assert.name(emplace, 'emplace');
  assert.nonEnumerable(Map.prototype, 'emplace');

  const map = new Map([['a', 2]]);
  let handler = {
    update(value, key, that) {
      assert.same(this, handler, 'correct handler in callback');
      assert.same(arguments.length, 3, 'correct number of callback arguments');
      assert.same(value, 2, 'correct value in callback');
      assert.same(key, 'a', 'correct key in callback');
      assert.same(that, map, 'correct map in callback');
      return value ** 2;
    },
    insert() {
      assert.ok(false, 'should not be called');
    },
  };
  assert.same(map.emplace('a', handler), 4, 'returns a correct value');
  handler = {
    update() {
      assert.ok(false, 'should not be called');
    },
    insert(key, that) {
      assert.same(this, handler, 'correct handler in callback');
      assert.same(arguments.length, 2, 'correct number of callback arguments');
      assert.same(key, 'b', 'correct key in callback');
      assert.same(that, map, 'correct map in callback');
      return 3;
    },
  };
  assert.same(map.emplace('b', handler), 3, 'returns a correct value');
  assert.same(map.size, 2, 'correct size');
  assert.same(map.get('a'), 4, 'correct result #1');
  assert.same(map.get('b'), 3, 'correct result #2');

  assert.same(new Map([['a', 2]]).emplace('b', { insert: () => 3 }), 3);
  assert.same(new Map([['a', 2]]).emplace('a', { update: value => value ** 2 }), 4);

  handler = { update() { /* empty */ }, insert() { /* empty */ } };
  assert.throws(() => new Map().emplace('a'), TypeError);
  assert.throws(() => emplace.call({}, 'a', handler), TypeError);
  assert.throws(() => emplace.call([], 'a', handler), TypeError);
  assert.throws(() => emplace.call(undefined, 'a', handler), TypeError);
  assert.throws(() => emplace.call(null, 'a', handler), TypeError);
});
