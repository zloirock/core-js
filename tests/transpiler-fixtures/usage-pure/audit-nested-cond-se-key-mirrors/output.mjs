import _Array$from from "@core-js/pure/actual/array/from";
// a SIDE-EFFECTING inner computed key on a DIVERGING ternary: the proxy branch mirrors to the synth
// literal carrying the RESOLVED static key, the user-object branch stays native (its legitimate
// undefined is preserved - a `const from = _polyfill` extraction would bind the polyfill on the user
// branch too and corrupt it). the key effect stays in the residual LHS and runs exactly once. only an
// unconditional receiver keeps the sound extraction
const userObj = {
  Array: {}
};
const useGlobal = false;
const {
  Array: {
    [(eff(), "from")]: from
  }
} = useGlobal ? {
  Array: {
    from: _Array$from
  }
} : userObj;
typeof from;