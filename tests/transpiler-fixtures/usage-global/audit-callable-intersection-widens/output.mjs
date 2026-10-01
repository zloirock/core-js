import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// CALLABLE-INTERSECTION: an intersection of call signatures does NOT resolve first-match - the
// result widens to the generic helper whatever the order of the members, so neither spelling below
// narrows. overload declarations are the shape that DOES take the first signature, and it narrows
// to that signature's return type - the two must not be conflated
declare const arrayFirst: (() => string[]) & (() => string);
export const a = arrayFirst().at(0);
declare const stringFirst: (() => string) & (() => string[]);
export const b = stringFirst().at(0);
declare function overloaded(): string[];
declare function overloaded(): string;
export const d = overloaded().at(0);