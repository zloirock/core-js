import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A captured selection keeps the user's value, its own undefined and key order.
function declared(flag, shim) {
  let held;
  const {
    Array: {
      [(trace('key'), 'from')]: from = fallback(),
      ...rest
    }
  } = held = flag ? globalThis : shim;
  return [held, from, rest];
}
function assigned(shim) {
  let held, of;
  ({
    Array: {
      [(trace('key'), 'of')]: of = fallback()
    }
  } = held = shim ?? globalThis);
  return [held, of];
}