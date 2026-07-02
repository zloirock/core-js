import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// arrow with a block body whose ONLY top-level statement is a single `return inner();`.
// the wrapped call is extracted and checked for effects; inner has a prefix statement, so
// the outer single-return arrow inherits the effect and SE-wrap is emitted. Promise.resolve
// is a dedicated static polyfill, so the SE-wrap is visible in the output
let inc = 0;
const inner = () => {
  inc++;
  return _Promise;
};
const wrapper = () => {
  return inner();
};
const out = (wrapper(), _Promise$resolve)(2);
export { inc, out };