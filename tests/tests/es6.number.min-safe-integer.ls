QUnit.module 'ES6 Number.MIN_SAFE_INTEGER'

test '*' !->
  strictEqual Number.MIN_SAFE_INTEGER, -2^53 + 1, 'Is -2^53 + 1'