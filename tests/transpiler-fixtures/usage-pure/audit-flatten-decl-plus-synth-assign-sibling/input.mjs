// a FLATTEN declarator plus a sibling synth-swap receiver in ONE statement once double-queued the
// unplugin transform-queue (sibling-receiver walk + synth-swap both rewrote the same `globalThis`
// range). the walk now skips a destructure's whole right side for both synth-swap shapes
// (assignment-init + nested-param default); babel is AST-immune (drops the init parens -> sidecar)
let of;
const { Object: { fromEntries }, Math: { floor } } = globalThis, alias = ({ Array: { of } } = globalThis);
const { Reflect: { ownKeys } } = globalThis, mk = function ({ Map: { groupBy } } = globalThis) { return groupBy; };
export { of, fromEntries, floor, alias, mk };
