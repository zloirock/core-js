import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
// a chain assignment writes its TAIL into every name on the chain, so a dominating `x = y = V` write
// installs `V` whatever channel later reads the alias - a bare receiver, a computed key, a callee, an
// array-wrapper alias, a class base or static container - and the static binds the ponyfill outright.
// a reassigned heritage imports the namespace entry, not `*/constructor`: the census holds the family of
// every value written to it, though the super read is served - an accepted over-hold

let recv = Object,
  r2;
recv = r2 = Array;
export const bareReceiver = _Array$from('ab');
let key = 'isArray',
  k2;
key = k2 = 'fromAsync';
export const computedKey = _Array$fromAsync([]);
let mk = () => ({}),
  m2;
mk = m2 = () => _globalThis;
export const callee = _Array$of(1);
let wrap = [Object],
  w2;
wrap = w2 = [_Promise];
const [_ref] = wrap;
const {
  allSettled: _unused
} = _ref;
const allSettled = _Promise$allSettled;
export const wrapperAlias = allSettled.call(_Promise, []);
let base = Object,
  b2;
base = b2 = _Iterator;
class Base extends base {
  static go() {
    return _Iterator$from.call(this, [1]);
  }
}
export const classBase = Base.go();
let box = {
    B: Object
  },
  x2;
box = x2 = {
  B: _Map
};
class Boxed extends box.B {
  static go() {
    return _Map$groupBy.call(this, [], () => 1);
  }
}
export const classContainer = Boxed.go();