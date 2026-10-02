import _at from "@core-js/pure/actual/instance/at";
// Replacing the enum object loses the receiver proof.
enum E {
  at = "at"
}
E = other;
use(_at(E));