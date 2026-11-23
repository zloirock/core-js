// Read the guarded constructor before initializing its exported method. The rest
// copy excludes that constructor. A missing receiver still throws at the pattern.
export const { Math: { trunc: viaRestDeclinedAnchor }, ...viaRestRest } = (globalThis.window?.self);
export const { isInteger: viaPartialProbed, customZ: viaPartialCustom } = globalThis.window?.self.Number;
