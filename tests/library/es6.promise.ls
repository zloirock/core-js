'use strict'
{module, test} = QUnit
module \ES6

global = Function('return this')!
MODERN = (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!
STRICT = !(-> @)!

{Promise, Symbol} = core
{iterator} = Symbol

test 'Promise' (assert)!->
  assert.isFunction Promise
  assert.throws (!-> Promise!), 'throws w/o `new`'
  new Promise (resolve, reject)!->
    assert.isFunction Promise, 'resolver is function'
    assert.isFunction Promise, 'rejector is function'
    assert.same @, (if STRICT => void else global), 'correct executor context'

# related https://github.com/zloirock/core-js/issues/78
if MODERN => test 'Promise operations order' !(assert)->
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
  setTimeout 1e3, !-> if ~result.indexOf(\C) => assert.same result, expected

test 'Promise#then' (assert)!->
  assert.isFunction Promise::then

test 'Promise#catch' (assert)!->
  assert.isFunction Promise::catch

test 'Promise#@@toStringTag' (assert)!->
  assert.ok Promise::[Symbol.toStringTag] is \Promise, 'Promise::@@toStringTag is `Promise`'

test 'Promise.all' (assert)!->
  assert.isFunction Promise.all
  # works with iterables
  passed = no
  iter = createIterable [1 2 3]
  Promise.all iter .catch ->
  assert.ok iter.received, 'works with iterables: iterator received'
  assert.ok iter.called, 'works with iterables: next called'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a['@@iterator'] = void
  a[iterator] = ->
    done := on
    core.getIteratorMethod([])call @
  Promise.all a
  assert.ok done

test 'Promise.race' (assert)!->
  assert.isFunction Promise.race
  # works with iterables
  passed = no
  iter = createIterable [1 2 3]
  Promise.race iter .catch ->
  assert.ok iter.received, 'works with iterables: iterator received'
  assert.ok iter.called, 'works with iterables: next called'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a['@@iterator'] = void
  a[iterator] = ->
    done := on
    getIteratorMethod([])call @
  Promise.race a
  assert.ok done

test 'Promise.resolve' (assert)!->
  assert.isFunction Promise.resolve

test 'Promise.reject' (assert)!->
  assert.isFunction Promise.reject

if core.Object.setPrototypeOf
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
