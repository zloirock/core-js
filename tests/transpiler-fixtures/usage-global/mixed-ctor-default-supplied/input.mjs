// The realm default supplies the constructor polyfill beside a native nested method.
// A supplied object keeps its own constructor and nested read.
function read({ Math: { floor }, Set: Ctor } = globalThis) {
  return [floor(1.9), new Ctor()];
}
export const out = read();
export const own = read({ Math: { floor: () => 9 }, Set: class Custom {} });
