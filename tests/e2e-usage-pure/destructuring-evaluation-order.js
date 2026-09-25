/* eslint-disable no-var, block-scoped-var, @stylistic/one-var-declaration-per-line -- hoisted bindings the init can observe, beside sibling declarators, are the case under test */
// a destructure whose init RUNS code - a getter, a call, an effect inside the read - evaluates that
// init before the pattern binds anything: the code sees every binding the pattern makes in its
// pre-destructure state, whatever host the pattern stands in and whichever claims extract first
QUnit.test('evaluation order: a getter init runs before a sole or sibling declarator binds', assert => {
  const seen = [];
  // eslint-disable-next-line unicorn/no-static-only-class -- a class static getter the transform sees is the receiver under test
  class Source {
    static get realm() {
      seen.push([typeof sole, typeof sibling]);
      return globalThis;
    }
  }
  var { groupBy: sole, length: soleOther } = Source.realm.Map;
  var first = 1, { groupBy: sibling, length: siblingOther } = Source.realm.Map;
  assert.deepEqual(seen, [['undefined', 'undefined'], ['function', 'undefined']]);
  assert.same(typeof sole, 'function');
  assert.same(typeof sibling, 'function');
  assert.same(first, 1);
  assert.same(soleOther, 0);
  assert.same(siblingOther, 0);
});

QUnit.test('evaluation order: a getter init runs before a loop head or an assignment binds', assert => {
  const seen = [];
  let assigned = 'unset';
  let assignedOther;
  // eslint-disable-next-line unicorn/no-static-only-class -- a class static getter the transform sees is the receiver under test
  class Source {
    static get realm() {
      seen.push([typeof header, typeof assigned]);
      return globalThis;
    }
  }
  for (var i = 0, { groupBy: header, length: headerOther } = Source.realm.Map; i < 1; i++) assert.same(i, 0);
  ({ groupBy: assigned, length: assignedOther } = Source.realm.Map);
  assert.deepEqual(seen, [['undefined', 'string'], ['function', 'string']]);
  assert.same(typeof header, 'function');
  assert.same(typeof assigned, 'function');
  assert.same(headerOther, 0);
  assert.same(assignedOther, 0);
});

QUnit.test('evaluation order: a call or an effect inside the read runs before the pattern binds', assert => {
  const seen = [];
  function load() {
    seen.push(typeof viaCall);
    return globalThis;
  }
  function note() {
    seen.push(typeof viaRoot);
  }
  var { groupBy: viaCall, length: callOther } = load().Map;
  var { groupBy: viaRoot, length: rootOther } = (note(), globalThis).Map;
  assert.deepEqual(seen, ['undefined', 'undefined']);
  assert.same(typeof viaCall, 'function');
  assert.same(typeof viaRoot, 'function');
  assert.same(callOther, 0);
  assert.same(rootOther, 0);
});

QUnit.test('evaluation order: an emptied pattern still runs its getter, once, ahead of the binding', assert => {
  const seen = [];
  // eslint-disable-next-line unicorn/no-static-only-class -- a class static getter the transform sees is the receiver under test
  class Source {
    static get realm() {
      seen.push([typeof emptied, typeof slotted]);
      return globalThis;
    }
  }
  var { groupBy: emptied } = Source.realm.Map;
  if (assert) var { groupBy: slotted } = Source.realm.Map;
  assert.deepEqual(seen, [['undefined', 'undefined'], ['function', 'undefined']]);
  assert.same(typeof emptied, 'function');
  assert.same(typeof slotted, 'function');
});

QUnit.test('evaluation order: a bodyless slot keeps the order its residual owes', assert => {
  const seen = [];
  // eslint-disable-next-line unicorn/no-static-only-class -- a class static getter the transform sees is the receiver under test
  class Source {
    static get realm() {
      seen.push(typeof partial);
      return globalThis;
    }
  }
  if (assert) var { groupBy: partial, length: partialOther } = Source.realm.Map;
  assert.deepEqual(seen, ['undefined']);
  assert.same(typeof partial, 'function');
  assert.same(partialOther, 0);
});

// a static beside an instance member off a CALL memoizes the call once, ahead of every read of it
QUnit.test('evaluation order: a call read by a static and an instance member runs once', assert => {
  let calls = 0;
  function make() {
    calls++;
    return Array;
  }
  const lead = 1, { from: fromLead, name: leadName } = make();
  for (let { of: fromHeader, name: headerName } = make(), pass = 0; pass < 1; pass++) {
    assert.deepEqual(fromHeader(7), [7]);
    assert.same(typeof headerName, 'string');
  }
  assert.same(calls, 2);
  assert.same(lead, 1);
  assert.deepEqual(fromLead('ab'), ['a', 'b']);
  assert.same(typeof leadName, 'string');
});

// a static extracted into a MEMBER target takes its polyfill like a binding would
QUnit.test('evaluation order: a member target takes the static off a call', assert => {
  const target = {};
  function make() {
    return Iterator;
  }
  ({ from: target.from } = make());
  let length;
  ({ from: target.again, length } = make());
  assert.deepEqual(target.from([1, 2]).toArray(), [1, 2]);
  assert.deepEqual(target.again([3]).toArray(), [3]);
  assert.same(typeof length, 'number');
});

// a LOGICAL fallback receiver read by an instance member and a static serves the static its polyfill
QUnit.test('evaluation order: a fallback receiver serves a static beside an instance member', assert => {
  let name, groupBy;
  // eslint-disable-next-line prefer-const -- the assignment host is the case under test
  ({ name, groupBy } = globalThis.absentReceiverForTheTest || Map);
  // eslint-disable-next-line no-constant-binary-expression -- a constant-nullish left is the fallback under test
  const { name: tryName, try: tryStatic } = null ?? Promise;
  let label, values;
  // eslint-disable-next-line prefer-const -- the assignment host is the case under test
  ({ name: label, values } = globalThis.absentReceiverForTheTest || Object);
  assert.same(typeof groupBy, 'function');
  assert.same(typeof tryStatic, 'function');
  assert.same(typeof name, 'string');
  assert.same(typeof tryName, 'string');
  assert.same(typeof label, 'string');
  assert.deepEqual(values({ a: 1 }), [1]);
});

// a pattern level whose DEFAULT is a call runs that call only when the default fires
QUnit.test('evaluation order: a call default runs only where the default fires', assert => {
  let calls = 0;
  function fallback() {
    calls++;
    return Map;
  }
  function pick(source) {
    const { M: { groupBy } = fallback() } = source;
    return groupBy;
  }
  assert.same(pick({ M: { groupBy: 1 } }), 1);
  assert.same(calls, 0);
  assert.same(typeof pick({}), 'function');
  assert.same(calls, 1);
});

// a nested level read through a user GETTER by a static and an instance member evaluates the getter
// once, before the static binds - its body still finds the binding unbound (in its temporal dead zone
// natively, undefined once the suite is lowered to `var`)
QUnit.test('evaluation order: a getter hop runs before its level binds', assert => {
  const seen = [];
  function probe() {
    try {
      seen.push(typeof bound);
    } catch {
      seen.push('undefined');
    }
  }
  // eslint-disable-next-line unicorn/no-static-only-class -- a class static getter the transform sees is the receiver under test
  class Source {
    static get iterator() {
      probe();
      return Iterator;
    }
  }
  const { M: { from: bound, name } } = { M: Source.iterator };
  assert.deepEqual(seen, ['undefined']);
  assert.deepEqual(bound([1, 2]).toArray(), [1, 2]);
  assert.same(typeof name, 'string');
});

// a getter-read prefix element ahead of a NESTED prototype or surface nav runs once, where the source
// runs it, whichever host elides the prefix to reach the nav
QUnit.test('evaluation order: a getter prefix ahead of a nested nav runs once', assert => {
  let reads = 0;
  // eslint-disable-next-line unicorn/no-static-only-class -- a class static getter the transform sees is the prefix under test
  class Source {
    static get g() {
      reads++;
      return 0;
    }
  }
  const { Array: { prototype: { at: viaSurface } } } = (Source.g, globalThis);
  const { prototype: { findLast: viaProto } } = (Source.g, Array);
  let viaAssign;
  // eslint-disable-next-line prefer-const -- the assignment host is the case under test
  ({ Array: { prototype: { flat: viaAssign } } } = (Source.g, globalThis));
  const [{ Array: { prototype: { toReversed: viaWrapper } } }] = [(Source.g, globalThis)];
  assert.same(reads, 4);
  assert.same(viaSurface.call([1, 2], -1), 2);
  assert.same(viaProto.call([1, 2, 3], item => item < 3), 2);
  assert.deepEqual(viaAssign.call([1, [2]]), [1, 2]);
  assert.deepEqual(viaWrapper.call([1, 2]), [2, 1]);
});

// member targets off an init that runs code are written in SOURCE order, after the init ran
QUnit.test('evaluation order: member targets off a call bind in source order', assert => {
  const seen = [];
  function make() {
    seen.push('make');
    return Array;
  }
  const target = {
    set first(value) {
      seen.push(`first:${ typeof value }`);
    },
    set second(value) {
      seen.push(`second:${ typeof value }`);
    },
  };
  ({ from: target.first, of: target.second } = make());
  assert.deepEqual(seen, ['make', 'first:function', 'second:function']);
});

// a user getter typed to a constructor, read by a nested instance claim beside a static, runs once
QUnit.test('evaluation order: a getter typed to a constructor is read once beside a static', assert => {
  let reads = 0;
  // eslint-disable-next-line unicorn/no-static-only-class -- a class static getter the transform sees is the receiver under test
  class Source {
    static get A() {
      reads++;
      return Array;
    }
  }
  const { prototype: { at }, from } = Source.A;
  assert.same(reads, 1);
  assert.same(at.call([1, 2], -1), 2);
  assert.deepEqual(from('ab'), ['a', 'b']);
});

// a static written into a member target beside an instance member written FIRST takes its polyfill
QUnit.test('evaluation order: a member target takes a static behind an instance member', assert => {
  function make() {
    return Iterator;
  }
  const target = {};
  ({ name: target.name, from: target.from } = make());
  assert.same(typeof target.name, 'string');
  assert.deepEqual(target.from([1, 2]).toArray(), [1, 2]);
});

// a getter read in a sequence prefix of a realm SELECTION arm runs once, ahead of the read
QUnit.test('evaluation order: a getter prefix in a selection arm runs once', assert => {
  let reads = 0;
  // eslint-disable-next-line unicorn/no-static-only-class -- a class static getter the transform sees is the prefix under test
  class Source {
    static get g() {
      reads++;
      return 0;
    }
  }
  const { Array: { from } } = (Source.g, globalThis) ?? {};
  assert.same(reads, 1);
  assert.deepEqual(from('ab'), ['a', 'b']);
});

// a prefix ahead of a call the rescue canon calls quiet still runs before the call: the callee reads
// what the prefix wrote
QUnit.test('evaluation order: a prefix runs before a quiet call tail that reads it', assert => {
  let box = null;
  function make() {
    // eslint-disable-next-line @stylistic/no-extra-parens -- the read of what the prefix wrote is the case under test
    return (box.x, Array);
  }
  let from, of;
  // eslint-disable-next-line prefer-const -- the assignment host is the case under test
  ({ from, of } = (box = { x: 1 }, make()));
  assert.deepEqual(from('ab'), ['a', 'b']);
  assert.deepEqual(of(1), [1]);
});

// an extraction beside a surviving residual keeps the source's key order for member-target setters
QUnit.test('evaluation order: member targets beside a residual bind in source order', assert => {
  const seen = [];
  function make() {
    seen.push('make');
    return Iterator;
  }
  const target = {
    set first(value) {
      seen.push(`first:${ typeof value }`);
    },
    set second(value) {
      seen.push(`second:${ typeof value }`);
    },
  };
  ({ from: target.first, name: target.second } = make());
  assert.deepEqual(seen, ['make', 'first:function', 'second:string']);
});

// a name a getter of the same pattern rebinds is read once: every reader sees the value destructured
QUnit.test('evaluation order: a name a getter rebinds is held once across readers', assert => {
  let list = [1, [2]];
  Object.defineProperty(list, 'at', {
    get() {
      list = 'xy';
      return () => 'own';
    },
  });
  const { at, flat } = list;
  assert.same(at(), 'own');
  assert.same(typeof flat, 'function');
});
