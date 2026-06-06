// a bound (shadowed) possible-global object is NOT a proxy-global: `globalThis` here is a local const,
// so `globalThis.Array.from?.()` reads the local object, the static deopt must NOT fire, and the `?.`
// stays guarded as a plain optional member access. only the trailing `.at` is polyfilled
const globalThis = { Array: { from: () => [1] } };
export const a = globalThis.Array.from?.().at(0);
