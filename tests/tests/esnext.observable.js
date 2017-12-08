import { STRICT } from '../helpers/constants';

QUnit.test('Observable', assert => {
  assert.isFunction(Observable);
  assert.arity(Observable, 1);
  assert.name(Observable, 'Observable');
  assert.looksNative(Observable);
  assert.throws(() => {
    Observable(() => { /* empty */ });
  }, 'throws w/o `new`');
  const observable = new Observable(function (subscriptionObserver) {
    assert.same(typeof subscriptionObserver, 'object', 'Subscription observer is object');
    assert.same(subscriptionObserver.constructor, Object);
    const { next, error, complete } = subscriptionObserver;
    assert.isFunction(next);
    assert.isFunction(error);
    assert.isFunction(complete);
    assert.arity(next, 1);
    assert.arity(error, 1);
    assert.arity(complete, 0);
    if (STRICT) {
      assert.same(this, undefined, 'correct executor context');
    }
  });
  observable.subscribe({});
  assert.ok(observable instanceof Observable);
});

QUnit.test('Observable#subscribe', assert => {
  assert.isFunction(Observable.prototype.subscribe);
  assert.arity(Observable.prototype.subscribe, 1);
  assert.name(Observable.prototype.subscribe, 'subscribe');
  assert.looksNative(Observable.prototype.subscribe);
  const subscription = new Observable(() => { /* empty */ }).subscribe({});
  assert.same(typeof subscription, 'object', 'Subscription is object');
  assert.same(subscription.constructor, Object);
  assert.isFunction(subscription.unsubscribe);
  assert.arity(subscription.unsubscribe, 0);
});

QUnit.test('Observable#constructor', assert => {
  assert.same(Observable.prototype.constructor, Observable);
});

QUnit.test('Observable#@@observable', assert => {
  assert.isFunction(Observable.prototype[Symbol.observable]);
  const observable = new Observable(() => { /* empty*/ });
  assert.same(observable[Symbol.observable](), observable);
});

QUnit.test('Observable.of', assert => {
  assert.isFunction(Observable.of);
  assert.arity(Observable.of, 0);
  assert.name(Observable.of, 'of');
  assert.looksNative(Observable.of);
});

QUnit.test('Observable.from', assert => {
  assert.isFunction(Observable.from);
  assert.arity(Observable.from, 1);
  assert.name(Observable.from, 'from');
  assert.looksNative(Observable.from);
});
