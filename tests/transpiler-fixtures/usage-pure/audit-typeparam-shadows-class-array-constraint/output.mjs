import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// type-param shadowing a class, but with an ARRAY constraint (`<Box extends Arrs>` where Arrs.make
// returns number[]): resolving via the constraint yields an array, narrowing `.at` to the array
// variant - distinct from the interface-constraint case whose member returns a string
class Box {
  make(): string {
    return "";
  }
}
interface Arrs {
  make(): number[];
}
function f<Box extends Arrs>(x: Box) {
  var _ref;
  _atMaybeArray(_ref = x.make()).call(_ref, 0);
}