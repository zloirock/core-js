import isInteger from 'core-js-pure/full/number/is-integer';
import create from 'core-js-pure/full/object/create';

QUnit.test('Number.isInteger', assert => {
  assert.isFunction(isInteger);
  const integers = [
    1,
    -1,
    2 ** 16,
    2 ** 16 - 1,
    2 ** 31,
    2 ** 31 - 1,
    2 ** 32,
    2 ** 32 - 1,
    -0,
  ];
  for (const value of integers) {
    assert.ok(isInteger(value), `isInteger ${ typeof value } ${ value }`);
  }
  const notIntegers = [
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
  for (const value of notIntegers) {
    assert.ok(!isInteger(value), `not isInteger ${ typeof value } ${ value }`);
  }
  assert.ok(!isInteger(create(null)), 'Number.isInteger(Object.create(null)) -> false');
});
