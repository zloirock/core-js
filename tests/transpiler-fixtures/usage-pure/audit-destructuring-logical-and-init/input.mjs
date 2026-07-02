// destructure with `&&` logical-and init: when the LHS is truthy, both branches must
// produce a consistent polyfill rewrite shape.
const { from } = Array && Promise;
