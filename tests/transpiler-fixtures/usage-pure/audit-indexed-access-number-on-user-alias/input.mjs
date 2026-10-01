// indexed access `Items[number]` on a user alias that expands to `string[]` must
// yield element type `string`, so both `.at` and `.includes` dispatch to the
// string-specific polyfills
type Items = string[];
declare const a: Items[number];
a.at(0);
a.includes('x');
