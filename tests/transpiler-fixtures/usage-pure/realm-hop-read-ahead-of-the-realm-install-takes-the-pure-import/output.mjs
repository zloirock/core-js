import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// a realm name read as a KEY (`globalThis.self`) ahead of the realm's own install is the realm this build serves,
// as the bare name read there is: each spelling takes what it takes with no install - the hop folds, and the
// static, prototype, iterator or test off it reads the pure import, and so does an alias captured there. a read
// deferred into a function may run after the install, so it stays the user's
let q;
const alias = _self;
const g = _globalThis;
export const fromHop = _Array$from(list);
export const protoHop = _atMaybeArray(_self.Array.prototype);
export const iterHop = _getIteratorMethod(_self);
export const testedHop = _Promise$resolve(1);
export const of = _Array$of;
export const storedHop = (q = _self, _Map$groupBy);
export const aliased = _Array$of(3, 4);
export const viaAlias = g.Array;
export const viaAliasKey = g.Array.prototype;
export const optionalHop = _includesMaybeArray(_self.Array.prototype);
export const typedChain = _atMaybeArray(_ref = _Array$from(list)).call(_ref, -1);
export const selected = (_ref2 = c ? _globalThis : user, _ref2 === _globalThis ? _self : _ref2.self);
export const deferredHop = () => _globalThis.self.Array.of(1);
export const realm = _self;
export const fromRealm = _Array$from(list);
export { q };
_globalThis.self = _globalThis;