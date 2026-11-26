import "core-js/modules/es.array.at";
declare function g<A, B = string>(a: A, b?: B): B;
const spelledOut = g<string, string[]>('x');
export const b = spelledOut.at(0);