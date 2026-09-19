import _Array$from from "@core-js/pure/actual/array/from";
// A named object parameter consumes Array at supplied and defaulted call sites.
// Repeated calls cannot reuse an extraction belonging to a different argument.
function read({
  from
} = {
  from: _Array$from
}) {
  return from;
}
function ownFrom(value) {
  return value;
}
read({
  from: _Array$from
})([1]);
read({
  from: _Array$from
})([2]);
read()([3]);
read(undefined)([4]);
read({
  from: ownFrom
})(5);