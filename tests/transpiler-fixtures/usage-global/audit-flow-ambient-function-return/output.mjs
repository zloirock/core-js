import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// @flow
// Flow's ambient function keeps its whole signature on the declared id's annotation, while the TS
// spelling puts params and return on the declaration itself - so a reader that only knows the
// declaration slot found no return type and the call widened. Distinct methods per arm:
// Array -> es.array.at, string -> es.string.includes.
declare function rows(): Array<number>;
declare function label(): string;
rows().at(0);
label().includes('x');