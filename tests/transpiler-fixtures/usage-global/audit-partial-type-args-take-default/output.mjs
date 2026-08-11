import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// TS-FIDELITY: with a partial explicit type-argument list the omitted parameter takes its DECLARED
// DEFAULT, matching the typechecker, not an inference from the call arguments. the default here is
// a string, so the string-specific helper is correct; spelling the argument out explicitly picks the
// array instead. reproducing the typechecker is deliberate even where it diverges from runtime
declare function g<A, B = string>(a: A, b?: B): B;
const fromDefault = g<string>('x');
export const a = fromDefault.at(0);
const spelledOut = g<string, string[]>('x');
export const b = spelledOut.at(0);