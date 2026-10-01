import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3;
// a CALL through a union of index signatures must WIDEN to generic when any arm's return
// fails to resolve - dropping the arm would over-narrow the survivors into a wrong Maybe
// (the runtime value may be the unresolvable arm's, e.g. a string, and a Maybe-Array
// forwards it to a native method absent on old engines)
type Arrays = {
  [k: string]: () => number[];
};
type Opaque = {
  [k: string]: () => UndeclaredExternalT;
};
declare const viaCall: Arrays | Opaque;
declare const k: string;
export const widened = _includes(_ref = viaCall[k]() as any).call(_ref, 1);

// convergent arms keep the narrow; a nullable arm stays skippable (throws natively anyway)
type MoreArrays = {
  [k: string]: () => number[];
};
declare const conv: Arrays | MoreArrays;
export const kept = _atMaybeArray(_ref2 = conv[k]() as any).call(_ref2, 0);
type Nullish = {
  [k: string]: null;
};
declare const nul: Arrays | Nullish;
export const skippable = _atMaybeArray(_ref3 = nul[k]() as any).call(_ref3, 1);