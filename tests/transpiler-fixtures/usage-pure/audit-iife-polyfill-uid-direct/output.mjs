import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// after pure rewrite, a polyfill UID is a direct Identifier reference: `_Promise` from a
// previous import. it's not a CallExpression, so the observable-effect check doesn't fire
// and no double-invocation hazard exists. lock current behaviour: the receiver is already
// the polyfill constructor identifier, and prototype-method `.then` resolves off it.
import _Promise from "@core-js/pure/actual/promise/constructor";
const out1 = _Promise$resolve(1).then(v => v + 1);
// inline arrow whose body returns a polyfill-bound Identifier: `() => _Map`. the receiver call
// `f()` inline-resolves to the Map constructor, and the instance-method `.keys` is gated off it:
// keys lives on `Map.prototype`, not on the constructor itself, so no polyfill emits and the call
// stays `_Map.keys()` - a runtime TypeError, exactly as the original `f().keys()`
import _Map from "@core-js/pure/actual/map/constructor";
const f = () => _Map;
const out2 = _Map.keys();
export { out1, out2 };