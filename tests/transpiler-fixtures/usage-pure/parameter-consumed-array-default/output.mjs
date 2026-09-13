import _Array$from from "@core-js/pure/actual/array/from";
// A named array parameter consumes the supplied element or its own Array default.
// Every known call needs an extraction; custom methods retain their identity.
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
read([{
  from: _Array$from
}])([1]);
read([{
  from: _Array$from
}])([2]);
read([])([3]);
read([undefined])([4]);
read([{
  from: ownFrom
}])(5);