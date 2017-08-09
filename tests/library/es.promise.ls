'use strict'
{module, test} = QUnit
module \ES

{Promise, Symbol} = core
{iterator} = Symbol

test 'Promise' (assert)!->
  assert.isFunction Promise
  assert.throws (!-> Promise!), 'throws w/o `new`'
  new Promise (resolve, reject)!->
    assert.isFunction Promise, 'resolver is function'
    assert.isFunction Promise, 'rejector is function'
    assert.same @, (-> @)!, 'correct executor context'

# related https://github.com/zloirock/core-js/issues/78
if DESCRIPTORS => test 'Promise operations order' (assert)!->
  assert.expect 1
  expected = \DEHAFGBC
  async = assert.async!
  result = ''
  var resolve
  p = new Promise (r)!-> resolve := r
  resolve then: !->
    result += \A
    throw Error!
  p.catch !-> result += \B
  p.catch !->
    result += \C
    assert.same result, expected
    async!
  var resolve2
  p2 = new Promise (r)!-> resolve2 := r
  resolve2 Object.defineProperty {}, \then, get: !->
    result += \D
    throw Error!
  result += \E
  p2.catch !-> result += \F
  p2.catch !-> result += \G
  result += \H
  setTimeout (!-> if ~result.indexOf(\C) => assert.same result, expected), 1e3

test 'Promise#then' (assert)!->
  assert.isFunction Promise::then
  assert.nonEnumerable Promise::, \then
  # subclassing, @@species pattern
  promise = new Promise !-> it 42
  promise@@ = FakePromise1 = !-> it ->, ->
  FakePromise1[Symbol?species] = FakePromise2 = !-> it ->, ->
  assert.ok promise.then(->) instanceof FakePromise2, 'subclassing, @@species pattern'
  # subclassing, incorrect `this.constructor` pattern
  promise = new Promise !-> it 42
  promise@@ = FakePromise1 = !-> it ->, ->
  assert.ok promise.then(->) instanceof Promise, 'subclassing, incorrect `this` pattern'
  # NewPromiseCapability validations
  promise = new Promise !-> it 42
  promise@@ = FakePromise1 = !-> it ->, ->
  FakePromise1[Symbol?species] = !->
  assert.throws (!-> promise.then(->)), 'NewPromiseCapability validations, #1'
  FakePromise1[Symbol?species] = !-> it null, ->
  assert.throws (!-> promise.then(->)), 'NewPromiseCapability validations, #2'
  FakePromise1[Symbol?species] = !-> it ->, null
  assert.throws (!-> promise.then(->)), 'NewPromiseCapability validations, #3'


test 'Promise#catch' (assert)!->
  assert.isFunction Promise::catch
  assert.nonEnumerable Promise::, \catch
  # subclassing, @@species pattern
  promise = new Promise !-> it 42
  promise@@ = FakePromise1 = !-> it ->, ->
  FakePromise1[Symbol?species] = FakePromise2 = !-> it ->, ->
  assert.ok promise.catch(->) instanceof FakePromise2, 'subclassing, @@species pattern'
  # subclassing, incorrect `this.constructor` pattern
  promise = new Promise !-> it 42
  promise@@ = FakePromise1 = !-> it ->, ->
  assert.ok promise.catch(->) instanceof Promise, 'subclassing, incorrect `this` pattern'
  # NewPromiseCapability validations
  promise = new Promise !-> it 42
  promise@@ = FakePromise1 = !-> it ->, ->
  FakePromise1[Symbol?species] = !->
  assert.throws (!-> promise.catch(->)), 'NewPromiseCapability validations, #1'
  FakePromise1[Symbol?species] = !-> it null, ->
  assert.throws (!-> promise.catch(->)), 'NewPromiseCapability validations, #2'
  FakePromise1[Symbol?species] = !-> it ->, null
  assert.throws (!-> promise.catch(->)), 'NewPromiseCapability validations, #3'
  # calling `.then`
  assert.same Promise::catch.call({then: (x, y)-> y }, 42), 42, 'calling `.then`'

test 'Promise#@@toStringTag' !(assert)->
  #assert.nonEnumerable Promise::, Symbol?toStringTag
  assert.ok Promise::[Symbol?toStringTag] is \Promise, 'Promise::@@toStringTag is `Promise`'

test 'Promise.all' (assert)!->
  {all} = Promise
  assert.isFunction all
  assert.arity all, 1
  # works with iterables
  iter = createIterable [1 2 3]
  Promise.all iter .catch ->
  assert.ok iter.received, 'works with iterables: iterator received'
  assert.ok iter.called, 'works with iterables: next called'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a['@@iterator'] = void
  a[Symbol?iterator] = ->
    done := on
    core.getIteratorMethod([])call @
  Promise.all a
  assert.ok done
  assert.throws (!-> all.call(null, []).catch !->), TypeError, 'throws without context'
  # iteration closing
  done = no
  {resolve} = Promise
  try
    Promise.resolve = !-> throw 42
    Promise.all(createIterable [1 2 3], return: !-> done := on)catch !->
  Promise.resolve = resolve
  assert.ok done, 'iteration closing'
  # subclassing, `this` pattern
  FakePromise1 = !-> it ->, ->
  FakePromise1[Symbol?species] = FakePromise2 = !-> it ->, ->
  FakePromise1.resolve = FakePromise2.resolve = Promise~resolve
  assert.ok all.call(FakePromise1, [1 2 3]) instanceof FakePromise1, 'subclassing, `this` pattern'
  # NewPromiseCapability validations
  FakePromise1 = !->
  FakePromise2 = !-> it null, ->
  FakePromise3 = !-> it ->, null
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = Promise~resolve
  assert.throws (!-> all.call(FakePromise1, [1 2 3])), 'NewPromiseCapability validations, #1'
  assert.throws (!-> all.call(FakePromise2, [1 2 3])), 'NewPromiseCapability validations, #2'
  assert.throws (!-> all.call(FakePromise3, [1 2 3])), 'NewPromiseCapability validations, #3'

test 'Promise.race' (assert)!->
  {race} = Promise
  assert.isFunction race
  assert.arity race, 1
  # works with iterables
  iter = createIterable [1 2 3]
  Promise.race iter .catch ->
  assert.ok iter.received, 'works with iterables: iterator received'
  assert.ok iter.called, 'works with iterables: next called'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a['@@iterator'] = void
  a[Symbol?iterator] = ->
    done := on
    core.getIteratorMethod([])call @
  Promise.race a
  assert.ok done
  assert.throws (!-> race.call(null, []).catch !->), TypeError, 'throws without context'
  # iteration closing
  done = no
  {resolve} = Promise
  try
    Promise.resolve = !-> throw 42
    Promise.race(createIterable [1 2 3], return: !-> done := on)catch !->
  Promise.resolve = resolve
  assert.ok done, 'iteration closing'
  # subclassing, `this` pattern
  FakePromise1 = !-> it ->, ->
  FakePromise1[Symbol?species] = FakePromise2 = !-> it ->, ->
  FakePromise1.resolve = FakePromise2.resolve = Promise~resolve
  assert.ok race.call(FakePromise1, [1 2 3]) instanceof FakePromise1, 'subclassing, `this` pattern'
  # NewPromiseCapability validations
  FakePromise1 = !->
  FakePromise2 = !-> it null, ->
  FakePromise3 = !-> it ->, null
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = Promise~resolve
  assert.throws (!-> race.call(FakePromise1, [1 2 3])), 'NewPromiseCapability validations, #1'
  assert.throws (!-> race.call(FakePromise2, [1 2 3])), 'NewPromiseCapability validations, #2'
  assert.throws (!-> race.call(FakePromise3, [1 2 3])), 'NewPromiseCapability validations, #3'

test 'Promise.resolve' (assert)!->
  {resolve} = Promise
  assert.isFunction resolve
  assert.throws (!-> resolve.call(null, 1).catch !->), TypeError, 'throws without context'
  # subclassing, `this` pattern
  FakePromise1 = !-> it ->, ->
  FakePromise1[Symbol?species] = FakePromise2 = !-> it ->, ->
  assert.ok resolve.call(FakePromise1, 42) instanceof FakePromise1, 'subclassing, `this` pattern'
  # NewPromiseCapability validations
  assert.throws (!-> resolve.call(!->, 42)), 'NewPromiseCapability validations, #1'
  assert.throws (!-> resolve.call((!-> it null, ->), 42)), 'NewPromiseCapability validations, #2'
  assert.throws (!-> resolve.call((!-> it ->, null), 42)), 'NewPromiseCapability validations, #3'

test 'Promise.reject' (assert)!->
  {reject} = Promise
  assert.isFunction reject
  assert.throws (!-> reject.call(null, 1).catch !->), TypeError, 'throws without context'
  # subclassing, `this` pattern
  FakePromise1 = !-> it ->, ->
  FakePromise1[Symbol?species] = FakePromise2 = !-> it ->, ->
  assert.ok reject.call(FakePromise1, 42) instanceof FakePromise1, 'subclassing, `this` pattern'
  # NewPromiseCapability validations
  assert.throws (!-> reject.call(!->, 42)), 'NewPromiseCapability validations, #1'
  assert.throws (!-> reject.call((!-> it null, ->), 42)), 'NewPromiseCapability validations, #2'
  assert.throws (!-> reject.call((!-> it ->, null), 42)), 'NewPromiseCapability validations, #3'

if PROTO
  test 'Promise subclassing' (assert)!->
    # this is ES5 syntax to create a valid ES6 subclass
    SubPromise = ->
      self = new Promise it
      core.Object.setPrototypeOf self, SubPromise::
      self.mine = 'subclass'
      self
    core.Object.setPrototypeOf SubPromise, Promise
    SubPromise:: = core.Object.create Promise::
    SubPromise::@@ = SubPromise
    # now let's see if this works like a proper subclass.
    p1 = SubPromise.resolve 5
    assert.strictEqual p1.mine, 'subclass'
    p1 = p1.then -> assert.strictEqual it, 5
    assert.strictEqual p1.mine, 'subclass'
    p2 = new SubPromise -> it 6
    assert.strictEqual p2.mine, 'subclass'
    p2 = p2.then -> assert.strictEqual it, 6
    assert.strictEqual p2.mine, 'subclass'
    p3 = SubPromise.all [p1, p2]
    assert.strictEqual p3.mine, 'subclass'
    # double check
    assert.ok p3 instanceof Promise
    assert.ok p3 instanceof SubPromise
    # check the async values
    p3.then assert.async!, -> assert.ok it, no

test 'Unhandled rejection tracking' (assert)!->
  done = no
  start = assert.async!
  if process?
    assert.expect 3
    process.on \unhandledRejection, onunhandledrejection = (reason, promise)!->
      process.removeListener \unhandledRejection, onunhandledrejection
      assert.same promise, $promise, 'unhandledRejection, promise'
      assert.same reason, 42, 'unhandledRejection, reason'
      $promise.catch ->
    process.on \rejectionHandled, onrejectionhandled = (promise)!->
      process.removeListener \rejectionHandled, onrejectionhandled
      assert.same promise, $promise, 'rejectionHandled, promise'
      done or start!
      done := on
  else
    assert.expect 4
    global.onunhandledrejection = !->
      assert.same it.promise, $promise, 'onunhandledrejection, promise'
      assert.same it.reason, 42, 'onunhandledrejection, reason'
      setTimeout (!-> $promise.catch ->), 1
      global.onunhandledrejection = null
    global.onrejectionhandled = !->
      assert.same it.promise, $promise, 'onrejectionhandled, promise'
      assert.same it.reason, 42, 'onrejectionhandled, reason'
      global.onrejectionhandled = null
      done or start!
      done := on
  Promise.reject(43).catch ->
  $promise = Promise.reject 42
  setTimeout (!->
    done or start!
    done := on
  ), 3e3