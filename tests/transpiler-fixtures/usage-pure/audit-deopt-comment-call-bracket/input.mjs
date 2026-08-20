// comments between `?.` and the next token (call paren or computed bracket) must NOT
// confuse classification - `?./*c*/(...)`, `?./*c*/[...]`, and `(arr?.at)?.(0)` should
// all dispatch the same way as their no-comment / no-paren forms
const a = arr?./* call */(0);
const b = obj?./* idx */[Symbol.iterator]();
const c = (arr?.at)?./* call */(0);
