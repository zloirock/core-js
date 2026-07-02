// destructure with `||` logical-or init: when the LHS is falsy, the fallback branch
// must still produce a consistent polyfill rewrite shape.
const { from } = Array || Promise;
