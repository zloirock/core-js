import { NATIVE } from '../helpers/constants';

QUnit.test('Symbol.for', assert => {
  assert.isFunction(Symbol.for, 'Symbol.for is function');
  assert.nonEnumerable(Symbol, 'for');
  assert.arity(Symbol.for, 1, 'Symbol.for arity is 1');
  if (NATIVE) assert.name(Symbol.for, 'for', 'Symbol.for.name is "for"');
  assert.looksNative(Symbol.for, 'Symbol.for looks like native');
  const symbol = Symbol.for('foo');
  assert.same(Symbol.for('foo'), symbol, 'registry');
  assert.true(Object(symbol) instanceof Symbol, 'returns symbol');
  assert.throws(() => Symbol.for(Symbol('foo')), 'throws on symbol argument');
});
