import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// TS angle-bracket cast `<T>x.method(...)` (legacy syntax): the cast is peeled to
// recognise the underlying instance-method receiver.
_includesMaybeArray(<any[]> arr).call(<any[]> arr, 1);