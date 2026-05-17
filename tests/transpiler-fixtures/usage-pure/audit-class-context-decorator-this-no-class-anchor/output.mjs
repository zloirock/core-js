import _at from "@core-js/pure/actual/instance/at";
var _ref;
// `this` inside a decorator argument evaluates at class-definition time in the OUTER
// scope, NOT bound to the decorated class. without the Decorator-boundary check in
// `resolveThisAnchor`, the walker climbs past Decorator -> ClassMethod -> ClassBody and
// incorrectly anchors `this` to class C - resolving `this.s` to C.s (string) and emitting
// the Maybe-string at polyfill. SOUNDNESS: outer `this` may not have an `s` member at all
declare function deco<T>(x: any): (target: T) => T;
class C {
  s: string = "hi";
  @deco(_at(_ref = this.s).call(_ref, 0))
  foo() {}
}