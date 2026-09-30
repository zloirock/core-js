// An exported parameter remains open to user receivers with accessor-backed slots.
export function readSelectedDestructure(useConstructor, user) {
  const { from, at } = useConstructor ? Array : user;
  return [from, at];
}

QUnit.test('destructuring: a sole nested computed hop captures once before its key', assert => {
  const events = [];
  const values = [4, 5];
  function source() {
    events.push('init');
    return {
      get data() {
        events.push('get');
        return values;
      },
    };
  }
  const { [(events.push('key'), 'data')]: { at } } = source();
  assert.same(at.call(values, -1), 5);
  assert.deepEqual(events, ['init', 'key', 'get']);
});

QUnit.test('destructuring: a nested instance beside rest preserves collection and order', assert => {
  const events = [];
  const values = [4, 5];
  const source = {
    get before() {
      events.push('before');
      return 1;
    },
    // eslint-disable-next-line unicorn/no-unused-properties -- Read through the computed pattern key below.
    get data() {
      events.push('data');
      return values;
    },
    get after() {
      events.push('after');
      return 2;
    },
  };
  const { before, [(events.push('key'), 'data')]: { includes, ...rest }, after } = source;
  const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'includes');
  // The pre transform retains the native rest boundary; post can serve the lowered read.
  if (descriptor) assert.same(includes, descriptor.value);
  else {
    const servedAfterLowering = includes === undefined || typeof includes === 'function';
    assert.true(servedAfterLowering);
  }
  assert.false('includes' in rest);
  assert.same(rest[0], 4);
  assert.deepEqual([before, after], [1, 2]);
  assert.deepEqual(events, ['before', 'key', 'data', 'after']);
});

QUnit.test('destructuring: a middle static follows its instance sibling', assert => {
  for (const supplied of [false, true]) {
    const events = [];
    let M = Map;
    if (supplied) M = {
      get name() {
        events.push('name');
        return 'user';
      },
      get groupBy() {
        events.push('groupBy');
        return 7;
      },
      get at() {
        events.push('at');
        return 8;
      },
    };
    const { name: nm, groupBy: method, at: other } = M;
    if (supplied) {
      assert.deepEqual([nm, method, other], ['user', 7, 8]);
      assert.deepEqual(events, ['name', 'groupBy', 'at']);
    } else {
      assert.same(method([1, 2, 3], value => value % 2).get(1).length, 2);
    }
  }
});

QUnit.test('destructuring: a stored realm selection keeps leaf defaults on its own route', assert => {
  let stored;
  function read(enabled) {
    const { Array: { from } } = stored = enabled && globalThis;
    return from;
  }
  assert.deepEqual(read(true)([2, 3]), [2, 3]);
  assert.same(typeof stored, 'object');
  assert.throws(() => read(false), TypeError);
  assert.same(stored, false);
});

QUnit.test('destructuring: nested prototype extraction keeps observable prefixes', assert => {
  const events = [];
  const observed = {
    get value() {
      events.push('get');
      return 0;
    },
  };
  const { prototype: { at } } = (observed.value, String);
  let count = 0;
  const { prototype: { includes } } = (count++, Array);
  assert.same(at.call('abc', -1), 'c');
  assert.true(includes.call([1, 2], 2));
  assert.deepEqual(events, ['get']);
  assert.same(count, 1);
});

QUnit.test('destructuring: a loop guard follows the native slot it detached from', assert => {
  function read(supplied) {
    const events = [];
    let M = Map;
    if (supplied) M = {
      get name() {
        events.push('name');
        return 'user';
      },
      get at() {
        events.push('at');
        return 8;
      },
      get groupBy() {
        events.push('groupBy');
        return 7;
      },
    };
    let once = true;
    let result;
    for (const { name: nm, at: other, groupBy: method } = M; once; once = false) {
      result = supplied ? [nm, other, method] : [typeof nm, other, typeof method];
    }
    return { result, events };
  }
  assert.deepEqual(read(true), { result: ['user', 8, 7], events: ['name', 'at', 'groupBy'] });
  assert.deepEqual(read(false), { result: ['string', undefined, 'function'], events: [] });
});

QUnit.test('destructuring: a capture after a detached guard preserves every binding', assert => {
  function read(supplied) {
    const events = [];
    let M = Map;
    if (supplied) M = {
      get groupBy() {
        events.push('groupBy');
        return 7;
      },
      get at() {
        events.push('at');
        return 8;
      },
      get name() {
        events.push('name');
        return 'user';
      },
    };
    const { groupBy: method, at: other, name: nm } = M;
    return { result: supplied ? [method, other, nm] : [typeof method, other, typeof nm], events };
  }
  assert.deepEqual(read(true), { result: [7, 8, 'user'], events: ['groupBy', 'at', 'name'] });
  assert.deepEqual(read(false), { result: ['function', undefined, 'string'], events: [] });
});

QUnit.test('destructuring: nested sequence prefixes run in order before a prototype read', assert => {
  const events = [];
  // eslint-disable-next-line @stylistic/no-extra-parens -- Keep the nested sequence spelling under test.
  const { prototype: { at } } = (events.push('outer'), (events.push('inner'), Array));
  assert.same(at.call([4, 5], -1), 5);
  assert.deepEqual(events, ['outer', 'inner']);
});

QUnit.test('destructuring: an assignment guard follows its earlier instance write', assert => {
  function read(supplied) {
    const events = [];
    let M = Map;
    if (supplied) M = {
      get name() {
        events.push('name');
        return 'user';
      },
      get groupBy() {
        events.push('groupBy');
        return 7;
      },
      get at() {
        events.push('at');
        return 8;
      },
    };
    let nm, method, other;
    // eslint-disable-next-line prefer-const -- Keep the assignment host under test.
    ({ name: nm, groupBy: method, at: other } = M);
    return { result: supplied ? [nm, method, other] : [typeof nm, typeof method, other], events };
  }
  assert.deepEqual(read(true), { result: ['user', 7, 8], events: ['name', 'groupBy', 'at'] });
  assert.deepEqual(read(false), { result: ['string', 'function', undefined], events: [] });
});

QUnit.test('destructuring: a loop prototype read keeps every nested sequence prefix', assert => {
  const events = [];
  let once = true;
  // eslint-disable-next-line @stylistic/no-extra-parens -- Keep the nested sequence spelling under test.
  for (const { prototype: { at } } = (events.push('outer'), (events.push('inner'), Array)); once; once = false) {
    assert.same(at.call([4, 5], -1), 5);
  }
  assert.deepEqual(events, ['outer', 'inner']);
});

QUnit.test('destructuring: a bodyless declaration keeps every nested sequence prefix', assert => {
  const events = [];
  // eslint-disable-next-line no-constant-condition, no-var, sonarjs/no-gratuitous-expressions, @stylistic/no-extra-parens -- Keep the bodyless host and nested sequence under test.
  if (true) var { prototype: { at } } = (events.push('outer'), (events.push('inner'), Array));
  assert.same(at.call([4, 5], -1), 5);
  assert.deepEqual(events, ['outer', 'inner']);
});

QUnit.test('destructuring: a bodyless nested prefix retains its own polyfills', assert => {
  const list = [[1], [2]];
  const text = 'prefix';
  // eslint-disable-next-line no-constant-condition, no-var, sonarjs/no-gratuitous-expressions, @stylistic/no-extra-parens -- Keep the bodyless host and nested sequence under test.
  if (true) var { at } = (list.flat(), (text.includes('x'), globalThis.Array.prototype));
  assert.deepEqual(at.call(list, -1), [2]);
});

QUnit.test('destructuring: a selected receiver reads a static before its instance sibling', assert => {
  const events = [];
  const user = {
    get from() {
      events.push('from');
      return 7;
    },
    get at() {
      events.push('at');
      return 8;
    },
  };
  assert.deepEqual(readSelectedDestructure(false, user), [7, 8]);
  assert.deepEqual(events, ['from', 'at']);
  const [from, at] = readSelectedDestructure(true, user);
  assert.same(typeof from, 'function');
  assert.same(at, undefined);
  assert.deepEqual(events, ['from', 'at']);
});

QUnit.test('destructuring: an assignment guard stays after the native sibling', assert => {
  const events = [];
  let M = Map;
  if (events) M = {
    get name() {
      events.push('name');
      return 'user';
    },
    get at() {
      events.push('at');
      return 8;
    },
    get groupBy() {
      events.push('groupBy');
      return 7;
    },
  };
  let nm, other, method;
  // eslint-disable-next-line prefer-const -- Keep the assignment host under test.
  ({ name: nm, at: other, groupBy: method } = M);
  assert.deepEqual([nm, other, method], ['user', 8, 7]);
  assert.deepEqual(events, ['name', 'at', 'groupBy']);
});
