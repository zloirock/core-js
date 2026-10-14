import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
// a nested claim inside an array wrapper's element is carried through the captured element: the whole
// array initializer runs first - an effectful neighbouring element included - and each receiver is read
// once, after it. a plain declaration reads its receiver once too, a neighbouring declarator keeping
// its place; a sibling key reads the same capture, a rest keeps the level native with its claim, and
// an effectful computed key runs on the captured value, after the coercibility check.
const arr = [3, [1, 2]];
const hb = {
  get y() {
    return [3, [1, 2]];
  }
};
let out;
const viaDeclSibling = _atMaybeArray(hb.y);
const viaDeclSiblingZ = 1;
const [_ref] = [{
  y: hb.y
}];
const viaWrapSole = _includesMaybeArray(_ref.y);
const [_ref2, _ref3] = [{
  y: hb.y
}, hb.y];
const viaWrapNeighbour = _findLastMaybeArray(_ref2.y);
const viaWrapNeighbourZ = _ref3;
const [_ref4] = [{
  y: _flatMaybeArray(arr).call(arr)
}];
const viaWrapCarried = _findLastIndexMaybeArray(_ref4.y);
const [{
  y: {
    toSorted: viaWrapCarriedRest,
    ...viaWrapCarriedRestOther
  }
}] = [{
  y: _flatMapMaybeArray(arr).call(arr, x => x)
}];
const [_ref5] = [{
  y: _concatMaybeArray(arr).call(arr),
  wz: 1
}];
const viaWrapCarriedSib = _toReversedMaybeArray(_ref5.y);
const {
  wz: viaWrapCarriedSibZ
} = _ref5;
const [_ref6] = [{
    y: _mapMaybeArray(arr).call(arr, x => x)
  }],
  {
    y: _ref7
  } = _ref6,
  viaWrapCarriedKey = null == _ref7 ? _ref7[""] : (out = 3, _fillMaybeArray(_ref7));
const [_ref8, _ref9] = [{
  y: _filterMaybeArray(arr).call(arr, x => x)
}, _toSplicedMaybeArray(arr).call(arr, 0, 0)];
const viaWrapCarriedNeighbour = _withMaybeArray(_ref8.y);
const viaWrapCarriedNeighbourZ = _ref9;
export { viaDeclSibling, viaDeclSiblingZ, viaWrapSole, viaWrapNeighbour, viaWrapNeighbourZ, out };
export { viaWrapCarried, viaWrapCarriedRest, viaWrapCarriedRestOther };
export { viaWrapCarriedSib, viaWrapCarriedSibZ, viaWrapCarriedKey };
export { viaWrapCarriedNeighbour, viaWrapCarriedNeighbourZ };