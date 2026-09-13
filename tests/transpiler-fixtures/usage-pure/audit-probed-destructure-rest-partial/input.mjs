// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
export const { Math: { trunc: viaRestDeclinedAnchor }, ...viaRestRest } = (globalThis.window?.self);
export const { isInteger: viaPartialProbed, customZ: viaPartialCustom } = globalThis.window?.self.Number;
