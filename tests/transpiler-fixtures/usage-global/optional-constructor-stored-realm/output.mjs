import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Both stores preserve their values while the optional static retains its claim.
export const effects = [];
let held;
let other;
export const r = (held = (other = globalThis).Array).from?.([1, 2]).at(-1);