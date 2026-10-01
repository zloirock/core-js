// pattern-hop (anchored) destructures over an UNDEFINABLE probe nav: the source read throws
// where the probe yields undefined, so every anchored render rides the guard-value spelling
// instead of the always-defined receiver / ctor bindings
// FULL consumes outside the anchor gate carry the same once-per-pattern probe: multi-prop
// nested, single-level flat (the probe read is the pattern key itself), array-wrapped
// (the probe value is the descended element), and the assignment-host cascade
export const { Math: { cbrt: viaMultiPropA }, Object: { seal: viaMultiPropB } } = (globalThis.window?.self);
export const { structuredClone: viaFlatBareNav } = (globalThis.window?.self);
export const [{ Math: { hypot: viaArrayWrapped } }] = [(globalThis.window?.self)];
let viaAssignFull;
({ Math: { sign: viaAssignFull } } = (globalThis.window?.self));
export { viaAssignFull };
