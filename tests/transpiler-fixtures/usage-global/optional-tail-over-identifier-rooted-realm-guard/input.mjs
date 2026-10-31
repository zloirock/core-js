// Optional tails over a guarded realm claim hide nothing from usage detection: every realm global and
// static the identifier- and call-rooted navigations reach pull their modules, whatever the tail does
// with the value - a call, an optional call, a sealed read or a `delete`.
const g = globalThis;
const s = self;
const A = globalThis.window;
const f = () => globalThis;
export const bare = window?.self?.Array?.from;
export const realm = g.window?.self?.Math?.trunc?.length;
export const viaSelf = s.window?.self?.Object?.entries({});
export const held = A?.self?.Number?.isInteger?.(1);
export const called = f().window?.self?.Array?.of;
export const sealed = (A?.self?.String?.raw).length;
export const viaThis = g.window?.globalThis?.Math?.sign;
export const removed = delete g.window?.self?.Reflect?.slot;
