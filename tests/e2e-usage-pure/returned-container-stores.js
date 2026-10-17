QUnit.test('returned property stores preserve their calls and replacement values', assert => {
  function define(box) {
    const install = Object.defineProperties;
    install(box, { M: { value: Map } });
    return box;
  }
  function assign(box) {
    Reflect.apply(Object.assign, null, [box, { M: Map }]);
    return box;
  }
  function set(box) {
    Reflect.set({}, 'M', Map, box);
    return box;
  }
  const events = [];
  const first = define((events.push('define'), { M: Object })).M.groupBy([1, 2], x => x % 2);
  const second = assign((events.push('assign'), { M: Object })).M.groupBy([3, 4], x => x % 2);
  const third = set((events.push('set'), { M: Object })).M.groupBy([5, 6], x => x % 2);
  assert.deepEqual(first.get(1), [1]);
  assert.deepEqual(second.get(0), [4]);
  assert.deepEqual(third.get(1), [5]);
  assert.deepEqual(events, ['define', 'assign', 'set']);
});

QUnit.test('a failed returned property store keeps its prior value', assert => {
  function swap(box) {
    Object.defineProperty(box, 'M', { writable: false });
    Reflect.set(box, 'M', Map);
    return box;
  }
  const custom = { groupBy() { return 7; } };
  assert.same(swap({ M: custom }).M.groupBy(), 7);
});

QUnit.test('a returned accessor pair keeps its getter after the setter runs', assert => {
  const events = [];
  const custom = { groupBy() { return 9; } };
  function swap(box) {
    Reflect.set(box, 'M', Map);
    return box;
  }
  const value = swap({
    get M() { events.push('get'); return custom; },
    set M(ignored) { events.push('set'); },
  }).M.groupBy();
  assert.same(value, 9);
  assert.deepEqual(events, ['set', 'get']);
});

QUnit.test('an inert returned setter discards its constructor argument', assert => {
  const events = [];
  const custom = { groupBy() { return 11; } };
  function swap(box) {
    Reflect.set(box, 'M', Map);
    return box;
  }
  const value = swap((events.push('argument'), {
    get M() { events.push('get'); return custom; },
    set M(ignored) { /* The constructor argument is deliberately discarded. */ },
  })).M.groupBy();
  assert.same(value, 11);
  assert.deepEqual(events, ['argument', 'get']);
});
