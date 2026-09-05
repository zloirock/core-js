import getName from '@core-js/pure/es/function/name';

QUnit.test('Function#name', assert => {
  assert.isFunction(getName);
  function foo() { /* empty */ }
  assert.same(getName(foo), 'foo', 'named function');
  // eslint-disable-next-line prefer-arrow-callback -- required
  assert.same(getName(function () { /* empty */ }), '', 'anonymous function');
  // eslint-disable-next-line prefer-arrow-callback -- required
  assert.same(getName(function bar() { /* empty */ }), 'bar', 'named function expression');
  function baz() { /* empty */ }
  baz.toString = function () {
    throw new Error();
  };
  assert.notThrows(() => getName(baz) === 'baz', 'works with redefined `.toString`');
  const qux = Object(() => { /* empty */ });
  qux.toString = function () {
    return '';
  };
  assert.same(getName(qux), '', 'empty `.toString`');
});
