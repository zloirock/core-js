import _Array$from from "@core-js/pure/actual/array/from";
// destructure init is a sequence expression `(0, Array)` - a canonical "strip this
// binding" idiom from CJS output. plugin must look at the trailing expression
// and recognize `Array`, then replace `from` with the `Array.from` pure import
const from = _Array$from;