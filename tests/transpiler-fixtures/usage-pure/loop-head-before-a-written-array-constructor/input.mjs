export function read(flag) {
  const box = { C: Map };
  if (flag) box.C = Set;
  let methods;
  for (const { of, groupBy } of [box.C]) methods = [of, groupBy];
  box.C = Array;
  return methods;
}
