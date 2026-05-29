// `build` is a regular (non-ambient) function with a single body and no overload heads, so
// the last-overload rule does not apply. ReturnType<typeof build> is the body's number[],
// and `.at(0)` narrows to the Array variant.
function build(): number[] {
  return [1, 2, 3];
}
const r: ReturnType<typeof build> = build();
r.at(0);
