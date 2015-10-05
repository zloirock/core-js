{module, test} = QUnit
module \ES6

{iterator} = Symbol

test 'Promise' (assert)->
  assert.isFunction Promise
  assert.arity Promise, 1
  assert.name Promise, \Promise
  assert.looksNative Promise

test 'Promise#then' (assert)->
  assert.isFunction Promise::then
  assert.arity Promise::then, 2
  assert.name Promise::then, \then
  assert.looksNative Promise::then

test 'Promise#catch' (assert)->
  assert.isFunction Promise::catch
  assert.arity Promise::catch, 1
  #assert.name Promise::catch, \catch # can't be polyfilled in some environments
  assert.looksNative Promise::then

test 'Promise#@@toStringTag' (assert)->
  assert.ok Promise::[Symbol.toStringTag] is \Promise, 'Promise::@@toStringTag is `Promise`'

test 'Promise.all' (assert)->
  assert.isFunction Promise.all
  assert.arity Promise.all, 1
  assert.name Promise.all, \all
  assert.looksNative Promise.all
  # works with iterables
  passed = no
  iter = [1 2 3].values!
  next = iter~next
  iter.next = ->
    passed := on
    next!
  Promise.all iter .catch ->
  assert.ok passed, 'works with iterables'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[iterator] = ->
    done := on
    [][iterator]call @
  Promise.all a
  assert.ok done

test 'Promise.race' (assert)->
  assert.isFunction Promise.race
  assert.arity Promise.race, 1
  assert.name Promise.race, \race
  assert.looksNative Promise.race
  # works with iterables
  passed = no
  iter = [1 2 3].values!
  next = iter~next
  iter.next = ->
    passed := on
    next!
  Promise.race iter .catch ->
  assert.ok passed, 'works with iterables'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a[iterator] = ->
    done := on
    [][iterator]call @
  Promise.race a
  assert.ok done

test 'Promise.resolve' (assert)->
  assert.isFunction Promise.resolve
  assert.arity Promise.resolve, 1
  assert.name Promise.resolve, \resolve
  assert.looksNative Promise.resolve

test 'Promise.reject' (assert)->
  assert.isFunction Promise.reject
  assert.arity Promise.reject, 1
  assert.name Promise.reject, \reject
  assert.looksNative Promise.reject

if Object.setPrototypeOf
  test 'Promise subclassing' (assert)->
    # this is ES5 syntax to create a valid ES6 subclass
    SubPromise = ->
      self = new Promise it
      Object.setPrototypeOf self, SubPromise::
      self.mine = 'subclass'
      self
    Object.setPrototypeOf SubPromise, Promise
    SubPromise:: = Object.create Promise::
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
