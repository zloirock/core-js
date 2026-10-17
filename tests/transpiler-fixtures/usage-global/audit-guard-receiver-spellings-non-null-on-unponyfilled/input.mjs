let k9;
// the static stays raw here BY CONSTRUCTION, not by a miss: `Object.keys` only needs the
// polyfill for a PRIMITIVE argument, and an object literal is filtered out of the injection.
// what this row spells is the receiver: a non-null assertion over an unponyfillable hop
export const nonNullOnUnponyfilled = (k9 = globalThis.window!)?.Object.keys({ e: 5 });
