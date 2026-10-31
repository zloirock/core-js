// A nested-instance assignment in a bodyless control body keeps both its RHS evaluation and
// polyfill read conditional. Placing the read after the body would run it unconditionally.
declare const a: number[];
let flat;
if (cond) [{ flat }] = [a];
export { flat };
