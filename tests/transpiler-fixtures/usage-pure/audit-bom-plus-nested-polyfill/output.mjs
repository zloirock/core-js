import _Array$from from "@core-js/pure/actual/array/from";
// BOM + composed nested polyfill. plugin strips BOM before MagicString so queue
// offsets must not drift. compose loop inserts nested polyfill into outer content
_Array$from(_Array$from(x));