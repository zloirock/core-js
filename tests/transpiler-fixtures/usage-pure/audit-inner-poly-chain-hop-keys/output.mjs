import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19;
// intermediate call hops between an inner and an outer polyfilled optional call all thread
// into one OR-guard chain. the key matters only for the hop's own POLYFILL lookup: a bare
// identifier and a computed STATIC-STRING key (string literal, template) resolve it; a
// dynamic key threads as a non-poly hop whose raw text re-emits verbatim
export const r1 = null == (_ref = _flatMaybeArray(arr)) || null == (_ref2 = _mapMaybeArray(_ref3 = _ref.call(arr)).call(_ref3, f)) ? void 0 : _at(_ref2).call(_ref2, 0);
export const r2 = null == (_ref4 = _flatMaybeArray(arr)) || null == (_ref5 = _filterMaybeArray(_ref6 = _ref4.call(arr)).call(_ref6, f)) ? void 0 : _at(_ref5).call(_ref5, 1);
export const r3 = null == (_ref7 = _flatMaybeArray(arr)) || null == (_ref8 = _sliceMaybeArray(_ref9 = _ref7.call(arr)).call(_ref9, 0)) ? void 0 : _at(_ref8).call(_ref8, 2);
export const r4 = null == (_ref10 = _flatMaybeArray(arr)) || null == (_ref11 = _ref10.call(arr)[key](f)) ? void 0 : _at(_ref11).call(_ref11, 3);
// a CONST-bound key resolves through the scope-aware canon like the literal form
const hop = 'map';
export const r5 = null == (_ref12 = _flatMaybeArray(arr)) || null == (_ref13 = _mapMaybeArray(_ref14 = _ref12.call(arr)).call(_ref14, f)) ? void 0 : _at(_ref13).call(_ref13, 4);
// an SE prefix on a poly hop key replays between the receiver memo and the dispatch
export const r6 = null == (_ref15 = _flatMaybeArray(arr)) || null == (_ref16 = (_ref17 = _ref15.call(arr), eff(), _filterMaybeArray(_ref17).call(_ref17, g))) ? void 0 : _at(_ref16).call(_ref16, 5);
// an all-NON-poly hop tail threads verbatim: the chain short-circuits through its own
// `?.` tokens and the single outer test covers it
export const r8 = null == (_ref18 = _flatMaybeArray(arr)?.call(arr)?.[eff3(), 'customY'](p)) ? void 0 : _at(_ref18).call(_ref18, 7);
export const r9 = null == (_ref19 = _flatMaybeArray(arr)?.call(arr)?.cA(p)?.cB(q)) ? void 0 : _at(_ref19).call(_ref19, 8);