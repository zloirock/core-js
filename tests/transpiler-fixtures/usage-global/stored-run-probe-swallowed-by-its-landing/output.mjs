import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/web.self";
// Stored navigation keeps its environment checks while injecting the consumed static.
let held;
export const dotted = (held = globalThis.window?.self.window?.Array)?.of(1);
export const computed = (held = globalThis.window?.self['window']?.Number)?.isFinite(1);