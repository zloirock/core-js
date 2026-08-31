// a claim inside a kept store's computed key stays live through the render: the key container
// rides by identity, so the polyfill lands in place - in the VALUE form (nothing above reads
// the store's absence, the fold replays the key ahead of the leaf) and in the GUARDED form
// alike (a claim above renders the test that reads the store, the key spelled inside it)
let held;
const keyLog = [];
export const storedKeyClaimValue = (held = globalThis[(keyLog.push(1), 'window')].self)?.customQ;
export const storedKeyClaimPlain = String((held = globalThis[(keyLog.push(2), 'window')].self).customQ);
export const storedKeyClaimGuarded = (held = globalThis[(keyLog.push(3), 'window')].self)?.Array.of(1);
export { held, keyLog };
