import _Array$of from "@core-js/pure/actual/array/of";
import _Set from "@core-js/pure/actual/set";
// a statement body, a name read by a later parameter and a name bound in the body take the same
// mirror - the body shape and the scope no longer pick an emission path here
export const statementBody = (([{
  Set: S4,
  Array: {
    of: of4
  }
} = {
  Set: _Set,
  Array: {
    of: _Array$of
  }
}]) => {
  return [S4, of4];
})([]);