import _at from "@core-js/pure/actual/instance/at";
// Deletion removes own presence; a foreign prototype may now supply the method.
enum E {
  at = "at",
}
delete E.at;
E.__proto__ = Array.prototype;
use(_at(E));