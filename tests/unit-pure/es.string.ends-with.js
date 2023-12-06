import Symbol from '@core-js/pure/es/symbol';
import endsWith from '@core-js/pure/es/string/ends-with';

QUnit.test('String#endsWith', assert => {
  assert.isFunction(endsWith);
  assert.true(endsWith('undefined'));
  assert.false(endsWith('undefined', null));
  assert.true(endsWith('abc', ''));
  assert.true(endsWith('abc', 'c'));
  assert.true(endsWith('abc', 'bc'));
  assert.false(endsWith('abc', 'ab'));
  assert.true(endsWith('abc', '', NaN));
  assert.false(endsWith('abc', 'c', -1));
  assert.true(endsWith('abc', 'a', 1));
  assert.true(endsWith('abc', 'c', Infinity));
  assert.true(endsWith('abc', 'a', true));
  assert.false(endsWith('abc', 'c', 'x'));
  assert.false(endsWith('abc', 'a', 'x'));

  if (!Symbol.sham) {
    const symbol = Symbol('endsWith test');
    assert.throws(() => endsWith(symbol, 'b'), 'throws on symbol context');
    assert.throws(() => endsWith('a', symbol), 'throws on symbol argument');
  }

  assert.throws(() => endsWith(null, '.'), TypeError);
  assert.throws(() => endsWith(undefined, '.'), TypeError);

  const regexp = /./;
  assert.throws(() => endsWith('/./', regexp), TypeError);
  regexp[Symbol.match] = false;
  assert.notThrows(() => endsWith('/./', regexp));
  const object = {};
  assert.notThrows(() => endsWith('[object Object]', object));
  object[Symbol.match] = true;
  assert.throws(() => endsWith('[object Object]', object), TypeError);
});
