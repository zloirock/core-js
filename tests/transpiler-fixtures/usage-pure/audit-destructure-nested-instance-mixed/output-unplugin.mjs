// Nested static and instance leaves in sibling branches both receive pure bindings. A fresh literal
// host and its pristine Array values may be retained or captured without observable effects. The
// ordinary receiver and both source bindings remain intact.
import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";

const arr = [1, [2]];
const _ref = { x: Array, y: arr };
const f = _Array$from;
const m = _flatMaybeArray(_ref.y);