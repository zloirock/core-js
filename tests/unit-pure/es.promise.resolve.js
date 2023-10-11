import Promise from '@core-js/pure/es/promise';
import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Promise.resolve', assert => {
  const { resolve } = Promise;
  assert.isFunction(resolve);
  assert.throws(() => {
    resolve.call(null, 1).catch(() => { /* empty */ });
  }, TypeError, 'throws without context');
  function FakePromise1(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  assert.true(resolve.call(FakePromise1, 42) instanceof FakePromise1, 'subclassing, `this` pattern');
  assert.throws(() => {
    resolve.call(() => { /* empty */ }, 42);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    resolve.call(executor => {
      executor(null, () => { /* empty */ });
    }, 42);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    resolve.call(executor => {
      executor(() => { /* empty */ }, null);
    }, 42);
  }, 'NewPromiseCapability validations, #3');
});
