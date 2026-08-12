import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// `ConstructorParameters<typeof K>[N]` indexing into a rest-param position of an ambient class
// constructor: the rest element type `string[]` flows through, so `x` narrows to `string` rather
// than to the whole rest array. `L` is the positional control - the same slot spelled without
// the rest stays `string[]`, so the two lines must pick different receiver families.
declare class K {
  constructor(a: number, ...rest: string[]);
}
declare class L {
  constructor(a: number, b: string[]);
}
declare const x: ConstructorParameters<typeof K>[1];
declare const y: ConstructorParameters<typeof L>[1];
x.at(0);
y.includes('a');