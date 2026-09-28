import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A default reading a claim the pattern binds is no ordering hazard where the claim is written first:
// a later sibling on a declaration, a closure that runs only after the pattern, a parameter of that
// closure shadowing the name. Every claim here extracts.
const from = _Array$from;
const of = _Array$of;
const entries = _Object$entries;
const {
  make = () => entries({})
} = Object;
const _ref = [1, 2];
const at = _atMaybeArray(_ref);
const {
  mapper = at => at
} = _ref;
export { from, of, make, entries, mapper, at };