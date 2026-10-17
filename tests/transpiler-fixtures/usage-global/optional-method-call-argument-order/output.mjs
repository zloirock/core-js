import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An absent optional method skips argument evaluation.
export function read(receiver, argument, key) {
  return receiver.at?.(argument());
}