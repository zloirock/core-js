// replacing the param DEFAULT with a synthesized literal is caller-correct - the default only
// evaluates when the argument is omitted, so a passed value still destructures natively. it is
// therefore preferred over the fallbacks, which bind in the body and ignore what the caller passed.
// the choice is bounded by ONE question: does the key resolve to a static NAME the synth literal can
// replay? that must cover every shape the caller-LOSSY extraction resolves, or the lossy emission
// would fire exactly where the correct one was available
let effects = 0;
const identifierKey = (function ({ from } = Array) {
  return from;
})();
const computedStaticString = (function ({ ['of']: of } = Array) {
  return of;
})();
const computedSequenceKey = (function ({ [(effects++, 'entries')]: entries } = Object) {
  return entries;
})();
const plainStringKey = (function ({ 'keys': keys } = Object) {
  return keys;
})();
const computedConcat = (function ({ ['val' + 'ues']: values } = Object) {
  return values;
})();
const computedTemplate = (function ({ [`fromEnt${ 'ries' }`]: fromEntries } = Object) {
  return fromEntries;
})();
// an effect-BEARING fold mirrors through the resolved name rather than cloning the key, so the
// effect stays on the pattern and still runs exactly once
const sideEffectingConcat = (function ({ [(effects++, 'gr') + 'oupBy']: groupBy } = Object) {
  return groupBy;
})();
// caller visibility is not part of the question: a self-reference is an extra caller, and the
// synthesized default is right for it too - an argument the recursion passes still wins
const selfReferencing = (function r({ getOwnPropertyNames } = Object) {
  return globalThis.never ? r({ getOwnPropertyNames: null }) : getOwnPropertyNames;
})();
const numericKey = (function ({ 0: zero, getOwnPropertyDescriptor } = Object) {
  return [zero, getOwnPropertyDescriptor];
})();
// a computed key that folds to no name at all cannot be replayed without re-running it, so the
// whole pattern takes the body fallback - the one emission left that ignores what the caller passed
const dynamicComputedKey = (function ({ [globalThis.pick]: picked, assign } = Object) {
  return [picked, assign];
})();
// an OPTIONAL receiver may be undefined at runtime - native then throws destructuring it, while a
// synthesized literal is always defined. that throw-semantics divergence bails BOTH key spellings
const optionalReceiverHost = { arr: [1, 2] };
const optionalReceiverIdentifierKey = (function ({ at } = optionalReceiverHost?.arr) {
  return at;
})();
// eslint-disable-next-line @stylistic/quote-props -- the string spelling of the bail is under test
const optionalReceiverStringKey = (function ({ 'at': a } = optionalReceiverHost?.arr) {
  return a;
})();
export {
  identifierKey, computedStaticString, computedSequenceKey, plainStringKey, computedConcat,
  computedTemplate, sideEffectingConcat, selfReferencing, numericKey, dynamicComputedKey, effects,
  optionalReceiverIdentifierKey, optionalReceiverStringKey,
};
