import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Wrapping the callee must preserve its static claim through the stored constructor.
let held;
export const result = ((held = Array).from)?.([1, 2]).at(-1);