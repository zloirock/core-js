import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set";
// Multiple calls keep the parameter pattern unchanged. Each caller supplies its own value:
// Array receives a mirror with its from method, while Set keeps its constructor surface.
const fn = ({
  from
}) => from;
fn({
  from: _Array$from
});
fn(_Set);