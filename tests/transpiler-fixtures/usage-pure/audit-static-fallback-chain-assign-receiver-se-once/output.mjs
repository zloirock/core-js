import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Promise from "@core-js/pure/actual/promise/constructor";
// static-FALLBACK with a chain-assignment receiver AND a side-effecting computed key. the receiver
// replacement preserves the chain-assignment (`a = Promise`) as a receiver effect, but the computed
// `[key]` property survives and re-runs its own SE - so the key SE (`o.push('K')`) must run exactly
// once, not once in the receiver prefix and again in the surviving key.
let a;
const o = [];
export const r = (a = _Promise, _Promise)[_pushMaybeArray(o).call(o, 'K'), 'noSuchStatic'];