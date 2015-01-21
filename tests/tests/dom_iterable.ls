QUnit.module 'DOM iterable'

isFunction = -> typeof! it is \Function

if NodeList? => test 'NodeList.prototype@@iterator' !->
  ok isFunction(NodeList.prototype[Symbol.iterator]), 'Is function'