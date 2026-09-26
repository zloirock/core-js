import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// An unknown key also prevents a mirror at an inner object default.
export function read(key, {
  value: {
    at,
    [key]: other
  } = [7]
} = {}) {
  return [at, other];
}