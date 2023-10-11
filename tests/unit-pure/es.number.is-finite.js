import create from '@core-js/pure/es/object/create';
import isFinite from '@core-js/pure/es/number/is-finite';

QUnit.test('Number.isFinite', assert => {
  assert.isFunction(isFinite);
  const finite = [
    1,
    0.1,
    -1,
    2 ** 16,
    2 ** 16 - 1,
    2 ** 31,
    2 ** 31 - 1,
    2 ** 32,
    2 ** 32 - 1,
    -0,
  ];
  for (const value of finite) {
    assert.true(isFinite(value), `isFinite ${ typeof value } ${ value }`);
  }
  const notFinite = [
    NaN,
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
  for (const value of notFinite) {
    assert.false(isFinite(value), `not isFinite ${ typeof value } ${ value }`);
  }
  assert.false(isFinite(create(null)), 'Number.isFinite(Object.create(null)) -> false');
});
