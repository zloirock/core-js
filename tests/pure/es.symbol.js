import { DESCRIPTORS } from '../helpers/constants';

import create from 'core-js-pure/features/object/create';
import defineProperty from 'core-js-pure/features/object/define-property';
import defineProperties from 'core-js-pure/features/object/define-properties';
import getOwnPropertyDescriptor from 'core-js-pure/features/object/get-own-property-descriptor';
import getOwnPropertyNames from 'core-js-pure/features/object/get-own-property-names';
import getOwnPropertySymbols from 'core-js-pure/features/object/get-own-property-symbols';
import keys from 'core-js-pure/features/object/keys';
import ownKeys from 'core-js-pure/features/reflect/own-keys';
import JSON from 'core-js-pure/features/json';
import Map from 'core-js-pure/features/map';
import Set from 'core-js-pure/features/set';
import Promise from 'core-js-pure/features/promise';
import Symbol from 'core-js-pure/features/symbol';

QUnit.test('Symbol', assert => {
  assert.isFunction(Symbol);
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
  }
});

QUnit.test('Global symbol registry', assert => {
  assert.isFunction(Symbol.for, 'Symbol.for is function');
  assert.isFunction(Symbol.keyFor, 'Symbol.keyFor is function');
  const symbol = Symbol.for('foo');
  assert.same(Symbol.for('foo'), symbol);
  assert.same(Symbol.keyFor(symbol), 'foo');
  assert.throws(() => Symbol.for(Symbol('foo')), 'throws on symbol argument');
  assert.throws(() => Symbol.keyFor('foo'), 'throws on non-symbol');
});

QUnit.test('Symbol#@@toPrimitive', assert => {
  const symbol = Symbol();
  assert.isFunction(Symbol.prototype[Symbol.toPrimitive]);
  assert.same(symbol, symbol[Symbol.toPrimitive](), 'works');
});

QUnit.test('Symbol#@@toStringTag', assert => {
  assert.same(Symbol.prototype[Symbol.toStringTag], 'Symbol', 'Symbol::@@toStringTag is `Symbol`');
});

QUnit.test('Object.getOwnPropertySymbols', assert => {
  assert.isFunction(getOwnPropertySymbols);
  const prototype = { q: 1, w: 2, e: 3 };
  prototype[Symbol()] = 42;
  prototype[Symbol()] = 43;
  assert.deepEqual(getOwnPropertyNames(prototype).sort(), ['e', 'q', 'w']);
  assert.same(getOwnPropertySymbols(prototype).length, 2);
  const object = create(prototype);
  object.a = 1;
  object.s = 2;
  object.d = 3;
  object[Symbol()] = 44;
  assert.deepEqual(getOwnPropertyNames(object).sort(), ['a', 'd', 's']);
  assert.same(getOwnPropertySymbols(object).length, 1);
  assert.same(getOwnPropertySymbols(Object.prototype).length, 0);
  const primitives = [42, 'foo', false];
  for (const value of primitives) {
    assert.notThrows(() => getOwnPropertySymbols(value), `accept ${ typeof value }`);
  }
});

if (JSON) {
  QUnit.test('Symbols & JSON.stringify', assert => {
    assert.same(JSON.stringify([
      1,
      Symbol('foo'),
      false,
      Symbol('bar'),
      {},
    ]), '[1,null,false,null,{}]', 'array value');
    assert.same(JSON.stringify({
      symbol: Symbol('symbol'),
    }), '{}', 'object value');
    if (DESCRIPTORS) {
      const object = { bar: 2 };
      object[Symbol('symbol')] = 1;
      assert.same(JSON.stringify(object), '{"bar":2}', 'object key');
    }
    assert.same(JSON.stringify(Symbol('symbol')), undefined, 'symbol value');
    if (typeof Symbol() == 'symbol') {
      assert.same(JSON.stringify(Object(Symbol('symbol'))), '{}', 'boxed symbol');
    }
    assert.same(JSON.stringify(undefined, () => 42), '42', 'replacer works with top-level undefined');
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

  const constructors = { Map, Set, Promise };
  for (const name in constructors) {
    QUnit.test(`${ name }@@species`, assert => {
      assert.same(constructors[name][Symbol.species], constructors[name], `${ name }@@species === ${ name }`);
      const Subclass = create(constructors[name]);
      assert.same(Subclass[Symbol.species], Subclass, `${ name } subclass`);
    });
  }

  QUnit.test('Array@@species', assert => {
    assert.same(Array[Symbol.species], Array, 'Array@@species === Array');
    const Subclass = create(Array);
    assert.same(Subclass[Symbol.species], Subclass, 'Array subclass');
  });

  QUnit.test('Symbol.sham flag', assert => {
    assert.same(Symbol.sham, typeof Symbol() == 'symbol' ? undefined : true);
  });
}
