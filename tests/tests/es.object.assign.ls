{module, test} = QUnit
module \ES

test 'Object.assign' (assert)!->
  {assign, keys, defineProperty} = Object
  assert.isFunction assign
  assert.arity assign, 2
  assert.name assign, \assign
  assert.looksNative assign
  assert.nonEnumerable Object, \assign
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
  if DESCRIPTORS
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
    try assert.strictEqual Function('return Object.assign({b: 1}, {get a(){delete this.b;},b: 2})')!b, 1
    try assert.strictEqual Function('return Object.assign({b: 1}, {get a(){Object.defineProperty(this, "b", {value:4,enumerable:false});},b: 2})')!b, 1
  # test deterministic property order, theoretical can fail with deterministic, but wrong, order
  string = 'abcdefghijklmnopqrst';
  O = {}
  for string.split('') => O[..] = ..
  assert.strictEqual keys(assign {}, O)join(''), string