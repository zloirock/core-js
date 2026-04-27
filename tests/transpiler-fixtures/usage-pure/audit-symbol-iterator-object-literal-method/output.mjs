import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// `{[Symbol.iterator]() {}}` - object literal computed-key method definition.
// the `Symbol.iterator` lookup must polyfill the well-known symbol identifier even
// when used as a method name in an object expression context.
const proto = {
  [_Symbol$iterator]() {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  },
  groupBy(items, fn) {
    return _Map$groupBy(items, fn);
  }
};
export { proto };