import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a class or interface whose base CANNOT be resolved - a mixin call (`extends mixinBase()`), an
// undeclared / opaque name - has an UNKNOWABLE instance type: the base could be Array or any other
// polyfillable type, so it must NOT masquerade as a plain Object (which would suppress the polyfill).
// the receiver stays unknown and reaches the generic helper. a base that IS a known class keeps its
// precise resolution (a known container narrows; a known plain class with no such method stays native).
declare function mixinBase(): any;
class Mixed extends mixinBase() {}
declare const m: Mixed;
export const a = _at(m).call(m, 0);
interface Opaque extends Unresolvable {}
declare const o: Opaque;
export const b = _includes(o).call(o, 0);
class Plain {
  value = 1;
}
class Known extends Plain {}
declare const k: Known;
export const c = k.at(0);
class Real extends Array<number> {}
declare const real: Real;
export const d = _flatMaybeArray(real).call(real);