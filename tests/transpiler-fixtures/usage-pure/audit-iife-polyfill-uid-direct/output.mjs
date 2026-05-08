import _keys from "@core-js/pure/actual/instance/keys";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// after pure rewrite, a polyfill UID is a direct Identifier reference: `_Promise`
// from a previous import. it's not a CallExpression - inlineCallHasObservableEffects
// is gated behind `obj.type === CallExpression`, so this path doesn't fire and no
// double-invocation hazard exists. lock current behaviour: receiver is the polyfill
// constructor identifier already, prototype-method `.then` resolves through the
// maybe-instance path
import _Promise from "@core-js/pure/actual/promise/constructor";
var _ref;
const out1 = _Promise$resolve(1).then(v => v + 1);
// inline arrow whose body returns a polyfill-bound Identifier: `() => _Map`. the
// receiver call here IS a CallExpression, but its inline-resolved return is a
// non-call Identifier so inlineCallHasObservableEffects body-shape check returns
// false (single ReturnStatement). polyfill emits without a SequenceExpression wrap
import _Map from "@core-js/pure/actual/map/constructor";
const f = () => _Map;
const out2 = _keys(_ref = f()).call(_ref);
export { out1, out2 };