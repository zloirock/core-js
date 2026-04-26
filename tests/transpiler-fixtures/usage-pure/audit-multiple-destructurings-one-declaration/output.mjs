import _Array$from from "@core-js/pure/actual/array/from";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// single `const`/`let` with multiple destructure declarators: each declarator must
// produce its own polyfill rewrite without interfering with siblings.
const from = _Array$from;
const resolve = _Promise$resolve;