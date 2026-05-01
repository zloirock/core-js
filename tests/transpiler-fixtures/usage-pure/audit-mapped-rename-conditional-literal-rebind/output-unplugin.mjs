import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// conditional literal rebind: `K extends 'a' ? 'aa' : K` - matched key gets a fresh literal
// new name, others keep their original key. exercises the trueType branch returning a
// non-K literal while the body T[K] still resolves through to the original member type
type Rebind<T> = { [K in keyof T as K extends 'a' ? 'aa' : K]: T[K] };
declare const r: Rebind<{ a: number[]; b: string }>;
_atMaybeArray(_ref = r.aa).call(_ref, 0);