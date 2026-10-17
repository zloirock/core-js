// a SECOND unresolvable hop past the ponyfillable one stays raw on the guarded ref (two
// sources of undefined: the nested test covers the window prefix, the outer memo test the
// chrome value). the static reads off the opaque chrome value, not a global - no collapse.
// the unplanned `chrome` tail rides inside the guarded branch
const upu = () => globalThis;
export const viaUnresPonyUnres = upu()?.window?.self?.chrome?.Array.of(14).at(0);
