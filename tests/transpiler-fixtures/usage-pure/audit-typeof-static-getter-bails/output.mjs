import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// `typeof X.staticGetter` is a VALUE read: TS says `ReturnType<typeof X.getter>` is
// `ReturnType<V>` (V = the getter's value type), so the typeof-family member lookup bails
// on accessor kinds instead of handing the getter node to the function-type extractor
// (which would return V itself and mis-type the receiver as a function - a total bail
// with NO injection, leaving the native call broken on old engines)
class X {
  static get sg(): () => number[] {
    return () => [1];
  }
  static sm(): string[] {
    return ['a'];
  }
}
type FromGetter = ReturnType<typeof X.sg>;
declare const g: FromGetter;
export const viaGetter = _at(_ref = g as any).call(_ref, 0);

// a setter-only accessor bails the same way (the accessor-kind guard is get/set-agnostic)
class Y {
  static set ss(v: number[]) {}
}
type FromSetter = ReturnType<typeof Y.ss>;
declare const s: FromSetter;
export const viaSetter = _at(_ref2 = s as any).call(_ref2, 1);

// a genuine static METHOD keeps the precise return narrow
type FromMethod = ReturnType<typeof X.sm>;
declare const m: FromMethod;
export const viaMethod = _includesMaybeArray(_ref3 = m as any).call(_ref3, 'a');