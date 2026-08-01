import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref4, _ref5, _ref7, _ref8, _ref9;
// the syntactic CONTEXTS a kept proxy root can be reached from. the rule does not depend on any of them -
// the assignment stays as the root, the redundant proxy hop drops, the guard survives - but each context
// reaches the collapse through its own visitor, so each pins separately: a kept root nested inside another
// kept root's value, a destructuring default, a class static method, an async arrow body, and a computed
// leaf key. distinct methods per line.
let n;
export const nestedKeptRoot = null == (_ref = n = null == _globalThis.window ? void 0 : _self.window) ? void 0 : _flatMaybeArray(_ref.Array.prototype).call([1, [2]]);
let p;
export const inDestructureDefault = (({
  x = null == (_ref2 = p = _globalThis.window) ? void 0 : _includesMaybeArray(_ref2.Array.prototype)
} = {}) => x)();
class Probe {
  static read() {
    var _ref3;
    let q;
    return null == (_ref3 = q = _globalThis.window) ? void 0 : _findLastMaybeArray(_ref3.Array.prototype).call([1], it => it);
  }
}
export const inClassStatic = Probe.read();
let r;
export const inAsyncArrow = (async () => (r = _globalThis.window)?.Array.prototype.some.call([1], it => it))();
let s;
export const computedLeafKey = null == (_ref4 = s = _globalThis.window) ? void 0 : _atMaybeArray(_ref4['Array'].prototype).call([1], 0);
// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
let fh;
for (const v of (null == (fh = _globalThis.window) ? void 0 : (c++, _Array$of(1, 2))) ?? []) void v;
let tp;
export const inTemplate = `${null == (_ref5 = tp = _globalThis.window) ? void 0 : _findIndexMaybeArray(_ref5[c++, "Array"].prototype).call([7], v => v === 7)}`;
let sp;
export const spreadOut = [...((null == (sp = _globalThis.window) ? void 0 : (c++, _Array$from))?.([3]) ?? [])];
class KeptHost {
  static probe = (null == _globalThis.window ? void 0 : (c++, _self))?.Array;
  // a PLAIN claimless tail after the guarded hop rides the source short-circuit: past an
  // absent `window` it must read nothing (not throw), and the key effect must not run
  static plainTail = (null == _globalThis.window ? void 0 : (c++, _self))?.Number;
  plainDotTail = (null == _globalThis.window ? void 0 : _self)?.JSON;
  // a chain END that is ITSELF a proxy hop - dotted, static-string computed or SE-keyed
  // computed alike - belongs to the alias / kept canons and stays raw (a value render of
  // only its object would strand the end hop outside the guard)
  static endHop = _globalThis.window?.self?.['window'];
  endHopSeKey = _globalThis.window?.self?.[c++, 'window'];
  field = (_globalThis.window ?? _globalThis)[c++, 'self']?.Array;
  static {
    var _ref6;
    let sb;
    void (null == (_ref6 = sb = _globalThis.window) ? void 0 : _findLastIndexMaybeArray(_ref6[c++, "Array"].prototype).call([1], v => v));
  }
}
export const keptHost = new KeptHost();

// a claimless ctor read in a `new` callee: the render stays inside the callee parens (a bare
// optional chain is not legal there), and an absent `window` throws in source and render alike
export const newCallee = new ((null == _globalThis.window ? void 0 : _self)?.CustomOther)(1);

// a call in the MIDDLE of the probe chain: the render lands on the deepest member whose object
// is the pure proxy nav, and the call rides the chain's own short-circuit outside it
export const midCall = (null == _globalThis.window ? void 0 : _self)?.foo().bar;

// a nullish-coalescing carrier over the probe chain: the guarded render is the left operand
export const nullishCarrier = (null == _globalThis.window ? void 0 : (c++, _self))?.JSON ?? 'absent';

// SE-keyed hop under a claimed static + instance dispatch: the dispatch's guard memoizes the
// probe root only, so the hop-key SE rides the claim body on the non-null branch
export const seKeyClaimDispatch = null == (_ref7 = _globalThis.window) ? void 0 : _flatMaybeArray(_ref8 = (c++, _Array$of)(8)).call(_ref8);

// bare-probe INSTANCE guard-memo spellings: the prototype-method call keeps the raw nav in
// the guard body (the locked alias/kept canon), the call-argument SE stays put; the SE-key
// claimless `new`-callee renders the pony guard inside the callee parens
export const bareProtoCall = null == (_ref9 = _globalThis.window) ? void 0 : _findMaybeArray(_ref9[c++, 'self'].Array.prototype).call([5], v => v === (c++, 5));
export const bareProtoUnpolyfilled = (null == _globalThis.window ? void 0 : (c++, _self))?.Array.prototype.indexOf.call([5], 5);
export const bareSeKeyNewCallee = new ((null == _globalThis.window ? void 0 : (c++, _self))?.CustomThing)();
export async function awaited() {
  let aw;
  return (aw = await _Promise$resolve(_globalThis.window))?.[c++, 'self']?.Array ?? null;
}
let sw;
switch ((sw = _globalThis.window)?.[c++, "Array"]) {
  default:
    break;
}
export const holder = {
  get val() {
    var _ref10;
    let gt;
    return null == (_ref10 = gt = _globalThis.window) ? void 0 : _mapMaybeArray(_ref10[c++, "Array"].prototype).call([9], v => v);
  }
};
export function* keptGen() {
  var _ref11;
  let yv;
  yield null == (_ref11 = yv = _globalThis.window) ? void 0 : _flatMapMaybeArray(_ref11[c++, "Array"].prototype).call([2], v => [v]);
}

// a param-default synth twin without a SE key: the wrapper default stays the synth target
export const fromSynthDefault = (({
  from
} = _globalThis.window ?? {
  from: x => [x]
}) => from)([1]);

// The kept double-optional through each remaining host: an ARRAY pattern source (never deferred),
// a for-of head, and an IIFE synth argument (the swap still owns the receiver over the narrowed
// defer). One memo at the root in the first two; the synth renders its own harvest in the third.
let c2 = 0;
let ap;
export const [firstOfKept] = (null == (ap = _globalThis.window) ? void 0 : (c2++, _Array$of(1, 2))) ?? [];
let fh2;
for (const v of (null == (fh2 = _globalThis.window) ? void 0 : (c2++, _Array$of(3))) ?? []) void v;
let sy;
export const ofKeptDouble = (({
  isArray
} = {}) => isArray)((sy = _globalThis.window)?.[c2++, "Array"] ?? {});
export { c2 };