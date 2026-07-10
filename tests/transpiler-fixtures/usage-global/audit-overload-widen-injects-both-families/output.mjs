import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// an indiscriminable / implicit-any overload set widens and injects BOTH families
// (over-inject-safe) instead of one arm's entry alone. one method per line so each
// line's contribution to the import set stays uniquely attributable
interface Make {
  (x: number): number[];
  (x: string): string;
}
declare const make: Make;
declare const u: unknown;
export const viaIndiscriminable = make(u).includes(1);
interface Parser {
  parse(x: string): string[];
  parse(x: number);
}
declare const p: Parser;
export const viaImplicitAny = p.parse(123).at(0);