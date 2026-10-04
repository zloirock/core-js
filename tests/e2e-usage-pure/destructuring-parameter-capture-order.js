import { restoreProperty } from '../helpers/restore-property.cjs';
import './mutation-cases/parameter-capture-late-return-statics.js';

QUnit.test('parameter capture: an inner default retains repeated native siblings', assert => {
  const events = [];
  const realm = Function('return this')();
  const previous = Object.getOwnPropertyDescriptor(realm, 'fc551ParameterSibling');
  let reads = 0;
  restoreProperty(realm, 'fc551ParameterSibling', {
    configurable: true,
    get() {
      events.push('sibling');
      return ++reads;
    },
  });
  try {
    function read([{ Array: { of }, fc551ParameterSibling: first, fc551ParameterSibling: second } = globalThis]) {
      return [of(7)[0], first, second];
    }
    assert.deepEqual(read([]), [7, 1, 2]);
    assert.deepEqual(events, ['sibling', 'sibling']);
  } finally {
    restoreProperty(realm, 'fc551ParameterSibling', previous);
  }
});

// The native sibling follows the key while the preceding statics stay polyfilled.
QUnit.test('parameter capture: a nested literal default preserves native read order', assert => {
  const events = [];
  const nativeArray = Function('return Array')();
  const previous = Object.getOwnPropertyDescriptor(nativeArray, 'fc551ParameterSibling');
  restoreProperty(nativeArray, 'fc551ParameterSibling', {
    configurable: true,
    get() {
      events.push('sibling');
      return 17;
    },
  });
  try {
    function read({ w: { v: { Array: { of, [(events.push('key'), 'from')]: from, length, fc551ParameterSibling: sibling } } } } = { w: { v: globalThis } }) {
      return [of(4)[0], from([5])[0], length, sibling];
    }
    assert.deepEqual(read(), [4, 5, 1, 17]);
    assert.deepEqual(events, ['key', 'sibling']);
  } finally {
    restoreProperty(nativeArray, 'fc551ParameterSibling', previous);
  }
});

QUnit.test('parameter capture: a literal array default preserves native read order', assert => {
  const events = [];
  const nativeArray = Function('return Array')();
  const previous = Object.getOwnPropertyDescriptor(nativeArray, 'fc551ParameterSibling');
  restoreProperty(nativeArray, 'fc551ParameterSibling', {
    configurable: true,
    get() {
      events.push('sibling');
      return 17;
    },
  });
  try {
    function read([[{ of, [(events.push('key'), 'from')]: from, length, fc551ParameterSibling: sibling }]] = [[Array]]) {
      return [of(4)[0], from([5])[0], length, sibling];
    }
    assert.deepEqual(read(), [4, 5, 1, 17]);
    assert.deepEqual(events, ['key', 'sibling']);
  } finally {
    restoreProperty(nativeArray, 'fc551ParameterSibling', previous);
  }
});

QUnit.test('parameter capture: a closed supplied realm preserves native read order', assert => {
  const events = [];
  const nativeArray = Function('return Array')();
  const previous = Object.getOwnPropertyDescriptor(nativeArray, 'fc551ParameterSibling');
  restoreProperty(nativeArray, 'fc551ParameterSibling', {
    configurable: true,
    get() {
      events.push('sibling');
      return 17;
    },
  });
  try {
    function read({ w: [{ Array: { of, [(events.push('key'), 'from')]: from, length, fc551ParameterSibling: sibling } }] }) {
      return [of(4)[0], from([5])[0], length, sibling];
    }
    assert.deepEqual(read({ w: [globalThis] }), [4, 5, 1, 17]);
    assert.deepEqual(events, ['key', 'sibling']);
  } finally {
    restoreProperty(nativeArray, 'fc551ParameterSibling', previous);
  }
});
