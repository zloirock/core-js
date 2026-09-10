import _at from "@core-js/pure/actual/instance/at";
// the preceding-exit spelling of the same deferred read: the early return proves the string only
// for the statements that run before the later write, and an instance field initializer is not one
// of them - it runs at `new`-time, so both families inject
declare function anyv(): any;
export function f(v: any) {
  let x: any = v;
  if (typeof x !== 'string') return null;
  class K {
    p = _at(x).call(x, 0);
  }
  x = anyv();
  return new K();
}