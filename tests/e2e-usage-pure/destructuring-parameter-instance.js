import Keys from '@core-js/pure/actual/object/keys';
import { restoreProperty, withTemporaryProperty } from '../helpers/restore-property.cjs';
import { parameterRealmMethodCases } from './mutation-cases/parameter-realm-method-cases.js';

QUnit.test('destructuring parameter: implicit conversions precede method lookup', assert => {
  const events = [];
  const nativeArray = Function('return Array')();
  const previous = Object.getOwnPropertyDescriptor(nativeArray.prototype, 'at');
  const value = {
    valueOf() { events.push('coerce'); return 2; },
    toString() { events.push('coerce'); return '2'; },
  };
  restoreProperty(nativeArray.prototype, 'at', {
    configurable: true,
    get() {
      events.push('method');
      return function (index) { return this[index]; };
    },
  });
  try {
    // eslint-disable-next-line default-param-last -- the earlier default runs before receiver binding
    const earlier = ((first = `${ value }`, { at }) => [at.call([7], 0), first])(undefined, [1]);
    assert.deepEqual(earlier, [7, '2']);
    assert.deepEqual(events, ['coerce', 'method']);
    events.length = 0;
    const later = (({ at }, other) => [at.call([8], 0), other])([1], +value);
    assert.deepEqual(later, [8, 2]);
    assert.deepEqual(events, ['coerce', 'method']);
    events.length = 0;
    // eslint-disable-next-line prefer-template -- exercise implicit conversion by binary addition
    const nested = (({ row: { at } }) => at.call([9], 0))({ row: [1], other: '' + value });
    assert.same(nested, 9);
    assert.deepEqual(events, ['coerce', 'method']);
    events.length = 0;
    // eslint-disable-next-line unicorn/no-unsafe-property-key -- exercise key conversion before the method read
    const keyed = (({ row: { at } }) => at.call([5], 0))({ row: [1], [value]: 0 });
    assert.same(keyed, 5);
    assert.deepEqual(events, ['coerce', 'method']);
    events.length = 0;
    const prefixed = (({ at }) => at.call([6], 0))(
      typeof Symbol !== 'undefined' ? (events.push('prefix'), []) : null,
    );
    assert.same(prefixed, 6);
    assert.deepEqual(events, ['prefix', 'method']);
    events.length = 0;
    const prefixedLater = (({ at }, other) => [at.call([4], 0), other])(
      typeof Symbol !== 'undefined' ? (events.push('prefix'), []) : null,
      +value,
    );
    assert.deepEqual(prefixedLater, [4, 2]);
    assert.deepEqual(events, ['prefix', 'coerce', 'method']);
  } finally {
    restoreProperty(nativeArray.prototype, 'at', previous);
  }
});

QUnit.test('destructuring parameter: an inner default precedes the next method read', assert => {
  const events = [];
  const nativeArray = Function('return Array')();
  const previous = Object.getOwnPropertyDescriptor(nativeArray.prototype, 'at');
  restoreProperty(nativeArray.prototype, 'at', {
    configurable: true,
    get() {
      events.push('method');
      return function (index) { return this[index]; };
    },
  });
  try {
    const result = (({ prototype: { 0: missing = (events.push('default'), 0), at } }) => {
      return [missing, at.call([7], 0)];
    })(Array);
    assert.deepEqual(result, [0, 7]);
    assert.deepEqual(events, ['default', 'method']);
  } finally {
    restoreProperty(nativeArray.prototype, 'at', previous);
  }
});

QUnit.test('destructuring parameter: a sole receiver call keeps its evaluation window', assert => {
  const events = [];
  function make() {
    events.push('source');
    const value = [3];
    restoreProperty(value, 'at', {
      configurable: true,
      get() {
        events.push('method');
        return function (index) { return this[index]; };
      },
    });
    return value;
  }
  const single = (({ at = null }) => {
    events.push('body');
    return at.call([7], 0);
  })(make());
  assert.same(single, 7);
  assert.deepEqual(events, ['source', 'method', 'body']);
  events.length = 0;
  const followed = (({ at }, other) => {
    events.push('body');
    return at.call([9], 0) + other;
  })(make(), (events.push('argument'), 1));
  assert.same(followed, 10);
  assert.deepEqual(events, ['source', 'argument', 'method', 'body']);
});

QUnit.test('destructuring parameter: a sole constructor caller supplies its prototype method', assert => {
  const result = (({ prototype: { at } }) => at.call('az', -1))(String);
  assert.same(result, 'z');
});

QUnit.test('destructuring parameter: each closed caller supplies its own array receiver', assert => {
  function read({ at, flat }) {
    return [at.call([3, 7], -1), flat.call([1, [2]])];
  }
  assert.deepEqual(read([1, [2]]), [7, [1, 2]]);
  assert.deepEqual(read(Array.prototype), [7, [1, 2]]);
  const supplied = {
    at() { return 'own'; },
    flat() { return 'custom'; },
  };
  assert.deepEqual(read(supplied), ['own', 'custom']);
});

QUnit.test('destructuring parameter: prototype defaults keep supplied getters and reentry', assert => {
  const events = [];
  let inner;
  function read({ prototype: { at = () => Array.of('fallback'), flat } } = Array) {
    return [at.call([4], 0), flat.call([1, [2]])];
  }
  const supplied = {
    get prototype() {
      events.push('prototype');
      return {
        get at() {
          events.push('at');
          inner = read();
          return undefined;
        },
        get flat() {
          events.push('flat');
          return () => 'own';
        },
      };
    },
  };
  assert.deepEqual(read(), [4, [1, 2]]);
  assert.deepEqual(read(supplied), [['fallback'], 'own']);
  assert.deepEqual(inner, [4, [1, 2]]);
  assert.deepEqual(events, ['prototype', 'at', 'flat']);
});

QUnit.test('destructuring parameter: realm prototype defaults preserve supplied values', assert => {
  // eslint-disable-next-line unicorn/consistent-function-style -- exercise an arrow parameter default
  const read = ({ Array: { prototype: { includes } } } = globalThis) => includes.call([3], 3);
  assert.same(read(), true);
  assert.same(read({ Array: { prototype: { includes() { return 'own'; } } } }), 'own');
});

QUnit.test('destructuring parameter: a nested default keeps its own activation during reentry', assert => {
  const events = [];
  let inner;
  function read({ result = (({ at, flat }) => [typeof at, typeof flat])([1, [2]]) } = {}) {
    return result;
  }
  const supplied = {
    get result() {
      events.push('result');
      inner = read();
      return 'own';
    },
  };
  assert.deepEqual(read(), ['function', 'function']);
  assert.same(read(supplied), 'own');
  assert.deepEqual(inner, ['function', 'function']);
  assert.deepEqual(events, ['result']);
});

QUnit.test('destructuring parameter: a native sibling reads after its preceding key effect', assert => {
  const prior = Object.getOwnPropertyDescriptor(Array.prototype, 'length');
  // eslint-disable-next-line no-extend-native -- mutate a native sibling to observe the exact read order
  function read({ at, [(Array.prototype.length = 1, 'flat')]: flat, length }) {
    return [typeof at, typeof flat, length];
  }
  try {
    assert.deepEqual(read(Array.prototype), ['function', 'function', 1]);
  } finally {
    restoreProperty(Array.prototype, 'length', prior);
  }
  assert.deepEqual(Object.getOwnPropertyDescriptor(Array.prototype, 'length'), prior, 'the native sibling descriptor is restored');
});

QUnit.test('destructuring parameter: deferred native getters retain each default activation', assert => {
  const prior = Object.getOwnPropertyDescriptor(Array.prototype, 'receiverMarker');
  let entered = false;
  let calls = 0;
  let inner;
  function methods({ at, flat, receiverMarker, 0: first }) {
    return [typeof at, typeof flat, receiverMarker, first];
  }
  function read(result = methods([1, [2]])) { return result; }
  // eslint-disable-next-line no-extend-native -- reenter the default from its native sibling getter
  Object.defineProperty(Array.prototype, 'receiverMarker', {
    configurable: true,
    get() {
      calls++;
      const label = entered ? 'inner' : 'outer';
      this[0] = label;
      if (!entered) {
        entered = true;
        inner = read();
      }
      return label;
    },
  });
  try {
    assert.deepEqual(read(), ['function', 'function', 'outer', 'outer']);
    assert.deepEqual(inner, ['function', 'function', 'inner', 'inner']);
    assert.same(calls, 2);
  } finally {
    restoreProperty(Array.prototype, 'receiverMarker', prior);
  }
});

QUnit.test('destructuring parameter: a selected caller receiver is mirrored once', assert => {
  const choose = JSON.parse('true');
  const events = [];
  const arrayResult = (([{ with: replace }]) => replace.call([1], 0, 7))([
    choose ? (events.push('left'), [1]) : (events.push('right'), [2]),
  ]);
  const mixedResult = (({ at: method }) => method.call('ab', -1))(choose ? 'ab' : [1, 2]);
  assert.deepEqual(arrayResult, [7]);
  assert.same(mixedResult, 'b');
  assert.deepEqual(events, ['left']);
});

QUnit.test('destructuring parameter: instance getters follow arguments and preceding defaults', assert => {
  const prior = Object.getOwnPropertyDescriptor(Array.prototype, 'at');
  const events = [];
  function custom() { return 'own'; }
  function read({ at }, value) { return [at, value]; }
  function withDefault({ missing = events.push('default'), at }) { return [at, missing]; }
  // eslint-disable-next-line default-param-last -- an earlier default must precede the destructured receiver
  function withParameterDefault(value = events.push('parameter-default'), { at }) { return [at, value]; }
  restoreProperty(Array.prototype, 'at', {
    configurable: true,
    get() {
      events.push('get');
      return custom;
    },
  });
  try {
    assert.deepEqual(read([1], events.push('argument')), [custom, 1]);
    assert.deepEqual(withDefault([2]), [custom, 3]);
    assert.deepEqual(withParameterDefault(undefined, [3]), [custom, 5]);
    assert.deepEqual(events, ['argument', 'get', 'default', 'get', 'parameter-default', 'get']);
  } finally {
    restoreProperty(Array.prototype, 'at', prior);
  }
});

QUnit.test('destructuring parameter: a retained array default keeps its prototype methods', assert => {
  const events = [];
  function read([[{ at, [(events.push('key'), 'flat')]: flat, length }]] = [[Array.prototype]]) {
    return [at.call([3], 0), flat.call([1, [2]]), length, events.join(',')];
  }
  assert.deepEqual(read(), [3, [1, 2], 0, 'key']);
});

QUnit.test('destructuring parameter: a retained string default keeps its prototype methods', assert => {
  const events = [];
  function read([[{ at, [(events.push('key'), 'includes')]: includes, length }]] = [[String.prototype]]) {
    return [at.call('az', -1), includes.call('az', 'z'), length, events.join(',')];
  }
  assert.deepEqual(read(), ['z', true, 0, 'key']);
});

QUnit.test('destructuring parameter: sibling caller patterns preserve method getter order', assert => {
  const priorAt = Object.getOwnPropertyDescriptor(Array.prototype, 'at');
  const priorFlat = Object.getOwnPropertyDescriptor(Array.prototype, 'flat');
  const events = [];
  function ownAt() { return 'at'; }
  function ownFlat() { return 'flat'; }
  restoreProperty(Array.prototype, 'at', {
    configurable: true,
    get() { events.push('at'); return ownAt; },
  });
  restoreProperty(Array.prototype, 'flat', {
    configurable: true,
    get() { events.push('flat'); return ownFlat; },
  });
  try {
    assert.deepEqual((([{ at }, { flat }]) => [at, flat])([[1], [[2]]]), [ownAt, ownFlat]);
    const second = [[2]];
    assert.deepEqual((([{ at }, { flat }]) => [at, flat])([[1], second]), [ownAt, ownFlat]);
    assert.deepEqual(events, ['at', 'flat', 'at', 'flat']);
  } finally {
    restoreProperty(Array.prototype, 'at', priorAt);
    restoreProperty(Array.prototype, 'flat', priorFlat);
  }
});

QUnit.test('destructuring parameter: direct callers defer their instance slot until all arguments finish', assert => {
  const prior = Object.getOwnPropertyDescriptor(String.prototype, 'at');
  const events = [];
  function own() { return 'at'; }
  restoreProperty(String.prototype, 'at', {
    configurable: true,
    get() { events.push('at'); return own; },
  });
  try {
    assert.deepEqual((({ at }, other) => [typeof at, other])('az', events.push('literal')), ['function', 1]);
    assert.deepEqual((({ at }, other) => [typeof at, other])(String.prototype, events.push('prototype')), ['function', 3]);
    assert.deepEqual(events, ['literal', 'at', 'prototype', 'at']);
  } finally {
    restoreProperty(String.prototype, 'at', prior);
  }
});

QUnit.test('destructuring parameter: a nullish caller keeps native default activation', assert => {
  // Babel's ES5 destructuring lowering advances computed keys across null rejection.
  // The exact key-order oracle stays in provider fixtures; default activation locks the same native-value guard here.
  function absent() { return undefined; }
  function nil() { return null; }
  assert.same((({ at } = String.prototype) => at.call('az', 1))(absent()), 'z');
  assert.throws(() => (({ at } = String.prototype) => at)(nil()), TypeError);
});

QUnit.test('destructuring parameter: an undefined caller keeps its own default receiver', assert => {
  const events = [];
  function absent() {
    events.push('argument');
    return undefined;
  }
  function nil() {
    events.push('null');
    return null;
  }
  assert.same((({ at } = Array.prototype) => at.call([4], 0))(absent()), 4);
  assert.same((({ at = 'own' } = Array.prototype) => at)({ at: undefined }), 'own');
  assert.throws(() => (({ at } = Array.prototype) => at)(nil()), TypeError);
  assert.deepEqual(events, ['argument', 'null']);
});

QUnit.test('destructuring parameter: an undefined caller evaluates its default and method once', assert => {
  const prior = Object.getOwnPropertyDescriptor(Array.prototype, 'at');
  let defaults = 0;
  let leaves = 0;
  function own(index) { return this[index]; }
  function source() { return undefined; }
  restoreProperty(Array.prototype, 'at', {
    configurable: true,
    get() { leaves++; return own; },
  });
  try {
    const result = (({ at } = (defaults++, Array.prototype)) => [at.call([4], 0), defaults, leaves])(source());
    assert.deepEqual(result, [4, 1, 1]);
  } finally {
    restoreProperty(Array.prototype, 'at', prior);
  }
});

QUnit.test('destructuring parameter: symbol and instance getters follow the same pattern order', assert => {
  const key = Symbol.iterator;
  const priorAt = Object.getOwnPropertyDescriptor(Array.prototype, 'at');
  const priorIterator = Object.getOwnPropertyDescriptor(Array.prototype, key);
  const events = [];
  function ownAt() { return 'at'; }
  function ownIterator() { return 'iterator'; }
  restoreProperty(Array.prototype, 'at', {
    configurable: true,
    get() { events.push('at'); return ownAt; },
  });
  restoreProperty(Array.prototype, key, {
    configurable: true,
    get() { events.push('iterator'); return ownIterator; },
  });
  let result;
  try {
    result = (function ({ at, [key]: iterator } = [1, 2]) { return [at, iterator]; })();
  } finally {
    restoreProperty(Array.prototype, 'at', priorAt);
    restoreProperty(Array.prototype, key, priorIterator);
  }
  assert.deepEqual(result, [ownAt, ownIterator]);
  assert.deepEqual(events, ['at', 'iterator']);
});

QUnit.test('destructuring parameter: falsy receivers retain their selector and method family', assert => {
  const zero = 0;
  const empty = '';
  const value = false;
  const fallback = [1];
  assert.same((({ at }) => at.call([4], 0))(zero || fallback), 4);
  /* eslint-disable no-constant-binary-expression -- literal falsiness must survive the receiver mirror */
  assert.same((({ at }) => at.call([4], 0))('' || fallback), 4);
  function read({ at }) { return at.call([4], 0); }
  assert.same(read('' || [1]), 4);
  assert.same((function ({ at } = '' || [1]) { return at.call([4], 0); })(), 4);
  /* eslint-enable no-constant-binary-expression -- end of literal receiver selections */
  assert.same((function ({ includes } = zero || empty) { return includes.call('az', 'z'); })(), true);
  assert.deepEqual((({ at, includes }) => [at.call('az', 1), includes.call('az', 'z')])(empty), ['z', true]);
  assert.deepEqual((function ({ at, includes } = empty) { return [at.call('az', 1), includes.call('az', 'z')]; })(), ['z', true]);
  assert.same((({ toFixed }) => toFixed.call(1.25, 1))(zero), '1.3');
  assert.same((({ toString }) => toString.call(false))(value), 'false');
});

QUnit.test('destructuring parameter: an awaited argument evaluates outside its receiver capture', assert => {
  const events = [];
  function make(value) {
    events.push(value);
    return 'ab';
  }
  // eslint-disable-next-line es/no-async-functions -- exercise suspension in the caller's source argument
  async function run() {
    return (({ at }, other) => [at.call('ab', -1), other])(
      make(await Promise.resolve('resume')), events.push('argument'),
    );
  }
  return run().then(result => {
    assert.deepEqual(result, ['b', 2]);
    assert.deepEqual(events, ['resume', 'argument']);
  });
});

QUnit.test('destructuring parameter: a yielded argument suspends outside its receiver capture', assert => {
  const events = [];
  function make(value) {
    events.push(value);
    return 'ab';
  }
  function * run() {
    return (({ at }, other) => [at.call('ab', -1), other])(
      make(yield 'pause'), events.push('argument'),
    );
  }
  const iterator = run();
  assert.deepEqual(iterator.next(), { value: 'pause', done: false });
  assert.deepEqual(events, []);
  assert.deepEqual(iterator.next('resume'), { value: ['b', 2], done: true });
  assert.deepEqual(events, ['resume', 'argument']);
});

QUnit.test('destructuring: a falsy OR receiver keeps both live method families', assert => {
  /* eslint-disable no-constant-binary-expression -- the literal receiver selects the other family */
  const { at: declared } = '' || [1];
  let assigned = null;
  assert.same(assigned, null);
  ({ at: assigned } = '' || [1]);
  const { row: { at: nested } } = { row: '' || [1] };
  const [{ at: wrapped }] = ['' || [1]];
  /* eslint-enable no-constant-binary-expression -- end of literal receiver selections */
  assert.same(declared.call([4], 0), 4);
  assert.same(assigned.call([4], 0), 4);
  assert.same(nested.call([4], 0), 4);
  assert.same(wrapped.call([4], 0), 4);
});

QUnit.test('destructuring parameter: AND keeps its falsy selected receiver', assert => {
  /* eslint-disable no-constant-binary-expression -- a falsy non-nullish value is the selected receiver */
  function read({ includes, length }) { return [includes.call('', 'x'), length]; }
  function defaulted({ includes, length } = '' && [1]) { return [includes.call('', 'x'), length]; }
  assert.deepEqual(read('' && [1]), [false, 0]);
  assert.deepEqual(defaulted(), [false, 0]);
  assert.deepEqual(read(('' && [1]) ?? [2]), [false, 0]);
  assert.deepEqual(read(('' ?? [1]) && [2]), [false, 0]);
  assert.deepEqual(read(('' && [1]) || [2]), [false, 1]);
  /* eslint-enable no-constant-binary-expression -- end of literal receiver selections */
});

QUnit.test('destructuring parameter: an AND receiver keeps argument and key effects in order', assert => {
  const events = [];
  function read({ [(events.push('key'), 'includes')]: includes, length }, other) {
    return [includes.call('', 'x'), length, other];
  }
  // eslint-disable-next-line no-constant-binary-expression -- retain the falsy receiver and both branch effects
  assert.deepEqual(read((events.push('left'), '') && (events.push('right'), [1]), events.push('argument')), [false, 0, 2]);
  assert.deepEqual(events, ['left', 'argument', 'key']);
});

QUnit.test('destructuring parameter: closed numeric callers keep their instance helper', assert => {
  const prior = Object.getOwnPropertyDescriptor(Number.prototype, 'toFixed');
  restoreProperty(Number.prototype, 'toFixed', { configurable: true, writable: true, value: undefined });
  function read({ toFixed }) { return toFixed.call(1.25, 1); }
  function nested({ value: { toFixed } }) { return toFixed.call(1.25, 1); }
  function wrapped([{ toFixed }]) { return toFixed.call(1.25, 1); }
  const one = 1;
  try {
    assert.same(read(1), '1.3');
    assert.same(read(0), '1.3');
    assert.same(read(-0), '1.3');
    assert.same(read(-1), '1.3');
    assert.same(read(Number.NaN), '1.3');
    assert.same(read(NaN), '1.3');
    assert.same(read(Infinity), '1.3');
    assert.same(read(one), '1.3');
    assert.same(nested({ value: 1 }), '1.3');
    assert.same(wrapped([1]), '1.3');
  } finally {
    restoreProperty(Number.prototype, 'toFixed', prior);
  }
});

QUnit.test('destructuring parameter: primitive global spellings retain supplied own properties', assert => {
  /* eslint-disable no-shadow-restricted-names -- test the scoped proof for intrinsic global spellings */
  const NaN = { toFixed() { return 'nan'; } };
  const Infinity = { toFixed() { return 'infinity'; } };
  /* eslint-enable no-shadow-restricted-names -- end of shadowed global declarations */
  function read({ toFixed }) { return toFixed(); }
  assert.same(read(NaN), 'nan');
  assert.same(read(Infinity), 'infinity');
});

QUnit.test('destructuring parameter: closed instance source forms share the default admission', assert => {
  function number({ toFixed }) { return toFixed.call(1.25, 1); }
  function string({ includes }) { return includes.call('az', 'z'); }
  function array({ at }) { return at.call([4], 0); }
  function regexp({ flags }) { return flags; }
  // Exercise boxed receivers supplied by closed callers.
  assert.same(number(new Number(1)), '1.3');
  assert.same(string(new String('az')), true);
  assert.same(array(new Array(1)), 4);
  // eslint-disable-next-line @stylistic/quotes -- exercise a no-substitution template receiver
  assert.same(string(`az`), true);
  assert.same(regexp(/a/g), 'g');
});

QUnit.test('destructuring parameter: a template receiver runs before later arguments', assert => {
  const events = [];
  function interpolation() {
    events.push('template');
    return 'b';
  }
  function read({ includes }, other) {
    events.push('body');
    return [includes.call('abc', 'b'), other];
  }
  assert.deepEqual(read(`a${ interpolation() }c`, events.push('argument')), [true, 2]);
  assert.deepEqual(events, ['template', 'argument', 'body']);
});

QUnit.test('destructuring parameter: stored receivers retain their reaching method families', assert => {
  function read({ at }) { return at.call([4], 0); }
  const constant = [1];
  let receiver = [1];
  let assigned = null;
  assert.same(assigned, null);
  assigned = [1];
  const [destructured] = [[1]];
  assert.same(read(constant), 4);
  assert.same(read(receiver), 4);
  assert.same(read(assigned), 4);
  assert.same(read(destructured), 4);
  receiver = 'ab';
  assert.same(read(receiver), '4');
});

QUnit.test('destructuring parameter: a stored receiver keeps its argument capture and lazy read', assert => {
  const events = [];
  let receiver = [1];
  Object.defineProperty(receiver, 'at', {
    configurable: true,
    get() {
      events.push('get');
      return function () { return 'original'; };
    },
  });
  function read({ at }, other) {
    events.push('body');
    return [at(), other];
  }
  assert.deepEqual(read(receiver, (events.push('argument'), receiver = 'ab')), ['original', 'ab']);
  assert.same(receiver, 'ab');
  assert.deepEqual(events, ['argument', 'get', 'body']);
});

QUnit.test('destructuring parameter: an assigned receiver keeps its write and method family', assert => {
  let receiver = null;
  let other = null;
  assert.deepEqual([receiver, other], [null, null]);
  function read({ at }) { return at.call([4], 0); }
  function nested({ row: { at } }) { return at.call([4], 0); }
  function wrapped([{ at }]) { return at.call([4], 0); }
  assert.same(read(receiver = [1]), 4);
  assert.deepEqual(receiver, [1]);
  assert.same(nested({ row: receiver = [2] }), 4);
  assert.deepEqual(receiver, [2]);
  assert.same(wrapped([receiver = [3]]), 4);
  assert.deepEqual(receiver, [3]);
  assert.same(read(receiver = other = 'ab'), '4');
  assert.deepEqual([receiver, other], ['ab', 'ab']);
  // eslint-disable-next-line no-constant-binary-expression -- the assigned value must retain the AND selector
  assert.same(read(receiver = '' && [1]), '4');
  assert.same(receiver, '');
});

QUnit.test('destructuring parameter: an argument assignment preserves target and later effects', assert => {
  const events = [];
  let receiver;
  const holder = {
    set value(value) {
      events.push('store');
      receiver = value;
    },
  };
  function read({ at }, other) {
    events.push('body');
    return [at.call([4], 0), other];
  }
  function rebind() {
    assert.deepEqual(receiver, [1]);
    events.push('argument');
    receiver = 'ab';
    return receiver;
  }
  // eslint-disable-next-line no-sequences -- the target key must run before the assigned value
  assert.deepEqual(read(holder[events.push('key'), 'value'] = [(events.push('source'), 1)], events.push('argument')), [4, 4]);
  assert.deepEqual(receiver, [1]);
  assert.deepEqual(events, ['key', 'source', 'store', 'argument', 'body']);
  events.length = 0;
  assert.deepEqual(read(receiver = [1], rebind()), [4, 'ab']);
  assert.same(receiver, 'ab');
  assert.deepEqual(events, ['argument', 'body']);
});

QUnit.test('destructuring parameter: a default store keeps the receiver and supplied values', assert => {
  let stored;
  function read({ toSorted } = stored = [3, 1]) { return toSorted; }
  assert.isFunction(read, 'the default must also serve invisible callers');
  const method = read();
  assert.arrayEqual(method.call(stored), [1, 3]);
  assert.true(Array.isArray(stored), 'the store receives the original array');
  const original = stored;
  function custom() { return 'custom'; }
  assert.same(read({ toSorted: custom }), custom);
  assert.same(read({ toSorted: undefined }), undefined);
  assert.same(read({ toSorted: null }), null);
  assert.same(stored, original, 'supplied objects bypass the store');
});

QUnit.test('destructuring parameter: a member default store keeps its target claims and order', assert => {
  const events = [];
  const keys = ['slot'];
  const holder = {};
  // eslint-disable-next-line default-param-last, no-sequences -- exercise the default and target evaluation order
  function read(first = (events.push('parameter'), 0), { toSorted } = holder[events.push('key'), keys.at(0)] = (events.push('source'), [3, 1]), last) {
    return [toSorted, first, last];
  }
  assert.isFunction(read, 'the default must also serve invisible callers');
  const result = read(undefined, undefined, events.push('argument'));
  assert.arrayEqual(result[0].call(holder.slot), [1, 3]);
  assert.arrayEqual(result.slice(1), [0, 1]);
  assert.true(Array.isArray(holder.slot));
  assert.arrayEqual(events, ['argument', 'parameter', 'key', 'source']);
});

QUnit.test('destructuring parameter: open defaults read methods after exposed bindings', assert => {
  let probe;
  const receiver = [];
  Object.defineProperties(receiver, {
    at: {
      configurable: true,
      get() { return function atMarker() { return 'at'; }; },
    },
    flat: {
      configurable: true,
      get() { return probe(); },
    },
  });
  function prefixed({ at, flat } = (probe = () => at, receiver)) { return flat.name; }
  function earlier(first = probe = () => at, { at, flat } = receiver) { return [first, flat.name][1]; }
  assert.isFunction(prefixed, 'the function remains available to unknown callers');
  assert.isFunction(earlier, 'the function remains available to unknown callers');
  assert.deepEqual([prefixed(), earlier()], ['atMarker', 'atMarker']);
});

QUnit.test('destructuring parameter: a stored factory receiver keeps its argument window', assert => {
  const events = [];
  const nativeArray = Function('return Array')();
  const previous = Object.getOwnPropertyDescriptor(nativeArray.prototype, 'at');
  let calls = 0;
  let nullish = false;
  let stored;
  function factory() {
    calls++;
    events.push('factory');
    return nullish ? null : [];
  }
  function later(value) {
    events.push('later');
    stored = value;
    return value;
  }
  restoreProperty(nativeArray.prototype, 'at', {
    configurable: true,
    get() {
      events.push('get');
      return function ownAt() { return 'own'; };
    },
  });
  try {
    const value = (({ at }, after) => {
      events.push('body');
      return [at.name, after];
    })(stored = factory(), later('changed'));
    assert.deepEqual(value, ['ownAt', 'changed']);
    assert.same(stored, 'changed');
    nullish = true;
    assert.throws(() => (({ at }, after) => [at, after])(
      stored = factory(), later('after-null'),
    ), TypeError);
    assert.same(stored, 'after-null');
    assert.same(calls, 2);
    assert.deepEqual(events, ['factory', 'later', 'get', 'body', 'factory', 'later']);
  } finally {
    restoreProperty(nativeArray.prototype, 'at', previous);
  }
});

QUnit.test('destructuring parameter: escaped flat receivers serve the actual incoming value', assert => {
  function readAt({ at }) { return at; }
  function readIncludes({ includes } = [1, 2]) { return includes; }
  // eslint-disable-next-line unicorn/consistent-function-style -- exercise an escaped arrow parameter
  const callback = ({ concat }) => concat;
  assert.isFunction(readAt, 'unknown callers still receive the method dispatcher');
  assert.isFunction(readIncludes, 'supplied values can override the receiver default');
  assert.isFunction(callback, 'an escaped arrow captures its actual receiver');
  assert.same(readAt.length, 1);
  assert.same(readIncludes.length, 0);
  assert.same(readAt([1, 2]).call([3, 4], -1), 4);
  assert.same(readAt('ab').call('cd', -1), 'd');
  assert.true(readIncludes().call([1, 2], 2));
  assert.true(readIncludes(undefined).call([1, 2], 2));
  assert.true(readIncludes('ab').call('ab', 'b'));
  assert.arrayEqual(callback([1]).call([2], [3]), [2, 3]);
  function own() { return 7; }
  assert.same(readAt({ at: own }), own);
  assert.same(readAt({ at: undefined }), undefined);
  assert.same(readAt({ at: null }), null);
  assert.same(readAt({ at: 9 }), 9);
  assert.same(readAt({}), undefined);
  assert.same(readIncludes({ includes: own }), own);
  assert.same(readIncludes({ includes: undefined }), undefined);
  assert.throws(() => readAt(null), TypeError);
  assert.throws(() => readIncludes(null), TypeError);
});

QUnit.test('destructuring parameter: a flat entry capture preserves getter order and mutable bindings', assert => {
  const events = [];
  function read({ before, at, after }, value) {
    events.push('body');
    at = 'changed';
    return [before, at, after, value];
  }
  assert.isFunction(read, 'the receiver is not restricted to visible callers');
  const receiver = {
    get before() { events.push('before'); return 1; },
    get at() { events.push('at'); return 2; },
    get after() { events.push('after'); return 3; },
  };
  assert.arrayEqual(read(receiver, events.push('argument')), [1, 'changed', 3, 1]);
  assert.arrayEqual(events, ['argument', 'before', 'at', 'after', 'body']);
  assert.same(read.length, 2);
});

QUnit.test('destructuring parameter: a served prototype default keeps supplied leaf defaults', assert => {
  const events = [];
  function own(index) { return this[index]; }
  function read({ prototype: { at = (events.push('default'), own), flat } } = Array) { return [at, flat]; }
  const missing = read();
  const absent = read(undefined);
  assert.same(missing[0].call([7], 0), 7);
  assert.deepEqual(absent[1].call([[2]], 1), [2]);
  assert.deepEqual(events, []);
  const supplied = read({ prototype: {
    get at() { events.push('at'); return undefined; },
    get flat() { events.push('flat'); return null; },
  } });
  assert.same(supplied[0], own);
  assert.same(supplied[1], null);
  assert.deepEqual(events, ['at', 'default', 'flat']);
  assert.deepEqual(read({ prototype: { at: null, flat: undefined } }), [null, undefined]);
  assert.same(read({ prototype: { at: own, flat: 0 } })[0], own);
  assert.throws(() => read(null), TypeError);
  assert.throws(() => read({ prototype: null }), TypeError);
});

QUnit.test('destructuring parameter: a native prototype default precedes a symbol read', assert => {
  const key = Symbol.iterator;
  const previous = Object.getOwnPropertyDescriptor(Array.prototype, key);
  const events = [];
  function ownIterator() { return 'iterator'; }
  restoreProperty(Array.prototype, key, {
    configurable: true,
    get() { events.push('symbol'); return ownIterator; },
  });
  let result;
  try {
    function read({ prototype: { missing = (events.push('default'), 0), at, [Symbol.iterator]: iterator } } = Array) {
      return [missing, at.call([7], 0), iterator === ownIterator];
    }
    result = read();
  } finally {
    restoreProperty(Array.prototype, key, previous);
  }
  assert.deepEqual(result, [0, 7, true]);
  assert.deepEqual(events, ['default', 'symbol']);
});

QUnit.test('destructuring parameter: native array slots remain beside the method read', assert => {
  const nativeArray = Function('return Array')();
  const original = nativeArray.prototype;
  const previous = Object.getOwnPropertyDescriptor(original, 'at');
  const other = {};
  function own() { return 'own'; }
  restoreProperty(original, 'at', {
    configurable: true,
    get() {
      this.length = 1;
      Object.setPrototypeOf(this, other);
      return own;
    },
  });
  try {
    function prefix({ __proto__: prototype, at } = [1, 2]) { return [prototype === original, at === own]; }
    function around({ length, at, __proto__: prototype } = [1, 2]) { return [length, prototype === other, at === own]; }
    function reverse({ __proto__: prototype, at, length } = [1, 2]) { return [prototype === original, length, at === own]; }
    assert.deepEqual(prefix(), [true, true]);
    assert.deepEqual(around(), [2, true, true]);
    assert.deepEqual(reverse(), [true, 1, true]);
  } finally {
    restoreProperty(original, 'at', previous);
  }
});

QUnit.test('destructuring parameter: a selected static and instance each receive their entry', assert => {
  for (const flag of [true, false]) {
    const user = [4];
    const fromDefault = (({ entries } = flag ? Object : user) => entries)();
    const fromIife = (({ entries }) => entries)(flag ? Object : user);
    function read({ entries }) { return entries; }
    const fromCaller = read(flag ? Object : user);
    const expected = flag ? ['x', 2] : [0, 4];
    assert.deepEqual(flag ? fromDefault({ x: 2 })[0] : fromDefault.call(user).next().value, expected);
    assert.deepEqual(flag ? fromIife({ x: 2 })[0] : fromIife.call(user).next().value, expected);
    assert.deepEqual(flag ? fromCaller({ x: 2 })[0] : fromCaller.call(user).next().value, expected);
  }
});

QUnit.test('destructuring parameter: deleting an own realm method keeps instance dispatch', assert => {
  assert.deepEqual(parameterRealmMethodCases(), [7, 7, 'b', true, true, true, true, 1]);
});

QUnit.test('destructuring parameter: a prior-owned sibling keeps the unknown instance live', assert => {
  function read({ keys, at } = { keys: Keys }) { return [keys, at]; }
  assert.isFunction(read, 'the receiver can arrive from unknown callers');
  assert.same(read.length, 0);
  assert.same(read()[0], Keys);
  assert.same(read()[1], undefined);
  const array = [7];
  function checkArray() {
    const nativeKeys = Function('return Array.prototype.keys')();
    const fromArray = read(array);
    // Lowering exposes a plain member read that the post pass can polyfill.
    if (typeof E2E_POST_LOWERED === 'undefined') {
      assert.same(fromArray[0], nativeKeys, 'the prior-owned slot retains its native read');
    } else {
      const iterator = fromArray[0].call(array);
      assert.deepEqual(iterator.next(), { value: 0, done: false }, 'the lowered read serves array keys');
      assert.deepEqual(iterator.next(), { value: undefined, done: true });
    }
    assert.same(fromArray[1].call(array, 0), 7, 'the unowned method still gets its dispatcher');
  }
  checkArray();
  withTemporaryProperty(Array.prototype, 'keys', undefined, checkArray);
  assert.same(read('ab')[1].call('ab', -1), 'b');
  const events = [];
  function own() { return 9; }
  const supplied = read({
    get keys() { events.push('keys'); return own; },
    get at() { events.push('at'); return own; },
  });
  assert.deepEqual(supplied, [own, own]);
  assert.deepEqual(events, ['keys', 'at']);
  assert.deepEqual(read({ keys: undefined, at: undefined }), [undefined, undefined]);
  assert.throws(() => read(null), TypeError);
});

QUnit.test('destructuring parameter: captured nested siblings keep their source read order', assert => {
  const events = [];
  function read({ first: { at }, last: { includes } }, other) { return [at.call([7], 0), includes.call([7], 7), other]; }
  const source = {
    get first() {
      events.push('first');
      return {
        get at() {
          events.push('at');
          return function () { return this[0]; };
        },
      };
    },
    get last() {
      events.push('last');
      return {
        get includes() {
          events.push('includes');
          return function (value) { return this[0] === value; };
        },
      };
    },
  };
  assert.deepEqual(read(source, (events.push('argument'), 3)), [7, true, 3]);
  assert.deepEqual(events, ['argument', 'first', 'at', 'last', 'includes']);
});

QUnit.test('destructuring parameter: a nested default retains its parameter scope', assert => {
  // eslint-disable-next-line no-undef, sonarjs/no-reference-error -- a parameter default cannot see the body binding
  function read({ value: { at } = parameterScopeReceiver }) {
    // eslint-disable-next-line no-var -- moving the default into the body would expose this hoisted binding
    var parameterScopeReceiver = 'ab';
    return [at, parameterScopeReceiver];
  }
  assert.throws(() => read({}), ReferenceError);
});

QUnit.test('destructuring parameter: an open nested default dispatches supplied receiver families', assert => {
  function read({ Array: { prototype: { includes } } } = globalThis) { return includes; }
  assert.isFunction(read, 'callers can supply either receiver family');
  assert.true(read({ Array: { prototype: 'ab' } }).call('ab', 'ab'));
  assert.false(read({ Array: { prototype: [1] } }).call('ab', 'ab'));
  assert.true(read().call([7], 7));
});

QUnit.test('destructuring parameter: a nested claim and its claimed sibling share one receiver', assert => {
  const events = [];
  function read({ row: { inner: { at }, includes } }) { return [at.call('ab', -1), includes.call([7], 7)]; }
  assert.isFunction(read, 'the nested receivers also serve unknown callers');
  const row = {
    get inner() { events.push('inner'); return 'cd'; },
    get includes() {
      events.push('includes');
      return function (value) { return this[0] === value; };
    },
  };
  assert.deepEqual(read({
    get row() {
      events.push('row');
      return row;
    },
  }), ['b', true]);
  assert.deepEqual(events, ['row', 'inner', 'includes']);
});

QUnit.test('destructuring parameter: a nested instance keeps its native static sibling', assert => {
  const events = [];
  function read({ Array: { prototype: { flat }, isArray } } = globalThis) { return [flat, isArray]; }
  assert.isFunction(read, 'the captured default also serves unknown callers');
  function own() { return true; }
  const holder = {
    get prototype() { events.push('prototype'); return []; },
    get isArray() { events.push('isArray'); return own; },
  };
  const result = read({
    get Array() { events.push('Array'); return holder; },
  });
  assert.deepEqual(result[0].call([[7]]), [7]);
  assert.same(result[1], own);
  assert.deepEqual(events, ['Array', 'prototype', 'isArray']);
  assert.deepEqual(read()[0].call([[9]]), [9]);
});
