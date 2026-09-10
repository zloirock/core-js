// a decorator expression evaluates at class-definition time, ahead of every static field, so the
// write inside one reaches the field's read: `x` holds the array there, not the string the guard
// narrowed to, and both families inject. the write is spelled ONLY in the decorator, so a walk that
// does not enter one reports the parameter constant and leaves the array polyfill out
export function f(x: any) {
  if (typeof x === "string") {
    class F {
      static v = x.at(0);
      @((x = [1, 2], (t: any, k: any) => t)) m() { return 1; }
    }
    return F.v;
  }
  return null;
}
