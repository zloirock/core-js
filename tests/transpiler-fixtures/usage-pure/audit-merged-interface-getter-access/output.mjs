import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// A getter exposed on a class through a MERGED interface declaration resolves, on property access, to
// its RETURN type - not a Function value. reading the getter as a Function would drop the polyfill for
// the real array / string it yields (ie:11 has no native `.at` / `.includes` -> throw). a paired setter
// is write-only and skips to the getter; a plain method stays a Function on access (only a call resolves
// its return). distinct methods keep each resolution identifiable.
class C {
  foo() {}
}
interface C {
  get items(): number[];
  set items(v: number[]);
  get label(): string;
}
const c = new C();
export const a = _atMaybeArray(_ref = c.items).call(_ref, 0);
export const b = _includesMaybeString(_ref2 = c.label).call(_ref2, "x");