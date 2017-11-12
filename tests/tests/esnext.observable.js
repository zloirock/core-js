import { STRICT } from '../helpers/constants';

QUnit.test('Observable', function (assert) {
  assert.isFunction(Observable);
  assert.arity(Observable, 1);
  assert.name(Observable, 'Observable');
  assert.looksNative(Observable);
  assert['throws'](function () {
    Observable(function () { /* empty */ });
  }, 'throws w/o `new`');
  var obsevable = new Observable(function (subscriptionObserver) {
    assert.same(typeof subscriptionObserver, 'object', 'Subscription observer is object');
    assert.same(subscriptionObserver.constructor, Object);
    var next = subscriptionObserver.next;
    var error = subscriptionObserver.error;
    var complete = subscriptionObserver.complete;
    assert.isFunction(next);
    assert.isFunction(error);
    assert.isFunction(complete);
    assert.arity(next, 1);
    assert.arity(error, 1);
    assert.arity(complete, 1);
    if (STRICT) {
      assert.same(this, undefined, 'correct executor context');
    }
  });
  obsevable.subscribe({});
  assert.ok(obsevable instanceof Observable);
});

QUnit.test('Observable#subscribe', function (assert) {
  assert.isFunction(Observable.prototype.subscribe);
  assert.arity(Observable.prototype.subscribe, 1);
  assert.name(Observable.prototype.subscribe, 'subscribe');
  assert.looksNative(Observable.prototype.subscribe);
  var subscription = new Observable(function () { /* empty */ }).subscribe({});
  assert.same(typeof subscription, 'object', 'Subscription is object');
  assert.same(subscription.constructor, Object);
  assert.isFunction(subscription.unsubscribe);
  assert.arity(subscription.unsubscribe, 0);
});

QUnit.test('Observable#forEach', function (assert) {
  assert.isFunction(Observable.prototype.forEach);
  assert.arity(Observable.prototype.forEach, 1);
  assert.name(Observable.prototype.forEach, 'forEach');
  assert.looksNative(Observable.prototype.forEach);
  assert.ok(new Observable(function () { /* empty */ }).forEach(function () { /* empty */ }) instanceof Promise, 'returns Promise');
});

QUnit.test('Observable#constructor', function (assert) {
  assert.same(Observable.prototype.constructor, Observable);
});

QUnit.test('Observable#@@observable', function (assert) {
  assert.isFunction(Observable.prototype[Symbol.observable]);
  var observable = new Observable(function () { /* empty*/ });
  assert.same(observable[Symbol.observable](), observable);
});

QUnit.test('Observable.of', function (assert) {
  assert.isFunction(Observable.of);
  assert.arity(Observable.of, 0);
  assert.name(Observable.of, 'of');
  assert.looksNative(Observable.of);
});

QUnit.test('Observable.from', function (assert) {
  assert.isFunction(Observable.from);
  assert.arity(Observable.from, 1);
  assert.name(Observable.from, 'from');
  assert.looksNative(Observable.from);
});
