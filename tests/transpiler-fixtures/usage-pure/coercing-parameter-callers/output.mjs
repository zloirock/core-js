import _at from "@core-js/pure/actual/instance/at";
// Coercing a function opens its caller set through conversion hooks.
// Its default cannot narrow every supplied argument to an array.
function read(value = []) {
  return _at(value).call(value, 0);
}
void (read + 0);