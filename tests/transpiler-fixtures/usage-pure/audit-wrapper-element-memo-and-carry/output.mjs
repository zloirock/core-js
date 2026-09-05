import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref2, _ref6;
// a DECLARATION array wrapper whose element cannot be spelled twice memoizes it, whatever the prop
// count and whatever the leaf: the residual keeps the element slot, so the memo is what gives that
// residual and the dispatch beside it the ONE read the source performs
const arr = [3, [1, 2]];
const hb = {
  get y() {
    return [3, [1, 2]];
  }
};
let out;
const _ref = _flatMaybeArray(arr).call(arr);
const viaWrapOpaque = _atMaybeArray(_ref);
const _ref3 = _flatMaybeArray(arr).call(arr);
const viaWrapOpaqueDefault = (_ref2 = _atMaybeArray(_ref3)) === void 0 ? null : _ref2;
// ... and the memo may hoist only where no LATER declarator carries effects of its own: one that
// does would have its element read before this declarator's own key
const _ref4 = _flatMaybeArray(arr).call(arr);
const viaWrapAheadOfPure = _atMaybeArray(_ref4);
const viaWrapPureTail = 1; // ... and a SURVIVING residual keeps its extraction beside itself in the one declaration, a declarator
// the source wrote BEHIND them staying in that join (the memo ahead of it all), while a pattern left
// holding nothing but a rest reads through the memo from a statement of its own instead
const _ref5 = hb.y;
const [{
    length: viaKeptLength
  }] = [_ref5],
  viaKeptResidual = _atMaybeArray(_ref5),
  viaKeptTail = 1;
// ... and a receiver carrying a CLAIM OF ITS OWN memoizes what the tree holds AFTER that claim
// rendered, never the copy the plan captured - the rest below re-reads that one memo
const _ref7 = _sliceMaybeArray(_ref6 = hb.y).call(_ref6);
const viaSharedMemo = _atMaybeArray(_ref7);
const [{
  at: _unused,
  ...viaSharedRest
}] = [_ref7];
// a wrapper element the PEEL reduces to a sequence TAIL: the claim consumes the level whole and the
// dispatch carries the sequence as written, prefix included - one evaluation, in source order
let viaPeeledTail;
// a DECLARATION host reads its receiver once whatever keeps the DECLARATION alive: a consumed
// declarator splits off beside its siblings, and a sole array WRAPPER takes the element whole
viaPeeledTail = _atMaybeArray((out = 2, _flatMaybeArray(arr).call(arr)));
const viaDeclSibling = _atMaybeArray(hb.y);
const viaDeclSiblingZ = 1;
const viaWrapSole = _atMaybeArray(hb.y); // ... and a wrapper whose NEIGHBOUR still binds keeps the wrapper while THIS element goes empty: the
// read hoists into the memo the source reads it in, so the neighbour's own effect still runs after it
const _ref8 = hb.y;
const viaWrapNeighbour = _atMaybeArray(_ref8);
const [{}, viaWrapNeighbourZ] = [{
  y: _ref8
}, hb.y];
// ... and where this claim's leaf is the wrapper's ONLY binding the residual dies whole and the
// dispatch performs the element's one read itself
const viaWrapCarried = _atMaybeArray(_flatMaybeArray(arr).call(arr)); // ... while a reader that SURVIVES the slot - a rest, a sibling prop, a key with an effect of its
// own - makes the slot MEMOIZE instead: both readers then share the one read, the slot swapping to
// the ref in place. the residual it keeps holds every EFFECTFUL KEY under the consumed prop, not
// just the one at its top, since the removal takes the whole subtree
const _ref9 = _flatMaybeArray(arr).call(arr);
const viaWrapCarriedRest = _atMaybeArray(_ref9);
const [{
  y: {
    at: _unused2,
    ...viaWrapCarriedRestOther
  }
}] = [{
  y: _ref9
}];
const _ref10 = _flatMaybeArray(arr).call(arr);
const viaWrapCarriedSib = _atMaybeArray(_ref10);
const [{
  wz: viaWrapCarriedSibZ
}] = [{
  y: _ref10,
  wz: 1
}];
const _ref11 = _flatMaybeArray(arr).call(arr);
const viaWrapCarriedKey = _atMaybeArray(_ref11);
const [{
  y: {
    [(out = 3, 'at')]: _unused3
  }
}] = [{
  y: _ref11
}];
// ... and a NEIGHBOUR element bearing effects of its own is no obstacle to that memo: the receiver
// answers for ITS element alone, and the neighbour evaluates where the source evaluates it
const _ref12 = _flatMaybeArray(arr).call(arr);
const [{}, viaWrapCarriedNeighbourZ] = [{
  y: _ref12
}, _flatMaybeArray(arr).call(arr)];
const viaWrapCarriedNeighbour = _atMaybeArray(_ref12);
export { viaWrapOpaque, viaWrapOpaqueDefault, viaWrapAheadOfPure, viaWrapPureTail, out };
export { viaKeptResidual, viaKeptLength, viaKeptTail, viaSharedMemo, viaSharedRest, viaPeeledTail };
export { viaDeclSibling, viaDeclSiblingZ, viaWrapSole, viaWrapNeighbour, viaWrapNeighbourZ };
export { viaWrapCarried, viaWrapCarriedRest, viaWrapCarriedRestOther };
export { viaWrapCarriedSib, viaWrapCarriedSibZ, viaWrapCarriedKey };
export { viaWrapCarriedNeighbour, viaWrapCarriedNeighbourZ };