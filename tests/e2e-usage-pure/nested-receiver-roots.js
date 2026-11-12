// Nested instance extraction keeps one evaluation of the receiver, including suspension,
// stores and sequence prefixes. Rest defaults own their branch, not the source above rest.
QUnit.test('nested receiver: optional invocation preserves this and getter order', assert => {
  const events = [];
  const rows = [3, 7];
  const owner = {
    make() {
      events.push(this === owner);
      return { get list() {
        events.push('list');
        return rows;
      } };
    },
  };
  // eslint-disable-next-line no-unsafe-optional-chaining -- the present call result is the receiver under test
  const { list: { at } } = owner.make?.();
  assert.same(at.call(rows, -1), 7);
  assert.deepEqual(events, [true, 'list']);
});

// eslint-disable-next-line es/no-async-functions -- lowered by the e2e bundle
QUnit.test('nested receiver: await and yield preserve their source values', async assert => {
  const events = [];
  const rows = [3, 7];
  const box = { get list() {
    events.push('list');
    return rows;
  } };
  const { list: { at } } = (events.push('await'), await box);
  assert.same(at.call(rows, -1), 7);
  function * read() {
    const { list: { includes } } = (events.push('yield'), yield 1);
    return includes.call(rows, 7);
  }
  const iterator = read();
  assert.same(iterator.next().value, 1);
  assert.same(iterator.next(box).value, true);
  assert.deepEqual(events, ['await', 'list', 'yield', 'list']);
});

QUnit.test('nested receiver: tagged call preserves the tag receiver', assert => {
  const events = [];
  const owner = {
    tag() { events.push(this === owner); return { list: [3, 7] }; },
  };
  const { list: { at } } = owner.tag`source`;
  assert.same(at.call([3, 7], -1), 7);
  assert.deepEqual(events, [true]);
});

QUnit.test('nested receiver: logical stores keep the write and selected arm', assert => {
  const events = [];
  const box = { get list() {
    events.push('list');
    return [3, 7];
  } };
  let held;
  function make() {
    events.push('make');
    return box;
  }
  const { list: { at } } = held ||= make();
  const { list: { includes } } = held ??= make();
  assert.same(held, box);
  assert.same(at.call([3, 7], -1), 7);
  assert.same(includes.call([3, 7], 3), true);
  assert.deepEqual(events, ['make', 'list', 'list']);
});

QUnit.test('nested receiver: a prefixed member is read once in both hosts', assert => {
  const events = [];
  const rows = { get at() {
    events.push('at');
    return function () { return this === rows; };
  } };
  const box = { get list() {
    events.push('list');
    return rows;
  } };
  const owner = { get value() {
    events.push('value');
    return box;
  } };
  const { list: { at } } = (events.push('prefix'), owner.value);
  assert.same(at.call(rows), true);
  let stored;
  // eslint-disable-next-line prefer-const -- exercises the discarded assignment host
  ({ list: { at: stored } } = (events.push('assignment'), owner.value));
  assert.same(stored.call(rows), true);
  assert.deepEqual(events, ['prefix', 'value', 'list', 'at', 'assignment', 'value', 'list', 'at']);
});

QUnit.test('nested receiver: an optional call still rejects before nested keys', assert => {
  const events = [];
  const absent = {};
  let result;
  try {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the pattern must reject an absent call result
    const { list: { [(events.push('key'), 'at')]: at } } = absent.make?.();
    result = at;
  } catch (error) {
    result = error.name;
  }
  assert.same(result, 'TypeError');
  assert.deepEqual(events, []);
});

QUnit.test('nested receiver: an optional member seals the following pattern read', assert => {
  const events = [];
  const source = null;
  let result;
  try {
    // eslint-disable-next-line no-unsafe-optional-chaining -- the pattern must reject the missing receiver
    const { list: { at } } = (events.push('prefix'), source?.value);
    result = at;
  } catch (error) {
    result = error.name;
  }
  assert.same(result, 'TypeError');
  assert.deepEqual(events, ['prefix']);
});

QUnit.test('nested receiver: compound assignment keeps its primitive value', assert => {
  let value = 'a';
  const { constructor: { prototype: { at } } } = value += 'b';
  assert.same(value, 'ab');
  assert.same(at.call(value, -1), 'b');
});

QUnit.test('nested receiver: rest default runs only for its own missing slot', assert => {
  const events = [];
  function read(first, ...[{ Array: { from } } = (events.push('default'), globalThis)]) {
    return from([first])[0];
  }
  assert.same(read(7), 7);
  assert.same(read(7, { Array: { from: () => [9] } }), 9);
  const [first, ...[{ Array: { from } } = globalThis]] = [3];
  assert.same(from([first])[0], 3);
  assert.deepEqual(events, ['default']);
});

QUnit.test('nested receiver: inner constructor default below rest', assert => {
  function read(...[{ w: { from } = Array } = {}]) { return from([7])[0]; }
  assert.same(read(), 7);
  assert.same(read({ w: { from: () => [9] } }), 9);
});

QUnit.test('nested receiver: rest consumes the iterator before its own default', assert => {
  const events = [];
  function * source() {
    events.push('first');
    yield 0;
    events.push('rest');
    yield undefined;
    events.push('done');
  }
  const [first, ...[{ Array: { from } } = (events.push('default'), globalThis)]] = source();
  assert.same(first, 0);
  assert.same(from([7])[0], 7);
  assert.deepEqual(events, ['first', 'rest', 'done', 'default']);
});

QUnit.test('nested receiver: a supplied rest value throws before the default', assert => {
  const events = [];
  function read(...[{ Array: { from } } = (events.push('default'), globalThis)]) { return from([7]); }
  let result;
  try {
    read({ get Array() {
      events.push('getter');
      throw new RangeError();
    } });
  } catch (error) {
    result = error.name;
  }
  assert.same(result, 'RangeError');
  assert.deepEqual(events, ['getter']);
});

QUnit.test('nested receiver: loop identity and all leading realm hops', assert => {
  for (const realm of [globalThis]) {
    const { globalThis: { Array: { prototype: { at } } } } = realm;
    assert.same(at.call([3, 7], -1), 7);
    const { self: { Array: { prototype: { includes } } } = globalThis } = realm;
    assert.same(includes.call([3, 7], 7), true);
  }
  const { globalThis: { self: { Array: { prototype: { at } } } = globalThis } } = globalThis.globalThis;
  assert.same(at.call([3, 7], -1), 7);
});
