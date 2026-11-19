import _Array$from from "@core-js/pure/actual/array/from";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// a static running its callback with the `thisArg` as `this` hands the holder to that callback, which
// may rewrite its field; the source it maps over is only read element by element, and the callback
// seeing those elements is an accepted boundary, so a holder there keeps its narrow
export function viaThisArg(list, map) {
  var _ref;
  const holder = {
    items: [1, 2]
  };
  _Array$from(list, map, holder);
  return _at(_ref = holder.items).call(_ref, 0);
}
export function viaSource(map) {
  var _ref2;
  const holder = {
    items: [1, 2]
  };
  _Array$from(holder, map);
  return _includesMaybeArray(_ref2 = holder.items).call(_ref2, 1);
}