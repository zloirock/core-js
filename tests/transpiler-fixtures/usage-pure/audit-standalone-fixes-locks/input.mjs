// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
const { "Array": { from } } = globalThis;
export const r1 = from([1]);
const { "Object": { keys }, other } = globalThis;
export const r2 = [keys({ a: 1 }), other];
const { "Map": { groupBy: g8 }, ...others } = globalThis;
export const r6 = [g8, others];
const { ['Object']: { entries: e8 }, ...rest3 } = globalThis;
export const r7 = [e8, rest3];
// Generated receiver names must not collide with the user's _ref binding.
const _ref = 5;
export const r4 = getArr().at(_ref);
// A parenthesized identifier receiver needs no extra evaluation when its method is called.
export const r5 = (arr).includes?.(3);
