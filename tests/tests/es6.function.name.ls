eq = strictEqual

if (-> try 2 == Object.defineProperty({}, \a, get: -> 2)a)!
  QUnit.module 'ES6 Function#name'
  test '*' !->
    ok \name of Function::
    eq (function foo => it).name, \foo
    eq (->).name, ''