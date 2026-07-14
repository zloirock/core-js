import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// a disable-next-line before a TYPE-ONLY statement spans just that construct - the type
// line vanishes at TS strip, and the runtime statement after it must keep folding
// core-js-disable-next-line
type T = Array<string>;
export const afterAlias = a.at(0);

// a multi-line interface body spans to ITS closing brace only
// core-js-disable-next-line
interface I {
  x: string;
  y: number;
}
export const afterInterface = b.flat();

// an enum is a brace host too - the directive covers its whole body, nothing past it
// core-js-disable-next-line
enum E {
  A,
  B,
}
export const afterEnum = c.toSorted(f);