import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// a guarded read INSIDE an instance field initializer runs at `new`-time, after every statement of
// the enclosing block - so the reassignment textually after the class reaches it, and the typeof
// guard above proves nothing for the value it reads: both families inject. the static field runs
// at class-eval, before the write, so its narrow holds
declare function anyv(): any;
export function f(v: any) {
  let x: any = v;
  if (typeof x === 'string') {
    class K {
      p = _at(x).call(x, 0);
    }
    x = anyv();
    return new K();
  }
  return null;
}
export function g(v: any) {
  let y: any = v;
  if (typeof y === 'string') {
    class S {
      static p = _includesMaybeString(y).call(y, 'a');
    }
    y = anyv();
    return S;
  }
  return null;
}