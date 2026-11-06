// a `typeof`-OR group whose second disjunct is a real built-in static guard: the group is
// {string, number}, the array arm is ruled out and only the string family injects. this leg never
// rewrites the callee, so the guard parser reads `Number.isFinite` straight off the source - the
// pure twin is where the same decision has to survive the rewrite
export function f(x: string | number[]) {
  if (typeof x === 'string' || Number.isFinite(x as any)) return x.at(0);
  return null;
}
