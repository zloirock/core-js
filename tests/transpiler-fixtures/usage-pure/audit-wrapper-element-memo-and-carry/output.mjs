import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref3, _ref6, _ref7;
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
const [_ref2] = [_flatMaybeArray(arr).call(arr)];
const viaWrapOpaqueDefault = (_ref3 = _atMaybeArray(_ref2)) === void 0 ? null : _ref3;
// ... and the memo may hoist only where no LATER declarator carries effects of its own: one that
// does would have its element read before this declarator's own key
const _ref4 = _flatMaybeArray(arr).call(arr);
const viaWrapAheadOfPure = _atMaybeArray(_ref4);
const viaWrapPureTail = 1;
const [_ref5] = [hb.y],
  viaKeptResidual = _atMaybeArray(_ref5),
  {
    length: viaKeptLength
  } = _ref5,
  viaKeptTail = 1;
const [{
  at: viaSharedMemo,
  ...viaSharedRest
}] = [_sliceMaybeArray(_ref6 = hb.y).call(_ref6)];
// A wrapper element with a sequence prefix evaluates that prefix once before its method read.
let viaPeeledTail;
[_ref7] = [(out = 2, _flatMaybeArray(arr).call(arr))];
// A declaration reads each receiver once. An array wrapper captures its element before reading
// the nested property, while a neighbouring declarator keeps its own position.
viaPeeledTail = _atMaybeArray(_ref7);
const viaDeclSibling = _atMaybeArray(hb.y);
const viaDeclSiblingZ = 1;
const [_ref8] = [{
  y: hb.y
}];
const viaWrapSole = _atMaybeArray(_ref8.y);
// The complete array initializer runs before either captured element is destructured.
const [_ref9, _ref10] = [{
  y: hb.y
}, hb.y];
const viaWrapNeighbour = _atMaybeArray(_ref9.y);
const viaWrapNeighbourZ = _ref10;
// A sole nested binding reads through the captured element; rest and computed keys retain
// their own native pattern work.
const [_ref11] = [{
  y: _flatMaybeArray(arr).call(arr)
}];
const viaWrapCarried = _atMaybeArray(_ref11.y);
const [{
  y: {
    at: viaWrapCarriedRest,
    ...viaWrapCarriedRestOther
  }
}] = [{
  y: _flatMaybeArray(arr).call(arr)
}];
const [_ref12] = [{
  y: _flatMaybeArray(arr).call(arr),
  wz: 1
}];
const viaWrapCarriedSib = _atMaybeArray(_ref12.y);
const {
  wz: viaWrapCarriedSibZ
} = _ref12;
const [_ref13] = [{
    y: _flatMaybeArray(arr).call(arr)
  }],
  {
    y: _ref14
  } = _ref13,
  _ref15 = _ref14,
  viaWrapCarriedKey = null == _ref15 ? _ref15[""] : (out = 3, _atMaybeArray(_ref15));
// An effectful neighbouring element finishes before the first captured property read.
const [_ref16, _ref17] = [{
  y: _flatMaybeArray(arr).call(arr)
}, _flatMaybeArray(arr).call(arr)];
const viaWrapCarriedNeighbour = _atMaybeArray(_ref16.y);
const viaWrapCarriedNeighbourZ = _ref17;
export { viaWrapOpaque, viaWrapOpaqueDefault, viaWrapAheadOfPure, viaWrapPureTail, out };
export { viaKeptResidual, viaKeptLength, viaKeptTail, viaSharedMemo, viaSharedRest, viaPeeledTail };
export { viaDeclSibling, viaDeclSiblingZ, viaWrapSole, viaWrapNeighbour, viaWrapNeighbourZ };
export { viaWrapCarried, viaWrapCarriedRest, viaWrapCarriedRestOther };
export { viaWrapCarriedSib, viaWrapCarriedSibZ, viaWrapCarriedKey };
export { viaWrapCarriedNeighbour, viaWrapCarriedNeighbourZ };