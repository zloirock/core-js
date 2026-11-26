import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
export function local() {
  let u = [3];
  ++(u as any);
  return u.at(0);
}
export function parameter(u: number[]) {
  (u as any)--;
  return u.flatMap(x => x);
}
export function conditional(u: number[], update: boolean) {
  if (update) ++(u as any);
  return _atMaybeArray(u).call(u, 0);
}