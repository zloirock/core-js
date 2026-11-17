// eslint-disable-next-line no-var, no-underscore-dangle -- a mutable generated-looking import exercises reassignment detection
var _ref = require('@core-js/pure/actual/array/instance/at');

const effects = [];
function replacement() {
  effects.push('write');
  return () => () => 99;
}
function use(value) {
  effects.push('use');
  return value;
}
use(_ref = replacement());

QUnit.test('a reassigned generated-looking import is not reused', assert => {
  assert.same([7].at(0), 7);
  assert.same(_ref()(), 99);
  assert.deepEqual(effects, ['write', 'use']);
});
