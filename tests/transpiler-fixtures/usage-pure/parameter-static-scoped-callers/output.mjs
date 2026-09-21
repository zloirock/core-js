import _Array$from from "@core-js/pure/actual/array/from";
// Local functions with the same name have independent closed caller sets.
// The other scope's custom receiver cannot erase the native source proof.
function first() {
  const box = {
    value: Array
  };
  function read(held) {
    return _Array$from([1]);
  }
  return read(box.value);
}
function second() {
  function read(held) {
    return held.of([2]);
  }
  return read({
    of: values => values
  });
}
first();
second();