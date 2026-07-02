import _Array$from from "@core-js/pure/actual/array/from";
// user imports from `full/` but plugin mode is `actual` - user's `full/...` binding
// is NOT reused for `actual/...` needs. plugin injects its own `actual/array/from`
// import alongside the user's unchanged `full/array/from` import
import MyArrayFrom from '@core-js/pure/full/array/from';
_Array$from(x);
console.log(MyArrayFrom);