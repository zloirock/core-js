import { DESCRIPTORS, GLOBAL, NATIVE } from '../helpers/constants.js';

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
  if (NATIVE) assert.same(Symbol.length, 0, 'arity is 0');
  assert.name(Symbol, 'Symbol');
  assert.looksNative(Symbol);
  const symbol1 = Symbol('symbol');
  const symbol2 = Symbol('symbol');
  assert.notSame(symbol1, symbol2, 'Symbol("symbol") !== Symbol("symbol")');
  const object = {};
  object[symbol1] = 42;
  assert.same(object[symbol1], 42, 'Symbol() work as key');
  assert.notSame(object[symbol2], 42, 'Various symbols from one description are various keys');
  // assert.throws(() => Symbol(Symbol('foo')), 'throws on symbol argument');
  if (DESCRIPTORS) {
    let count = 0;
    // eslint-disable-next-line no-unused-vars -- required for testing
    for (const key in object) count++;
    assert.same(count, 0, 'object[Symbol()] is not enumerable');
  }
});

QUnit.test('Symbol as global key', assert => {
  const TEXT = 'test global symbol key';
  const symbol = Symbol(TEXT);
  GLOBAL[symbol] = TEXT;
  assert.same(GLOBAL[symbol], TEXT, TEXT);
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
    'toPrimitive',
    'toStringTag',
    'unscopables',
  ];
  for (const name of wks) {
    assert.true(name in Symbol, `Symbol.${ name } available`);
    assert.true(Object(Symbol[name]) instanceof Symbol, `Symbol.${ name } is symbol`);
    if (DESCRIPTORS) {
      const descriptor = getOwnPropertyDescriptor(Symbol, name);
      assert.false(descriptor.enumerable, 'non-enumerable');
      assert.false(descriptor.writable, 'non-writable');
      assert.false(descriptor.configurable, 'non-configurable');
    }
  }
});

QUnit.test('Symbol#@@toPrimitive', assert => {
  const symbol = Symbol('Symbol#@@toPrimitive test');
  assert.isFunction(Symbol.prototype[Symbol.toPrimitive]);
  assert.same(symbol, symbol[Symbol.toPrimitive](), 'works');
});

QUnit.test('Symbol#@@toStringTag', assert => {
  assert.same(Symbol.prototype[Symbol.toStringTag], 'Symbol', 'Symbol::@@toStringTag is `Symbol`');
});

if (DESCRIPTORS) {
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
    defineProperty(prototype, j, {
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
    assert.true(descriptor.enumerable, 'defineProperty not changes descriptor object');
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
    assert.same(getOwnPropertyDescriptor(object, 'g'), undefined, 'getOwnPropertyDescriptor g');
    assert.same(getOwnPropertyDescriptor(object, 'h'), undefined, 'getOwnPropertyDescriptor h');
    assert.same(getOwnPropertyDescriptor(object, i), undefined, 'getOwnPropertyDescriptor i');
    assert.same(getOwnPropertyDescriptor(object, j), undefined, 'getOwnPropertyDescriptor j');
    assert.same(getOwnPropertyDescriptor(object, 'k'), undefined, 'getOwnPropertyDescriptor k');
    assert.false(getOwnPropertyDescriptor(Object.prototype, 'toString').enumerable, 'getOwnPropertyDescriptor on Object.prototype');
    assert.same(getOwnPropertyDescriptor(Object.prototype, d), undefined, 'getOwnPropertyDescriptor on Object.prototype missed symbol');
    assert.same(keys(object).length, 2, 'Object.keys');
    assert.same(getOwnPropertyNames(object).length, 3, 'Object.getOwnPropertyNames');
    assert.same(getOwnPropertySymbols(object).length, 3, 'Object.getOwnPropertySymbols');
    assert.same(ownKeys(object).length, 6, 'Reflect.ownKeys');
    delete object[e];
    object[e] = 'e';
    assert.deepEqual(getOwnPropertyDescriptor(object, e), {
      configurable: true,
      writable: true,
      enumerable: true,
      value: 'e',
    }, 'redefined non-enum key');
    const g = Symbol('g');
    defineProperty(object, g, { configurable: true, enumerable: true, writable: true, value: 1 });
    defineProperty(object, g, { value: 2 });
    assert.deepEqual(getOwnPropertyDescriptor(object, g), {
      configurable: true,
      writable: true,
      enumerable: true,
      value: 2,
    }, 'redefine with partial descriptor preserves enumerable');
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
    assert.same(object.a, 'a', 'a');
    assert.same(object.b, undefined, 'b');
    assert.same(object[c], 'c', 'c');
    assert.same(object[d], undefined, 'd');
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
    assert.same(object.a, 'a', 'a');
    assert.same(object.b, undefined, 'b');
    assert.same(object[c], 'c', 'c');
    assert.same(object[d], undefined, 'd');
  });

  const constructors = ['Map', 'Set', 'Promise'];
  for (const name of constructors) {
    QUnit.test(`${ name }@@species`, assert => {
      assert.same(GLOBAL[name][Symbol.species], GLOBAL[name], `${ name }@@species === ${ name }`);
      const Subclass = create(GLOBAL[name]);
      assert.same(Subclass[Symbol.species], Subclass, `${ name } subclass`);
    });
  }

  QUnit.test('Array@@species', assert => {
    assert.same(Array[Symbol.species], Array, 'Array@@species === Array');
    const Subclass = create(Array);
    assert.same(Subclass[Symbol.species], Subclass, 'Array subclass');
  });

  QUnit.test('Symbol.sham flag', assert => {
    assert.same(Symbol.sham, typeof Symbol('Symbol.sham flag test') == 'symbol' ? undefined : true);
  });
}
