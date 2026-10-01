import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a discriminant-narrowed read inside an instance field initializer observes the field write and
// the identity reassignment that textually follow the class: both run before `new K()` evaluates
// the initializer, so the narrow drops: the `at` row injects both reachable families, the `includes`
// row a third the declared union cannot reach
type A = {
  kind: 'a';
  v: string;
};
type B = {
  kind: 'b';
  v: number[];
};
declare function anyv(): any;
export function fieldWrite(o: A | B) {
  if (o.kind === 'a') {
    var _ref;
    class K {
      p = _at(_ref = o.v).call(_ref, 0);
    }
    o.kind = 'b';
    o.v = [1, 2];
    return new K();
  }
  return null;
}
export function identityWrite(o: A | B) {
  if (o.kind === 'a') {
    var _ref2;
    class K {
      p = _includes(_ref2 = o.v).call(_ref2, 'x');
    }
    o = anyv();
    return new K();
  }
  return null;
}