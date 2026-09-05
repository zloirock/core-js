import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a STATIC (or ctor) claim under an effectful key beside SIBLING declarators takes the plain static's
// canon: one statement per declarator, the extraction in its own declarator's group ahead of the
// sentinel residual and BEHIND the receiver's sequence prefix - which is where the source ran it
// (an extraction ahead of the prefix would bind before the prefix could observe the binding).
// the same on an exported host (the prefix a plain statement ahead of the export), in a loop head
// (declarators, the prefix riding the value), and in a bodyless slot (the join, or a block around
// the lifted prefix). a static keeps its default guard there like the flat twin does
let k = 0;
function pre() {}
function eff() {}
export const first = 1;
export const f = _Array$from;
export const {
  [(k++, 'from')]: _unused,
  m
} = Array;
export const lead = pre();
eff();
export const ko = _Array$of;
export const {
  [(k++, 'of')]: _unused2,
  alsoMore
} = Array;
var lead2 = pre();
var ko2 = _Array$of === void 0 ? 1 : _Array$of;
var {
  [(k++, 'of')]: _unused3,
  m2
} = Array;
var lead3 = pre();
eff();
var P = _Map;
var {
  [(k++, 'Map')]: _unused4,
  m3
} = _globalThis;
var lead4 = pre();
var ko4 = _Array$of;
var {
  [(k++, 'of')]: _unused5,
  ...r4
} = Array;
var lead5 = pre();
var ko5 = _Array$of;
var fr5 = _Array$from;
var {
  [(k++, 'of')]: _unused6,
  [(k++, 'from')]: _unused7,
  m5
} = Array;
for (var lead6 = pre(), {
    [(k++, 'of')]: _unused8,
    m6
  } = (eff(), Array), ko6 = _Array$of; false;) break;
if (k) {
  var lead7 = pre();
  eff();
  var ko7 = _Array$of;
  var {
    [(k++, 'of')]: _unused9,
    m7
  } = Array;
}
while (k < 0) var lead8 = pre(),
  ko8 = _Array$of,
  {
    [(k++, 'of')]: _unused10,
    m8
  } = Array;

// a CONSTANT-literal receiver under an effectful key memoizes beside sibling declarators too, the
// memo a preceding declarator at the source slot (or the `const` statement ahead where the residual
// holds the sentinel alone and a sibling was written ahead of it); a bodyless slot joins it, a loop
// head takes it as a declarator, an export keeps the memo off the module surface
var t1 = 0;
const _ref = [1];
var {
    [(k++, 'at')]: _unused11
  } = _ref,
  a1 = _atMaybeArray(_ref);
const _ref2 = [1];
var {
    [(k++, 'at')]: _unused12
  } = _ref2,
  a2 = _atMaybeArray(_ref2),
  t2 = 0;
var t3 = 0,
  _ref3 = [1],
  {
    [(k++, 'at')]: _unused13,
    other3
  } = _ref3,
  a3 = _atMaybeArray(_ref3);
for (var t4 = 0, _ref4 = [1], {
    [(k++, 'at')]: _unused14
  } = _ref4, a4 = _atMaybeArray(_ref4); false;) break;
if (k) var t5 = 0,
  _ref5 = [1],
  {
    [(k++, 'at')]: _unused15
  } = _ref5,
  a5 = _atMaybeArray(_ref5);
export const t6 = 0;
const _ref6 = [1];
export const {
    [(k++, 'at')]: _unused16
  } = _ref6,
  a6 = _atMaybeArray(_ref6); // an UNCLAIMED effectful key beside a claim still segments the residual at the claim: native runs
// key, read, key, read, and the props past the claim are read after its dispatch
var _ref7 = [1],
  {
    [(k++, 'of')]: o7,
    [(k++, 'at')]: _unused17
  } = _ref7,
  a7 = _atMaybeArray(_ref7),
  {
    m7b
  } = _ref7;
var _ref8 = [1],
  {
    [(k++, 'at')]: _unused18
  } = _ref8,
  a8 = _atMaybeArray(_ref8),
  {
    m8b,
    [(k++, 'of')]: o8
  } = _ref8;

// a bodyless slot beside sibling declarators: the flatten leaf and the static bind AHEAD of the
// residual, the instance claim behind the sentinel whose key runs first
do var f9 = _Array$from,
  {
    keep9
  } = _globalThis,
  tail9 = 1; while (k < 0);
if (k) var lead10 = pre(),
  _ref9 = [1, 2],
  {
    [(k++, 'at')]: _unused19,
    m10
  } = _ref9,
  a10 = _atMaybeArray(_ref9);

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
    Set: _unused20
  }, y11] = [_globalThis, 2],
  S11 = _Set;
const [{
    WeakMap: _unused21
  }, q11] = [_globalThis, 3],
  W11 = _WeakMap;
export default [f, m, ko, alsoMore, lead, ko2, m2, P, m3, ko4, r4, ko5, fr5, m5, ko6, m6, ko7, m7, ko8, m8, a1, a2, a3, other3, a4, a5, a6, t1, t2, t3, t4, t5, t6, o7, a7, m7b, a8, m8b, o8, f9, keep9, tail9, a10, m10, M11, z11, S11, y11, W11, q11, lead2, lead3, lead4, lead5, lead6, lead7, lead8, lead10, k];