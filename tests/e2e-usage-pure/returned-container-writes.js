QUnit.test('returned containers carry statics installed through property mutators', assert => {
  function assigned(box) {
    box.M = Map;
    return box;
  }
  function defined(box) {
    Object.defineProperty(box, 'M', { value: Map });
    return box;
  }
  function definedMany(box) {
    Object.defineProperties(box, { M: { value: Map } });
    return box;
  }
  function copied(box) {
    Object.assign(box, { M: Map });
    return box;
  }
  function reflected(box) {
    Reflect.defineProperty(box, 'M', { value: Map });
    return box;
  }
  function set(box) {
    Reflect.set(box, 'M', Map);
    return box;
  }
  function receiver(box) {
    Reflect.set({}, 'M', Map, box);
    return box;
  }
  assert.same(assigned({}).M.groupBy([1, 2], x => x % 2).get(1)[0], 1);
  assert.same(defined({}).M.groupBy([1, 2], x => x % 2).get(1)[0], 1);
  assert.same(definedMany({}).M.groupBy([1, 2], x => x % 2).get(1)[0], 1);
  assert.same(copied({}).M.groupBy([1, 2], x => x % 2).get(1)[0], 1);
  assert.same(reflected({}).M.groupBy([1, 2], x => x % 2).get(1)[0], 1);
  assert.same(set({}).M.groupBy([1, 2], x => x % 2).get(1)[0], 1);
  assert.same(receiver({}).M.groupBy([1, 2], x => x % 2).get(1)[0], 1);
});
