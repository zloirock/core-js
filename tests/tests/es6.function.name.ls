eq = strictEqual

if /\[native code\]\s*\}\s*$/.test Object.defineProperty
  QUnit.module 'ES6 Function#name'
  test 'Function instance "name" property' !->
    ok \name of Function::
    eq (function foo => it).name, \foo
    eq (->).name, ''