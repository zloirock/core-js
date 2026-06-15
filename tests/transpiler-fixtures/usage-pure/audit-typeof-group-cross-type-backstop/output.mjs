import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `typeof x === 'object'` narrows to the whole object-type group (Array AND Date/Map/Set/...), and
// `typeof y !== 'string'` to every non-string. a method with only an array variant must NOT emit the
// array-specific helper for such a broad receiver - it would throw on a Date/Map at ie:11. the generic
// receiver-dispatching helper is used instead. but a narrow to a SINGLE specialised type stays precise
// (`typeof w === 'string'` -> string helper), and a concretely-typed array still gets the array helper.
function fromObjectGroup(x: any) {
  if (typeof x === "object") return _at(x).call(x, 0);
}
function fromNonString(y: any) {
  if (typeof y !== "string") return _includes(y).call(y, 1);
}
function fromStringNarrow(w: any) {
  if (typeof w === "string") return _atMaybeString(w).call(w, 0);
}
function fromConcreteArray(z: number[]) {
  return _flatMaybeArray(z).call(z);
}