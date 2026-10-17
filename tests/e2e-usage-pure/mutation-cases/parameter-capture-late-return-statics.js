import { restoreProperty } from '../../helpers/restore-property.cjs';

QUnit.test('parameter capture: late iterator return keeps static methods available', assert => {
  const events = [];
  const nativeArray = Function('return Array')();
  const iteratorPrototype = Object.getPrototypeOf([][Symbol.iterator]());
  const previousReturn = Object.getOwnPropertyDescriptor(iteratorPrototype, 'return');
  const previousSibling = Object.getOwnPropertyDescriptor(nativeArray, 'fc551ParameterSibling');
  restoreProperty(nativeArray, 'fc551ParameterSibling', {
    configurable: true,
    get() {
      events.push('sibling');
      Object.defineProperty(Object.getPrototypeOf([][Symbol.iterator]()), 'return', {
        configurable: true,
        get() {
          events.push('return');
          return function () {
            events.push('close');
            return { done: true };
          };
        },
      });
      return 17;
    },
  });
  try {
    function read([{ of, [(events.push('key'), 'from')]: from, length, fc551ParameterSibling: sibling }] = [Array]) {
      return [of(3)[0], from([4])[0], length, sibling];
    }
    assert.deepEqual(read(), [3, 4, 1, 17]);
    assert.deepEqual(events.slice(0, 2), ['key', 'sibling']);
  } finally {
    restoreProperty(iteratorPrototype, 'return', previousReturn);
    restoreProperty(nativeArray, 'fc551ParameterSibling', previousSibling);
  }
});
