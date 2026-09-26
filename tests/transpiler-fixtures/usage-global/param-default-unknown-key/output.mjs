import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An unknown parameter key keeps the default receiver native.
// A mirror could overwrite the named read and repeat key conversion.
export function read(key, {
  at,
  [key]: other
} = [7]) {
  return [at, other];
}