import _Array$from from "@core-js/pure/actual/array/from";
// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims.
function read([{
  from
} = {
  from: _Array$from
}]) {
  return from;
}
function ownFrom(value) {
  return value;
}
read([Array])([1]);
read([Array])([2]);
read([])([3]);
read([undefined])([4]);
read([{
  from: ownFrom
}])(5);