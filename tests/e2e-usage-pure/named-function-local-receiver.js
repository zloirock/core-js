/* eslint-disable no-shadow, no-var, unicorn/consistent-function-style -- locals shadow a function expression's name */

QUnit.test('a local receiver shadows its named function expression', assert => {
  const read = function value(input) {
    var value = input;
    return value.at(-1);
  };
  assert.same(read(['array']), 'array');
  assert.same(read('string'), 'g');
});

QUnit.test('a shadowing receiver is captured before its getter changes the binding', assert => {
  const read = function value() {
    var value = ['held'];
    Object.defineProperty(value, 'at', {
      get() {
        value = ['changed'];
        return function (index) { return this[index]; };
      },
    });
    return [value.at(0), value[0]];
  };
  assert.deepEqual(read(), ['held', 'changed']);
});

QUnit.test('a shadowing receiver is captured before argument reassignment', assert => {
  const read = function value() {
    var value = ['held'];
    const first = value;
    const size = value.push((value = ['changed'])[0]);
    return [first, value, size];
  };
  assert.deepEqual(read(), [['held', 'changed'], ['changed'], 2]);
});
