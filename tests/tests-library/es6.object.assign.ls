QUnit.module 'ES6 Object.assign'

descriptors = (-> try 2 == core.Object.defineProperty({}, \a, get: -> 2)a)!

eq = strictEqual
deq = deepEqual

test '*' !->
  {assign, defineProperty} = core.Object
  ok typeof! assign is \Function, 'Is function'
  foo = q: 1
  eq foo, assign(foo, bar: 2), 'assign return target'
  eq foo.bar, 2, 'assign define properties'
  deq assign({}, {q: 1}, {w: 2}), {q: 1, w: 2}
  deq assign({}, \qwe), {0: \q, 1: \w, 2: \e}
  throws (-> assign null {q: 1}), TypeError
  throws (-> assign void, {q: 1}), TypeError
  str = assign(\qwe, {q: 1})
  eq typeof str, \object
  eq String(str), \qwe
  eq str.q, 1
  if descriptors
    foo = baz: 1
    assign foo, defineProperty {}, \bar, get: -> @baz + 1
    ok foo.bar is void, "assign don't copy descriptors"
    c = core.Symbol \c
    d = core.Symbol \d
    D = {
      a: \a
      (c): \c
    }
    defineProperty D, \b, value: \b
    defineProperty D, d, value: \d
    O = assign {}, D
    eq O.a, \a, \a
    eq O.b, void, \b
    eq O[c], \c, \c
    eq O[d], void, \d