import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17;
// A non-bare optional root feeds two non-optional polyfilled hops, so the inner hop reuses the
// memoized root via a guardRef needle. The needle's boundary check reads the char after the root
// spelling; a valid connector may carry a comment or whitespace before `?.`, so a bare index would
// see the gap, decide the needle has no root boundary, skip the guardRef candidate, and then the
// needle fails to locate in the outer content - throwing on the whole file. The read must skip the gap.
const a = {
  b: {
    c: [[1], [2]]
  }
};
null == (_ref = a.b /* keep me */) ? void 0 : _flatMaybeArray(_ref2 = _sliceMaybeArray(_ref3 = _ref.c).call(_ref3, 1)).call(_ref2, 2);

// A gap on BOTH connectors, and one trailing the leaf: every boundary read the needle machinery
// does must skip the gap, including the end-of-needle case where only a comment follows the root.
const t = {
  u: {
    v: [[3], [4]]
  }
};
null == (_ref4 = t.u /* one */) ? void 0 : _flatMaybeArray(_ref5 = _sliceMaybeArray(_ref6 = _ref4.v /* two */).call(_ref6, 0) /* three */).call(_ref5, 1);

// A line-terminator gap is a gap too (a prettier rewrap of a minified chain).
const w = {
  q: {
    r: [[5]]
  }
};
null == (_ref7 = w.q) ? void 0 : _flatMaybeArray(_ref8 = _sliceMaybeArray(_ref9 = _ref7.r).call(_ref9, 0)).call(_ref8, 1);

// A gap TRAILING the last hop only: the boundary reads before `?.` see no gap here, and the
// end-of-chain comment must neither confuse the needle nor survive into a wrong slot.
const p = {
  q: {
    r: [[5], [6]]
  }
};
null == (_ref10 = p.q) ? void 0 : _flatMaybeArray(_ref11 = _sliceMaybeArray(_ref12 = _ref10.r).call(_ref12, 1)).call(_ref11, 0) /* tail */;

// The root itself is parenthesized with an inner trailing comment: the memoized value is the
// paren expression, and the comment stays inside the memo assignment.
const s = {
  t: {
    u: [[7]]
  }
};
null == (_ref13 = s.t /* in */) ? void 0 : _flatMapMaybeArray(_ref14 = _sliceMaybeArray(_ref15 = _ref13.u).call(_ref15, 0)).call(_ref14, v => v);

// A ternary CONSUMES the guarded chain: the root-boundary gate accepts the chain inside the
// test position, and the guard-memo wraps only the chain, not the branches.
const k = {
  l: [[8]]
};
export const viaTernary = (null == (_ref16 = k.l) ? void 0 : _flatMaybeArray(_ref16).call(_ref16, 0)) ? _flatMaybeArray(_ref17 = k.l).call(_ref17, 1) : null;