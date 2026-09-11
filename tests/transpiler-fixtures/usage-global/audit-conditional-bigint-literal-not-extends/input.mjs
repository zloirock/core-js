// Conditional types whose `extends` check involves a bigint literal must canonicalize the literal to
// a real BigInt before picking a branch. A string magnitude (babel stores bigint digits as a string) or
// a number-coerced negative bigint mis-picked the TRUE branch, narrowing the binding to `string` and
// emitting the wrong instance polyfill. All three checks are FALSE, so each binding is `number[]` and
// each distinct method maps to its array polyfill (a string narrow would emit es.string.* or nothing).
type StringVsBigint = '1' extends 1n ? string : number[];
type NegBigintVsNegNumber = -1n extends -1 ? string : number[];
type DistinctNegBigint<N> = N extends -1n ? string : number[];
declare const fromStringCheck: StringVsBigint;
declare const fromNegCheck: NegBigintVsNegNumber;
declare const fromTypeParamCheck: DistinctNegBigint<-2n>;
fromStringCheck.at(0);
fromNegCheck.flat();
fromTypeParamCheck.includes(1);
