import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref2, _ref6;
// Object-rest keeps the affected pattern native, including inside an array wrapper.
// Independent reads and key/default expressions still receive their own polyfills.
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
const viaWrapPureTail = 1;
const _ref5 = hb.y;
const [{
    length: viaKeptLength
  }] = [_ref5],
  viaKeptResidual = _atMaybeArray(_ref5),
  viaKeptTail = 1;
const [{
  at: viaSharedMemo,
  ...viaSharedRest
}] = [_sliceMaybeArray(_ref6 = hb.y).call(_ref6)];
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
const _ref7 = hb.y;
const viaWrapNeighbour = _atMaybeArray(_ref7);
const [{}, viaWrapNeighbourZ] = [{
  y: _ref7
}, hb.y];
// ... and where this claim's leaf is the wrapper's ONLY binding the residual dies whole and the
// dispatch performs the element's one read itself
const viaWrapCarried = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const [{
  y: {
    at: viaWrapCarriedRest,
    ...viaWrapCarriedRestOther
  }
}] = [{
  y: _flatMaybeArray(arr).call(arr)
}];
const _ref8 = _flatMaybeArray(arr).call(arr);
const viaWrapCarriedSib = _atMaybeArray(_ref8);
const [{
  wz: viaWrapCarriedSibZ
}] = [{
  y: _ref8,
  wz: 1
}];
const [_ref9] = [{
    y: _flatMaybeArray(arr).call(arr)
  }],
  {
    y: _ref10
  } = _ref9,
  _ref11 = _ref10,
  viaWrapCarriedKey = null == _ref11 ? _ref11[""] : (out = 3, _atMaybeArray(_ref11));
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