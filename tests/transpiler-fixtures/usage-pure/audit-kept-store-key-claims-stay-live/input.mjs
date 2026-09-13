// Claims inside a kept store's computed key survive the proxy fold and execute once.
// Plain window.self navigation stores the backed self value in value, plain-member
// and claimed-static consumers; key effects stay ahead of that store.
let held;
const keyLog = [];
export const storedKeyClaimValue = (held = globalThis[(keyLog.push(1), 'window')].self)?.customQ;
export const storedKeyClaimPlain = String((held = globalThis[(keyLog.push(2), 'window')].self).customQ);
export const storedKeyClaimGuarded = (held = globalThis[(keyLog.push(3), 'window')].self)?.Array.of(1);
export { held, keyLog };
