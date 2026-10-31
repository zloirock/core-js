// Independent claims in a retained realm key execute once before the source store.
// The stored value and sealed reads keep their native behavior.
let held;
const keyLog = [];
export const storedKeyClaimValue = (held = globalThis[(keyLog.push(1), 'window')].self)?.customQ;
export const storedKeyClaimPlain = String((held = globalThis[(keyLog.push(2), 'window')].self).customQ);
export const storedKeyClaimGuarded = (held = globalThis[(keyLog.push(3), 'window')].self)?.Array.of(1);
export { held, keyLog };
