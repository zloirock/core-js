import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// --- destructured spellings ---
const {
  self: extracted
} = globalThis;
export const destructuredHop = extracted.Array.from([1, 2]);