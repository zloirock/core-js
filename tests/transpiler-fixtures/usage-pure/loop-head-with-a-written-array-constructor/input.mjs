export function read(useArray) {
  const box = { C: Map };
  if (useArray) box.C = Array;
  for (const { of, groupBy } of [box.C]) return [of, groupBy];
}
