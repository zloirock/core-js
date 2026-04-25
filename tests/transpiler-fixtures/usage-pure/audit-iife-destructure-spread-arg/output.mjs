import _Array$from from "@core-js/pure/actual/array/from";
// IIFE with spread-literal argument: `...[Array]` exposes an indexable element at a static
// slot, so the receiver substitution lands at that position. spread from a non-literal
// identifier (`...rest`) carries no static index - rewrite bails and the raw call stays
(({
  from
}) => from)(...[{
  from: _Array$from
}]);
(({
  from
}) => from)(...rest);