import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Reflect from "@core-js/pure/actual/reflect/namespace";
import _Reflect$ownKeys from "@core-js/pure/actual/reflect/own-keys";
// a chain assignment writes its TAIL into every name on the chain, so a dominating `x = y = V` write
// installs `V` whatever channel later reads the alias: a bare receiver, a computed key, a callee, an
// array-wrapper alias, a class base and a class static container. one write-value canon answers
// them all - a channel judging the raw `y = V` node resolves nothing and drops the polyfill
// the bare receiver takes the tail as the ONE value its read observes: the dominating write is the
// live value, so the static binds the ponyfill outright - no runtime ctor guard is owed

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
const allSettled = _Promise$allSettled;
export const wrapperAlias = allSettled([]);
let base = Object,
  b2;
base = b2 = _Reflect;
class Base extends base {
  static go() {
    return _Reflect$ownKeys.call(this, {});
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