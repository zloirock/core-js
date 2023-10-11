import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from '../helpers/constants.js';

import isSafeInteger from '@core-js/pure/es/number/is-safe-integer';

const { create } = Object;

QUnit.test('Number.isSafeInteger', assert => {
  assert.isFunction(isSafeInteger);
  const safeIntegers = [
    1,
    -1,
    2 ** 16,
    2 ** 16 - 1,
    2 ** 31,
    2 ** 31 - 1,
    2 ** 32,
    2 ** 32 - 1,
    -0,
    MAX_SAFE_INTEGER,
    MIN_SAFE_INTEGER,
  ];
  for (const value of safeIntegers) {
    assert.true(isSafeInteger(value), `isSafeInteger ${ typeof value } ${ value }`);
  }
  const notSafeIntegers = [
    MAX_SAFE_INTEGER + 1,
    MIN_SAFE_INTEGER - 1,
    NaN,
    0.1,
    Infinity,
    'NaN',
    '5',
    false,
    new Number(NaN),
    new Number(Infinity),
    new Number(5),
    new Number(0.1),
    undefined,
    null,
    {},
    function () { /* empty */ },
  ];
  for (const value of notSafeIntegers) {
    assert.false(isSafeInteger(value), `not isSafeInteger ${ typeof value } ${ value }`);
  }
  assert.false(isSafeInteger(create(null)), 'Number.isSafeInteger(Object.create(null)) -> false');
});
