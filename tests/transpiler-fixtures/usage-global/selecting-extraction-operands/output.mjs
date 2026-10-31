import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Decided operands keep their effects; a user arm keeps its own member.
function selected(other) {
  const {
    from
  } = (trace('left'), Array) || other;
  return from;
}
function shared(flag) {
  const {
    of,
    length
  } = flag ? Array : Array;
  return [of, length];
}
function user(flag, shim) {
  const {
    Array: {
      [(trace('key'), 'from')]: from
    }
  } = flag ? globalThis : shim;
  return from;
}