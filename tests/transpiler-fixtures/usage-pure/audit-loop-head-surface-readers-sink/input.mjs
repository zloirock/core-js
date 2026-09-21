// A loop initializer evaluates its effect before the first extracted binding.
// Static and instance reads retain their source property order.
let out1;
let out2;
for (const { Array: { prototype: { values: headValues, at: headAt } }, Object: { keys: headKeys } } = (globalThis.effect ??= 1, globalThis); !out1;) out1 = [headValues, headAt, headKeys];
for (const { Object: { keys: tailKeys }, Array: { prototype: { at: tailAt } } } = (globalThis.effect ??= 2, globalThis); !out2;) out2 = [tailKeys, tailAt];
export const r = [typeof out1[0], typeof out1[1], typeof out1[2], typeof out2[0], typeof out2[1]];
