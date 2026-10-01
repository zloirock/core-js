// `extends globalThis['Array']` (computed key) and `extends (globalThis as any).Array`
// (TS-cast) both resolve to the global Array: super-global resolution must peel TS wrappers,
// accept computed string-literal keys, and map the alias `_globalThis` back to `'globalThis'`,
// else `c.at(0)` / `d.includes('x')` lose the Array-subclass narrow (parity with `extends Array`)
class Computed extends globalThis['Array']<string[]> {}
class Cast extends (globalThis as any).Array<string[]> {}
const c = new Computed();
const d = new Cast();
c.at(0);
d.includes('x');
