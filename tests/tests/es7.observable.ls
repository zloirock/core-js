'use strict'
{module, test} = QUnit
module 'ESNext'

test \Observable (assert)!->
  assert.isFunction Observable
  assert.arity Observable, 1
  assert.name Observable, \Observable
  assert.looksNative Observable
  assert.throws (!-> Observable ->), 'throws w/o `new`'
  obsevable = new Observable (subscriptionObserver)!->
    assert.same typeof subscriptionObserver, \object, 'Subscription observer is object'
    assert.same subscriptionObserver@@, Object
    {next, error, complete} = subscriptionObserver
    assert.isFunction next
    assert.isFunction error
    assert.isFunction complete
    assert.name next, \next
    assert.name error, \error
    assert.name complete, \complete
    assert.arity next, 1
    assert.arity error, 1
    assert.arity complete, 1
    assert.looksNative next
    assert.looksNative error
    assert.looksNative complete
    if STRICT
      assert.same @, (-> @)!, 'correct executor context'
  obsevable.subscribe({})
  assert.ok obsevable instanceof Observable

test 'Observable#subscribe' (assert)!->
  assert.isFunction Observable::subscribe
  assert.arity Observable::subscribe, 1
  assert.name Observable::subscribe, \subscribe
  assert.looksNative Observable::subscribe
  subscription = new Observable(!->).subscribe({})
  assert.same typeof subscription, \object, 'Subscription is object'
  assert.same subscription@@, Object
  assert.isFunction subscription.unsubscribe
  assert.arity subscription.unsubscribe, 0
  assert.name subscription.unsubscribe, \unsubscribe
  assert.looksNative subscription.unsubscribe

test 'Observable#forEach' (assert)!->
  assert.isFunction Observable::forEach
  assert.arity Observable::forEach, 1
  assert.name Observable::forEach, \forEach
  assert.looksNative Observable::forEach
  assert.ok new Observable(!->).forEach(!->) instanceof Promise, 'returns Promise'

test 'Observable#constructor' (assert)!->
  assert.same Observable::@@, Observable

test 'Observable#@@observable' (assert)!->
  assert.isFunction Observable::[Symbol.observable]
  observable = new Observable !->
  assert.same observable[Symbol.observable]!, observable

test 'Observable.of' (assert)!->
  assert.isFunction Observable.of
  assert.arity Observable.of, 0
  assert.name Observable.of, \of
  assert.looksNative Observable.of

test 'Observable.from' (assert)!->
  assert.isFunction Observable.from
  assert.arity Observable.from, 1
  assert.name Observable.from, \from
  assert.looksNative Observable.from