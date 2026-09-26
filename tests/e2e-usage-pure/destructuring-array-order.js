// Babel's array-literal lowering can reorder neighbour effects, re-read replaced
// bindings and lose default names before post-only detection. The differential
// checks source syntax; the other e2e phases check lowering after our capture.
const testBeforeLowering = typeof E2E_DETECT_LOWERED === 'undefined' ? QUnit.test : QUnit.skip;

QUnit.test('destructuring: positional native fragments keep keys, defaults and nested reads', assert => {
  const events = [];
  const key = {
    toString() {
      events.push('key');
      return 'other';
    },
  };
  function read(rows) {
    // eslint-disable-next-line unicorn/no-unsafe-property-key -- checks one observable key conversion
    const [{ [key]: other = (events.push('other-default'), 3), nested: { value }, at, includes = (events.push('includes-default'), 7) }] = rows;
    return [other, value, at, includes];
  }
  const source = {
    get other() { events.push('other'); },
    get nested() {
      events.push('nested');
      return {
        get value() {
          events.push('value');
          return 4;
        },
      };
    },
    get at() { events.push('at'); return 1; },
    get includes() { events.push('includes'); },
  };
  assert.deepEqual(read([source]), [3, 4, 1, 7]);
  assert.deepEqual(events, ['key', 'other', 'other-default', 'nested', 'value', 'at', 'includes', 'includes-default']);
});

QUnit.test('destructuring: a positional assignment retains a preceding static claim', assert => {
  const array = [2, 7];
  const rows = [Object, array];
  let keys, at;
  // eslint-disable-next-line prefer-const -- checks assignment placement
  [{ keys }, { at }] = rows;
  assert.deepEqual(keys({ x: 1 }), ['x']);
  assert.strictEqual(at.call(array, -1), 7);
});

QUnit.test('destructuring: positional reads stay between sibling initializers and outer reads', assert => {
  const events = [];
  function read(rows) {
    const beforeInit = events.push('before-init'),
          [{ before, y: { other, at }, after }] = rows,
          afterInit = events.push('after-init');
    return [beforeInit, before, other, at, after, afterInit];
  }
  const source = {
    get before() { events.push('before'); return 1; },
    get y() {
      events.push('y');
      return {
        get other() { events.push('other'); return 3; },
        get at() { events.push('at'); return 4; },
      };
    },
    get after() { events.push('after'); return 2; },
  };
  assert.deepEqual(read([source]), [1, 1, 3, 4, 2, 7]);
  assert.deepEqual(events, ['before-init', 'before', 'y', 'other', 'at', 'after', 'after-init']);
});

QUnit.test('destructuring: positional assignments complete each write before the next read', assert => {
  const events = [];
  function read(make) {
    let value, tail;
    const rows = make(() => value);
    [[{ at: value }], , [{ includes: value }], ...tail] = rows;
    return [value, tail];
  }
  const result = read(current => [
    [{
      get at() { events.push('at'); return 1; },
    }],
    7,
    [{
      get includes() { events.push(['includes', current()]); return 2; },
    }],
    9,
  ]);
  assert.deepEqual(result, [2, [9]]);
  assert.deepEqual(events, ['at', ['includes', 1]]);
});

QUnit.test('destructuring: positional native properties stay between independent reads', assert => {
  const events = [];
  let count = 0;
  const source = {
    get at() { events.push('at'); return ++count; },
    get other() { events.push('other'); return 3; },
    get includes() { events.push('includes'); return 4; },
  };
  function read(rows) {
    const [{ at: first, other, at: second, includes }] = rows;
    return [first, other, second, includes];
  }
  assert.deepEqual(read([source]), [1, 3, 2, 4]);
  assert.deepEqual(events, ['at', 'other', 'at', 'includes']);
  events.length = 0;
  function nested(rows) {
    const [{ y: { other, at } }] = rows;
    return [other, at];
  }
  const box = {
    get y() {
      events.push('y');
      return source;
    },
  };
  assert.deepEqual(nested([box]), [3, 3]);
  assert.deepEqual(events, ['y', 'other', 'at']);
});

QUnit.test('destructuring: positional hosts retain slots and source read order', assert => {
  const events = [];
  const first = {
    get at() {
      events.push('at');
      return 1;
    },
  };
  const second = {
    get includes() {
      events.push('includes');
      return 2;
    },
  };
  function read(rows) {
    const [[{ at }], , [{ includes }], ...tail] = rows;
    return [at, includes, tail];
  }
  assert.deepEqual(read([[first], 7, [second], 9]), [1, 2, [9]]);
  assert.deepEqual(events, ['at', 'includes']);
  function loop(rows) {
    let result;
    for (const [{ at }, { includes }] = rows; !result;) result = [at, includes];
    return result;
  }
  assert.deepEqual(loop([first, second]), [1, 2]);
  function bodyless(rows) {
    // eslint-disable-next-line no-var -- an unbraced control body requires a var declaration
    if (rows) var [{ at }, { includes }] = rows;
    return [at, includes];
  }
  assert.deepEqual(bodyless([first, second]), [1, 2]);
  assert.deepEqual(events, ['at', 'includes', 'at', 'includes', 'at', 'includes']);
});

QUnit.test('destructuring: unbraced loop assignments capture before reading', assert => {
  const events = [];
  let reads = 0;
  const source = {
    get flat() {
      events.push('read');
      return ++reads;
    },
  };
  function read(receiver, rows) {
    let flat = 0;
    for (const row of rows) [{ flat }] = [(events.push(row), receiver)];
    return flat;
  }
  assert.same(read(source, []), 0);
  assert.same(read(source, ['first', 'second']), 2);
  assert.deepEqual(events, ['first', 'read', 'second', 'read']);
  const array = [[1], [2]];
  assert.deepEqual(read(array, ['array']).call(array), [1, 2]);
});

QUnit.test('destructuring: later array claims keep earlier nested reads in place', assert => {
  const events = [];
  const source = {
    get w() {
      events.push('w');
      return {
        get values() {
          events.push('values');
          return 1;
        },
      };
    },
    get y() {
      events.push('y');
      return {
        get at() {
          events.push('at');
          return 2;
        },
      };
    },
  };
  function read(box) {
    const [{ w: { values }, y: { at } }] = [box, events.push('effect')];
    return [values, at];
  }
  assert.deepEqual(read(source), [1, 2]);
  assert.deepEqual(events, ['effect', 'w', 'values', 'y', 'at']);
});

QUnit.test('destructuring: nested array capture retains a replaced root', assert => {
  function read() {
    let box = { y: { at: 1 } };
    // eslint-disable-next-line no-useless-assignment -- the later element cannot replace the captured root
    const [{ y: { at } }, tail] = [box, box = { y: { at: 9 } }];
    return [at, tail.y.at];
  }
  assert.deepEqual(read(), [1, 9]);
});

QUnit.test('destructuring: nested array leaves share the receiver, not its getters', assert => {
  const events = [];
  let count = 0;
  const source = {
    get y() {
      events.push('receiver');
      return {
        get at() { events.push('at'); return ++count; },
        get other() { events.push('other'); return 3; },
      };
    },
  };
  function read(box) {
    const [{ y: { at: first, at: second, other } }] = [box];
    return [first, second, other];
  }
  assert.deepEqual(read(source), [1, 2, 3]);
  assert.deepEqual(events, ['receiver', 'at', 'at', 'other']);
  function builtin(box) {
    const [{ y: { at, includes } }] = [box];
    return [at.call(box.y, -1), includes.call(box.y, 2)];
  }
  assert.deepEqual(builtin({ y: [1, 2] }), [2, true]);
});

QUnit.test('destructuring: array iterator reads stay independent and ordered', assert => {
  const events = [];
  let reads = 0;
  const source = {
    get [Symbol.iterator]() {
      events.push('iterator');
      const value = ++reads;
      return () => value;
    },
    get other() { events.push('other'); return 3; },
    get at() { events.push('at'); return 4; },
  };
  function read(receiver) {
    const [{ [Symbol.iterator]: first, other, at, [Symbol.iterator]: second }] = [receiver];
    return [first(), other, at, second()];
  }
  assert.deepEqual(read(source), [1, 3, 4, 2]);
  assert.deepEqual(events, ['iterator', 'other', 'at', 'iterator']);
});

QUnit.test('destructuring: array iterator aliases keep instance dispatch', assert => {
  const key = Symbol.iterator;
  function read(receiver) {
    const [{ [key]: iterator, at }] = [receiver];
    return [iterator.call(receiver).next().value, at.call(receiver, -1)];
  }
  assert.deepEqual(read([2, 5]), [2, 5]);
  assert.deepEqual(read('abc'), ['a', 'c']);
});

QUnit.test('destructuring: array element properties and defaults keep source order', assert => {
  const events = [];
  const source = {
    get at() { events.push('at'); return undefined; },
    get other() { events.push('other'); return 2; },
    get includes() { events.push('includes'); return 3; },
  };
  function fallback() {
    events.push('default');
    return 1;
  }
  function first(receiver) {
    const [{ at = fallback(), other }] = [receiver];
    return [at, other];
  }
  function last(receiver) {
    const [{ other, at = fallback() }] = [receiver];
    return [at, other];
  }
  function middle(receiver) {
    const [{ at = fallback(), other, includes }] = [receiver];
    return [at, other, includes];
  }
  for (const [run, order, result] of [
    [first, ['at', 'default', 'other'], [1, 2]],
    [last, ['other', 'at', 'default'], [1, 2]],
    [middle, ['at', 'default', 'other', 'includes'], [1, 2, 3]],
  ]) {
    events.length = 0;
    assert.deepEqual(run(source), result);
    assert.deepEqual(events, order);
  }
});

testBeforeLowering('destructuring: array capture keeps values across neighbouring effects', assert => {
  const events = [];
  const source = {
    get at() { events.push('at'); return 1; },
    get other() { events.push('other'); return 2; },
  };
  function read(receiver) {
    // eslint-disable-next-line no-useless-assignment -- a later initializer must not replace the captured element
    const [{ other, at }, tail] = [receiver, (events.push('tail'), receiver = { at: 9, other: 8 })];
    return [at, other, tail.at];
  }
  assert.deepEqual(read(source), [1, 2, 9]);
  assert.deepEqual(events, ['tail', 'other', 'at']);
});

QUnit.test('destructuring: array property reads stop at an abrupt default', assert => {
  const events = [];
  const source = {
    get at() { events.push('at'); return undefined; },
    get other() { events.push('other'); return 2; },
  };
  const failure = {};
  function fail() {
    events.push('default');
    throw failure;
  }
  function read(receiver) {
    // eslint-disable-next-line sonarjs/no-use-of-empty-return-value -- the default's throw stops the later getter
    const [{ at = fail(), other }] = [receiver];
    return [at, other];
  }
  assert.throws(() => read(source), error => error === failure);
  assert.deepEqual(events, ['at', 'default']);
});

QUnit.test('destructuring: repeated array element keys are independent reads', assert => {
  let count = 0;
  const source = { get at() { return ++count; }, other: 7 };
  function read(receiver) {
    const [{ at: first, other, at: second }] = [receiver];
    return [first, other, second];
  }
  assert.deepEqual(read(source), [1, 7, 2]);
  assert.same(count, 2);
});

// Inferred names are checked by the differential's array-property-order/default-name
// case; ES5 lowering leaves an anonymous function whose name IE cannot recover.
testBeforeLowering('destructuring: captured array defaults keep nested polyfills', assert => {
  function read(receiver) {
    const [{ other, at = () => 'abc'.at(-1) }] = [receiver];
    return [other, at()];
  }
  assert.deepEqual(read({ other: 7 }), [7, 'c']);
  function builtin(receiver) {
    const [{ other, at = () => 'fallback' }] = [receiver];
    return [other, at.call(receiver, -1)];
  }
  assert.deepEqual(builtin([4, 8]), [undefined, 8]);
});

QUnit.test('destructuring: array extraction stays between adjacent declarators', assert => {
  const events = [];
  const source = {
    get at() { events.push('at'); return undefined; },
    get other() { events.push('other'); return 2; },
  };
  function fallback() {
    events.push('default');
    return 1;
  }
  function read(receiver) {
    const before = events.push('before'),
          [{ at = fallback(), other }] = [receiver],
          after = events.push('after');
    return [before, at, other, after];
  }
  assert.deepEqual(read(source), [1, 1, 2, 5]);
  assert.deepEqual(events, ['before', 'at', 'default', 'other', 'after']);
});

QUnit.test('destructuring: array extraction in a for initializer keeps property order', assert => {
  const events = [];
  const source = {
    get at() { events.push('at'); return undefined; },
    get other() { events.push('other'); return 2; },
  };
  function fallback() {
    events.push('default');
    return 1;
  }
  function read(receiver) {
    // eslint-disable-next-line no-unreachable-loop -- exercising the initializer's declaration context
    for (const [{ at = fallback(), other }] = [receiver]; ;) return [at, other];
  }
  assert.deepEqual(read(source), [1, 2]);
  assert.deepEqual(events, ['at', 'default', 'other']);
});

QUnit.test('destructuring: receiver getters precede array element property reads', assert => {
  const events = [];
  function read(holder) {
    const [{ at }, { includes }] = [holder.first, holder.second];
    return [at, includes];
  }
  assert.deepEqual(read({
    get first() {
      events.push('first');
      return {
        get at() { events.push('at'); return 1; },
      };
    },
    get second() {
      events.push('second');
      return {
        get includes() { events.push('includes'); return 2; },
      };
    },
  }), [1, 2]);
  assert.deepEqual(events, ['first', 'second', 'at', 'includes']);
});

testBeforeLowering('destructuring: array reads retain a later receiver rebound by a getter', assert => {
  function read(first, second) {
    let later = second;
    const earlier = first(() => { later = { includes: 9 }; });
    const [{ at }, { includes }] = [earlier, later];
    return [at, includes];
  }
  assert.deepEqual(
    read(
      replace => ({
        get at() { replace(); return 1; },
      }),
      { includes: 2 },
    ),
    [1, 2],
  );
});

QUnit.test('destructuring: array reads retain one receiver rebound by a getter', assert => {
  function shared(make) {
    let receiver = make(() => { receiver = { includes: 9 }; });
    const [{ at, includes }] = [receiver];
    return [at, includes];
  }
  assert.deepEqual(
    shared(replace => ({
      get at() { replace(); return 1; },
      includes: 2,
    })),
    [1, 2],
  );
});

QUnit.test('destructuring: array memo runs once between adjacent declarators', assert => {
  const events = [];
  let count = 0;
  function read(holder) {
    const before = events.push('before'),
          [{ at, includes }] = [holder.value],
          after = events.push('after');
    return [before, at, includes, after];
  }
  assert.deepEqual(read({
    get value() {
      events.push('receiver');
      return {
        get at() { events.push('at'); return ++count; },
        get includes() { events.push('includes'); return ++count; },
      };
    },
  }), [1, 1, 2, 5]);
  assert.deepEqual(events, ['before', 'receiver', 'at', 'includes', 'after']);
});

QUnit.test('destructuring: positional declarators retain their property order', assert => {
  const events = [];
  const firstRows = [{
    get at() { events.push('at'); return 1; },
  }];
  const secondRows = [{
    get includes() { events.push('includes'); return 2; },
  }];
  function read(first, second) {
    const [{ at }] = first,
          [{ includes }] = second;
    return [at, includes];
  }
  assert.deepEqual(read(firstRows, secondRows), [1, 2]);
  assert.deepEqual(events, ['at', 'includes']);
  events.length = 0;
  const failure = {};
  assert.throws(
    () => read(
      [{
        get at() { events.push('throw'); throw failure; },
      }],
      secondRows,
    ),
    error => error === failure,
  );
  assert.deepEqual(events, ['throw']);
});

QUnit.test('destructuring: compact array extraction preserves a nested sibling', assert => {
  let reads = 0;
  function read(source) {
    const [{ value: { flat }, keep }] = [source],
          [{ at }] = [[1, 2]];
    return [flat.call([1, [2]]), keep, at.call([1, 2], -1)];
  }
  assert.deepEqual(
    read({
      get value() { reads++; return [1, [2]]; },
      keep: 7,
    }),
    [[1, 2], 7, 2],
  );
  assert.same(reads, 1);
});

QUnit.test('destructuring: array getters observe source binding writes', assert => {
  const events = [];
  function read(make) {
    // eslint-disable-next-line no-var -- observes the uninitialized value after ES5 lowering too
    var [before, { at }, after] = [2, make(() => [before, after]), 3];
    return [before, at, after];
  }
  assert.deepEqual(read(current => ({
    get at() {
      events.push(current());
      return 1;
    },
  })), [2, 1, 3]);
  assert.deepEqual(events, [[2, undefined]]);
});

QUnit.test('destructuring: array getter precedes its rest binding', assert => {
  const events = [];
  function read(make) {
    // eslint-disable-next-line no-var -- observes the uninitialized value after ES5 lowering too
    var [{ at }, ...rest] = [make(() => rest), 4, 5],
        after = 6;
    return [at, rest, after];
  }
  assert.deepEqual(read(current => ({
    get at() {
      events.push(current());
      return 1;
    },
  })), [1, [4, 5], 6]);
  assert.deepEqual(events, [undefined]);
  events.length = 0;
  function readInterleaved(make) {
    // eslint-disable-next-line no-var -- observes the uninitialized value after ES5 lowering too
    var [before, { includes }, ...rest] = [2, make(() => [before, rest]), 3];
    return [before, includes, rest];
  }
  assert.deepEqual(readInterleaved(current => ({
    get includes() {
      events.push(current());
      return 4;
    },
  })), [2, 4, [3]]);
  assert.deepEqual(events, [[2, undefined]]);
});

QUnit.test('destructuring: array spread evaluates before ordered binding writes', assert => {
  const events = [];
  function read(make, values) {
    // eslint-disable-next-line no-var -- observes the uninitialized value after ES5 lowering too
    var [before, { at }, ...rest] = [2, make(() => [before, rest]), ...values];
    return [before, at, rest];
  }
  const values = {
    * [Symbol.iterator]() {
      events.push('next');
      yield 4;
      events.push('done');
    },
  };
  assert.deepEqual(read(current => ({
    get at() {
      events.push(current());
      return 1;
    },
  }), values), [2, 1, [4]]);
  assert.deepEqual(events, ['next', 'done', [2, undefined]]);
});

QUnit.test('destructuring: a folded key runs after spread and before its pure binding', assert => {
  const events = [];
  const tail = {
    * [Symbol.iterator]() { events.push('spread'); yield 1; },
  };
  const [{ [(events.push('key'), 'at')]: at }] = [Array.prototype, ...tail];
  assert.same(at.call([2, 7], -1), 7);
  assert.deepEqual(events, ['spread', 'key']);
});

QUnit.test('destructuring: a static under an array key respects a written slot', assert => {
  function clean() {
    const wrapped = [{ k: [Object] }];
    const [{ k: [{ is }] }] = wrapped;
    return is(1, 1);
  }
  function written() {
    const wrapped = [{ k: [Object] }];
    wrapped[0].k[0] = { is: () => false };
    const [{ k: [{ is }] }] = wrapped;
    return is(1, 1);
  }
  assert.true(clean());
  assert.false(written());
});

QUnit.test('destructuring: an object key selects the array before its method receiver', assert => {
  const { w: [{ at }] } = { w: [[4, 8]] };
  const holder = { y: [2, 7] };
  const { w: [{ y: { at: nested } }] } = { w: [holder] };
  const source = { w: [[4, 8]] };
  source.w[0] = { at: () => 'user' };
  const { w: [{ at: written }] } = source;
  assert.same(at.call([4, 8], -1), 8);
  assert.same(nested.call(holder.y, -1), 7);
  assert.same(written(), 'user');
});

QUnit.test('destructuring: mixed nested statics and instances preserve their receiver choices', assert => {
  const events = [];
  const known = { w: Object, y: [4, 8] };
  const [{ w: { is }, y: { at } }] = [known, events.push('first')];
  const [{ y: { at: reverseAt }, w: { is: reverseIs } }] = [known, events.push('second')];
  assert.true(is(1, 1));
  assert.same(at.call(known.y, -1), 8);
  assert.same(reverseAt.call(known.y, -1), 8);
  assert.true(reverseIs(1, 1));
  assert.deepEqual(events, ['first', 'second']);
});

QUnit.test('destructuring: an outer computed key follows initialization and precedes iteration', assert => {
  const events = [];
  const { [(events.push('key'), 'items')]: [{ at }] } = { items: [(events.push('receiver'), [2, 7])] };
  assert.same(at.call([2, 7], -1), 7);
  assert.deepEqual(events, ['receiver', 'key']);
  let includes;
  // eslint-disable-next-line prefer-const -- checks assignment placement
  ({ [(events.push('assign-key'), 'items')]: [{ includes }] } = { items: [(events.push('assign-receiver'), 'abc')] });
  assert.same(includes.call('abc', 'b'), true);
  assert.deepEqual(events, ['receiver', 'key', 'assign-receiver', 'assign-key']);
});

QUnit.test('destructuring: a nested computed key runs once before its independent read', assert => {
  const events = [];
  const [{ [(events.push('key'), 'w')]: { at } }] = [
    {
      get w() { events.push('get'); return [2, 7]; },
    },
    events.push('rhs'),
  ];
  assert.same(at.call([2, 7], -1), 7);
  let includes;
  // eslint-disable-next-line prefer-const -- checks assignment placement
  [{ [(events.push('assign-key'), 'w')]: { includes } }] = [
    {
      get w() { events.push('assign-get'); return 'abc'; },
    },
    events.push('assign-rhs'),
  ];
  assert.same(includes.call('abc', 'b'), true);
  assert.deepEqual(events, ['rhs', 'key', 'get', 'assign-rhs', 'assign-key', 'assign-get']);
});

QUnit.test('destructuring: a shared nested receiver is read once before its properties', assert => {
  const events = [];
  const item = {
    get at() { events.push('at'); return () => 3; },
    get other() { events.push('other'); return 5; },
  };
  const receiver = {
    get w() { events.push('w'); return item; },
    y: 'abc',
  };
  const [{ w: { at, other }, y: { includes } }] = [receiver, events.push('rhs')];
  assert.same(at(), 3);
  assert.same(other, 5);
  assert.same(includes.call('abc', 'b'), true);
  assert.deepEqual(events, ['rhs', 'w', 'at', 'other']);
});

QUnit.test('destructuring: array nested reads stay between outer siblings', assert => {
  const events = [];
  function read(box) {
    const [{ lead, y: { at, extra }, top }] = [box, events.push('rhs')];
    return [lead, at, extra, top];
  }
  const source = {
    get lead() { events.push('lead'); return 1; },
    get y() {
      events.push('y');
      return {
        get at() { events.push('at'); return 2; },
        get extra() { events.push('extra'); return 3; },
      };
    },
    get top() { events.push('top'); return 4; },
  };
  assert.deepEqual(read(source), [1, 2, 3, 4]);
  assert.deepEqual(events, ['rhs', 'lead', 'y', 'at', 'extra', 'top']);
  const result = read({ lead: 1, y: [2, 7], top: 4 });
  assert.same(result[1].call([2, 7], -1), 7);
});

QUnit.test('destructuring: nested object routes run after the complete array initializer', assert => {
  const events = [];
  const receiver = {
    get y() {
      events.push('get');
      return [1, [2]];
    },
  };
  const [{ y: { flat } = [] }] = [receiver, events.push('rhs-default')];
  assert.deepEqual(flat.call([1, [2]]), [1, 2]);
  const [{ y: { at } = [] }] = [receiver, events.push('rhs-typed')];
  assert.same(at.call([1, 2], -1), 2);
  // eslint-disable-next-line no-useless-computed-key -- checks the folded-key route
  const [{ y: { ['flat']: folded } }] = [receiver, events.push('rhs-key')];
  assert.deepEqual(folded.call([1, [2]]), [1, 2]);
  const [{ a, y: { flat: sibling } }] = [{ a: events.push('init'), y: [1, [2]] }, events.push('rhs-sibling')];
  assert.same(typeof a, 'number');
  assert.deepEqual(sibling.call([1, [2]]), [1, 2]);
  const [{ flat: { at: functionAt } = [] }] = [[1, [2]], events.push('rhs-hop')];
  assert.same(functionAt, undefined);
  assert.deepEqual(events, ['rhs-default', 'get', 'rhs-typed', 'get', 'rhs-key', 'get', 'init', 'rhs-sibling', 'rhs-hop']);
});
testBeforeLowering('destructuring: array capture keeps the selected static mirror after its sibling', assert => {
  for (const pick of [true, false]) {
    const log = [];
    const source = {
      get at() {
        log.push('at');
        return () => 7;
      },
    };
    const other = {
      get from() {
        log.push('from');
        return () => [9];
      },
    };
    const [{ at }, { from }] = [source, (log.push('pick'), pick) ? Array : other];
    assert.same(at(), 7);
    assert.same(from([4])[0], pick ? 4 : 9);
    assert.deepEqual(log, pick ? ['pick', 'at'] : ['pick', 'at', 'from']);
  }
});

QUnit.test('destructuring: positional reads precede later binding writes', assert => {
  const log = [];
  function read(build) {
    let tail = 'old';
    let at;
    const rows = build(() => tail);
    [{ at }, tail] = rows;
    return [at, tail];
  }
  assert.deepEqual(read(get => [
    {
      get at() {
        log.push(get());
        return 7;
      },
    },
    9,
  ]), [7, 9]);
  assert.deepEqual(log, ['old']);
});

QUnit.test('destructuring: positional static binds before a native neighbouring getter', assert => {
  const log = [];
  let sign = null;
  let other = null;
  const source = {
    get other() {
      log.push(typeof sign, other);
      return 9;
    },
  };
  const rows = [Math, source];
  [{ sign }, { other }] = rows;
  assert.same(sign(-4), -1);
  assert.same(other, 9);
  assert.deepEqual(log, ['function', null]);
});

testBeforeLowering('destructuring: a mirror-only array assignment keeps RHS effects before native reads', assert => {
  for (const pick of [true, false]) {
    const log = [];
    const source = {
      get native() {
        log.push('native');
        return 7;
      },
    };
    const other = {
      get of() {
        log.push('of');
        return () => [9];
      },
    };
    let native;
    let of;
    // eslint-disable-next-line prefer-const -- the assignment host is the regression surface
    [{ native }, { of }] = [source, (log.push('pick'), pick) ? Array : other];
    assert.same(native, 7);
    assert.same(of(4)[0], pick ? 4 : 9);
    assert.deepEqual(log, pick ? ['pick', 'native'] : ['pick', 'native', 'of']);
  }
});

QUnit.test('destructuring: a static with rest stays after its for initializer', assert => {
  const events = [];
  function observe(read) {
    try { events.push(typeof read()); } catch (error) {
      events.push(error.name);
    }
  }
  // The ES5 test build erases lexical TDZ; a var binding observes the same ordering.
  /* eslint-disable no-var, no-redeclare, block-scoped-var -- the old hoisted binding observes initializer order */
  var of = 'before';
  // eslint-disable-next-line no-unreachable-loop -- observe the initializer once
  for (var [{ Array: { of }, ...rest }] = [(observe(() => of), globalThis)]; ;) {
    assert.deepEqual(of(3), [3]);
    assert.false(Object.hasOwn(rest, 'Array'));
    break;
  }
  /* eslint-enable no-var, no-redeclare, block-scoped-var -- end of the hoisted binding case */
  assert.deepEqual(events, ['string']);
});
