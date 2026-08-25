import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const _ref = effect();
const se = _getIteratorMethod(_ref);
// array-wrapped `[Symbol.iterator]` bindings whose receiver cannot be re-read: an element whose
// EVALUATION is observable memoizes into a leading ref, so the extraction and the residual read
// one evaluation (what native performs) and the polyfill lands; a const-chain wrapper hides the
// element behind another statement and a hole leaves the target undefined - both stay NATIVE
// (only the well-known-symbol key text is polyfilled there)
const [{
  [_Symbol$iterator]: _unused,
  ...seRest
}] = [_ref];
se;
seRest;
const chain = [arr];
const [{
  [_Symbol$iterator]: chained,
  ...chainRest
}] = chain;
chained;
chainRest;
const [, {
  [_Symbol$iterator]: holed,
  ...holeRest
}] = [0];
holed;
holeRest;