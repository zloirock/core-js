import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a type parameter shadowing an outer `class` of the same name (`function f<Box extends Strs>`
// over `class Box`) must resolve its members through the CONSTRAINT, not the shadowed class -
// so `x.make()` is `Strs.make()` (string), narrowing `.at` to the string variant, not the array one
class Box {
  make(): number[] {
    return [1, 2, 3];
  }
}
interface Strs {
  make(): string;
}
function f<Box extends Strs>(x: Box) {
  var _ref;
  _atMaybeString(_ref = x.make()).call(_ref, 0);
}