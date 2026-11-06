// Moving the loop pattern keeps the declaration before its later assignment.
export function collect(forms) {
  const seen = [];
  for (const { values, meta } of forms) {
    let entries, status;
    ({ data: { entries }, status } = meta);
    seen.push(values, entries, status);
  }
  return seen;
}
