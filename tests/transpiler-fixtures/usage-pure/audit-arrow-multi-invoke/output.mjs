import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set";
// Multiple calls keep the shared arrow body unchanged. The Array argument supplies its
// polyfilled static through a mirror; the Set argument retains its own constructor surface.
const fn = ({
  from
}) => from([1, 2, 3]);
fn({
  from: _Array$from
});
fn(_Set);