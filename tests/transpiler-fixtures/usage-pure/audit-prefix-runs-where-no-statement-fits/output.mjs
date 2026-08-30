import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// the same prefix rule where the host has no statement slot to lift into. a bodyless control slot
// is BRACED first, so the effect stays conditional; a multi-declarator host SPLITS and the prefix
// opens its own declarator's group, past the sibling init that runs before it - and so does the
// extraction of a prop whose OWN key carries an effect, whose key then runs where it stands; a for-init header
// hosts no statement at all, so the prefix rides the FIRST extraction's value; an ARRAY WRAPPER
// keeps its literal in the residual and takes the lift ahead of the extraction like a plain host.
// the negative: a nested hop or a rest sibling re-reads the receiver through the residual, so
// there the whole read stays where it was written.
function eff() {}
function pre() {}
var bm, bo;
if (_globalThis) {
  eff();
  bm = _Map;
  ({
    other: bo
  } = _globalThis);
}
if (_globalThis) {
  eff();
  var bs = _Set;
  var {
    alsoOther
  } = _globalThis;
}
var first = pre();
eff();
var dw = _WeakMap;
var {
  stillOther
} = _globalThis;
let kk = 0;
var lead = pre();
eff();
var ko = _Array$of;
var {
  [(kk++, 'of')]: _unused,
  alsoMore
} = Array;
for (var fw = (eff(), _WeakSet), {
    moreOther
  } = _globalThis; false;) break;
eff();
var aw = _Map;
var [{
  Map: _unused2
}, alsoWrapped] = [_globalThis, 1];
for (const nf = _Array$from, {
    Array: _unused3,
    ...rest
  } = (eff(), _globalThis); false;) break;
export const r = [bm, bo, bs, alsoOther, first, dw, stillOther, lead, ko, alsoMore, kk, fw, moreOther, aw, alsoWrapped, nf, rest];