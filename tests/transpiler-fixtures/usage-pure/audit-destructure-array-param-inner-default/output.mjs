import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// an inner-default AssignmentPattern wrapper (`{x} = {}`) inside an ARRAY param-default destructure is
// transparent: the real receiver is the param default further up, not the `{}` default itself. each
// leaf must still resolve its static off that receiver. distinct methods so each line's import is clear
function fromArr([{
  from
} = {}] = [{
  from: _Array$from
}]) {
  return from;
}
function ofGlobal([{
  Array: {
    of
  }
} = {}] = [{
  Array: {
    of: _Array$of
  }
}]) {
  return of;
}