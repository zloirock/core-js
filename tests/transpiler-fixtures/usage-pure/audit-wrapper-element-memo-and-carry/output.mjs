import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref2, _ref4, _ref5;
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
const viaWrapOpaque = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const [_ref] = [_flatMaybeArray(arr).call(arr)];
const viaWrapOpaqueDefault = (_ref2 = _atMaybeArray(_ref)) === void 0 ? null : _ref2;
// ... and the memo may hoist only where no LATER declarator carries effects of its own: one that
// does would have its element read before this declarator's own key
const viaWrapAheadOfPure = _atMaybeArray(_flatMaybeArray(arr).call(arr));
const viaWrapPureTail = 1;
const [_ref3] = [hb.y],
  viaKeptResidual = _atMaybeArray(_ref3),
  {
    length: viaKeptLength
  } = _ref3,
  viaKeptTail = 1;
const [{
  at: viaSharedMemo,
  ...viaSharedRest
}] = [_sliceMaybeArray(_ref4 = hb.y).call(_ref4)];
// A wrapper element with a sequence prefix evaluates that prefix once before its method read.
let viaPeeledTail;
[_ref5] = [(out = 2, _flatMaybeArray(arr).call(arr))];
// A declaration reads each receiver once. An array wrapper captures its element before reading
// the nested property, while a neighbouring declarator keeps its own position.
viaPeeledTail = _atMaybeArray(_ref5);
const viaDeclSibling = _atMaybeArray(hb.y);
const viaDeclSiblingZ = 1;
const [_ref6] = [{
  y: hb.y
}];
const viaWrapSole = _atMaybeArray(_ref6.y);
// The complete array initializer runs before either captured element is destructured.
const [_ref7, _ref8] = [{
  y: hb.y
}, hb.y];
const viaWrapNeighbour = _atMaybeArray(_ref7.y);
const viaWrapNeighbourZ = _ref8;
// A sole nested binding reads through the captured element; rest and computed keys retain
// their own native pattern work.
const [_ref9] = [{
  y: _flatMaybeArray(arr).call(arr)
}];
const viaWrapCarried = _atMaybeArray(_ref9.y);
const [{
  y: {
    at: viaWrapCarriedRest,
    ...viaWrapCarriedRestOther
  }
}] = [{
  y: _flatMaybeArray(arr).call(arr)
}];
const [_ref10] = [{
  y: _flatMaybeArray(arr).call(arr),
  wz: 1
}];
const viaWrapCarriedSib = _atMaybeArray(_ref10.y);
const {
  wz: viaWrapCarriedSibZ
} = _ref10;
const [_ref11] = [{
    y: _flatMaybeArray(arr).call(arr)
  }],
  {
    y: _ref12
  } = _ref11,
  viaWrapCarriedKey = null == _ref12 ? _ref12[""] : (out = 3, _atMaybeArray(_ref12));
// An effectful neighbouring element finishes before the first captured property read.
const [_ref13, _ref14] = [{
  y: _flatMaybeArray(arr).call(arr)
}, _flatMaybeArray(arr).call(arr)];
const viaWrapCarriedNeighbour = _atMaybeArray(_ref13.y);
const viaWrapCarriedNeighbourZ = _ref14;
export { viaWrapOpaque, viaWrapOpaqueDefault, viaWrapAheadOfPure, viaWrapPureTail, out };
export { viaKeptResidual, viaKeptLength, viaKeptTail, viaSharedMemo, viaSharedRest, viaPeeledTail };
export { viaDeclSibling, viaDeclSiblingZ, viaWrapSole, viaWrapNeighbour, viaWrapNeighbourZ };
export { viaWrapCarried, viaWrapCarriedRest, viaWrapCarriedRestOther };
export { viaWrapCarriedSib, viaWrapCarriedSibZ, viaWrapCarriedKey };
export { viaWrapCarriedNeighbour, viaWrapCarriedNeighbourZ };