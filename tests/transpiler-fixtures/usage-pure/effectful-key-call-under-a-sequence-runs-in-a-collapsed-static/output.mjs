import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// a computed key ending in a call that runs code, under a sequence: a navigation collapsed into a static
// still runs the call, as it runs it for the key spelled bare
let n = 0;
function l(v) {
  return v;
}
export const from = (l(0), (() => (n++, 'Array'))(), _Array$from);
export const of = (l(1), l(2), (() => (n++, 'Array'))(), _Array$of);
export { n };