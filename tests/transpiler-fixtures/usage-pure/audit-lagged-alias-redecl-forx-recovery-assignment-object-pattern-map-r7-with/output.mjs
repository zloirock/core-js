import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a case-consequent lexical binding keeps its own assigned Array receiver
switch (_globalThis.k) {
  case 1:
    let S;
    S = _Map;
    S = [4];
    _globalThis.r7 = _withMaybeArray(S).call(S, 0, 'w');
}