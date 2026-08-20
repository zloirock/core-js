import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// the value-vs-ambient gate covers the CLASS lookups too. its discriminator is scope, not the
// bare presence of a binding: an overload HEAD and its implementation are one declaration
// entity sharing one name, and only a NARROWER binding really stands in front of the ambient one
declare class Holder {
  pick(): number[];
}
declare function heads(): number[];
export function shadowed(Holder: {
  new (): {
    pick(): string;
  };
}) {
  var _ref;
  return _at(_ref = new Holder().pick()).call(_ref, 0);
}
export function unshadowed() {
  var _ref2;
  return _includesMaybeArray(_ref2 = heads()).call(_ref2, 1);
}