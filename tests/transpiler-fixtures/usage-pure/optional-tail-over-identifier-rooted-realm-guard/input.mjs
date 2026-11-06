// A guard over a realm claim reached from an identifier or call root renders the always-defined
// ponyfill, so its tail pulls in by the rule the direct root follows: the `?.` reading the ponyfill
// folds in, the next one stays outside on the guard's own value - for a call, an optional call and a
// sealed read alike, whichever name holds the root. A `delete` still takes the guard whole.
const g = globalThis;
const s = self;
const A = globalThis.window;
const f = () => globalThis;
export const bare = window?.self?.box?.k;
export const realm = g.window?.self?.cfg?.opts?.depth;
export const viaSelf = s.window?.self?.api?.run();
export const held = A?.self?.api?.stop?.();
export const called = f().window?.self?.box?.list;
export const sealed = (A?.self?.cfg?.opts).depth;
export const viaThis = g.window?.globalThis?.cfg?.mode;
export const removed = delete g.window?.self?.box?.k;
