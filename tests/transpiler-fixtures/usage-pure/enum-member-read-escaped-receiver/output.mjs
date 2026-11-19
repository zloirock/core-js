import _at from "@core-js/pure/actual/instance/at";
// An unknown consumer may change the enum object and its prototype.
enum E {
  at = "at"
}
mutate(E);
use(_at(E));