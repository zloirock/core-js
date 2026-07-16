import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
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
var _ref, _ref2, _ref4, _ref5;
// the syntactic CONTEXTS a kept proxy root can be reached from. the rule does not depend on any of them -
// the assignment stays as the root, the redundant proxy hop drops, the guard survives - but each context
// reaches the collapse through its own visitor, so each pins separately: a kept root nested inside another
// kept root's value, a destructuring default, a class static method, an async arrow body, and a computed
// leaf key. distinct methods per line.
let n;
export const nestedKeptRoot = null == (_ref = n = _globalThis.window?.self.window) ? void 0 : _flatMaybeArray(_ref.Array.prototype).call([1, [2]]);
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
for (const v of (fh = _globalThis.window)?.[c++, "Array"].of(1, 2) ?? []) void v;
let tp;
export const inTemplate = `${null == (_ref5 = tp = _globalThis.window) ? void 0 : _findIndexMaybeArray(_ref5[c++, "Array"].prototype).call([7], v => v === 7)}`;
let sp;
export const spreadOut = [...((sp = _globalThis.window)?.[c++, "Array"].from?.([3]) ?? [])];
class KeptHost {
  static probe = (c++, _globalThis).Array;
  field = (_globalThis.window ?? _globalThis)[c++, 'self']?.Array;
  static {
    var _ref6;
    let sb;
    void (null == (_ref6 = sb = _globalThis.window) ? void 0 : _findLastIndexMaybeArray(_ref6[c++, "Array"].prototype).call([1], v => v));
  }
}
export const keptHost = new KeptHost();
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
    var _ref7;
    let gt;
    return null == (_ref7 = gt = _globalThis.window) ? void 0 : _mapMaybeArray(_ref7[c++, "Array"].prototype).call([9], v => v);
  }
};
export function* keptGen() {
  var _ref8;
  let yv;
  yield null == (_ref8 = yv = _globalThis.window) ? void 0 : _flatMapMaybeArray(_ref8[c++, "Array"].prototype).call([2], v => [v]);
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
export const [firstOfKept] = (ap = _globalThis.window)?.[c2++, "Array"].of(1, 2) ?? [];
let fh2;
for (const v of (fh2 = _globalThis.window)?.[c2++, "Array"].of(3) ?? []) void v;
let sy;
export const ofKeptDouble = (({
  isArray
} = {}) => isArray)((sy = _globalThis.window)?.[c2++, "Array"] ?? {});
export { c2 };