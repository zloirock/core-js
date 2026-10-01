// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
export const { Math: { trunc: viaRestDeclinedAnchor }, ...viaRestRest } = (globalThis.window?.self);
export const { isInteger: viaPartialProbed, customZ: viaPartialCustom } = globalThis.window?.self.Number;
