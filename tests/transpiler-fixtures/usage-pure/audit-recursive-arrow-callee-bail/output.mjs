import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// recursive arrow `const f = () => f();` - inline-call resolution must bail when the
// same binding name is re-entered, else it loops indefinitely walking f -> f -> f.
// secondary case: mutual recursion `g <-> h` exercises the same cycle guard.
const f = () => f();
const result1 = _includes(_ref = f()).call(_ref, 1);
const g = () => h();
const h = () => g();
const result2 = _includes(_ref2 = g()).call(_ref2, 2);
export { result1, result2 };