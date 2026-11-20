import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// an object-pattern key naming an array index reads the slot under the positional contract: past
// a leading spread every static element is a possible value, the same maybe-union the positional
// spelling enumerates, so both spellings of one read inject the static the runtime may reach
// one static per row, so every row is observable by its own module
const {
  1: viaKeyed
} = [...rest, _Map];
export const a = _Map$groupBy.call.call(viaKeyed === _Map ? _Map$groupBy : viaKeyed.groupBy, viaKeyed, src, x => x);
const [, viaPositional] = [...rest, Object];
export const b = _Object$fromEntries.call.call(viaPositional === Object ? _Object$fromEntries : viaPositional.fromEntries, viaPositional, src);