import _Array$from2 from "@core-js/pure/actual/array/from";
// user declares a local const with the exact name the plugin would pick for the pure hint
// `_Array$from`. the plugin must detect the collision and fall back to a suffixed
// `_Array$from2`. verify both plugins handle the naming clash
const _Array$from = {
  custom: true
};
_Array$from2([1, 2, 3]);
console.log(_Array$from);