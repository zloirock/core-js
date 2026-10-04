import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Coercing a function opens its caller set through conversion hooks.
// Its default cannot narrow every supplied argument to an array.
function read(value = []) {
  return value.at(0);
}
void (read + 0);