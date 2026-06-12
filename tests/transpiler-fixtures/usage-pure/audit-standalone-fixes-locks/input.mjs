// a string-literal outer key flattens like the identifier form (the key resolves through
// the canonical property-key resolver); residual siblings keep the quoted key valid
const { "Array": { from } } = globalThis;
export const r1 = from([1]);
const { "Object": { keys }, other } = globalThis;
export const r2 = [keys({ a: 1 }), other];
// a rest sibling keeps the consumed string-literal key excluded via the quoted sentinel
const { "Map": { groupBy: g8 }, ...others } = globalThis;
export const r6 = [g8, others];
const { ['Object']: { entries: e8 }, ...rest3 } = globalThis;
export const r7 = [e8, rest3];
// a `_ref`-shaped user name must not shift the generated UID sequence
const _ref = 5;
export const r4 = getArr().at(_ref);
// a paren-wrapped receiver reuses without a memo (the shared reusable-receiver gate)
export const r5 = (arr).includes?.(3);
