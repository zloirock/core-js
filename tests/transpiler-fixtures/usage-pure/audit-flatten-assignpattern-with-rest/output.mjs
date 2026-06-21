import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// AssignmentPattern (around the inner `{from}`) coexisting with a RestElement at outer level:
// rest gathers all OTHER own keys of globalThis, so dropping `Array: {from}` outright would
// change semantics (`rest.Array` would become defined, originally excluded). instead an
// `Array: _unused` sentinel keeps the consumed slot, `from = _Array$from` is emitted
// separately, and rest still excludes the Array key.
const from = _Array$from;
const {
  Array: _unused,
  ...rest
} = _globalThis;
from('hi');
rest.Object;