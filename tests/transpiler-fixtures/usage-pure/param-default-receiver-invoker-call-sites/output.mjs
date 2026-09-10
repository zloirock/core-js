import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _includes from "@core-js/pure/actual/instance/includes";
import _Reflect$apply from "@core-js/pure/actual/reflect/apply";
// a call is not one syntactic shape. `.call` drops the receiver slot, `.apply` spreads an inline
// array, a `bind` invoked on the spot prepends what it captured and `Reflect.apply` puts the
// function in the first slot - each is an invocation whose arguments land in the parameters, so a
// census matching the plain callee slot alone read every one of them as "not a call" and lost the
// slot's proof. the negatives ride along: an argument at the slot overrides the default through
// every spelling and leaves the read on the generic dispatch, and an apply array the walk cannot
// read decides nothing at all either. one method per row, or in usage-global the narrowed rows
// would answer inside those two generic families and neither side could go wide alone
function viaCall(a = [1, 2]) {
  return _atMaybeArray(a).call(a, 0);
}
function viaApply(b = [1, 2]) {
  return _keysMaybeArray(b).call(b);
}
function viaBind(c = [1, 2]) {
  return _valuesMaybeArray(c).call(c);
}
function viaReflect(d = [1, 2]) {
  return _entriesMaybeArray(d).call(d);
}
function overridden(e = [1, 2]) {
  return _includes(e).call(e, 'a');
}
function opaqueApply(f = [1, 2]) {
  return _findMaybeArray(f).call(f, x => x);
}
const spread = ['ab'];
export default [viaCall.call(null), viaApply.apply(null, []), viaBind.bind(null)(), _Reflect$apply(viaReflect, null, []), overridden.call(null, 'ab'), opaqueApply.apply(null, spread)];