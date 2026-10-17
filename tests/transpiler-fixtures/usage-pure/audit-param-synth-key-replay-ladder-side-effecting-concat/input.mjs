// Replacing the param DEFAULT with a synthesized literal is caller-correct - the default only evaluates when the argument is
// omitted, so a passed value still destructures natively.
let effects = 0;
// an effect-BEARING fold mirrors through the resolved name rather than cloning the key, so the
// effect stays on the pattern and still runs exactly once
const sideEffectingConcat = (function ({ [(effects++, 'gr') + 'oupBy']: groupBy } = Object) {
  return groupBy;
})();
export { sideEffectingConcat };
export { effects };
