import { NATIVE } from '../helpers/constants';

QUnit.test('Symbol.for', assert => {
  assert.isFunction(Symbol.for, 'Symbol.for is function');
  assert.nonEnumerable(Symbol, 'for');
  assert.strictEqual(Symbol.for.length, 1, 'Symbol.for arity is 1');
  if (NATIVE) assert.strictEqual(Symbol.for.name, 'for', 'Symbol.for.name is "for"');
  assert.looksNative(Symbol.for, 'Symbol.for looks like native');
  const symbol = Symbol.for('foo');
  assert.strictEqual(Symbol.for('foo'), symbol, 'registry');
  assert.ok(Object(symbol) instanceof Symbol, 'returns symbol');
  assert.throws(() => Symbol.for(Symbol('foo')), 'throws on symbol argument');
});
