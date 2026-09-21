import _Array$of from "@core-js/pure/actual/array/of";
// Both branches supply the same nested constructor and the selector still evaluates once.
function read({
  value: {
    of
  }
}) {
  return of(1);
}
read(test() ? {
  value: {
    of: _Array$of
  }
} : {
  value: {
    of: _Array$of
  }
});