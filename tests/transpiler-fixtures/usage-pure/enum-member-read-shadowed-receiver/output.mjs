import _at from "@core-js/pure/actual/instance/at";
// A same-named parameter shadows the runtime enum receiver.
enum E {
  at = "at"
}
function f(E) {
  return _at(E);
}
use(f);