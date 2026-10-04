import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
var _ref6;
// Computed keys retain their effects across exports, declarator lists and control-flow hosts.
// Static extractions and instance dispatches preserve receiver evaluation and sibling read order.
let k = 0;
function pre() {}
function eff() {}
const first = 1,
  f = (k++, _Array$from),
  {
    m
  } = Array;
export { first, f, m };
const lead = pre(),
  {} = (eff(), Array),
  ko = (k++, _Array$of),
  {
    alsoMore
  } = Array;
export { lead, ko, alsoMore };
var lead2 = pre(),
  ko2 = (k++, _Array$of),
  {
    m2
  } = Array;
var lead3 = pre(),
  {} = (eff(), _globalThis),
  P = (k++, _Map),
  {
    m3
  } = _globalThis;
var lead4 = pre(),
  ko4 = (k++, _Array$of),
  {
    "of": _unused,
    ...r4
  } = Array;
var lead5 = pre(),
  ko5 = (k++, _Array$of),
  fr5 = (k++, _Array$from),
  {
    m5
  } = Array;
for (var lead6 = pre(), {} = (eff(), Array), ko6 = (k++, _Array$of), {
    m6
  } = Array; false;) break;
if (k) var lead7 = pre(),
  {} = (eff(), Array),
  ko7 = (k++, _Array$of),
  {
    m7
  } = Array;
while (k < 0) var lead8 = pre(),
  ko8 = (k++, _Array$of),
  {
    m8
  } = Array;

// A literal receiver is evaluated once before its effectful key. Sibling declarators and
// control-flow hosts retain that position, and exports expose only the source bindings.
var t1 = 0,
  _ref = [1],
  a1 = null == _ref ? _ref[""] : (k++, _atMaybeArray(_ref));
var _ref2 = [1],
  a2 = null == _ref2 ? _ref2[""] : (k++, _atMaybeArray(_ref2)),
  t2 = 0;
var t3 = 0,
  _ref3 = [1],
  a3 = null == _ref3 ? _ref3[""] : (k++, _atMaybeArray(_ref3)),
  {
    other3
  } = _ref3;
for (var t4 = 0, _ref4 = [1], a4 = null == _ref4 ? _ref4[""] : (k++, _atMaybeArray(_ref4)); false;) break;
if (k) var t5 = 0,
  _ref5 = [1],
  a5 = null == _ref5 ? _ref5[""] : (k++, _atMaybeArray(_ref5));
export const t6 = 0,
  a6 = (_ref6 = [1], null == _ref6 ? _ref6[""] : (k++, _atMaybeArray(_ref6)));

// Claimed and unclaimed keys interleave in source order: key, read, key, read. Sibling
// properties following an instance claim are read only after its dispatch.
var _ref7 = [1],
  {
    [(k++, 'of')]: o7
  } = _ref7,
  a7 = (k++, _atMaybeArray(_ref7)),
  {
    m7b
  } = _ref7;
var _ref8 = [1],
  a8 = null == _ref8 ? _ref8[""] : (k++, _atMaybeArray(_ref8)),
  {
    m8b
  } = _ref8,
  {
    [(k++, 'of')]: o8
  } = _ref8;

// Bodyless declaration hosts preserve sibling order. A nested static keeps its ordinary
// extraction, while an effectful instance key runs before dispatch and later property reads.
do var {
    Array: {
      from: f9
    },
    keep9
  } = {
    Array: {
      from: _Array$from
    },
    keep9: _globalThis.keep9
  },
  tail9 = 1; while (k < 0);
if (k) var lead10 = pre(),
  _ref9 = [1, 2],
  a10 = null == _ref9 ? _ref9[""] : (k++, _atMaybeArray(_ref9)),
  {
    m10
  } = _ref9;

// several claimed hosts of one declaration - an object hop and the array wrappers beside it - stay one
// declaration: each literal takes its mirror in place
const {
    w: {
      Map: M11
    },
    z11
  } = {
    w: {
      Map: _Map
    },
    z11: 1
  },
  [{
    Set: S11
  }, y11] = [{
    Set: _Set
  }, 2],
  [{
    WeakMap: W11
  }, q11] = [{
    WeakMap: _WeakMap
  }, 3];
export default [f, m, ko, alsoMore, lead, ko2, m2, P, m3, ko4, r4, ko5, fr5, m5, ko6, m6, ko7, m7, ko8, m8, a1, a2, a3, other3, a4, a5, a6, t1, t2, t3, t4, t5, t6, o7, a7, m7b, a8, m8b, o8, f9, keep9, tail9, a10, m10, M11, z11, S11, y11, W11, q11, lead2, lead3, lead4, lead5, lead6, lead7, lead8, lead10, k];