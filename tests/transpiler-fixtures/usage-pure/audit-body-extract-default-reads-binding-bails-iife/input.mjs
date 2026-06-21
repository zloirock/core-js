// rest sibling forces synth-swap into body-extract, but a sibling in-pattern default reads the
// polyfilled binding (`dflt = of`). relocating `of` into a body `let` would strand the param-scope
// read (ReferenceError at call time), so the emitter detects the read and bails to inline-default,
// keeping `of` in the destructure. immediately-invoked twin: emission sound, single call site visible.
(function g({ of, dflt = of, ...rest } = Array) {
  return [of, dflt, rest];
})();
