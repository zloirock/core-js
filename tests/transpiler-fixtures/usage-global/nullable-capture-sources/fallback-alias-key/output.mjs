import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A fallback must prove its aliased value before discarding null rejection.
const held = globalThis.window?.Array;
const missing = undefined;
export const {
  [(effect(), "from")]: from
} = missing ?? held;