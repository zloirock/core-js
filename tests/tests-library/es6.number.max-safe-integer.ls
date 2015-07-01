QUnit.module \ES6

test 'Number.MAX_SAFE_INTEGER' !->
  strictEqual core.Number.MAX_SAFE_INTEGER, 2^53 - 1, 'Is 2^53 - 1'