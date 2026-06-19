import _Array$of from "@core-js/pure/actual/array/of";
// a SIDE-EFFECTING computed key whose receiver is a CONSTRUCTOR directly (`Array`), behind a diverging
// ternary. the proxy branch mirrors to a synth literal under the resolved static key, the user branch
// stays native (no corruption). the effect stays in the residual LHS key and runs exactly once - so
// the proxy branch polyfills instead of bailing to native
const userObj = {};
const cond = false;
const { [(eff(), "of")]: of } = cond ? { "of": _Array$of } : userObj;
typeof of;
