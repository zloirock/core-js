import _Array$of from "@core-js/pure/actual/array/of";
// An unescaped alias of the local method shares its closed caller set.
const box = {
  read({
    of
  }) {
    return of(1);
  }
};
const read = box.read;
read({
  of: _Array$of
});