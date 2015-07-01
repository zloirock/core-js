QUnit.module \ES6
isFunction = -> typeof! it is \Function
test 'Promise' !->
  ok isFunction(core.Promise), 'Is function'
test 'Promise#then' !->
  ok isFunction(core.Promise::then), 'Is function'
test 'Promise#catch' !->
  ok isFunction(core.Promise::catch), 'Is function'
test 'Promise#@@toStringTag' !->
  ok core.Promise::[core.Symbol.toStringTag] is \Promise, 'Promise::@@toStringTag is `Promise`'
test 'Promise.all' !->
  ok isFunction(core.Promise.all), 'Is function'
  # works with iterables
  passed = no
  iter = core.Array.values [1 2 3]
  next = iter~next
  iter.next = ->
    passed := on
    next!
  core.Promise.all iter .catch ->
  ok passed, 'works with iterables'
test 'Promise.race' !->
  ok isFunction(core.Promise.race), 'Is function'
  # works with iterables
  passed = no
  iter = core.Array.values [1 2 3]
  next = iter~next
  iter.next = ->
    passed := on
    next!
  core.Promise.race iter .catch ->
  ok passed, 'works with iterables'
test 'Promise.resolve' !->
  ok isFunction(core.Promise.resolve), 'Is function'
test 'Promise.reject' !->
  ok isFunction(core.Promise.reject), 'Is function'
if core.Object.setPrototypeOf
  test 'Promise subclassing' !->
    # this is ES5 syntax to create a valid ES6 subclass
    SubPromise = (x) ->
      self = new core.Promise(x)
      core.Object.setPrototypeOf(self, SubPromise.prototype)
      self.mine = 'subclass'
      self
    core.Object.setPrototypeOf(SubPromise, core.Promise)
    SubPromise.prototype = core.Object.create(core.Promise.prototype)
    SubPromise.prototype.constructor = SubPromise
    # now let's see if this works like a proper subclass.
    p1 = SubPromise.resolve(5)
    strictEqual p1.mine, 'subclass'
    p1 = p1.then( (x) -> strictEqual x, 5 )
    strictEqual p1.mine, 'subclass'

    p2 = new SubPromise( (r) -> r(6) )
    strictEqual p2.mine, 'subclass'
    p2 = p2.then( (x) -> strictEqual x, 6 )
    strictEqual p2.mine, 'subclass'

    p3 = SubPromise.all([p1, p2])
    strictEqual p3.mine, 'subclass'
    # double check
    ok p3 instanceof core.Promise
    ok p3 instanceof SubPromise
    # check the async values
    p3.then( it.async!, ((e) -> ok(false, e)) )
