// intrinsic `Uppercase<string & K>` - JS String#toUpperCase applied at the type level.
// rename evaluator pipes the K-substituted inner string through the corresponding string
// transformer so `r.FOO` resolves to source `foo`'s typeAnnotation
type Upper<T> = { [K in keyof T as Uppercase<string & K>]: T[K] };
declare const r: Upper<{ foo: number[] }>;
r.FOO.at(0);
