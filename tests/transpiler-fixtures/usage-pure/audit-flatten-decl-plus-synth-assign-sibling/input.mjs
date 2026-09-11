// a FLATTEN declarator plus a sibling destructure-ASSIGNMENT in one statement. the assignment's VALUE
// is CAPTURED (`alias = ({ Array: { of } } = globalThis)` yields globalThis), so its receiver must NOT
// synth-swap into a mirror literal - that would capture the mirror instead of globalThis. the leaf bails
// to the inline-default (`{ of = _Array$of }`), keeping the receiver (-> _globalThis) as the captured
// value while still polyfilling the leaf on absence. contrasts, each a distinct path: a param default
// (`mk`) is caller-correct so it synth-swaps its default; a STATEMENT-context assignment discards its
// value so the cascade extracts (`from = _Array$from`). distinct static per line. babel drops the
// assignment parens -> sidecar.
let of, from;
const { Object: { fromEntries }, Math: { floor } } = globalThis, alias = ({ Array: { of } } = globalThis);
const { Reflect: { ownKeys } } = globalThis, mk = function ({ Map: { groupBy } } = globalThis) { return groupBy; };
({ Array: { from } } = globalThis);
export { of, from, fromEntries, floor, alias, mk };
