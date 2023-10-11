import { STRICT } from '../helpers/constants.js';

import Symbol from '@core-js/pure/full/symbol';
import Observable from '@core-js/pure/full/observable';

QUnit.test('Observable', assert => {
  assert.isFunction(Observable);
  assert.arity(Observable, 1);
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
  assert.true(observable instanceof Observable);
  // eslint-disable-next-line sonarjs/inconsistent-function-call -- required for testing
  assert.throws(() => Observable(() => { /* empty */ }), 'throws w/o `new`');
});

QUnit.test('Observable#subscribe', assert => {
  assert.isFunction(Observable.prototype.subscribe);
  assert.arity(Observable.prototype.subscribe, 1);
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
