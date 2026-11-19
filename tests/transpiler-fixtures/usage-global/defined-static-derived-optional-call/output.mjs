import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Replacing a defined static does not remove an optional testing its derived value.
export const read = () => globalThis?.Array.from([1]).foo?.();