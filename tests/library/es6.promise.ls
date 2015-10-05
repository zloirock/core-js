{module, test} = QUnit
module \ES6

{iterator} = core.Symbol

test 'Promise' (assert)->
  assert.isFunction core.Promise

test 'Promise#then' (assert)->
  assert.isFunction core.Promise::then

test 'Promise#catch' (assert)->
  assert.isFunction core.Promise::catch

test 'Promise#@@toStringTag' (assert)->
  assert.ok core.Promise::[core.Symbol.toStringTag] is \Promise, 'Promise::@@toStringTag is `Promise`'

test 'Promise.all' (assert)->
  assert.isFunction core.Promise.all
  # works with iterables
  passed = no
  iter = core.Array.values [1 2 3]
  next = iter~next
  iter.next = ->
    passed := on
    next!
  core.Promise.all iter .catch ->
  assert.ok passed, 'works with iterables'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a['@@iterator'] = void
  a[iterator] = ->
    done := on
    core.getIteratorMethod([])call @
  core.Promise.all a
  assert.ok done

test 'Promise.race' (assert)->
  assert.isFunction core.Promise.race
  # works with iterables
  passed = no
  iter = core.Array.values [1 2 3]
  next = iter~next
  iter.next = ->
    passed := on
    next!
  core.Promise.race iter .catch ->
  assert.ok passed, 'works with iterables'
  # call @@iterator in Array with custom iterator
  a = []
  done = no
  a['@@iterator'] = void
  a[iterator] = ->
    done := on
    core.getIteratorMethod([])call @
  core.Promise.race a
  assert.ok done

test 'Promise.resolve' (assert)->
  assert.isFunction core.Promise.resolve

test 'Promise.reject' (assert)->
  assert.isFunction core.Promise.reject

if core.Object.setPrototypeOf
  test 'Promise subclassing' (assert)->
    # this is ES5 syntax to create a valid ES6 subclass
    SubPromise = ->
      self = new core.Promise it
      core.Object.setPrototypeOf self, SubPromise::
      self.mine = 'subclass'
      self
    core.Object.setPrototypeOf SubPromise, core.Promise
    SubPromise:: = core.Object.create core.Promise::
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
    assert.ok p3 instanceof core.Promise
    assert.ok p3 instanceof SubPromise
    # check the async values
    p3.then assert.async!, -> assert.ok it, no
