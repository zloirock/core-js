import _Array$from from "My-Pure-Fork/actual/array/from";
// `packages` is lowercased inside resolver. but the emitted import source keeps the user's
// original `pkg` as typed — `@core-js/pure` is default; here a mixed-case alias goes through
_Array$from(x);