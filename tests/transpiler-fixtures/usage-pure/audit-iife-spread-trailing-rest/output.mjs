import _Array$from from "@core-js/pure/actual/array/from";
// IIFE call with array literal containing trailing rest spread: `[a, b, ...rest]`.
// Inner SpreadElement at any position makes param-to-arg matching bail (the param index
// would be off by N positions when `rest` expands variadically). Verify body-extract takes
// over - the user's call shape itself is unusual but valid
const tail = [1, 2];
(({
  from
}) => from([1]))(...[{
  from: _Array$from
}, ...tail]);