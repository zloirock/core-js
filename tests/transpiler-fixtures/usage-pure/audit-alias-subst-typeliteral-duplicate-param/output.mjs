import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// object-literal alias with two members referencing the same inner param; both
// members narrow when the outer alias instantiation propagates substitution
type Twin<U> = {
  left: U;
  right: U;
};
type Box<T> = T[];
type Wrap<T> = Twin<Box<T>>;
declare const x: Wrap<string>;
_atMaybeArray(_ref = x.left).call(_ref, 0);
_flatMaybeArray(_ref2 = x.right).call(_ref2);