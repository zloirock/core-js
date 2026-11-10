import "core-js/modules/es.array.at";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A lowered optional keeps its store, prefix and sealed plain read.
// The instance method belongs to the defined receiver after that read.
let held, memo, value;
export const method = (memo = (effect(), ((value = held = globalThis.window) == null ? void 0 : value.self).self)) == null ? void 0 : memo.Array.prototype.at;