import Symbol from '@core-js/pure/es/symbol';
import getDescription from '@core-js/pure/es/symbol/instance/description';
import setPrototypeOf from '@core-js/pure/es/object/set-prototype-of';

QUnit.test('Symbol#description', assert => {
  assert.isFunction(getDescription);
  for (const value of ['foo', '', ')', '\n', null, undefined]) {
    const symbol = Symbol(value);
    const expected = value === undefined ? undefined : String(value);
    assert.same(getDescription(symbol), expected);
    assert.same(getDescription(Object(symbol)), expected, 'boxed symbol');
  }
  assert.same(getDescription(Symbol()), undefined);
  assert.same(getDescription(Symbol.for('')), '', 'empty registry key');
  assert.same(getDescription(Symbol.for('foo')), 'foo', 'registry key');
  assert.throws(() => getDescription(null), TypeError);
  assert.throws(() => getDescription(undefined), TypeError);

  let reads = 0;
  const custom = Object.defineProperty(Object(Symbol('original')), 'description', {
    get() { reads++; return 'custom'; },
  });
  assert.same(getDescription(custom), 'custom', 'own getter');
  assert.same(reads, 1, 'one property read');
  const inherited = Object(Symbol('original'));
  setPrototypeOf(inherited, Object.create(Symbol.prototype, { description: { value: 'inherited' } }));
  assert.same(getDescription(inherited), 'inherited', 'inherited override');
  assert.same(getDescription({ description: 42 }), 42, 'unrelated receiver');
});
