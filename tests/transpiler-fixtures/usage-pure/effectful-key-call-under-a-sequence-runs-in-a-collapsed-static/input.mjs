// a computed key ending in a call that runs code, under a sequence: a navigation collapsed into a static
// still runs the call, as it runs it for the key spelled bare
let n = 0;
function l(v) { return v; }
export const from = globalThis[(l(0), (() => (n++, 'Array'))())].from;
export const of = globalThis[(l(1), (l(2), (() => (n++, 'Array'))()))].of;
export { n };
