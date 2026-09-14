// A nested instance leaf under an array wrapper whose paired element the source computes (a call,
// a selection, an optional chain) beside a SIBLING slot: the wrapper capture takes the whole literal
// once, position for position (`const [_ref, t1] = [realm(), eff('t1')]`), so every element reads in
// source order ahead of the per-element patterns, and the nested claim then extracts off its own
// captured slot - a rest sibling and a claim in the second slot ride the same capture. Both legs
// inject; the babel leg narrows the dispatcher to the Array variant where the captured element
// resolves to the global object (its typed re-anchor), the unplugin leg dispatches generically.
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";

const seen = [];
const eff = (t) => (_pushMaybeArray(seen).call(seen, t), t);
const realm = () => _globalThis;
const opaque = () => JSON.parse('{}');
const c = seen.length === 0;
const [_ref, _ref2] = [realm(), eff('t1')];
const a1 = _atMaybeArray(_ref.Array.prototype);
const t1 = _ref2;
const [_ref3, _ref4] = [opaque(), eff('t2')];
const a2 = _at(_ref3.Array.prototype);
const t2 = _ref4;
const [_ref5, _ref6] = [c ? _globalThis : realm(), eff('t3')];
const a3 = _at(_ref5.Array.prototype);
const t3 = _ref6;
const [_ref7, _ref8] = [null == _globalThis.window ? void 0 : _self, eff('t4')];
const a4 = _atMaybeArray(_ref7.Array.prototype);
const t4 = _ref8;
const [{ Array: { prototype: { at: a5 } } }, ...r5] = [realm(), eff('t5')];
const [_ref9, _ref10] = [eff('t6'), realm()];
const t6 = _ref9;
const a6 = _atMaybeArray(_ref10.Array.prototype);

export { a1, t1, a2, t2, a3, t3, a4, t4, a5, r5, a6, t6, seen };