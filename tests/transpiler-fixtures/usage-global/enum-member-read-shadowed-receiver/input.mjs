// A same-named parameter shadows the runtime enum receiver.
enum E {
  at = "at"
}
function f(E) {
  return E.at;
}
use(f);
