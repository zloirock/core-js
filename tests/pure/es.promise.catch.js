import { Promise, Symbol } from 'core-js-pure';

QUnit.test('Promise#catch', assert => {
  assert.isFunction(Promise.prototype.catch);
  assert.nonEnumerable(Promise.prototype, 'catch');
  let promise = new Promise(resolve => {
    resolve(42);
  });
  let FakePromise1 = promise.constructor = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  const FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  assert.ok(promise.catch(() => { /* empty */ }) instanceof FakePromise2, 'subclassing, @@species pattern');
  promise = new Promise(resolve => {
    resolve(42);
  });
  promise.constructor = FakePromise1 = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  assert.ok(promise.catch(() => { /* empty */ }) instanceof Promise, 'subclassing, incorrect `this` pattern');
  promise = new Promise(resolve => {
    resolve(42);
  });
  promise.constructor = FakePromise1 = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  FakePromise1[Symbol.species] = function () { /* empty */ };
  assert.throws(() => {
    promise.catch(() => { /* empty */ });
  }, 'NewPromiseCapability validations, #1');
  FakePromise1[Symbol.species] = function (executor) {
    executor(null, () => { /* empty */ });
  };
  assert.throws(() => {
    promise.catch(() => { /* empty */ });
  }, 'NewPromiseCapability validations, #2');
  FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, null);
  };
  assert.throws(() => {
    promise.catch(() => { /* empty */ });
  }, 'NewPromiseCapability validations, #3');
  assert.same(Promise.prototype.catch.call({
    then(x, y) {
      return y;
    },
  }, 42), 42, 'calling `.then`');
});
