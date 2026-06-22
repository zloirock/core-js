import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// An enum used as a computed key (`obj[K.Field]`) reads its member's literal value only when the enum is
// the NEAREST value declaration for the name. A lexically-nearer `const K = {...}` or a parameter `K`
// shadows it - the resolver must NOT read the enum value then (the key is the shadow's, not the enum's),
// so the access falls to the generic helper instead of the enum-keyed property type. With no shadow the
// enum value "data" keys `obj.data` (string[] -> `_atMaybeArray`)
enum K {
  Field = "data",
  Spare = "spare"
}
interface Obj {
  data: string[];
  other: string;
}
declare const obj: Obj;
function noShadow() {
  var _ref;
  return _atMaybeArray(_ref = obj[K.Field]).call(_ref, 0);
}
function constShadow() {
  var _ref2;
  const K = {
    Field: "other"
  } as const;
  return _includes(_ref2 = obj[K.Field]).call(_ref2, "x");
}
function paramShadow(K: {
  Field: "other";
}) {
  var _ref3;
  return _at(_ref3 = obj[K.Field]).call(_ref3, 0);
}
export { noShadow, constShadow, paramShadow };