import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
// An effectful computed static key shares its pattern with a plain static key.
// The key effect runs once before either binding is initialized, and both bindings
// receive their distinct polyfills without duplicate declarations.
let log = [];
const x = (_pushMaybeArray(log).call(log, 1), _Array$from);
const y = _Array$of;
x([1]);
y(2);
export { log };