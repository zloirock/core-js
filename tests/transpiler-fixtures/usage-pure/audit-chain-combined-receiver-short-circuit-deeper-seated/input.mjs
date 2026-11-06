// the live `?.` may sit deeper than the root, with the root itself plain
export function deeperSeated(a) {
  return a.b?.c.flat?.().map(x => x).length;
}
