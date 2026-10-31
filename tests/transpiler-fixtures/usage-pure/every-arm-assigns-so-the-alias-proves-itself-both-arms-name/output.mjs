import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// When every arm assigns the realm, the alias permits a direct static fold.
// Mixed or missing arms and shadowed realm names provide only candidates: pure keeps
// the constructor read behind an identity guard. A later overwrite prevents direct
// folding too. Distinct static methods keep these decisions independently observable.
export function bothArmsName(flag) {
  if (flag) {
    var G = _globalThis;
  } else {
    var G = _self;
  }
  return _Array$from([2]);
}