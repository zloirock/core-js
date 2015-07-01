QUnit.module \ES6
isFunction = -> typeof! it is \Function
test 'Promise' !->
  ok isFunction((global? && global || window)Promise), 'Is function'
  ok /native code/.test(Promise), 'looks like native'
test 'Promise#then' !->
  ok isFunction(Promise::then), 'Is function'
  ok /native code/.test(Promise::then), 'looks like native'
test 'Promise#catch' !->
  ok isFunction(Promise::catch), 'Is function'
test 'Promise#@@toStringTag' !->
  ok Promise::[Symbol.toStringTag] is \Promise, 'Promise::@@toStringTag is `Promise`'
test 'Promise.all' !->
  ok isFunction(Promise.all), 'Is function'
  ok /native code/.test(Promise.all), 'looks like native'
  # works with iterables
  passed = no
  iter = [1 2 3].values!
  next = iter~next
  iter.next = ->
    passed := on
    next!
  Promise.all iter .catch ->
  ok passed, 'works with iterables'
test 'Promise.race' !->
  ok isFunction(Promise.race), 'Is function'
  ok /native code/.test(Promise.race), 'looks like native'
  # works with iterables
  passed = no
  iter = [1 2 3].values!
  next = iter~next
  iter.next = ->
    passed := on
    next!
  Promise.race iter .catch ->
  ok passed, 'works with iterables'
test 'Promise.resolve' !->
  ok isFunction(Promise.resolve), 'Is function'
  ok /native code/.test(Promise.resolve), 'looks like native'
test 'Promise.reject' !->
  ok isFunction(Promise.reject), 'Is function'
  ok /native code/.test(Promise.reject), 'looks like native'
if Object.setPrototypeOf
  test 'Promise subclassing' !->
    # this is ES5 syntax to create a valid ES6 subclass
    SubPromise = (x) ->
      self = new Promise(x)
      Object.setPrototypeOf(self, SubPromise.prototype)
      self.mine = 'subclass'
      self
    Object.setPrototypeOf(SubPromise, Promise)
    SubPromise.prototype = Object.create(Promise.prototype)
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
    ok p3 instanceof Promise
    ok p3 instanceof SubPromise
    # check the async values
    p3.then( it.async!, ((e) -> ok(false, e)) )
