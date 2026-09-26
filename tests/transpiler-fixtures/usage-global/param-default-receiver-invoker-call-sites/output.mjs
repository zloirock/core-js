import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.values";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// a call is not one syntactic shape. `.call` drops the receiver slot, `.apply` spreads an inline
// array, a `bind` invoked on the spot prepends what it captured and `Reflect.apply` puts the
// function in the first slot - each is an invocation whose arguments land in the parameters, so a
// census matching the plain callee slot alone read every one of them as "not a call" and lost the
// slot's proof. the negatives ride along: an argument at the slot overrides the default through
// every spelling and leaves the read on the generic dispatch, and an apply array the walk cannot
// read decides nothing at all either. one method per row, or in usage-global the narrowed rows
// would answer inside those two generic families and neither side could go wide alone
function viaCall(a = [1, 2]) {
  return a.at(0);
}
function viaApply(b = [1, 2]) {
  return b.keys();
}
function viaBind(c = [1, 2]) {
  return c.values();
}
function viaReflect(d = [1, 2]) {
  return d.entries();
}
function overridden(e = [1, 2]) {
  return e.includes('a');
}
function opaqueApply(f = [1, 2]) {
  return f.find(x => x);
}
const spread = ['ab'];
export default [viaCall.call(null), viaApply.apply(null, []), viaBind.bind(null)(), Reflect.apply(viaReflect, null, []), overridden.call(null, 'ab'), opaqueApply.apply(null, spread)];