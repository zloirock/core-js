import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An effectful parameter key stays at its original evaluation point.
export function read({
  [(effect(), 'at')]: at
}) {
  return at;
}