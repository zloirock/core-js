import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
var _ref15;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let k = 0;
function pre() {}
function eff() {}
const first = 1,
  _ref = Array,
  f = (k++, _Array$from),
  {
    m
  } = _ref;
export { first, f, m };
const lead = pre(),
  _ref2 = (eff(), Array),
  ko = (k++, _Array$of),
  {
    alsoMore
  } = _ref2;
export { lead, ko, alsoMore };
var lead2 = pre(),
  _ref3 = Array,
  ko2 = (k++, _Array$of),
  {
    m2
  } = _ref3;
var lead3 = pre(),
  _ref4 = (eff(), _globalThis),
  P = (k++, _Map),
  {
    m3
  } = _ref4;
var lead4 = pre(),
  _ref5 = Array,
  ko4 = (k++, _Array$of),
  {
    "of": _unused,
    ...r4
  } = _ref5;
var lead5 = pre(),
  _ref6 = Array,
  ko5 = (k++, _Array$of),
  fr5 = (k++, _Array$from),
  {
    m5
  } = _ref6;
for (var lead6 = pre(), _ref7 = (eff(), Array), ko6 = (k++, _Array$of), {
    m6
  } = _ref7; false;) break;
if (k) var lead7 = pre(),
  _ref8 = (eff(), Array),
  ko7 = (k++, _Array$of),
  {
    m7
  } = _ref8;
while (k < 0) var lead8 = pre(),
  _ref9 = Array,
  ko8 = (k++, _Array$of),
  {
    m8
  } = _ref9;

// A literal receiver is evaluated once before its effectful key. Sibling declarators and
// control-flow hosts retain that position, and exports expose only the source bindings.
var t1 = 0,
  _ref10 = [1],
  a1 = null == _ref10 ? _ref10[""] : (k++, _atMaybeArray(_ref10));
var _ref11 = [1],
  a2 = null == _ref11 ? _ref11[""] : (k++, _atMaybeArray(_ref11)),
  t2 = 0;
var t3 = 0,
  _ref12 = [1],
  a3 = null == _ref12 ? _ref12[""] : (k++, _atMaybeArray(_ref12)),
  {
    other3
  } = _ref12;
for (var t4 = 0, _ref13 = [1], a4 = null == _ref13 ? _ref13[""] : (k++, _atMaybeArray(_ref13)); false;) break;
if (k) var t5 = 0,
  _ref14 = [1],
  a5 = null == _ref14 ? _ref14[""] : (k++, _atMaybeArray(_ref14));
export const t6 = 0,
  a6 = (_ref15 = [1], null == _ref15 ? _ref15[""] : (k++, _atMaybeArray(_ref15)));

// Claimed and unclaimed keys interleave in source order: key, read, key, read. Sibling
// properties following an instance claim are read only after its dispatch.
var _ref16 = [1],
  {
    [(k++, 'of')]: o7
  } = _ref16,
  a7 = null == _ref16 ? _ref16[""] : (k++, _atMaybeArray(_ref16)),
  {
    m7b
  } = _ref16;
var _ref17 = [1],
  a8 = null == _ref17 ? _ref17[""] : (k++, _atMaybeArray(_ref17)),
  {
    m8b
  } = _ref17,
  {
    [(k++, 'of')]: o8
  } = _ref17;

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
  _ref18 = [1, 2],
  a10 = null == _ref18 ? _ref18[""] : (k++, _atMaybeArray(_ref18)),
  {
    m10
  } = _ref18;

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