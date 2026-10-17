import _Array$from from "@core-js/pure/actual/array/from";
// A closed method caller set supplies the selected static to its parameter.
const box = {
  read({
    from
  }) {
    return from([1]);
  }
};
box.read({
  from: _Array$from
});