import _Array$from from "@core-js/pure/actual/array/from";
// resolveObjectName must peel `(0, Array)` receiver so Array.from still polyfills;
// otherwise the sequence-wrapped call bypasses the static-method detector
_Array$from(src);