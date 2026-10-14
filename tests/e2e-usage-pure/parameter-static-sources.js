QUnit.test('closed callers prove static sources through members and returns', assert => {
  const box = { value: Array };
  function member(held) { return held.from([1]); }
  function literal(held) { return held.from([2]); }
  function nested(held) { return held.from([3]); }
  function returned(held) { return held.from([4]); }
  function get() { return Array; }
  assert.deepEqual(member(box.value), [1]);
  assert.deepEqual(literal({ value: Array }.value), [2]);
  assert.deepEqual(nested({ box: { value: Array } }.box.value), [3]);
  assert.deepEqual(returned(get()), [4]);
});

QUnit.test('caller pattern mirrors preserve argument selection and supplied undefined', assert => {
  const events = [];
  const box = { value: Array };
  function member({ of }) { return of(1); }
  function nested({ value: { of } }, later) {
    events.push('body');
    return of(later);
  }
  function choose() {
    events.push('test');
    return true;
  }
  function fallback({ of = 7 }) { return of; }
  assert.deepEqual(member(box.value), [1]);
  assert.deepEqual(nested(choose() ? { value: Array } : { value: Array }, events.push('argument')), [2]);
  assert.deepEqual(events, ['test', 'argument', 'body']);
  assert.same(fallback({ of: undefined }), 7);
});

QUnit.test('an assigned getter invalidates the previous parameter source', assert => {
  const events = [];
  const box = { value: Array };
  Object.assign(box, { get value() {
    events.push('getter');
    return { from: () => 'custom' };
  } });
  function read(held) { return held.from([1]); }
  assert.same(read(box.value), 'custom');
  assert.deepEqual(events, ['getter']);
});

QUnit.test('custom static names remain custom beside a native caller', assert => {
  const events = [];
  function native(held) { return held.from([1]); }
  function read(held) {
    return [held.of(2), held.resolve(3), held.allSettled(4), held.groupBy(5)];
  }
  assert.deepEqual(native(Array), [1]);
  assert.deepEqual(read({
    of(value) { events.push('of'); return value; },
    resolve(value) { events.push('resolve'); return value; },
    allSettled(value) { events.push('allSettled'); return value; },
    groupBy(value) { events.push('groupBy'); return value; },
  }), [2, 3, 4, 5]);
  assert.deepEqual(events, ['of', 'resolve', 'allSettled', 'groupBy']);
});

QUnit.test('a class static method takes its parameter source from the calls through the class', assert => {
  class Factory {
    static make(C, list) { return C.from(list); }
    static single = (C, value) => C.of(value);
    kind() { return 'factory'; }
  }
  const Alias = Factory;
  const Tags = class {
    static raw(S, strings) { return S.raw(strings, 1); }
    kind() { return 'tags'; }
  };
  assert.deepEqual(Factory.make(Array, 'ab'), ['a', 'b']);
  // eslint-disable-next-line dot-notation -- the string key is the spelling under test
  assert.deepEqual(Factory['make'](Array, 'cd'), ['c', 'd']);
  assert.deepEqual(Alias.single(Array, 3), [3]);
  assert.same(Tags.raw(String, { raw: ['x', 'y'] }), 'x1y');
});

QUnit.test('a class the file also constructs or extends pairs its statics with their callers', assert => {
  class Lists {
    static fromText(C, text) { return new Lists(C.from(text)); }
    constructor(items) { this.items = items; }
  }
  class Base {
    static single(C, value) { return C.of(value); }
    kind() { return 'base'; }
  }
  class Derived extends Base {}
  assert.deepEqual(Lists.fromText(Array, 'ab').items, ['a', 'b']);
  assert.deepEqual(Derived.single(Array, 3), [3]);
});
