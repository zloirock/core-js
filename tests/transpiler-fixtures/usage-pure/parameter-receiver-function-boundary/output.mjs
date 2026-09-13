import _Array$from from "@core-js/pure/actual/array/from";
// The returned receiver supplies only from; saving its local function is not a constructor escape.
// Argument mirroring must keep that function's return and its internal name intact.
let saved;
function read([{
  from
} = {
  from: _Array$from
}]) {
  return typeof from;
}
read([function source() {
  saved = source;
  return Array;
}()]);
saved() === Array;
read([function Array() {
  return Array;
}()]);