import _Array$from from "@core-js/pure/actual/array/from";
// A parameter-array default serves Array.from for both absent and supplied Array elements.
// A supplied user object retains its own from method across repeated calls.
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