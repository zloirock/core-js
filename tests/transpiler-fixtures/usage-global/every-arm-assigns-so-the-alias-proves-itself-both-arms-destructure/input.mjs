export function bothArmsDestructure(flag) {
  if (flag) { var H = globalThis; } else { var H = self; }
  const { Object: { entries } } = H;
  return entries({ a: 1 });
}
