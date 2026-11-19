// indexed access on the built-in `Parameters<typeof fn>[0]` then `.foo.at(0)`.
// numeric index into Parameters must resolve to the corresponding tuple element type
// (parity with how `Parameters<F>[0]` works as a TS type), so the inner array member
// types feed through to the array-specific polyfill
function fn(x: { foo: string[] }) {}
declare const obj: Parameters<typeof fn>[0];
obj.foo.at(0);
