import { readArrayIteratorBeforeStatic, readNestedRealmIterator, readRealmIteratorWithStatic } from './destructuring.js';

// Symbol well-known - only features that work in pure mode on engines without native symbols
// NOTE: typeof checks use notSame(_, undefined) instead of typeof === 'symbol'
// because pure-mode Symbol on engines without native symbols returns strings, not real symbols

QUnit.test('Symbol.iterator exists', assert => {
  assert.notSame(Symbol.iterator, undefined);
  assert.same(typeof [][Symbol.iterator], 'function');
});

QUnit.test('Symbol.for / Symbol.keyFor', assert => {
  const s = Symbol.for('test');
  assert.same(Symbol.for('test'), s);
  assert.same(Symbol.keyFor(s), 'test');
});

QUnit.test('Symbol.toPrimitive exists', assert => {
  assert.notSame(Symbol.toPrimitive, undefined);
});

QUnit.test('Symbol.hasInstance exists', assert => {
  assert.notSame(Symbol.hasInstance, undefined);
});

QUnit.test('Symbol.toStringTag exists', assert => {
  assert.notSame(Symbol.toStringTag, undefined);
});

QUnit.test('Symbol.asyncIterator exists', assert => {
  assert.notSame(Symbol.asyncIterator, undefined);
});

QUnit.test('Symbol.metadata exists', assert => {
  assert.notSame(Symbol.metadata, undefined);
});

// Symbol.iterator `in` operator - transforms to isIterable() in usage-pure
QUnit.test('Symbol.iterator in array', assert => {
  assert.true(Symbol.iterator in [1, 2, 3]);
});

QUnit.test('Symbol.iterator in string', assert => {
  assert.true(Symbol.iterator in Object('abc'));
});

QUnit.test('Symbol.iterator in Set', assert => {
  assert.true(Symbol.iterator in new Set());
});

QUnit.test('Symbol.iterator in Map', assert => {
  assert.true(Symbol.iterator in new Map());
});

QUnit.test('Symbol.iterator in plain object', assert => {
  assert.false(Symbol.iterator in {});
});

// Symbol.iterator access (non-call) vs call - different transformations
QUnit.test('Symbol.iterator access: get method without calling', assert => {
  const arr = [1, 2, 3];
  const iterFn = arr[Symbol.iterator];
  assert.same(typeof iterFn, 'function');
  const iter = iterFn.call(arr);
  assert.deepEqual(iter.next(), { value: 1, done: false });
});

QUnit.test('Symbol.iterator call: invoke directly', assert => {
  const arr = [1, 2, 3];
  const iter = arr[Symbol.iterator]();
  const result = [];
  let step;
  while (!(step = iter.next()).done) result.push(step.value);
  assert.deepEqual(result, [1, 2, 3]);
});

QUnit.test('Symbol.iterator call on string', assert => {
  const iter = 'abc'[Symbol.iterator]();
  assert.deepEqual(iter.next(), { value: 'a', done: false });
});

QUnit.test('Symbol.iterator call on Map', assert => {
  const map = new Map([['x', 1]]);
  const iter = map[Symbol.iterator]();
  assert.deepEqual(iter.next().value, ['x', 1]);
});

// well-known Symbols beyond `iterator` - runtime DISPATCH protocols.
//
// `Symbol.hasInstance` / `Symbol.toStringTag` / `Symbol.toPrimitive` are
// intentionally NOT covered here: their mechanics rely on the runtime's NATIVE
// abstract operations (`instanceof` operator, `Object.prototype.toString`,
// `ToPrimitive`) reading the NATIVE well-known Symbol off the target. The pure
// polyfill exposes the Symbol VALUE but doesn't modify either operation; on
// engines without native Symbol support (the audience that needs the polyfill)
// the user-defined override never activates regardless of what key was used.
// Testing them in pure mode would just exercise the host runtime, not the
// polyfill - leaving polyfill-specific surfaces for the remaining tests
QUnit.test('Symbol.asyncIterator: AsyncIterator.prototype exposes the key', assert => {
  const async = assert.async();
  // `AsyncIterator.from([...])` returns an AsyncIterator whose prototype defines
  // `[Symbol.asyncIterator]` (returns the iterator itself). exercising the
  // polyfilled Symbol via the AsyncIterator entry point keeps the source
  // compatible with the e2e lint policy (no `async function*` syntax)
  const asyncIt = AsyncIterator.from(['first', 'second']);
  const reAccessed = asyncIt[Symbol.asyncIterator]();
  reAccessed.next().then(step => {
    assert.same(step.value, 'first');
    assert.false(step.done);
    async();
  });
});

// a computed destructure key EVALUATES at the capture: flipping the key variable to 'Symbol'
// AFTER the capture must not fold the alias chain - the captured binding holds the Array
// constructor, so the consumer's default fires. live oracle: a wrong-value fold binds the
// well-known symbol (never undefined) and the sentinel default never applies
QUnit.test('Symbol.iterator: post-capture key flip to Symbol does not fold the alias chain', assert => {
  const sentinel = { marker: true };
  let key = 'Array';
  const { [key]: Captured } = globalThis;
  // eslint-disable-next-line no-useless-assignment -- the post-capture dead flip IS the case under test
  key = 'Symbol';
  const { iterator: viaPostFlip = sentinel } = Captured;
  assert.same(Captured, Array);
  assert.same(viaPostFlip, sentinel);
});

// the inverse flip captures the Symbol constructor; the later same-scope write cannot reach
// the captured binding, so the chain folds and the iterator method stays live on the target
QUnit.test('Symbol.iterator: post-capture key flip away from Symbol keeps the captured chain', assert => {
  const sentinel = { marker: true };
  let key = 'Symbol';
  const { [key]: Captured } = globalThis;
  // eslint-disable-next-line no-useless-assignment -- the post-capture dead flip IS the case under test
  key = 'Array';
  const { iterator: viaPreFlip = sentinel } = Captured;
  assert.notSame(viaPreFlip, sentinel);
  assert.notSame(viaPreFlip, undefined);
  const iteratorMethod = [10, 11][viaPreFlip];
  assert.same(typeof iteratorMethod, 'function');
  assert.same(iteratorMethod.call([10, 11]).next().value, 10);
});

// a conditionally-initialized hoisted var key binds everywhere but assigns on one path: on
// the untaken path the capture reads globalThis[undefined] and the consumer destructure must
// throw natively - a fold would bind the well-known symbol and silently rescue it
QUnit.test('Symbol.iterator: conditional var key capture keeps the native throw', assert => {
  const sentinel = { marker: true };
  const cond = false;
  // eslint-disable-next-line no-var -- the hoisted conditional var IS the case under test
  if (cond) var condKey = 'Symbol';
  const { [condKey]: CondCaptured } = globalThis;
  assert.same(CondCaptured, undefined);
  assert.throws(() => {
    const { iterator: viaCondVar = sentinel } = CondCaptured;
    return viaCondVar;
  }, TypeError);
});

// a multi-hop alias captures its source BEFORE the aliasing write: the hop holds undefined
// and a member read off it must throw natively - a narrow would un-throw it
QUnit.test('Symbol.iterator: alias hop captured before the aliasing write keeps the native throw', assert => {
  // eslint-disable-next-line prefer-const -- the separate aliasing WRITE below is the case under test
  let HopSource;
  const HopAlias = HopSource;
  ({ Symbol: HopSource } = globalThis);
  assert.notSame(HopSource, undefined);
  assert.same(HopAlias, undefined);
  assert.throws(() => HopAlias.iterator, TypeError);
});

// the assignment-form constructor alias itself folds its consumer chain - the registered
// write dominates the consumer read, so the iterator method stays live on the target
QUnit.test('Symbol.iterator: assignment-form Symbol alias folds the consumer chain', assert => {
  const sentinel = { marker: true };
  let AssignedCtor;
  // eslint-disable-next-line prefer-const -- the assignment-form aliasing write is the case under test
  ({ Symbol: AssignedCtor } = globalThis);
  const { iterator: viaAssigned = sentinel } = AssignedCtor;
  assert.notSame(viaAssigned, sentinel);
  assert.notSame(viaAssigned, undefined);
  const iteratorMethod = [20, 21][viaAssigned];
  assert.same(typeof iteratorMethod, 'function');
  assert.same(iteratorMethod.call([20, 21]).next().value, 20);
});

// a for-init destructure host folds its in-body consumer like the block-hosted twin - the
// iterator method must stay live on the target inside the loop body
QUnit.test('Symbol.iterator: for-init destructure alias folds inside the loop body', assert => {
  const collected = [];
  for (const { iterator: viaForInit = 0 } = Symbol; collected.length < 1;) {
    collected.push([30, 31][viaForInit]);
  }
  assert.same(typeof collected[0], 'function');
  assert.same(collected[0].call([30, 31]).next().value, 30);
});

// a key binding only an assignment gives a value holds the well-known symbol at the read - written
// plainly or under a presence test the build always answers. the read must find the iterator method
// on an engine without a native Symbol too, where a raw read of the pure key misses it
QUnit.test('Symbol.iterator: assignment-written key alias reads the iterator method', assert => {
  let assignedKey;
  // eslint-disable-next-line prefer-const -- the separate key WRITE is the case under test
  assignedKey = Symbol.iterator;
  function readAssigned(receiver) {
    return receiver[assignedKey];
  }
  let guardedKey;
  if (typeof Symbol != 'undefined') guardedKey = Symbol.iterator;
  function readGuarded(receiver) {
    return receiver[guardedKey];
  }
  assert.same(readAssigned([40, 41]).call([40, 41]).next().value, 40);
  assert.same(readGuarded([42, 43]).call([42, 43]).next().value, 42);
});

// the fallback a decided presence test selects against never runs - the else arm of an `if`, the
// other arm of a ternary, a pattern write over the init - so the key stays the well-known symbol,
// aliased or spelled in the member
QUnit.test('Symbol.iterator: decided presence test with a fallback reads the iterator method', assert => {
  let elseKey;
  if (typeof Symbol != 'undefined') elseKey = Symbol.iterator;
  else elseKey = '@@iterator';
  function readElse(receiver) {
    return receiver[elseKey];
  }
  const ternaryKey = typeof Symbol == 'undefined' ? '@@iterator' : Symbol.iterator;
  function readTernary(receiver) {
    return receiver[ternaryKey];
  }
  function readDirect(receiver) {
    return receiver[typeof Symbol != 'undefined' ? Symbol.iterator : '@@iterator'];
  }
  let functionKey;
  // eslint-disable-next-line yoda -- the reversed operand order of babel's minified helpers IS the case under test
  if ('function' == typeof Symbol) functionKey = Symbol.iterator;
  else functionKey = '@@iterator';
  function readFunction(receiver) {
    return receiver[functionKey];
  }
  function readFunctionDirect(receiver) {
    return receiver[typeof Symbol !== 'function' ? '@@iterator' : Symbol.iterator];
  }
  let patternKey = Symbol.iterator;
  if (typeof Symbol == 'undefined') [patternKey] = ['@@iterator'];
  function readPattern(receiver) {
    return receiver[patternKey];
  }
  assert.same(readElse([60, 61]).call([60, 61]).next().value, 60);
  assert.same(readTernary([62, 63]).call([62, 63]).next().value, 62);
  assert.same(readDirect([64, 65]).call([64, 65]).next().value, 64);
  assert.same(readFunction([66, 67]).call([66, 67]).next().value, 66);
  assert.same(readFunctionDirect([68, 69]).call([68, 69]).next().value, 68);
  assert.same(readPattern([70, 71]).call([70, 71]).next().value, 70);
});

// a logical selection over a decided presence test yields one operand on every path - `&&` its right
// where the test always holds, as tslib's `__values` and React's iterator lookup spell it, `||` its right
// where the test always fails - so the key is that operand, and a string selection names its method
QUnit.test('Symbol.iterator: decided logical selection reads the iterator method', assert => {
  const maybeKey = typeof Symbol !== 'undefined' && Symbol.iterator;
  function readMaybe(receiver) {
    return receiver[maybeKey];
  }
  function values(receiver) {
    const key = typeof Symbol === 'function' && Symbol.iterator;
    return key && receiver[key];
  }
  const deadTestKey = typeof Symbol == 'undefined' || Symbol.iterator;
  function readDeadTest(receiver) {
    return receiver[deadTestKey];
  }
  // eslint-disable-next-line yoda -- the reversed operand order of minified helpers IS the case under test
  const methodName = 'function' == typeof Symbol && 'findLast';
  assert.same(readMaybe([72, 73]).call([72, 73]).next().value, 72);
  assert.same(values([74, 75]).call([74, 75]).next().value, 74);
  assert.same(readDeadTest([76, 77]).call([76, 77]).next().value, 76);
  assert.same([78, 79][methodName](it => it > 78), 79);
});

// the iterator key the regenerator helpers, `regenerator-runtime` and immutable spell - a `||` / `??` whose
// left is the well-known symbol through a decided `&&`, an alias of one, a static read off a decided realm
// selection or the symbol itself - always takes the left, so each read is the iterator method where an
// engine lacks `Symbol`
QUnit.test('Symbol.iterator: helper key selections read the iterator method', assert => {
  const realm = typeof Symbol == 'function' ? Symbol : {};
  const realmKey = realm.iterator || '@@iterator';
  function viaRealm(receiver) {
    return receiver[realmKey];
  }
  function viaValues(receiver) {
    return receiver[typeof Symbol == 'function' && Symbol.iterator || '@@iterator'];
  }
  const realKey = typeof Symbol === 'function' && Symbol.iterator;
  const fauxKey = '@@iterator';
  const iteratorKey = realKey || fauxKey;
  function viaAlias(receiver) {
    return receiver[iteratorKey];
  }
  function viaMember(receiver) {
    return receiver[realm.iterator];
  }
  const orKey = Symbol.iterator || '@@iterator';
  const nullishKey = Symbol.iterator ?? '@@iterator';
  function viaOr(receiver) {
    return receiver[orKey];
  }
  function viaNullish(receiver) {
    return receiver[nullishKey];
  }
  assert.same(viaRealm([80, 81]).call([80, 81]).next().value, 80);
  assert.same(viaValues([82, 83]).call([82, 83]).next().value, 82);
  assert.same(viaAlias([84, 85]).call([84, 85]).next().value, 84);
  assert.same(viaMember([86, 87]).call([86, 87]).next().value, 86);
  assert.same(viaOr([89, 90]).call([89, 90]).next().value, 89);
  assert.same(viaNullish([91, 92]).call([91, 92]).next().value, 91);
  assert.true(realm.iterator in [88]);
});

// the async iterator helpers' lookup tries the symbol a decided test installs, then its `'@@iterator'`
// fallback, in a loop: every value the key holds reads the iterator method
QUnit.test('Symbol.iterator: helper loop keys read the iterator method', assert => {
  function lookup(receiver) {
    let method, asyncKey, syncKey;
    let retry = 2;
    for (typeof Symbol != 'undefined' && (asyncKey = Symbol.asyncIterator, syncKey = Symbol.iterator); retry--;) {
      if (asyncKey && (method = receiver[asyncKey])) return method;
      if (syncKey && (method = receiver[syncKey])) return method;
      asyncKey = '@@asyncIterator';
      syncKey = '@@iterator';
    }
  }
  function iterable(receiver) {
    let key;
    let retry = 2;
    for (typeof Symbol != 'undefined' && (key = Symbol.iterator); retry--;) {
      if (key in receiver) return true;
      key = '@@iterator';
    }
    return false;
  }
  assert.same(lookup([90, 91]).call([90, 91]).next().value, 90);
  assert.true(iterable([92]));
});

// a key a decided test installs is often tested before the read: the read after the test is still
// the iterator method
QUnit.test('Symbol.iterator: key tested before its read reads the iterator method', assert => {
  let key;
  if (typeof Symbol != 'undefined') key = Symbol.iterator;
  function read(receiver) {
    return key && receiver[key];
  }
  assert.same(read([94, 95]).call([94, 95]).next().value, 94);
});

// a write a presence test may skip - an undecided test, or one the build always answers false -
// leaves the key undefined, an undecided ternary may yield its fallback, and the read stays the
// native property a fold would turn into the method
QUnit.test('Symbol.iterator: possibly-unwritten key alias keeps the native read', assert => {
  const flag = false;
  let undecidedKey;
  if (flag) undecidedKey = Symbol.iterator;
  let falseKey;
  if (typeof Symbol == 'undefined') falseKey = Symbol.iterator;
  let notFunctionKey;
  if (typeof Symbol != 'function') notFunctionKey = Symbol.iterator;
  const undecidedTernaryKey = flag ? Symbol.iterator : '@@iterator';
  assert.same([50, 51][undecidedKey], undefined);
  assert.same([52, 53][falseKey], undefined);
  assert.same([54, 55][notFunctionKey], undefined);
  // Firefox 17-35 has a native iterator under the fallback key.
  const nativeFallback = Object.getOwnPropertyDescriptor(Array.prototype, '@@iterator')?.value;
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- the fallback key IS the case under test
  assert.same([56, 57][undecidedTernaryKey], nativeFallback);
  function ownFallback() { return 'own fallback'; }
  const receiver = Object.defineProperty([58, 59], '@@iterator', { value: ownFallback });
  assert.same(receiver[undecidedTernaryKey], ownFallback, 'the fallback key keeps its own property');
});

// the value an assignment gives a key alias resolves where the assignment stands: a block around the
// write, or around a closure reading the key, may rebind a name the value reads, and a block holding
// the declaration and the write rebinds it for both. a pattern write reads its own key names there
// too, and so do both arms of a settled write. the keys name ES5 statics every engine carries, which
// tell an own non-enumerable key apart - but one, a method only the claim serves where it is missing
QUnit.test('assigned key alias resolves where it was written', assert => {
  const hidden = Object.defineProperty({}, 'own', { value: 1 });
  const source = 'keys';
  let written;
  {
    // eslint-disable-next-line no-shadow -- the same-name block shadow IS the case
    const source = 'getOwnPropertyNames';
    written = source;
  }
  function viaWritten(object) {
    return Object[written](object);
  }
  let outer;
  // eslint-disable-next-line prefer-const -- the separate key WRITE is the case under test
  outer = source;
  let viaOuter;
  {
    // eslint-disable-next-line no-shadow, no-unused-vars -- the same-name block shadow IS the case
    const source = 'getOwnPropertyNames';
    viaOuter = object => Object[outer](object);
  }
  let symbolKey;
  {
    const Symbol = { iterator: 'own' };
    symbolKey = Symbol.iterator;
  }
  function viaSymbolKey(receiver) {
    return receiver[symbolKey];
  }
  let viaShared;
  {
    // eslint-disable-next-line no-shadow -- the same-name block shadow IS the case
    const source = 'getOwnPropertyNames';
    let shared;
    // eslint-disable-next-line prefer-const -- the separate key WRITE is the case under test
    shared = source;
    viaShared = object => Object[shared](object);
  }
  const slot = 'k1';
  let paired;
  // eslint-disable-next-line prefer-const -- the separate pattern WRITE is the case under test
  ({ [slot]: paired } = { k1: 'getOwnPropertyNames', k2: 'keys' });
  let viaPatternKey;
  {
    // eslint-disable-next-line no-shadow, no-unused-vars -- the same-name block shadow IS the case
    const slot = 'k2';
    viaPatternKey = object => Object[paired](object);
  }
  let patternUnderBlock;
  {
    // eslint-disable-next-line no-shadow -- the same-name block shadow IS the case
    const slot = 'k2';
    ({ [slot]: patternUnderBlock } = { k1: 'getOwnPropertyNames', k2: 'keys' });
  }
  function viaPatternUnderBlock(object) {
    return Object[patternUnderBlock](object);
  }
  function viaSettledArms(object, flag) {
    let armKey;
    if (flag) {
      // eslint-disable-next-line no-shadow -- the same-name block shadow IS the case
      const source = 'getOwnPropertyNames';
      armKey = source;
    // eslint-disable-next-line unicorn/no-duplicate-if-branches, sonarjs/no-duplicated-branches -- a write in each arm IS the settled case
    } else {
      // eslint-disable-next-line no-shadow -- the same-name block shadow IS the case
      const source = 'getOwnPropertyNames';
      armKey = source;
    }
    return Object[armKey](object);
  }
  // eslint-disable-next-line no-unused-vars -- the outer name a wrong resolution would read IS the case
  const pick = 'find';
  let blockMethod;
  {
    // eslint-disable-next-line no-shadow -- the same-name block shadow IS the case
    const pick = 'findLast';
    blockMethod = pick;
  }
  function viaBlockMethod(list) {
    return list[blockMethod](it => it < 3);
  }
  assert.deepEqual(viaWritten(hidden), ['own']);
  assert.same(viaBlockMethod([1, 2, 3]), 2);
  assert.deepEqual(viaOuter(hidden), []);
  assert.same(viaSymbolKey({ own: 'hit' }), 'hit');
  assert.deepEqual(viaShared(hidden), ['own']);
  assert.deepEqual(viaPatternKey(hidden), ['own']);
  assert.deepEqual(viaPatternUnderBlock(hidden), []);
  assert.deepEqual(viaSettledArms(hidden, true), ['own']);
});

// a key declared with `var` in both arms of an undecided test holds whichever arm ran
QUnit.test('var key alias declared in both arms keeps the arm that ran', assert => {
  const hidden = Object.defineProperty({}, 'own', { value: 1 });
  function pick(flag) {
    // eslint-disable-next-line no-var -- the hoisted var in both arms IS the case
    if (flag) var key = 'getOwnPropertyNames';
    // eslint-disable-next-line no-var, no-redeclare -- the hoisted var in both arms IS the case
    else var key = 'keys';
    return Object[key](hidden);
  }
  assert.deepEqual(pick(true), ['own']);
  assert.deepEqual(pick(false), []);
});

// a computed key that merely SPELLS 'Symbol.iterator' as a string is a plain property read,
// NOT the well-known symbol - it must not route through the iterator-method helper. live
// runtime oracle: fail-before compiled the call to a get-iterator helper that returns an
// object where native semantics throw a TypeError (undefined is not a function)
QUnit.test('Symbol.iterator: string-spelled key stays a plain property read', assert => {
  /* eslint-disable no-useless-concat, no-useless-computed-key -- string spellings under test */
  /* eslint-disable es/no-nonstandard-array-prototype-properties -- string spellings under test */
  const arr = [1, 2];
  assert.same(arr['Symbol.iterator'], undefined);
  assert.same(arr[`Symbol.${ 'iterator' }`], undefined);
  // eslint-disable-next-line unicorn/no-useless-concat -- testing
  const stringKey = 'Symbol.' + 'iterator';
  assert.same(arr[stringKey], undefined);
  assert.throws(() => arr['Symbol.iterator'](), TypeError);
  const { ['Symbol.iterator']: extracted } = arr;
  assert.same(extracted, undefined);
  assert.false('Symbol.iterator' in arr);
  /* eslint-enable no-useless-concat, no-useless-computed-key -- end of string-spelling block */
  /* eslint-enable es/no-nonstandard-array-prototype-properties -- end of string-spelling block */
});

QUnit.test('destructuring: an iterator under a retained container reads its own receiver', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, Symbol.iterator);
  function ownIterator() { return 7; }
  try {
    Object.defineProperty(globalThis, Symbol.iterator, { configurable: true, value: ownIterator });
    const result = readNestedRealmIterator();
    assert.same(result[0], ownIterator);
    assert.deepEqual(result[1], { value: 3 });
  } finally {
    if (descriptor) Object.defineProperty(globalThis, Symbol.iterator, descriptor);
    else delete globalThis[Symbol.iterator];
  }
});

QUnit.test('destructuring: nested static and iterator read once before rest', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, Symbol.iterator);
  const retainedKey = Symbol('retained');
  let reads = 0;
  function ownIterator() { return 7; }
  try {
    // eslint-disable-next-line unicorn/prefer-object-define-properties -- install the symbol keys independently
    Object.defineProperty(globalThis, Symbol.iterator, {
      configurable: true, enumerable: true,
      get() { reads++; return ownIterator; },
    });
    Object.defineProperty(globalThis, retainedKey, { configurable: true, enumerable: true, value: 42 });
    const result = readRealmIteratorWithStatic();
    assert.deepEqual(result[0]([1]), [1]);
    assert.same(result[1], ownIterator);
    assert.same(reads, 1);
    assert.same(Object.getOwnPropertyDescriptor(result[2], 'Array'), undefined);
    assert.same(Object.getOwnPropertyDescriptor(result[2], Symbol.iterator), undefined);
    // under sham symbols the lowered rest copy lists no symbol keys: the retained key is
    // asserted only where symbols are native
    if (!Symbol.sham) {
      assert.deepEqual(Object.getOwnPropertyDescriptor(result[2], retainedKey), {
        value: 42, enumerable: true, configurable: true, writable: true,
      });
    }
  } finally {
    delete globalThis[retainedKey];
    if (descriptor) Object.defineProperty(globalThis, Symbol.iterator, descriptor);
    else delete globalThis[Symbol.iterator];
  }
});

QUnit.test('destructuring: an iterator read keeps its polyfilled static sibling', assert => {
  const receiver = globalThis.Array;
  const descriptor = Object.getOwnPropertyDescriptor(receiver, Symbol.iterator);
  const retainedKey = Symbol('retained');
  let reads = 0;
  function ownIterator() { return 7; }
  try {
    // eslint-disable-next-line unicorn/prefer-object-define-properties -- install the symbol keys independently
    Object.defineProperty(receiver, Symbol.iterator, {
      configurable: true, enumerable: true,
      get() { reads++; return ownIterator; },
    });
    Object.defineProperty(receiver, retainedKey, { configurable: true, enumerable: true, value: 42 });
    const result = readArrayIteratorBeforeStatic();
    assert.same(result[0], ownIterator);
    assert.deepEqual(result[1]([1]), [1]);
    assert.same(reads, 1);
    assert.same(Object.getOwnPropertyDescriptor(result[2], 'from'), undefined);
    assert.same(Object.getOwnPropertyDescriptor(result[2], Symbol.iterator), undefined);
    if (!Symbol.sham) {
      assert.deepEqual(Object.getOwnPropertyDescriptor(result[2], retainedKey), {
        value: 42, enumerable: true, configurable: true, writable: true,
      });
    }
  } finally {
    delete receiver[retainedKey];
    if (descriptor) Object.defineProperty(receiver, Symbol.iterator, descriptor);
    else delete receiver[Symbol.iterator];
  }
});
