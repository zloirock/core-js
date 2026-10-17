// A patched enum no longer names a pristine realm hop.
enum HopPatched { SELF = 'self' }
Object.assign(HopPatched, { SELF: 'window' });
export const r17 = globalThis[HopPatched.SELF].Array.from([4]);
