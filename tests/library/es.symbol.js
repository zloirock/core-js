import { DESCRIPTORS } from '../helpers/constants';

const { Symbol, JSON } = core;
const {
  defineProperty,
  defineProperties,
  getOwnPropertyDescriptor,
  getOwnPropertyNames,
  getOwnPropertySymbols,
  keys,
  create,
} = core.Object;
const { ownKeys } = core.Reflect;

QUnit.test('Symbol', assert => {
  assert.isFunction(Symbol);
  const symbol1 = Symbol('symbol');
  const symbol2 = Symbol('symbol');
  assert.ok(symbol1 !== symbol2, 'Symbol("symbol") !== Symbol("symbol")');
  const object = {};
  object[symbol1] = 42;
  assert.ok(object[symbol1] === 42, 'Symbol() work as key');
  assert.ok(object[symbol2] !== 42, 'Various symbols from one description are various keys');
  if (DESCRIPTORS) {
    let count = 0;
    // eslint-disable-next-line no-unused-vars
    for (const key in object) count++;
    assert.ok(count === 0, 'object[Symbol()] is not enumerable');
  }
});

QUnit.test('Well-known Symbols', assert => {
  const wks = [
    'hasInstance',
    'isConcatSpreadable',
    'iterator',
    'match',
    'replace',
    'search',
    'species',
    'split',
    'toPrimitive',
    'toStringTag',
    'unscopables',
  ];
  for (const name of wks) {
    assert.ok(name in Symbol, `Symbol.${ name } available`);
    assert.ok(Object(Symbol[name]) instanceof Symbol, `Symbol.${ name } is symbol`);
  }
});

QUnit.test('Global symbol registry', assert => {
  assert.isFunction(Symbol.for, 'Symbol.for is function');
  assert.isFunction(Symbol.keyFor, 'Symbol.keyFor is function');
  const symbol = Symbol.for('foo');
  assert.strictEqual(Symbol.for('foo'), symbol);
  assert.strictEqual(Symbol.keyFor(symbol), 'foo');
  assert.throws(() => {
    return Symbol.keyFor('foo');
  }, 'throws on non-symbol');
});

QUnit.test('Symbol#@@toPrimitive', assert => {
  const symbol = Symbol();
  assert.isFunction(Symbol.prototype[Symbol.toPrimitive]);
  assert.same(symbol, symbol[Symbol.toPrimitive](), 'works');
});

QUnit.test('Symbol#@@toStringTag', assert => {
  assert.ok(Symbol.prototype[Symbol.toStringTag] === 'Symbol', 'Symbol::@@toStringTag is `Symbol`');
});

QUnit.test('Object.getOwnPropertySymbols', assert => {
  assert.isFunction(getOwnPropertySymbols);
  const prototype = { q: 1, w: 2, e: 3 };
  prototype[Symbol()] = 42;
  prototype[Symbol()] = 43;
  assert.deepEqual(getOwnPropertyNames(prototype).sort(), ['e', 'q', 'w']);
  assert.strictEqual(getOwnPropertySymbols(prototype).length, 2);
  const object = create(prototype);
  object.a = 1;
  object.s = 2;
  object.d = 3;
  object[Symbol()] = 44;
  assert.deepEqual(getOwnPropertyNames(object).sort(), ['a', 'd', 's']);
  assert.strictEqual(getOwnPropertySymbols(object).length, 1);
  assert.strictEqual(getOwnPropertySymbols(Object.prototype).length, 0);
});

if (JSON) {
  QUnit.test('Symbols & JSON.stringify', assert => {
    assert.strictEqual(JSON.stringify([
      1,
      Symbol('foo'),
      false,
      Symbol('bar'),
      {},
    ]), '[1,null,false,null,{}]', 'array value');
    assert.strictEqual(JSON.stringify({
      symbol: Symbol('symbol'),
    }), '{}', 'object value');
    if (DESCRIPTORS) {
      const object = { bar: 2 };
      object[Symbol('symbol')] = 1;
      assert.strictEqual(JSON.stringify(object), '{"bar":2}', 'object key');
    }
    assert.strictEqual(JSON.stringify(Symbol('symbol')), undefined, 'symbol value');
    if (typeof Symbol() === 'symbol') {
      assert.strictEqual(JSON.stringify(Object(Symbol('symbol'))), '{}', 'boxed symbol');
    }
    assert.strictEqual(JSON.stringify(undefined, () => 42), '42', 'replacer works with top-level undefined');
  });
}

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
      assert.strictEqual(core[name][Symbol.species], core[name], `${ name }@@species === ${ name }`);
      const Subclass = create(core[name]);
      assert.strictEqual(Subclass[Symbol.species], Subclass, `${ name } subclass`);
    });
  }

  QUnit.test('Array@@species', assert => {
    assert.strictEqual(Array[Symbol.species], Array, 'Array@@species === Array');
    const Subclass = create(Array);
    assert.strictEqual(Subclass[Symbol.species], Subclass, 'Array subclass');
  });
}
