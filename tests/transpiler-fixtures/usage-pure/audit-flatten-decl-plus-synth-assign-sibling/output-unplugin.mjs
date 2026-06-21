import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// a FLATTEN declarator plus a sibling synth-swap receiver in ONE statement once double-queued the
// unplugin transform-queue (sibling-receiver walk + synth-swap both rewrote the same `globalThis`
// range). the walk now skips a destructure's whole right side for both synth-swap shapes
// (assignment-init + nested-param default); babel is AST-immune (drops the init parens -> sidecar)
let of;
const fromEntries = _Object$fromEntries;
const { Math: { floor } } = _globalThis;
const alias = ({ Array: { of } } = { Array: { of: _Array$of } });
const ownKeys = _Reflect$ownKeys;
const mk = function ({ Map: { groupBy } } = { Map: { groupBy: _Map$groupBy } }) { return groupBy; };
export { of, fromEntries, floor, alias, mk };