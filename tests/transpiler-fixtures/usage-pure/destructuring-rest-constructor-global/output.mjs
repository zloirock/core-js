import _Promise from "@core-js/pure/actual/promise";
// A constructor entry makes its index the source of both named properties and rest.
const {
  resolve,
  ...rest
} = _Promise;