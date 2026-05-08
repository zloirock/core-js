import _Array$from from "@core-js/pure/actual/array/from";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Promise$try from "@core-js/pure/actual/promise/try";
// proxy-global access through long alias chains must collapse to the leaf static. covers:
//   1) 3-hop dot chain `globalThis.self.window.Array.from`
//   2) 4-hop computed-bracket chain `globalThis['self']['window']['Object'].entries`
//   3) 4-hop with extra hop `globalThis.self.window.self.Promise.try`
const a = _Array$from([1, 2, 3]);
const b = _Object$entries({
  x: 1
});
const c = _Promise$try(() => 1);
export { a, b, c };