import _Array$from from "@core-js/pure/actual/array/from";
// A default on the imported function property remains live.
export let value;
({
  missing: value = fallback()
} = _Array$from);