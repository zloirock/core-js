import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2;
// getter `get list(): number[]` vs method `next(): number[]` - same `number[]` return type,
// but getter-access reads the value directly (property semantics) while method-access returns
// a function reference. findTypeMember + resolveMemberAnnotation branch on `kind === 'get'`
// so `i.list` yields number[] (narrow to array polyfill), while plain method stays function
interface Iter {
  get list(): number[];
  next(): number[];
}
declare const i: Iter;
_atMaybeArray(_ref = i.list).call(_ref, -1);
_atMaybeArray(_ref2 = i.next()).call(_ref2, -1);