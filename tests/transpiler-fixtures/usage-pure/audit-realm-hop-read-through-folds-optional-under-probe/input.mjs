// a `?.` standing BELOW the probe hop guards the always-defined root, not the probe: the vestigial
// verdict calls it dead, so the read above it is the plain twin and folds with it. only a `?.` ON
// the probe hop is the branch the source asked for (the guarded rows above)
export const optionalUnderProbe = globalThis?.window.noSuchStatic;
