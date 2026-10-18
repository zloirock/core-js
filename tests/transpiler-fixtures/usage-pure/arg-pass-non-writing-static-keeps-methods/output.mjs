import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// a known static that writes none of its arguments and hands none on keeps the methods of a holder
// in place (`Object.hasOwn` only reads a key); a static writing one argument copies the others'
// methods onto it (`Object.assign`), so its source loses the this-field narrow
export function viaKeyRead() {
  const holder = {
    items: [1, 2],
    read() {
      var _ref;
      return _atMaybeArray(_ref = this.items).call(_ref, 0);
    }
  };
  _Object$hasOwn(holder, 'items');
  return holder.read();
}
export function viaCopy(target) {
  const holder = {
    items: [1, 2],
    read() {
      var _ref2;
      return _includes(_ref2 = this.items).call(_ref2, 1);
    }
  };
  _Object$assign(target, holder);
  return holder.read();
}