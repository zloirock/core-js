QUnit.test('consumed initializer: receiver stores precede their own bindings and preserve siblings', assert => {
  const events = [];
  let held;
  const box = { set value(value) {
    held = value;
    // eslint-disable-next-line block-scoped-var -- the setter observes the hoisted loop binding before initialization
    events.push(['store', typeof method]);
  } };
  /* eslint-disable no-var, no-unreachable-loop -- observe the hoisted binding before its loop-header initialization */
  for (var before = events.push('before'),
           { Array: { prototype: { at: method } } } = box.value = (events.push('init'), globalThis),
           after = events.push(['after', typeof method]); ;) {
    assert.same(before, 1);
    assert.same(after, 4);
    assert.same(method.call([4, 9], -1), 9);
    break;
  }
  /* eslint-enable no-var, no-unreachable-loop -- loop-header observation ends here */
  assert.same(typeof held.Array, 'function');
  assert.deepEqual(events, ['before', 'init', ['store', 'undefined'], ['after', 'function']]);
});

QUnit.test('consumed initializer: a bodyless receiver store stays conditional and runs once', assert => {
  const events = [];
  let held;
  const box = { set value(value) {
    held = value;
    events.push('store');
  } };
  // eslint-disable-next-line no-var -- a bodyless declaration requires var
  if (events.length === 0) var { Array: { prototype: { at: method } } } = box.value = (events.push('init'), globalThis);
  assert.same(method.call([4, 9], -1), 9);
  // eslint-disable-next-line no-var, no-unused-vars -- the unentered body must retain its declaration and initializer
  if (events.length === 0) var { Array: { prototype: { at: skipped } } } = box.value = (events.push('skipped'), globalThis);
  assert.same(typeof held.Array, 'function');
  assert.deepEqual(events, ['init', 'store']);
});

QUnit.test('consumed initializer: one getter precedes extraction and a throw stops later siblings', assert => {
  const events = [];
  let fail = false;
  const box = { get rows() {
    events.push('get');
    if (fail) throw new Error('stop');
    return [4, 9];
  } };
  function run() {
    const before = events.push('before'),
          { at, includes } = (events.push(Array.from([1])[0]), box.rows),
          after = events.push('after');
    return [before, at.call([4, 9], -1), includes.call([4, 9], 4), after];
  }
  assert.deepEqual(run(), [1, 9, true, 4]);
  assert.deepEqual(events, ['before', 1, 'get', 'after']);
  events.length = 0;
  fail = true;
  assert.throws(run, /stop/);
  assert.deepEqual(events, ['before', 1, 'get']);
});

QUnit.test('consumed initializer: bodyless siblings keep prefix claims and binding stores', assert => {
  const events = [];
  let held;
  /* eslint-disable no-var -- bodyless var bindings observe initializer order */
  if (events.length === 0) var before = events.push('before'),
                               { from, of } = held = (events.push(['init', typeof from, Array.from([1])[0]]), Array),
                               after = events.push(['after', typeof from]);
  assert.same(before, 1);
  assert.same(after, 3);
  assert.deepEqual(from([4, 9]), [4, 9]);
  assert.deepEqual(of(7), [7]);
  assert.same(typeof held, 'function');
  assert.deepEqual(events, ['before', ['init', 'undefined', 1], ['after', 'function']]);
  events.length = 0;
  if (events.length === 0) var left = events.push('left'),
                               { Array: { prototype: { at } } } = (events.push(['child', Array.from([3])[0]]), globalThis),
                               right = events.push('right');
  assert.same(left, 1);
  assert.same(right, 3);
  assert.same(at.call([4, 9], -1), 9);
  assert.deepEqual(events, ['left', ['child', 3], 'right']);
  /* eslint-enable no-var -- bodyless observations end here */
});

QUnit.test('consumed initializer: bodyless static member writes keep their setter', assert => {
  const events = [];
  let held;
  const box = { set value(value) {
    held = value;
    events.push(['store', typeof from]);
  } };
  /* eslint-disable no-var -- bodyless var bindings observe the setter before initialization */
  if (events.length === 0) var before = events.push('before'),
                               { from, of } = box.value = (events.push('init'), Array),
                               after = events.push('after');
  assert.same(before, 1);
  assert.same(after, 4);
  assert.deepEqual(from([4, 9]), [4, 9]);
  assert.deepEqual(of(7), [7]);
  /* eslint-enable no-var -- bodyless observations end here */
  assert.same(typeof held, 'function');
  assert.deepEqual(events, ['before', 'init', ['store', 'undefined'], 'after']);
});

QUnit.test('consumed initializer: a loop sink cannot overtake another source group', assert => {
  const events = [];
  /* eslint-disable no-unreachable-loop -- one header evaluation makes its source order observable */
  // eslint-disable-next-line es/no-nonstandard-array-properties -- an unserved property retains the earlier pattern
  for (const { from: first, custom } = Array, middle = events.push('middle'),
             { from: last } = (events.push(typeof first), Array); ;) {
    assert.same(custom, undefined);
    assert.same(middle, 1);
    assert.deepEqual(first([1]), last([1]));
    break;
  }
  assert.deepEqual(events, ['middle', 'function']);
  events.length = 0;
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- an unserved property retains the earlier pattern
  for (const { at: first, custom } = [4, 9], middle = events.push('middle'),
             { from: last } = (events.push(typeof first), Array); ;) {
    assert.same(custom, undefined);
    assert.same(middle, 1);
    assert.same(first.call(last([4, 9]), -1), 9);
    break;
  }
  /* eslint-enable no-unreachable-loop -- loop-header observations end here */
  assert.deepEqual(events, ['middle', 'function']);
});
