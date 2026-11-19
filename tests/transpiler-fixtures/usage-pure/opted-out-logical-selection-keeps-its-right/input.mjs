// An opted-out selecting receiver stays native, including its fallback arm.
// Extraction must not replace its branches or the default of a parameter.
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
