import _at from "@core-js/pure/actual/instance/at";
// Deletion removes own presence; a foreign prototype may now supply the method.
enum E {
  at = "at",
}
// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test
delete E.at;
E.__proto__ = Array.prototype;
use(_at(E));