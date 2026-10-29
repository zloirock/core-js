import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A transparent type wrapper preserves the environment probe above a store.
// The optional static call keeps its argument on the defined branch only.
let held;
let effects = 0;
export const value = ((held = globalThis.self) as any).window?.Array.from((effects++, [1]));
export { held, effects };