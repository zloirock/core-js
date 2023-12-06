import Symbol from '@core-js/pure/es/symbol';
import includes from '@core-js/pure/es/string/includes';

QUnit.test('String#includes', assert => {
  assert.isFunction(includes);
  assert.false(includes('abc'));
  assert.true(includes('aundefinedb'));
  assert.true(includes('abcd', 'b', 1));
  assert.false(includes('abcd', 'b', 2));

  if (!Symbol.sham) {
    const symbol = Symbol('includes test');
    assert.throws(() => includes(symbol, 'b'), 'throws on symbol context');
    assert.throws(() => includes('a', symbol), 'throws on symbol argument');
  }

  assert.throws(() => includes(null, '.'), TypeError);
  assert.throws(() => includes(undefined, '.'), TypeError);

  const re = /./;
  assert.throws(() => includes('/./', re), TypeError);
  re[Symbol.match] = false;
  assert.notThrows(() => includes('/./', re));
  const O = {};
  assert.notThrows(() => includes('[object Object]', O));
  O[Symbol.match] = true;
  assert.throws(() => includes('[object Object]', O), TypeError);
});
