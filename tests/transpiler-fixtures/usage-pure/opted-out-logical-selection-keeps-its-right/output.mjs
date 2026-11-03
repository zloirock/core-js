import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$try from "@core-js/pure/actual/promise/try";
// A `||` / `??` on a line the user opted out of decides nothing: its right stays live, so usage-global
// injects what each arm reads and a pattern reading it mirrors each arm, as it does for an opted-out
// ternary - the selection never collapses to its left.
// core-js-disable-next-line
export const {
  groupBy
} =
// core-js-disable-next-line
{
  groupBy: _Map$groupBy
} || {
  groupBy: _Object$groupBy
};
// core-js-disable-next-line
export function f({
  from
} =
// core-js-disable-next-line
{
  from: _Array$from
} ?? fallback) {
  return from;
}
export const {
  C: {
    try: attempt
  }
} = {
  // core-js-disable-next-line
  C: {
    try: _Promise$try
  } || Thenable
};