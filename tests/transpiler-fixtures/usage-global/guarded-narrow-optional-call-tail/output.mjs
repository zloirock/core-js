import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// An optional call in a captured constructor tail skips every following plain step.
export function read(c, list) {
  return (c ? Array : null)?.from(list).foo?.().length;
}