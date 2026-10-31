// a destructure over a probe nav extracts its claimed statics ahead of the residual that keeps the
// probe: beside a rest the residual keeps the claimed key as an exclusion, beside a plain key it keeps
// that key alone. the residual still reads the guarded value, so it throws where native does.
export const { Math: { trunc: viaRestDeclinedAnchor }, ...viaRestRest } = (globalThis.window?.self);
export const { isInteger: viaPartialProbed, customZ: viaPartialCustom } = globalThis.window?.self.Number;
