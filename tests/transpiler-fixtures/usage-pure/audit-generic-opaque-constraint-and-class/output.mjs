import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5;
// a constraint is skipped for a SUPPLIED param exactly like a default (established rule
// extended to deep references); class METHOD type-params follow the same discipline; a
// class-LEVEL generic keeps legitimate omitted-arg defaults and resolvable instantiations
type Opaque = {
  z: 1;
};
declare const opaque: Opaque;
function bounded<T extends string[]>(x: T | null): T {
  return x as any;
}
// @ts-expect-error an opaque argument the constraint does not admit is the shape under test
_at(_ref = bounded(opaque)).call(_ref, 0);
function widest<T extends unknown[]>(): T {
  return [] as any;
}
// @ts-expect-error an opaque argument the constraint does not admit is the shape under test
_includes(_ref2 = widest<Opaque>()).call(_ref2, 1);
class C {
  m<T = string>(x: T | null): T {
    return x as any;
  }
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_at(_ref3 = new C().m(opaque)).call(_ref3, 0);
class Holder<T = string> {
  get(): T {
    return null as any;
  }
}
declare const defaulted: Holder;
_atMaybeString(_ref4 = defaulted.get()).call(_ref4, 0);
declare const resolved: Holder<number[]>;
_includesMaybeArray(_ref5 = resolved.get()).call(_ref5, 2);