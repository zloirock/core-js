import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
import _repeatMaybeString from "@core-js/pure/actual/string/instance/repeat";
import _trimEndMaybeString from "@core-js/pure/actual/string/instance/trim-end";
var _ref, _ref3, _ref4;
// re-verified narrowing positives: each line locks a shape once suspected to under-resolve
// a parenthesized mapped-type constraint and body peel to the inner type
interface Foo { xs: number[] }
type M = { [K in keyof (Foo)]: (Foo)[K] };
declare const m: M;
_atMaybeArray(_ref = m.xs).call(_ref, 0);
// a computed STRING-literal class-field key names a fixed slot - the field type applies
class C { ['ys']: number[] = [1]; m() {
var _ref2; return _flatMaybeArray(_ref2 = this['ys']).call(_ref2); } }
new C().m();
// a direct new-expression receiver peels to the class for method return narrowing
class D { zs(): number[] { return [1]; } }
_includesMaybeArray(_ref3 = new D().zs()).call(_ref3, 1);
// intersections narrow from the primitive branch and the container branch alike
type BrandedS = string & { __b?: true };
declare const bs: BrandedS;
_padStartMaybeString(bs).call(bs, 2);
type BrandedA = number[] & { __b?: true };
declare const ba: BrandedA;
_flatMapMaybeArray(ba).call(ba, x => [x]);
// compound string concatenation narrows through the shared operator table
let cs = 'a';
cs += 'b';
_trimEndMaybeString(cs).call(cs);
// a heterogeneous enum stays opaque as a WHOLE type, but each member keeps its own kind
enum H { A, B = 'x' }
_repeatMaybeString(_ref4 = H.B).call(_ref4, 2);