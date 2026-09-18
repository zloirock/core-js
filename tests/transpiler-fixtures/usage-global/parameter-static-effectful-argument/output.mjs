import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// An effectful argument still supplies the static beside an opaque parameter default.
// The argument prefix and later argument run before extraction; the custom default stays intact.
export function outer(Custom, effects) {
  function read({
    of
  } = Custom, later) {
    return [of(1), later];
  }
  return [read((effects.push('argument'), globalThis.Array), effects.push('later')), read(undefined, 3)];
}