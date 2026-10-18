import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// a static callee in parentheses or behind a cast is the same static as the bare spelling, so a holder
// it only reads keeps its narrow - also on the ESTree parser, where the parentheses are a node
export function viaParenthesized() {
  var _ref;
  const holder = {
    items: [1, 2]
  };
  Object.keys(holder);
  return _atMaybeArray(_ref = holder.items).call(_ref, 0);
}
export function viaCast() {
  const holder = {
    items: [1, 2],
    read() {
      var _ref2;
      return _includesMaybeArray(_ref2 = this.items).call(_ref2, 1);
    }
  };
  _Object$hasOwn(holder, 'items');
  return holder.read();
}