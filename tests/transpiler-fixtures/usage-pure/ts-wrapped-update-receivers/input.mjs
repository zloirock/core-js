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
  return u.at(0);
}
