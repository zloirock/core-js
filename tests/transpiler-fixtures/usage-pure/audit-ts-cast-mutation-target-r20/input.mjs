// Destructuring through a patched enum hop keeps the live receiver.
enum HopPatched { SELF = 'self' }
Object.assign(HopPatched, { SELF: 'window' });
const { from: fromPatchedHop } = globalThis[HopPatched.SELF].Array;
export const r20 = typeof fromPatchedHop;
