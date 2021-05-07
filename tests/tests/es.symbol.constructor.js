import { GLOBAL, NATIVE } from '../helpers/constants';

const {
  defineProperty,
  defineProperties,
  getOwnPropertyDescriptor,
  getOwnPropertyNames,
  getOwnPropertySymbols,
  keys,
  create,
} = Object;
const { ownKeys } = GLOBAL.Reflect || {};

QUnit.test('Symbol', assert => {
  assert.isFunction(Symbol);
  if (NATIVE) assert.strictEqual(Symbol.length, 0, 'arity is 0');
  assert.name(Symbol, 'Symbol');
  assert.looksNative(Symbol);
  const symbol1 = Symbol('symbol');
  const symbol2 = Symbol('symbol');
  assert.ok(symbol1 !== symbol2, 'Symbol("symbol") !== Symbol("symbol")');
  const object = {};
  object[symbol1] = 42;
  assert.ok(object[symbol1] === 42, 'Symbol() work as key');
  assert.ok(object[symbol2] !== 42, 'Various symbols from one description are various keys');
  assert.throws(() => Symbol(Symbol('foo')), 'throws on symbol argument');
  let count = 0;
  // eslint-disable-next-line no-unused-vars -- required for testing
  for (const key in object) count++;
  assert.ok(count === 0, 'object[Symbol()] is not enumerable');
});

QUnit.test('Well-known Symbols', assert => {
  const wks = [
    'hasInstance',
    'isConcatSpreadable',
    'iterator',
    'match',
    'matchAll',
    'replace',
    'search',
    'species',
    'split',
    'toStringTag',
    'unscopables',
  ];
  for (const name of wks) {
    assert.ok(name in Symbol, `Symbol.${ name } available`);
    assert.ok(Object(Symbol[name]) instanceof Symbol, `Symbol.${ name } is symbol`);
    const descriptor = getOwnPropertyDescriptor(Symbol, name);
    assert.ok(!descriptor.enumerble, 'non-enumerable');
    assert.ok(!descriptor.writable, 'non-writable');
    assert.ok(!descriptor.configurable, 'non-configurable');
  }
});

QUnit.test('Symbol#@@toStringTag', assert => {
  assert.ok(Symbol.prototype[Symbol.toStringTag] === 'Symbol', 'Symbol::@@toStringTag is `Symbol`');
});

QUnit.test('Symbols & descriptors', assert => {
  const d = Symbol('d');
  const e = Symbol('e');
  const f = Symbol('f');
  const i = Symbol('i');
  const j = Symbol('j');
  const prototype = { g: 'g' };
  prototype[i] = 'i';
  defineProperty(prototype, 'h', {
    value: 'h',
  });
  defineProperty(prototype, 'j', {
    value: 'j',
  });
  const object = create(prototype);
  object.a = 'a';
  object[d] = 'd';
  defineProperty(object, 'b', {
    value: 'b',
  });
  defineProperty(object, 'c', {
    value: 'c',
    enumerable: true,
  });
  defineProperty(object, e, {
    configurable: true,
    writable: true,
    value: 'e',
  });
  const descriptor = {
    value: 'f',
    enumerable: true,
  };
  defineProperty(object, f, descriptor);
  assert.strictEqual(descriptor.enumerable, true, 'defineProperty not changes descriptor object');
  assert.deepEqual(getOwnPropertyDescriptor(object, 'a'), {
    configurable: true,
    writable: true,
    enumerable: true,
    value: 'a',
  }, 'getOwnPropertyDescriptor a');
  assert.deepEqual(getOwnPropertyDescriptor(object, 'b'), {
    configurable: false,
    writable: false,
    enumerable: false,
    value: 'b',
  }, 'getOwnPropertyDescriptor b');
  assert.deepEqual(getOwnPropertyDescriptor(object, 'c'), {
    configurable: false,
    writable: false,
    enumerable: true,
    value: 'c',
  }, 'getOwnPropertyDescriptor c');
  assert.deepEqual(getOwnPropertyDescriptor(object, d), {
    configurable: true,
    writable: true,
    enumerable: true,
    value: 'd',
  }, 'getOwnPropertyDescriptor d');
  assert.deepEqual(getOwnPropertyDescriptor(object, e), {
    configurable: true,
    writable: true,
    enumerable: false,
    value: 'e',
  }, 'getOwnPropertyDescriptor e');
  assert.deepEqual(getOwnPropertyDescriptor(object, f), {
    configurable: false,
    writable: false,
    enumerable: true,
    value: 'f',
  }, 'getOwnPropertyDescriptor f');
  assert.strictEqual(getOwnPropertyDescriptor(object, 'g'), undefined, 'getOwnPropertyDescriptor g');
  assert.strictEqual(getOwnPropertyDescriptor(object, 'h'), undefined, 'getOwnPropertyDescriptor h');
  assert.strictEqual(getOwnPropertyDescriptor(object, i), undefined, 'getOwnPropertyDescriptor i');
  assert.strictEqual(getOwnPropertyDescriptor(object, j), undefined, 'getOwnPropertyDescriptor j');
  assert.strictEqual(getOwnPropertyDescriptor(object, 'k'), undefined, 'getOwnPropertyDescriptor k');
  assert.strictEqual(getOwnPropertyDescriptor(Object.prototype, 'toString').enumerable, false, 'getOwnPropertyDescriptor on Object.prototype');
  assert.strictEqual(getOwnPropertyDescriptor(Object.prototype, d), undefined, 'getOwnPropertyDescriptor on Object.prototype missed symbol');
  assert.strictEqual(keys(object).length, 2, 'Object.keys');
  assert.strictEqual(getOwnPropertyNames(object).length, 3, 'Object.getOwnPropertyNames');
  assert.strictEqual(getOwnPropertySymbols(object).length, 3, 'Object.getOwnPropertySymbols');
  assert.strictEqual(ownKeys(object).length, 6, 'Reflect.ownKeys');
  delete object[e];
  object[e] = 'e';
  assert.deepEqual(getOwnPropertyDescriptor(object, e), {
    configurable: true,
    writable: true,
    enumerable: true,
    value: 'e',
  }, 'redefined non-enum key');
});

QUnit.test('Symbols & Object.defineProperties', assert => {
  const c = Symbol('c');
  const d = Symbol('d');
  const descriptors = {
    a: {
      value: 'a',
    },
  };
  descriptors[c] = {
    value: 'c',
  };
  defineProperty(descriptors, 'b', {
    value: {
      value: 'b',
    },
  });
  defineProperty(descriptors, d, {
    value: {
      value: 'd',
    },
  });
  const object = defineProperties({}, descriptors);
  assert.strictEqual(object.a, 'a', 'a');
  assert.strictEqual(object.b, undefined, 'b');
  assert.strictEqual(object[c], 'c', 'c');
  assert.strictEqual(object[d], undefined, 'd');
});

QUnit.test('Symbols & Object.create', assert => {
  const c = Symbol('c');
  const d = Symbol('d');
  const descriptors = {
    a: {
      value: 'a',
    },
  };
  descriptors[c] = {
    value: 'c',
  };
  defineProperty(descriptors, 'b', {
    value: {
      value: 'b',
    },
  });
  defineProperty(descriptors, d, {
    value: {
      value: 'd',
    },
  });
  const object = create(null, descriptors);
  assert.strictEqual(object.a, 'a', 'a');
  assert.strictEqual(object.b, undefined, 'b');
  assert.strictEqual(object[c], 'c', 'c');
  assert.strictEqual(object[d], undefined, 'd');
});

const constructors = ['Map', 'Set', 'Promise'];
for (const name of constructors) {
  QUnit.test(`${ name }@@species`, assert => {
    assert.strictEqual(GLOBAL[name][Symbol.species], GLOBAL[name], `${ name }@@species === ${ name }`);
    const Subclass = create(GLOBAL[name]);
    assert.strictEqual(Subclass[Symbol.species], Subclass, `${ name } subclass`);
  });
}

QUnit.test('Array@@species', assert => {
  assert.strictEqual(Array[Symbol.species], Array, 'Array@@species === Array');
  const Subclass = create(Array);
  assert.strictEqual(Subclass[Symbol.species], Subclass, 'Array subclass');
});

QUnit.test('Symbol.sham flag', assert => {
  assert.same(Symbol.sham, typeof Symbol() === 'symbol' ? undefined : true);
});
