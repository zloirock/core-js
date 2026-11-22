import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
// A write through the Array alias makes its static available at the later read.
const AliasA = Array;
const ca = {
  k: Object
};
ca.k = AliasA;
const viaAliasValue = _Array$fromAsync;
export { viaAliasValue };