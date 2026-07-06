import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11;
// a type-param SUPPLIED at the call site but OPAQUE (an unresolvable explicit type-arg, or
// a present arg the resolver can't type) must NOT fall back to its declared default: the
// default would emit a type-specific Maybe on a foreign runtime receiver (a throw on
// engines without the native method). every supply channel degrades to the GENERIC helper
// instead; the resolvable controls keep their type-specific precision
type Opaque = {
  z: 1;
};
declare const opaque: Opaque;

// channel: explicit type-arg, present but unresolvable
function makeExplicit<T = number[]>(): T {
  return [] as any;
}
_at(_ref = makeExplicit<Opaque>()).call(_ref, 0);
_atMaybeArray(_ref2 = makeExplicit<string[]>()).call(_ref2, 0);

// channel: deep param-annotation reference (a union wrapper), arg present but opaque
function fromUnionParam<T = string>(x: T | null): T {
  return x as any;
}
_includes(_ref3 = fromUnionParam(new Date())).call(_ref3, 1);

// channel: transitive dependent default (U = T) with an opaque earlier param
function makeTransitive<T = number[], U = T>(x: T): U {
  return x as any;
}
_at(_ref4 = makeTransitive(opaque)).call(_ref4, 0);
_includesMaybeString(_ref5 = makeTransitive('str')).call(_ref5, 's');

// channel: implicit inference default-fill with a present-but-opaque arg
function pickInferred<T, U = string[]>(t: T, u: U): U {
  return u;
}
_at(_ref6 = pickInferred('a', opaque)).call(_ref6, 0);

// channel: user-type instantiation with an explicit opaque type-arg
interface Box<T = number[]> {
  v: T;
}
declare const box: Box<Opaque>;
_includes(_ref7 = box.v).call(_ref7, 1);
declare const defaultedBox: Box;
_atMaybeArray(_ref8 = defaultedBox.v).call(_ref8, 0);

// channel: annotation-domain member chain - a LITERAL arg carries its trivially-known type
// (the inference domain reads declared annotations, so literals needed a keyword bridge);
// an opaque arg through the same chain stays generic
type Wrap<T> = {
  v: T;
};
function wrapIt<T = string>(x: T): Wrap<T> {
  return {
    v: x
  } as any;
}
_atMaybeString(_ref9 = wrapIt('abc').v).call(_ref9, 0);
_includesMaybeArray(_ref10 = wrapIt([1, 2]).v).call(_ref10, 1);
function wrapOpaque<T = string>(x: T | null): Wrap<T> {
  return {
    v: x
  } as any;
}
_at(_ref11 = wrapOpaque(opaque).v).call(_ref11, 0);