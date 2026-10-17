import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _at from "@core-js/pure/actual/instance/at";
// a disable-next-line before a TYPE-ONLY statement spans just that construct - the type
// line vanishes at TS strip, and the runtime statement after it must keep folding
// core-js-disable-next-line
type T = Array<string>;
export const afterAlias = _at(a).call(a, 0);

// a multi-line interface body spans to ITS closing brace only
// core-js-disable-next-line
interface I {
  x: string;
  y: number;
}
export const afterInterface = _flatMaybeArray(b).call(b);

// an enum is a brace host too - the directive covers its whole body, nothing past it
// core-js-disable-next-line
enum E {
  A,
  B,
}
export const afterEnum = _toSortedMaybeArray(c).call(c, f);