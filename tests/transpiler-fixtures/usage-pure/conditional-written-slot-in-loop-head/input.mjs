export function read(flag, other) {
  const box = { C: Array };
  if (flag) box.C = other;
  for (const { of, groupBy } of [box.C]) return [of, groupBy];
}
