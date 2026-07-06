import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2;
// an AMBIENT declaration's type-param supplied with an untypeable arg must not fall to the
// declared default (the annotation-domain default-fill channel); a resolvable annotated
// arg keeps its precision
type Opaque = {
  z: 1;
};
declare const opaque: Opaque;
declare function parse<T = string[]>(x: T | null): T;
_at(_ref = parse(opaque)).call(_ref, 0);
declare const s: string;
declare function pick<T, U = number[]>(t: T, u: U): U;
_includesMaybeString(_ref2 = pick(1, s)).call(_ref2, 'x');