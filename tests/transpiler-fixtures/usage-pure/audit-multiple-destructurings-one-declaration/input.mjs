// single `const`/`let` with multiple destructure declarators: each declarator must
// produce its own polyfill rewrite without interfering with siblings.
const { from } = Array, { resolve } = Promise;
