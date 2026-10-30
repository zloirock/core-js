import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Kept readers share one captured getter; rest retains its own native boundary.
let method, kept, rest;
({
  y: _ref
} = {
  y: holder.rows
});
method = _at(_ref), {
  length: kept
} = _ref;
method = _at(holder.rows);
kept = 1;
({
  y: {
    at: method,
    ...rest
  }
} = {
  y: holder.rows
});