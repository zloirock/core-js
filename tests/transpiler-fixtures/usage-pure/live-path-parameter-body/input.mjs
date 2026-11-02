// Capturing a parameter keeps the following body bindings in their own slots.
export function read({ values }, state) {
  let entries, status;
  ({ data: { entries }, status } = state);
  return [values, entries, status];
}
