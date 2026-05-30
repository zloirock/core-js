// rest sibling forces synth-swap to bail into body-extract, but a sibling in-pattern default
// reads the polyfilled binding (`dflt = of`). relocating `of` into a body `let` would strand
// the param-scope read of `of` (ReferenceError at call time). the emitter detects the read and
// bails to inline-default instead, keeping `of` in the destructure so the sibling default resolves
function g({ of, dflt = of, ...rest } = Array) {
  return [of, dflt, rest];
}
g();
