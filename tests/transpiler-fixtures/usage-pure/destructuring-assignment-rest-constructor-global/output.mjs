import _Promise from "@core-js/pure/actual/promise";
// A constructor entry makes its index the source of both named properties and rest.
let resolve, rest;
({
  resolve,
  ...rest
} = _Promise);