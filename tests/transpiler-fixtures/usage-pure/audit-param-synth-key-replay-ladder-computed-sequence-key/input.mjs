// Replacing the param DEFAULT with a synthesized literal is caller-correct - the default only evaluates when the argument is
// omitted, so a passed value still destructures natively.
let effects = 0;
const computedSequenceKey = (function ({ [(effects++, 'entries')]: entries } = Object) {
  return entries;
})();
export { computedSequenceKey };
export { effects };
