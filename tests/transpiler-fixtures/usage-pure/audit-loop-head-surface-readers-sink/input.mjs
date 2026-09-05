// a LOOP HEAD hosts no statement, so the discarded init stays in the header as the `_unused` sink
// BEHIND the extractions, every reader spells the surface itself and the emptied residual leaves.
// the extractions keep SOURCE order whichever channel renders them - the statics through the
// flatten at the first prop's dispatch, the instance claims through the per-prop route later
let out1;
let out2;
for (const { Array: { prototype: { values: headValues, at: headAt } }, Object: { keys: headKeys } } = (globalThis.effect ??= 1, globalThis); !out1;) out1 = [headValues, headAt, headKeys];
for (const { Object: { keys: tailKeys }, Array: { prototype: { at: tailAt } } } = (globalThis.effect ??= 2, globalThis); !out2;) out2 = [tailKeys, tailAt];
export const r = [typeof out1[0], typeof out1[1], typeof out1[2], typeof out2[0], typeof out2[1]];
