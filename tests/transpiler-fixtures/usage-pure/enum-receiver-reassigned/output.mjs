import _at from "@core-js/pure/actual/instance/at";
// Replacing the enum object loses the receiver proof.
enum E {
  at = "at"
}
// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test
E = other;
use(_at(E));