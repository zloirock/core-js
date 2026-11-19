import _Array$from from "@core-js/pure/actual/array/from";
// `configPath: null` passes option validation symmetric to `configPath: undefined`:
// an optional path treats null and undefined the same, so build configs using a
// conditional spread (`{ configPath: cond ? path : null }`) work without surfacing a
// stale "or undefined"-only error message
_Array$from(x);