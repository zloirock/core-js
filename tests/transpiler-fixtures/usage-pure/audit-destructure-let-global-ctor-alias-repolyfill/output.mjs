import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a global-ctor alias bound with `let` (or in a for-init) must re-polyfill member reads exactly like a
// `const` alias: `P.allSettled` resolves to the pure static, `new P` binds the pure ctor. the alias
// binding is identified by its init resolving to the destructured global, not by declaration kind - a
// const-only shadow gate left every `let` / for-init alias raw -> TypeError on ie:11
let P = _Promise;
const settled = _Promise$allSettled([]);
const pending = new P(resolve => resolve());
for (let {
  Array: A
} = _globalThis; flag; flag = false) use(_Array$of(1, 2));
export { settled, pending };