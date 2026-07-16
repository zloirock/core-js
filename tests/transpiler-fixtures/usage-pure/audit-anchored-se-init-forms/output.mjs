import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$getOwnPropertySymbols from "@core-js/pure/actual/object/get-own-property-symbols";
import _Object$getPrototypeOf from "@core-js/pure/actual/object/get-prototype-of";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Set from "@core-js/pure/actual/set/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// An SE-bearing init joins the anchored proxy-hop family when every effect rides a
// re-emittable channel: a sequence prefix replays once ahead of the re-anchored read
// (or lifts standalone on full consume), a chain-assignment is rescued WHOLE. The fold
// is what keeps a PROXY key readable off-engine (the raw residual read `.self` off the
// pure root throws where the folded form works).
// sequence prefix + proxy key - the hop folds, the prefix replays once
const {
  navigator: nav
} = (eff(), _globalThis);
// chain-assignment + proxy key - the assignment replays whole (binding update observable)
let q;
const {
  location: loc
} = (q = _globalThis, _globalThis);
// sequence prefix + ctor key, zero extractions - re-anchored residual keeps the prefix
const {
  customB
} = (eff(), _Set);
// chain-assignment + full consume - the assignment rides the extraction prefix
let w;
const groupBy = (w = _globalThis, _Map$groupBy); // mixed extraction + residual - the prefix runs exactly once (lift, not lift + replay)
const tryFn = _Promise$try;
const {
  customP
} = (eff(), _Promise);
// negative: a ternary-branch effect keeps the nested handling (branch may not be taken)
const {
  Iterator: {
    customC
  }
} = cond ? (eff(), _globalThis) : _globalThis;
// assignment-form host: the cascade lifts the prefix standalone and the hop still folds
let nv2;
eff();
({
  isSecureContext: nv2
} = _globalThis);
// assignment-form + chain-assignment: the rescued assignment replays in the rebuilt init
let q2, cr;
({
  crossOriginIsolated: cr
} = (q2 = _globalThis, _globalThis));
// bodyless-if host blockifies and the effect stays CONDITIONAL (runs only with the branch)
let ok;
if (cond) {
  eff();
  ({
    isSecureContext: ok
  } = _globalThis);
}
// for-init-buried host: the fold reaches the sink's re-embedded slot (proxy key + chain init)
let q8, onx, out8;
for (const _ref = ({
    ononline: onx
  } = (q8 = _globalThis, _globalThis), Object), fk = _Object$keys; !out8;) out8 = fk;
// for-init FULL-consume host whose receiver is a proxy global (the flatten-route sink):
// the buried host folds before the sink assembly captures it
let customY2, outFC;
for (const g2 = _Map$groupBy, _unused = ({
    onlanguagechange: customY2
  } = _globalThis, _globalThis); !outFC;) outFC = g2;
// recursion boundary: a host buried in the prefix an ANCHORED RESIDUAL itself replays
// stays verbatim (root substituted, effect once) - replayed slices are not re-folded
let customFR, outFR;
for (const {
  customFR: fr
} = ({
  self: {
    onoffline: customFR
  }
} = _globalThis, _Promise); !outFR;) outFR = fr;
// an extraction-bearing buried host (a symbol-iterator leaf) bails the fold on a FOR-INIT
// host in both emitters (no statement slot for the synth) - keyed verbatim, and the bail
// must not leak the discarded render's imports
let itF, outSF;
for (const _ref2 = ({
    WeakSet: {
      [_Symbol$iterator]: itF
    }
  } = _globalThis, Object), gopn = _Object$getOwnPropertyNames; !outSF;) outSF = gopn;
// a rest sibling under the buried hop bails the fold (rest excludes the peel) - verbatim
let onc, rst, outRS;
for (const _ref3 = ({
    self: {
      onclick: onc,
      ...rst
    }
  } = _globalThis, Object), gops = _Object$getOwnPropertySymbols; !outRS;) outRS = gops;
// multi-declarator host: the replayed effect stays BETWEEN sibling inits (native order) -
// the anchored residual owns its SE inline instead of lifting it above the pre-sibling
const sA = sideA();
const {
  onresize: onrs
} = (eff(), _globalThis);
const sB = sideB(); // export host keeps the re-export wrap around the inline-replayed residual
export const {
  customEX
} = (eff(), _WeakMap);
// consecutive proxy hops peel to the ctor anchor with the prefix replayed once
const {
  customML
} = (eff(), _globalThis.RegExp);
// FULL-consume multi-declarator: the split machinery keeps the lifted effect between siblings
const sC = sideA();
eff();
const fe = _Object$fromEntries;
const sD = sideB(); // bodyless-if var host keeps the inline replay in the bodyless slot (effect stays conditional)
if (cond) var {
  oncut: bod
} = (eff(), _globalThis);
// transparent wrappers around the SE-init peel: a TS cast and oxc-kept parens both fold
const {
  onblur: tb
} = (eff(), _globalThis);
const {
  onfocus: pf
} = (eff(), _globalThis);
// marked NON-host SE operands in a for-init sink stay verbatim, each effect exactly once
let outNH;
for (const _ref4 = (eff(), other(), Object), gpo = _Object$getPrototypeOf; !outNH;) outNH = gpo;
export const r = [nav, q, loc, customB, w, groupBy, tryFn, customP, customC, nv2, q2, cr, ok, q8, onx, out8, customY2, outFC, customFR, outFR, itF, outSF, onc, rst, outRS, sA, onrs, sB, customEX, customML, sC, fe, sD, bod, tb, pf, outNH];