import Promise from '@core-js/pure/es/promise';
import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Promise.reject', assert => {
  const { reject } = Promise;
  assert.isFunction(reject);
  assert.throws(() => {
    reject.call(null, 1).catch(() => { /* empty */ });
  }, TypeError, 'throws without context');
  function FakePromise1(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  assert.true(reject.call(FakePromise1, 42) instanceof FakePromise1, 'subclassing, `this` pattern');
  assert.throws(() => {
    reject.call(() => { /* empty */ }, 42);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    reject.call(executor => {
      executor(null, () => { /* empty */ });
    }, 42);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    reject.call(executor => {
      executor(() => { /* empty */ }, null);
    }, 42);
  }, 'NewPromiseCapability validations, #3');
});
