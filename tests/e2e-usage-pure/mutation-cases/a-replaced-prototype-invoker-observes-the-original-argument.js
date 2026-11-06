import { restoreProperty } from '../../helpers/restore-property.cjs';
/* eslint-disable no-extend-native -- Mutation sources under test. */
QUnit.test('consumed parameters: a replaced prototype invoker observes the original argument', assert => {
  function read([{ from } = Array]) { return from; }
  const descriptor = Object.getOwnPropertyDescriptor(Function.prototype, 'apply');
  let result;
  try {
    Function.prototype.apply = function (receiver, args) { return args[0][0] === Array; };
    result = read.apply(null, [[Array]]);
  } finally {
    restoreProperty(Function.prototype, 'apply', descriptor);
  }
  assert.same(result, true);
});
