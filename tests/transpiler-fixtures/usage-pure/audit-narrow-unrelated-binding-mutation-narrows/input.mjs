// control: mutation in the test-tail belongs to a DIFFERENT binding (counter), not the
// one being narrowed (x). mutation violations are per-binding, so x's narrow must
// survive. asserts the soundness check isn't over-broad - it filters on binding identity
let x: string | number[] = "hi";
let counter = 0;
if (typeof x === "string" && (counter++, true)) {
  x.includes(1);
}
