// A run of OPTIONAL hops sharing the environment probe's name (`globalThis?.window?.window?.window`)
// is one source of undefined: under the realm-self-reference assumption every deeper `window` reads
// the same value, so the guard test reads the shortest prefix carrying the probe (`_globalThis.window`)
// and the deeper `?.` are dead text. The claim's own `?.Array?.of` collapses onto the ponyfill inside
// the guarded alternate. A plain first hop, a sequence prefix, the `self` / `window` / alias roots and
// both depths spell the same test - on both legs alike (the unplugin once kept the whole slice).
const g = globalThis;
let n = 0;
export const a = globalThis?.window?.window?.Array?.of(1).length;
export const b = globalThis.window?.window?.window?.Array?.of(1).length;
export const c = (n++, globalThis?.window?.window?.window?.Array?.of(1).length);
export const d = self?.window?.window?.Array?.of(1).length;
export const e = window.window?.window?.Array?.of(1).length;
export const f = g?.window?.window?.window?.Array?.of(1).length;
export const h = globalThis.window?.window?.window?.Array?.from([1]).length;
export { n };
