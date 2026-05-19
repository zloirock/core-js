import _Array$from from "@core-js/pure/actual/array/from";
// `configPath: null` passes validation symmetric to `configPath: undefined`.
// `expectOptional` routes through `isEmpty` which treats null and undefined the
// same - build configs using conditional spread (`{ configPath: cond ? path :
// null }`) work without surfacing a stale "or undefined"-only error message
_Array$from(x);