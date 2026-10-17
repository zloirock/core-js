import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// A type-param SUPPLIED at the call site but OPAQUE (an unresolvable explicit type-arg, or a present arg the resolver can't type)
// must NOT fall back to its declared default: the default would emit a type-specific Maybe on a foreign runtime receiver (a throw
// on engines without the native method).
type Opaque = {
  z: 1;
};
// channel: user-type instantiation with an explicit opaque type-arg
interface Box<T = number[]> {
  v: T;
}
declare const box: Box<Opaque>;
_includes(_ref = box.v).call(_ref, 1);