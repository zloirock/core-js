import _Array$from from "@core-js/pure/actual/array/from";
// `additionalPackages` may repeat the main `package` or itself - resolver uses a `Set` over
// lowercased entries to dedup. hot-loop `stripPkgPrefix` hits main pkg first
_Array$from(x);