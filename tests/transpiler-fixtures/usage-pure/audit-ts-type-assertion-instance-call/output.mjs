import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// TS type assertion on an instance-call receiver: the assertion is peeled so the
// instance call is rewritten through the polyfill.
_atMaybeArray(<any[]> arr).call(<any[]> arr, -1);