// inner fresh conditional shields against outer mutation: outer `if` has a test-tail
// mutation, but the inner `if` re-narrows from scratch with no mutations between its
// guard and the usage. `innerFreshConditional` must keep the narrow alive across the
// outer walker level instead of bailing on the outer's tainted test slot
let x: string | number[] = "hi";
if (typeof x === "string" && (x = [1, 2, 3], true)) {
  if (typeof x === "string") {
    // @ts-expect-error the write in the test leaves tsc a never type under the fresh guard, and the read there is the probe
    x.includes(1);
  }
}
