QUnit.module 'ES6 Object.assign'

descriptors = /\[native code\]\s*\}\s*$/.test core.Object.defineProperty

eq = strictEqual
deq = deepEqual

test '*' !->
  {assign} = core.Object
  ok typeof! assign is \Function, 'Is function'
  foo = q: 1
  eq foo, assign(foo, bar: 2), 'assign return target'
  eq foo.bar, 2, 'assign define properties'
  if descriptors
    foo = baz: 1
    assign foo, core.Object.defineProperty {}, \bar, get: -> @baz + 1
    ok foo.bar is void, "assign don't copy descriptors"
  deq assign({}, {q: 1}, {w: 2}), {q: 1, w: 2}
  deq assign({}, \qwe), {0: \q, 1: \w, 2: \e}
  throws (-> assign null {q: 1}), TypeError
  throws (-> assign void, {q: 1}), TypeError
  str = assign(\qwe, {q: 1})
  eq typeof str, \object
  eq String(str), \qwe
  eq str.q, 1