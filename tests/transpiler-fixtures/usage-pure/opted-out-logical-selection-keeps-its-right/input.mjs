// A `||` / `??` on a line the user opted out of decides nothing: its right stays live, so usage-global
// injects what each arm reads and a pattern reading it mirrors each arm, as it does for an opted-out
// ternary - the selection never collapses to its left.
export const { groupBy } =
  // core-js-disable-next-line
  Map || Object;
export function f({ from } =
  // core-js-disable-next-line
  Array ?? fallback) {
  return from;
}
export const { C: { try: attempt } } = {
  // core-js-disable-next-line
  C: Promise || Thenable,
};
