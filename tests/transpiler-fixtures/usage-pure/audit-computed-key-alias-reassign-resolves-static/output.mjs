import _Array$from from "@core-js/pure/actual/array/from";
// usage-pure counterpart: `Array[K]` where the key alias K is reassigned AFTER the use - at the call
// K is still 'from', so the value is provably Array.from and pure substitutes `_Array$from`. the
// identifier-binding-follow gate resolves when no reassignment reaches the use; mirror of the
// usage-global counterpart.
let K = 'from';
_Array$from([1, 2, 3]);
K = 'of';