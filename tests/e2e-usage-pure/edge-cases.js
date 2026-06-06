// delete expression - must NOT be transformed
QUnit.test('delete: should not transform delete expression', assert => {
  const obj = { includes: true, at: 1 };
  delete obj.includes;
  assert.false('includes' in obj);
});

// assignment target - must NOT be transformed
QUnit.test('assignment: should not transform assignment target', assert => {
  const obj = { includes: false };
  obj.includes = true;
  assert.true(obj.includes);
});

// update expression - must NOT be transformed
QUnit.test('update: should not transform update expression', assert => {
  const obj = { at: 0 };
  obj.at++;
  assert.same(obj.at, 1);
});

// logical AND short-circuit
QUnit.test('logical AND: polyfilled method in &&', assert => {
  const arr = [1, 2, 3];
  const result = arr && arr.includes(2);
  assert.true(result);
});

// polyfill in template literal
QUnit.test('template literal: interpolated polyfill call', assert => {
  const result = `has 2: ${ [1, 2, 3].includes(2) }`;
  assert.same(result, 'has 2: true');
});

// nested call: polyfill result as argument
QUnit.test('nested: polyfill result as argument to another polyfill', assert => {
  const keys = Object.keys({ a: 1, b: 2 });
  assert.true(keys.includes('a'));
  assert.same(keys.at(0), 'a');
});

// method on literal
QUnit.test('literal: method on string literal', assert => {
  assert.true('hello world'.includes('world'));
  assert.same('hello'.at(-1), 'o');
});

QUnit.test('literal: method on array literal', assert => {
  assert.true([1, 2, 3].includes(2));
  assert.same([10, 20, 30].at(-1), 30);
});

// IIFE pattern
QUnit.test('IIFE: polyfill in immediately invoked function', assert => {
  const result = (() => [1, 2, 3].includes(2))();
  assert.true(result);
});

// computed property access - plugin should NOT transform dynamic names
QUnit.test('computed: dynamic method name not transformed', assert => {
  const method = 'includes';
  assert.same(typeof [][method], 'function');
});

// ternary / conditional - unknown type at compile time
QUnit.test('ternary: array or string .includes', assert => {
  const target = Math.random() > -1 ? [1, 2, 3] : 'hello';
  assert.true(target.includes(1));
});

QUnit.test('function return type unknown', assert => {
  function getData() {
    return [1, 2, 3];
  }
  assert.true(getData().includes(2));
  assert.same(getData().at(-1), 3);
});

QUnit.test('?? nullish coalescing pattern', assert => {
  function getItems(input) {
    return input ?? [4, 5, 6];
  }
  assert.true(getItems(null).includes(5));
  assert.true(getItems([1, 2]).includes(1));
});

// variable reassignment
QUnit.test('variable reassignment then use', assert => {
  let arr = [0];
  assert.false(arr.includes(2));
  arr = [1, 2, 3];
  assert.true(arr.includes(2));
});

// method on parameter
QUnit.test('method on parameter', assert => {
  function process(items) {
    return items.filter(x => x > 0).map(x => x * 2);
  }
  assert.deepEqual(process([1, -2, 3, -4, 5]), [2, 6, 10]);
});

// method on loop variable
QUnit.test('method on loop variable', assert => {
  const arrays = [[1, 2], [3, 4], [5, 6]];
  const result = [];
  for (const arr of arrays) {
    result.push(arr.at(0));
  }
  assert.deepEqual(result, [1, 3, 5]);
});

// method in nested callback
QUnit.test('method in nested callback', assert => {
  const result = [[3, 1, 2], [6, 4, 5]].map(arr => arr.toSorted());
  assert.deepEqual(result, [[1, 2, 3], [4, 5, 6]]);
});

// nested: polyfill inside polyfill callback
QUnit.test('nested: polyfill inside filter callback', assert => {
  const data = [['a', 'b'], ['c', 'd'], ['e', 'f']];
  assert.deepEqual(data.filter(arr => arr.includes('c')), [['c', 'd']]);
});

QUnit.test('nested: chained polyfills in callback', assert => {
  const result = [[3, 1], [6, 4]].map(arr => arr.toSorted().at(0));
  assert.deepEqual(result, [1, 4]);
});

// try/catch
QUnit.test('try/catch: polyfill in try block', assert => {
  let result;
  try {
    result = [1, 2, 3].find(x => x > 2);
  } catch {
    result = -1;
  }
  assert.same(result, 3);
});

QUnit.test('try/catch: polyfill in catch block', assert => {
  let keys;
  try {
    throw new Error('fail');
  } catch (error) {
    keys = Object.keys({ message: error.message });
  }
  assert.deepEqual(keys, ['message']);
});

// promise handlers
QUnit.test('promise: polyfill in catch handler', assert => {
  const async = assert.async();
  Promise.reject(new Error('fail')).catch(error => {
    assert.true(error.message.includes('fail'));
    async();
  });
});

// nested for-of
QUnit.test('nested: for-of inside for-of', assert => {
  const matrix = [[1, 2], [3, 4]];
  const flat = [];
  for (const row of matrix) {
    for (const val of row) flat.push(val);
  }
  assert.deepEqual(flat, [1, 2, 3, 4]);
});

// default parameter
QUnit.test('default param: polyfill in default value', assert => {
  function getFirst(arr, fallback = [0].at(0)) {
    return arr.at(0) ?? fallback;
  }
  assert.same(getFirst([5, 6]), 5);
});

// var self-reference shadow - var Map = Map resolves to global
QUnit.test('var self-ref: var Map = Map; Map.groupBy', assert => {
  // eslint-disable-next-line no-var -- testing var hoisting
  var Map = Map;
  assert.same(typeof Map.groupBy, 'function');
});

// computed template literal key
QUnit.test('computed template key: arr.includes(x) via computed', assert => {
  assert.true([1, 2, 3].includes(2));
});

// three chained polyfills
QUnit.test('three chained: Array.from(...).filter(...).findLast(...)', assert => {
  assert.same(Array.from([1, 2, 3, 4]).filter(x => x > 2).findLast(x => x < 4), 3);
});

// catch clause
QUnit.test('catch: instance method on caught error', assert => {
  try {
    throw new Error('test failure');
  } catch (err) {
    assert.true(err.message.includes('failure'));
    assert.same(err.message.at(0), 't');
  }
});

QUnit.test('catch: Object.keys on caught error', assert => {
  try {
    const err = new Error('fail');
    err.code = 42;
    throw err;
  } catch (err) {
    assert.true(Object.keys(err).includes('code'));
  }
});

// scope shadows
QUnit.test('scope: block-scoped shadow does not leak', assert => {
  {
    // eslint-disable-next-line no-unused-vars -- testing scope
    const Array = [1, 2, 3];
  }
  assert.deepEqual(Array.from([4, 5]), [4, 5]);
});

QUnit.test('scope: arrow param shadow', assert => {
  const fn = Array => Array.length;
  assert.same(fn([1, 2, 3]), 3);
  assert.deepEqual(Array.from('ab'), ['a', 'b']);
});

QUnit.test('scope: for-of variable shadow', assert => {
  for (const Map of [1, 2, 3]) {
    assert.same(typeof Map, 'number');
  }
  assert.same(typeof Map.groupBy, 'function');
});

// typeof guard - polyfill still injected
QUnit.test('typeof guard: typeof Map !== undefined', assert => {
  assert.same(typeof Map, 'function');
  assert.same(typeof Map.groupBy, 'function');
});

// spread into polyfilled constructor
QUnit.test('spread: new Map from entries', assert => {
  const entries = [['a', 1], ['b', 2]];
  const map = new Map(entries);
  assert.same(map.get('a'), 1);
  assert.same(map.size, 2);
});

// AggregateError
QUnit.test('AggregateError: constructor and errors', assert => {
  const err = new AggregateError([new Error('a'), new Error('b')], 'multi');
  assert.same(err.message, 'multi');
  assert.same(err.errors.length, 2);
});

// disable directive - WeakMap.of is not native anywhere, so without polyfill it throws
QUnit.test('disable: core-js-disable-next-line prevents polyfill', assert => {
  // core-js-disable-next-line
  assert.same(typeof WeakMap.of, 'undefined');
});

// new on polyfilled constructor result
QUnit.test('new: Map from polyfilled entries', assert => {
  const entries = Array.from(Object.entries({ a: 1, b: 2 }));
  const map = new Map(entries);
  assert.same(map.get('a'), 1);
});

// multiple polyfills in one line
QUnit.test('multi-polyfill: several in one expression', assert => {
  assert.true(Object.keys({ a: 1 }).includes('a'));
  assert.same([1, 2].at(-1), 2);
});

// polyfill in ternary branches
QUnit.test('ternary: polyfill in both branches', assert => {
  const useSet = true;
  const size = useSet ? new Set([1, 2]).size : new Map([['a', 1]]).size;
  assert.same(size, 2);
});

// chained assignment with polyfill
QUnit.test('assignment: polyfill result stored and used', assert => {
  const keys = Object.keys({ x: 1, y: 2 });
  const first = keys.at(0);
  const has = keys.includes('y');
  assert.same(first, 'x');
  assert.true(has);
});

// polyfill in object method shorthand
QUnit.test('object method: polyfill in method body', assert => {
  const obj = {
    getKeys(data) {
      return Object.keys(data).toSorted();
    },
  };
  assert.deepEqual(obj.getKeys({ b: 2, a: 1 }), ['a', 'b']);
});

// polyfill with comma operator
QUnit.test('comma operator: polyfill in sequence', assert => {
  const result = (0, Array.from)([1, 2, 3]);
  assert.deepEqual(result, [1, 2, 3]);
});

// --- object-literal property type tracking through arg-pass channels ---
// the plugin's defaultAliasRefClassifier decides whether passing `o` to a static call
// constitutes an escape that invalidates property-type narrows. these tests verify that
// runtime behaviour holds across the various classifier branches: known-non-mutating call
// (Object.keys/JSON.stringify), known-mutating slot (Object.assign target), spread sites
// (read-only by construction), and through MemberExpression chains

QUnit.test('flow: o passed to non-mutating static, this.X read still works', assert => {
  const o = {
    arr: [10, 20, 30],
    test() {
      Object.keys(o);
      JSON.stringify(o);
      return this.arr.at(-1);
    },
  };
  assert.same(o.test(), 30);
});

QUnit.test('flow: o passed as Object.assign target, mutation visible at next read', assert => {
  const o = {
    arr: [1, 2, 3],
    extend(src) {
      Object.assign(o, src);
      return { added: this.added, first: this.arr.at(0) };
    },
  };
  const r = o.extend({ added: 'yes' });
  assert.same(r.added, 'yes');
  assert.same(r.first, 1);
});

QUnit.test('flow: o spread into mutating call mutates first source slot', assert => {
  // Object.assign(...sources): sources[0] receives the merge; this is the ONLY way
  // a spread can land at a mutating slot (target=index 0) at runtime
  const sources = [{ tag: 'first' }, { extra: true }];
  Object.assign(...sources);
  assert.true(sources[0].extra);
  assert.same(sources[0].tag, 'first');
  assert.deepEqual(sources[1], { extra: true }, 'subsequent sources unchanged');
});

QUnit.test('flow: o passed to user fn (escape), polyfill still runs at runtime', assert => {
  // user fn can mutate o.arr to a different type; classifier must conservatively leak the
  // closure so a generic polyfill is selected. runtime test verifies the generic dispatch
  // still works on whatever type o.arr ends up as
  function leak(p) { p.arr = 'stringified'; }
  const o = {
    arr: [1, 2, 3],
    test() {
      leak(o);
      return this.arr.at(0);
    },
  };
  assert.same(o.test(), 's');
});

QUnit.test('flow: anonymous object literal in array, this.X access', assert => {
  const items = [
    { arr: [1, 2], first() { return this.arr.at(0); } },
    { arr: [3, 4], first() { return this.arr.at(0); } },
  ];
  assert.deepEqual(items.map(item => item.first()), [1, 3]);
});

QUnit.test('flow: this.X through getter resolves at runtime', assert => {
  /* eslint-disable es/no-accessor-properties, no-underscore-dangle -- getter access pattern */
  const o = {
    _arr: [10, 20, 30],
    get arr() { return this._arr; },
    first() { return this.arr.at(0); },
  };
  /* eslint-enable es/no-accessor-properties, no-underscore-dangle -- end */
  assert.same(o.first(), 10);
});

// --- computed key access: string-literal vs dynamic ---

QUnit.test('computed: string-literal key resolves to polyfill', assert => {
  // arr['at'](0) is syntactically computed but the key is a static string literal -
  // the plugin treats it the same as arr.at(0) and emits a polyfill call
  const arr = [10, 20, 30];
  // eslint-disable-next-line dot-notation -- testing computed string-literal key
  assert.same(arr['at'](-1), 30);
  // eslint-disable-next-line dot-notation -- testing computed string-literal key
  assert.true(arr['includes'](20));
});

QUnit.test('computed: dynamic key (variable) does NOT trigger polyfill emit', assert => {
  // const-bound key name - plugin can't statically resolve which method, leaves raw access.
  // resolution falls back to runtime: native String.prototype.at on the receiver
  const arr = [10, 20, 30];
  const method = 'at';
  assert.same(typeof arr[method], 'function');
  assert.same(arr[method](-1), 30);
});

// --- side-effect preservation: SE-prefix in computed key ---

QUnit.test('SE-prefix: computed key with side-effect tail', assert => {
  // (sideEffect(), 'at') - SequenceExpression computed key. the SE-bearing prefix must run
  // exactly once and the tail ('at') is the real key; the rewrite preserves the prefix rather
  // than dropping it
  let counter = 0;
  const arr = [10, 20, 30];
  // eslint-disable-next-line @stylistic/no-extra-parens -- testing SE-prefix in computed
  const value = arr[(counter++, 'at')](-1);
  assert.same(value, 30);
  assert.same(counter, 1, 'SE prefix executed exactly once');
});

QUnit.test('SE-prefix: SequenceExpression in callee position', assert => {
  // (sideEffect(), Array).from(x) - SE-bearing prefix before the polyfill receiver.
  // emission wraps the polyfill id in a source-level sequence to preserve the SE
  let counter = 0;
  const result = (counter++, Array).from('abc');
  assert.deepEqual(result, ['a', 'b', 'c']);
  assert.same(counter, 1);
});

QUnit.test('SE-prefix: Symbol.iterator computed key keeps receiver before key side effect', assert => {
  // getObj()[(key(), Symbol.iterator)]() must evaluate the receiver BEFORE the key side effect,
  // matching native order. the rewrite hoists the receiver memo ahead of the key SE
  // (`(_ref = getObj(), key(), getIterator(_ref))`) so the two effects do not swap
  const order = [];
  function getObj() {
    order.push('receiver');
    return [1, 2, 3];
  }
  function key() {
    order.push('key');
  }
  // eslint-disable-next-line @stylistic/no-extra-parens -- SE-prefix in computed key under test
  const iter = getObj()[(key(), Symbol.iterator)]();
  assert.deepEqual(order, ['receiver', 'key']);
  assert.same(typeof iter.next, 'function');
});

QUnit.test('SE-prefix: computed instance-method key keeps receiver before key side effect', assert => {
  // getObj()[(key(), 'at')](-1) must evaluate the receiver before the key side effect (native
  // order) and only once; the receiver memo is hoisted ahead of the key SE so the polyfill applies
  const order = [];
  let recvCalls = 0;
  function getObj() {
    order.push('receiver');
    recvCalls += 1;
    return [10, 20, 30];
  }
  function key() {
    order.push('key');
    return 'at';
  }
  // eslint-disable-next-line @stylistic/no-extra-parens -- SE-prefix in computed key under test
  const last = getObj()[(key(), 'at')](-1);
  assert.deepEqual(order, ['receiver', 'key']);
  assert.same(recvCalls, 1);
  assert.same(last, 30);
});

// --- recursive call with polyfill ---

QUnit.test('recursive: polyfill in recursive function body', assert => {
  // exercises plugin's traversal when the same function references polyfilled methods
  // multiple times across recursive call boundaries
  function flatten(items) {
    if (items.length === 0) return [];
    const head = items.at(0);
    const tail = items.slice(1);
    return Array.isArray(head) ? flatten(head).concat(flatten(tail)) : [head].concat(flatten(tail));
  }
  assert.deepEqual(flatten([[1, [2, 3]], 4, [5, [6, [7]]]]), [1, 2, 3, 4, 5, 6, 7]);
});

// --- polyfill in switch case ---

QUnit.test('switch: polyfill in switch discriminant + case', assert => {
  function classify(arr) {
    switch (arr.at(0)) {
      case 'admin': return 'priviliged';
      case 'guest': return 'limited';
      default: return arr.includes('admin') ? 'mixed' : 'standard';
    }
  }
  assert.same(classify(['admin', 'user']), 'priviliged');
  assert.same(classify(['guest']), 'limited');
  assert.same(classify(['user', 'admin']), 'mixed');
  assert.same(classify(['user']), 'standard');
});

// --- destructured catch parameter + polyfilled access ---

QUnit.test('catch destructure: { message } binding then polyfill on it', assert => {
  // catch param ObjectPattern + .message property access + .includes polyfill
  try {
    throw new Error('connection refused');
  } catch ({ message }) {
    assert.true(message.includes('refused'));
    assert.same(message.at(0), 'c');
  }
});

QUnit.test('catch destructure: { message: msg, name } renamed', assert => {
  try {
    throw new TypeError('bad arg');
  } catch ({ message: msg, name }) {
    assert.same(name, 'TypeError');
    assert.true(msg.startsWith('bad'));
  }
});

// --- nested destructure flatten ---

QUnit.test('nested destructure: { a: { from } } = { a: Array }', assert => {
  // plugin's flatten path resolves nested ObjectPattern through the init's nested literal
  // to find Array.from polyfill anchor
  const { a: { from } } = { a: Array };
  assert.deepEqual(from([1, 2, 3]), [1, 2, 3]);
});

QUnit.test('nested destructure: through proxy global', assert => {
  // const { Array: { from } } = globalThis - proxy-global step + nested destructure
  const { Array: { from } } = globalThis;
  assert.deepEqual(from('abc'), ['a', 'b', 'c']);
});

QUnit.test('nested destructure: triple-nested with default', assert => {
  // resolveNestedDestructureReceiver walks N-deep ObjectPattern (babel)
  const { a: { b: { from } = {} } = {} } = { a: { b: Array } };
  assert.deepEqual(from([10, 20]), [10, 20]);
});

// --- side-effect prefix in non-callee positions ---

QUnit.test('SE-prefix: in array element position', assert => {
  // SE-bearing SequenceExpression as array element - polyfill emit must keep the prefix
  // alive (no silent SE drop). element evaluation order: SE prefix runs, then polyfill
  let counter = 0;
  const result = [(counter++, [1, 2, 3].at(-1))];
  assert.same(counter, 1);
  assert.same(result[0], 3);
});

QUnit.test('SE-prefix: in function call argument', assert => {
  // SE prefix in arg position - same constraint, prefix must run before polyfill emit
  let counter = 0;
  function id(x) { return x; }
  const result = id((counter++, [10, 20, 30].at(0)));
  assert.same(counter, 1);
  assert.same(result, 10);
});

QUnit.test('SE-prefix: in object property value', assert => {
  let counter = 0;
  const obj = { first: (counter++, [1, 2, 3].at(0)) };
  assert.same(counter, 1);
  assert.same(obj.first, 1);
});

// --- export with polyfill ---

// these patterns appear in user libraries that re-export polyfilled built-ins. plugin
// must inject polyfills into the producing module regardless of the value flowing
// through export bindings

QUnit.test('export: arrow re-exporting polyfilled value', assert => {
  // simulated re-export pattern: function returning polyfilled call
  const exportedFn = () => Array.from(new Set([1, 1, 2, 3]));
  assert.deepEqual(exportedFn(), [1, 2, 3]);
});

QUnit.test('export: object literal field is polyfilled call', assert => {
  // simulated module shape: object containing polyfilled-built data
  const moduleShape = {
    items: Array.from([10, 20, 30]),
    first() { return this.items.at(0); },
    last() { return this.items.at(-1); },
  };
  assert.same(moduleShape.first(), 10);
  assert.same(moduleShape.last(), 30);
});
