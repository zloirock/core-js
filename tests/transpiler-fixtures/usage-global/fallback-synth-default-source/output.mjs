import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
export function read(pick) {
  // Only undefined selects the parameter default; the other arm keeps its own value.
  return (({
    from,
    missing = 9
  } = Array) => [from([7])[0], missing])(pick ? void 0 : globalThis.Array);
}
export function nullable(pick) {
  return (({
    from
  } = Array) => from([8]))(pick ? null : globalThis.Array);
}