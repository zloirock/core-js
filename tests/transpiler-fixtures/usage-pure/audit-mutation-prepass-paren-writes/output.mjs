// paren-wrapped write targets reach the monkey-patch pre-pass at any nesting depth, so
// the patched static routes instead of substituting (patch-invisible would diverge)
const patched = () => [9];
Array.from = patched;
Array.of = patched;
export const r = [Array.from([1]), Array.of(2)];