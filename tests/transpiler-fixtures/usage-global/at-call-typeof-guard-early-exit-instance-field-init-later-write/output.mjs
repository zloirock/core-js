import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// the preceding-exit spelling of the same deferred read: the early return proves the string only
// for the statements that run before the later write, and an instance field initializer is not one
// of them - it runs at `new`-time, so both families inject
declare function anyv(): any;
export function f(v: any) {
  let x: any = v;
  if (typeof x !== 'string') return null;
  class K {
    p = x.at(0);
  }
  x = anyv();
  return new K();
}