import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref3;
// A never receiver cannot contribute a member. A never property contributes no value either.
type Pick<K> = K extends string ? {
  v: number[];
} : never;
export function read<K>(p: Pick<K>) {
  var _ref;
  return _atMaybeArray(_ref = p.v).call(_ref, 0);
}
type Member<K> = K extends string ? {
  v: number[];
} : {
  v: never;
};
export function field<K>(p: Member<K>) {
  var _ref2;
  return _includesMaybeArray(_ref2 = p.v).call(_ref2, 1);
}
declare const fixed: Pick<'x'>;
_flatMaybeArray(_ref3 = fixed.v).call(_ref3);