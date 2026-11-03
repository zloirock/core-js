// Every kept store and prefix belongs to the probe, before either guard outcome.
let first, second;
const holder = {};
export const direct = (effect(), first = second = globalThis.window)?.self.Array.from([7]);
export const member = (holder.first = holder.second = globalThis.window)?.self.Map;
export const wrapped = (effect(), (first = (second = globalThis.window)))?.self.Array.of?.(2);
export const nested = (effect(), (other(), first = globalThis.window))?.self.self.Array.from([1]);
export { first, second, holder };
