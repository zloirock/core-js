import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2;
// recursive arrow `const f = () => f();` - inline-call resolution must bail because the
// `seen` Set rejects re-entering the same binding name. without the cycle guard,
// `inlineCallReturnExpression` would loop indefinitely walking f -> f -> f.
// secondary case: mutual recursion `g <-> h` exercises the same `seen.has` gate
const f = () => f();
const result1 = _includes(_ref = f()).call(_ref, 1);
const g = () => h();
const h = () => g();
const result2 = _includes(_ref2 = g()).call(_ref2, 2);
export { result1, result2 };