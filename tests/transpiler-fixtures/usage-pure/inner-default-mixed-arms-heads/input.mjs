// A receiver-bearing default runs only for an undefined source slot. Nested constructor and static claims must share that
// condition and preserve a supplied foreign value.
const held = { Set: function HeldSet() { return held; }, Array: { of: x => [x, 'held'] } };
const rows = [[], [held]];
export const heads = [];
for (const [{ Set: S, Array: { of } } = globalThis] of rows) heads.push(S, of(7));
