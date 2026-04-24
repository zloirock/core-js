import _Array$from from "@core-js/pure/actual/array/from";
// four nested Array.from - stresses compose loop's nth accounting when the same needle
// is swallowed level by level (each outer substitution absorbs one copy of `Array.from`)
_Array$from(_Array$from(_Array$from(_Array$from(s))));