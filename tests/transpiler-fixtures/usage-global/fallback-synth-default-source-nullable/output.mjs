import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Null is supplied to the pattern, not replaced by the parameter default.
export function nullable(pick) {
  return (({
    from
  } = Array) => from([8]))(pick ? null : globalThis.Array);
}