import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
var _ref15;
// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
let k = 0;
function pre() {}
function eff() {}
const first = 1,
  _ref = Array,
  f = null == _ref ? _ref[""] : (k++, _Array$from),
  {
    m
  } = _ref;
export { first, f, m };
const lead = pre(),
  _ref2 = (eff(), Array),
  ko = null == _ref2 ? _ref2[""] : (k++, _Array$of),
  {
    alsoMore
  } = _ref2;
export { lead, ko, alsoMore };
var lead2 = pre(),
  _ref3 = Array,
  ko2 = null == _ref3 ? _ref3[""] : (k++, _Array$of),
  {
    m2
  } = _ref3;
var lead3 = pre();
eff();
var P = _Map;
var {
  [(k++, 'Map')]: _unused,
  m3
} = _globalThis;
var lead4 = pre(),
  {
    [(k++, 'of')]: ko4,
    ...r4
  } = Array;
var lead5 = pre(),
  _ref4 = Array,
  ko5 = null == _ref4 ? _ref4[""] : (k++, _Array$of),
  _ref5 = _ref4,
  fr5 = null == _ref5 ? _ref5[""] : (k++, _Array$from),
  {
    m5
  } = _ref4;
for (var lead6 = pre(), _ref6 = (eff(), Array), ko6 = null == _ref6 ? _ref6[""] : (k++, _Array$of), {
    m6
  } = _ref6; false;) break;
if (k) var lead7 = pre(),
  _ref7 = (eff(), Array),
  ko7 = null == _ref7 ? _ref7[""] : (k++, _Array$of),
  {
    m7
  } = _ref7;
while (k < 0) var lead8 = pre(),
  _ref8 = Array,
  ko8 = null == _ref8 ? _ref8[""] : (k++, _Array$of),
  {
    m8
  } = _ref8;

// A literal receiver is evaluated once before its effectful key. Sibling declarators and
// control-flow hosts retain that position, and exports expose only the source bindings.
var t1 = 0,
  _ref9 = [1],
  a1 = null == _ref9 ? _ref9[""] : (k++, _atMaybeArray(_ref9));
var _ref10 = [1],
  a2 = null == _ref10 ? _ref10[""] : (k++, _atMaybeArray(_ref10)),
  t2 = 0;
var t3 = 0,
  _ref11 = [1],
  _ref12 = _ref11,
  a3 = null == _ref12 ? _ref12[""] : (k++, _atMaybeArray(_ref12)),
  {
    other3
  } = _ref11;
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
  _ref17 = _ref16,
  a7 = null == _ref17 ? _ref17[""] : (k++, _atMaybeArray(_ref17)),
  {
    m7b
  } = _ref16;
var _ref18 = [1],
  _ref19 = _ref18,
  a8 = null == _ref19 ? _ref19[""] : (k++, _atMaybeArray(_ref19)),
  {
    m8b
  } = _ref18,
  {
    [(k++, 'of')]: o8
  } = _ref18;

// Bodyless declaration hosts preserve sibling order. A nested static keeps its ordinary
// extraction, while an effectful instance key runs before dispatch and later property reads.
do var f9 = _Array$from,
  {
    keep9
  } = _globalThis,
  tail9 = 1; while (k < 0);
if (k) var lead10 = pre(),
  _ref20 = [1, 2],
  _ref21 = _ref20,
  a10 = null == _ref21 ? _ref21[""] : (k++, _atMaybeArray(_ref21)),
  {
    m10
  } = _ref20;

// several claimed array hosts of one declaration stand in separate statements once an object hop
// beside them split the declaration; each keeps its extraction as the declarator after itself
const M11 = _Map;
const {
  z11
} = {
  w: _globalThis,
  z11: 1
};
const [{
    Set: _unused2
  }, y11] = [_globalThis, 2],
  S11 = _Set;
const [{
    WeakMap: _unused3
  }, q11] = [_globalThis, 3],
  W11 = _WeakMap;
export default [f, m, ko, alsoMore, lead, ko2, m2, P, m3, ko4, r4, ko5, fr5, m5, ko6, m6, ko7, m7, ko8, m8, a1, a2, a3, other3, a4, a5, a6, t1, t2, t3, t4, t5, t6, o7, a7, m7b, a8, m8b, o8, f9, keep9, tail9, a10, m10, M11, z11, S11, y11, W11, q11, lead2, lead3, lead4, lead5, lead6, lead7, lead8, lead10, k];