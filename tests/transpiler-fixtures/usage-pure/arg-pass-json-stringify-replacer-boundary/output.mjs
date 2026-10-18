import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
// a `JSON.stringify` replacer runs with the holder as `this` and sees its methods, but a callback that
// reaches values only through the call's own work is an accepted boundary, so the narrow stays; a
// holder passed as a callback's explicit `thisArg` is handed out and loses it
export function viaReplacer(replacer) {
  const holder = {
    items: [1, 2],
    read() {
      var _ref;
      return _atMaybeArray(_ref = this.items).call(_ref, 0);
    }
  };
  _JSON$stringify(holder, replacer);
  return holder.read();
}
export function viaThisArg(list, map) {
  const holder = {
    items: [1, 2],
    read() {
      var _ref2;
      return _includes(_ref2 = this.items).call(_ref2, 1);
    }
  };
  _Array$from(list, map, holder);
  return holder.read();
}