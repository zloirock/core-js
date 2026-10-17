// `makeBox(...args)` with a generic `<T>(t: T)` signature: a SpreadElement expands into
// an unknown count of positional args, so param-to-arg subst must bail on ANY spread in
// the call's args. otherwise the T slot picks up the spread's annotation and mis-narrows
// the return shape. with the bail, `.at()` routes through the generic instance polyfill
function makeBox<T>(t: T): { v: T } {
  return { v: t };
}
declare const arr: string[];
const r = makeBox(...arr);
r.v.at(0);
