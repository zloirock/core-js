import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// A proven enum own-slot read leaves its computed-key effects visitable.
// The array claim inside the key is independent of the enum member named at.
enum E {
  at = "at",
}
use(E[_includesMaybeArray(_ref = [1, 2]).call(_ref, 2), "at"]);