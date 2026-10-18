import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `Promise.try(fn, ...args)` calls `fn` with the arguments after it, so a holder passed there reaches
// code that may rewrite its field and keeps no narrow; in the callback slot itself it is only called
export function viaArgument(fn) {
  var _ref;
  const holder = {
    items: [1, 2]
  };
  _Promise$try(fn, holder);
  return _at(_ref = holder.items).call(_ref, 0);
}
export function viaCallback() {
  var _ref2;
  const holder = {
    items: [1, 2]
  };
  _Promise$try(holder);
  return _includesMaybeArray(_ref2 = holder.items).call(_ref2, 1);
}