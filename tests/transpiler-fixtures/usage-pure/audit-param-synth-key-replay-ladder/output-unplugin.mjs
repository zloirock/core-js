import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$getOwnPropertyDescriptor from "@core-js/pure/actual/object/get-own-property-descriptor";
import _Object$getOwnPropertyNames from "@core-js/pure/actual/object/get-own-property-names";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// replacing the param DEFAULT with a synthesized literal is caller-correct - the default only
// evaluates when the argument is omitted, so a passed value still destructures natively. it is
// therefore preferred over the fallbacks, which bind in the body and ignore what the caller passed.
// the choice is bounded by ONE question: does the key resolve to a static NAME the synth literal can
// replay? that must cover every shape the caller-LOSSY extraction resolves, or the lossy emission
// would fire exactly where the correct one was available
let effects = 0;
const identifierKey = (function ({ from } = { from: _Array$from }) {
  return from;
})();
const computedStaticString = (function ({ ['of']: of } = { ['of']: _Array$of }) {
  return of;
})();
const computedSequenceKey = (function ({ [(effects++, 'entries')]: entries } = { "entries": _Object$entries }) {
  return entries;
})();
const plainStringKey = (function ({ 'keys': keys } = { "keys": _Object$keys }) {
  return keys;
})();
const computedConcat = (function ({ ['val' + 'ues']: values } = { ['val' + 'ues']: _Object$values }) {
  return values;
})();
const computedTemplate = (function ({ [`fromEnt${ 'ries' }`]: fromEntries } = { [`fromEnt${ 'ries' }`]: _Object$fromEntries }) {
  return fromEntries;
})();
// an effect-BEARING fold mirrors through the resolved name rather than cloning the key, so the
// effect stays on the pattern and still runs exactly once
const sideEffectingConcat = (function ({ [(effects++, 'gr') + 'oupBy']: groupBy } = { "groupBy": _Object$groupBy }) {
  return groupBy;
})();
// caller visibility is not part of the question: a self-reference is an extra caller, and the
// synthesized default is right for it too - an argument the recursion passes still wins
const selfReferencing = (function r({ getOwnPropertyNames } = { getOwnPropertyNames: _Object$getOwnPropertyNames }) {
  return _globalThis.never ? r({ getOwnPropertyNames: null }) : getOwnPropertyNames;
})();
const numericKey = (function ({ 0: zero, getOwnPropertyDescriptor } = { "0": Object["0"], getOwnPropertyDescriptor: _Object$getOwnPropertyDescriptor }) {
  return [zero, getOwnPropertyDescriptor];
})();
// a computed key that folds to no name at all cannot be replayed without re-running it, so the
// whole pattern takes the body fallback - the one emission left that ignores what the caller passed
const dynamicComputedKey = (function ({ [_globalThis.pick]: picked } = Object) {
  let assign = _Object$assign;
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