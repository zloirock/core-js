// branded intersection of `string` plus opaque tag types resolves to a string-shaped receiver,
// so `.at` polyfill emits string-instance side effects; the brand annotations themselves carry no
// runtime impact
type Branded = string & { __brand: true } & { __tag: "x" };
const x: Branded = "hello" as Branded;
x.at(0);
