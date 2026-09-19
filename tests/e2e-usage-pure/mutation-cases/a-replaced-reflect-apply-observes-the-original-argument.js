import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('consumed parameters: a replaced Reflect.apply observes the original argument', assert => {
  function read([{ from } = Array]) { return from; }
  const descriptor = Object.getOwnPropertyDescriptor(Reflect, 'apply');
  let result;
  try {
    Reflect.apply = function (fn, receiver, args) { return args[0][0] === Array; };
    result = Reflect.apply(read, null, [[Array]]);
  } finally {
    restoreProperty(Reflect, 'apply', descriptor);
  }
  assert.same(result, true);
});
