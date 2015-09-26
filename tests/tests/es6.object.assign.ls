{module, test} = QUnit
module \ES6

descriptors = (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!

test 'Object.assign' (assert)->
  {assign, keys, defineProperty} = Object
  assert.ok typeof! assign is \Function, 'is function'
  assert.strictEqual assign.length, 2, 'arity is 2'
  assert.strictEqual assign.name, \assign, 'name is "assign"'
  assert.ok /native code/.test(assign), 'looks like native'
  foo = q: 1
  assert.strictEqual foo, assign(foo, bar: 2), 'assign return target'
  assert.strictEqual foo.bar, 2, 'assign define properties'
  assert.deepEqual assign({}, {q: 1}, {w: 2}), {q: 1, w: 2}
  assert.deepEqual assign({}, \qwe), {0: \q, 1: \w, 2: \e}
  assert.throws (-> assign null {q: 1}), TypeError
  assert.throws (-> assign void, {q: 1}), TypeError
  str = assign(\qwe, {q: 1})
  assert.strictEqual typeof str, \object
  assert.strictEqual String(str), \qwe
  assert.strictEqual str.q, 1
  if descriptors
    foo = baz: 1
    assign foo, defineProperty {}, \bar, get: -> @baz + 1
    assert.ok foo.bar is void, "assign don't copy descriptors"
    c = Symbol \c
    d = Symbol \d
    D = {
      a: \a
      (c): \c
    }
    defineProperty D, \b, value: \b
    defineProperty D, d, value: \d
    O = assign {}, D
    assert.strictEqual O.a, \a, \a
    assert.strictEqual O.b, void, \b
    assert.strictEqual O[c], \c, \c
    assert.strictEqual O[d], void, \d
  # test deterministic property order, theoretical can fail with deterministic, but wrong, order
  string = 'abcdefghijklmnopqrst';
  O = {}
  for string => O[..] = ..
  assert.strictEqual keys(assign {}, O)join(''), string