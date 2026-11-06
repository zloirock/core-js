import _getIterator from "@core-js/pure/actual/get-iterator";
// paren-wrapped outer property `recv[(fn(), Symbol)[(g(), 'iterator')]]` stacks SE in BOTH
// the wrapping paren-SE on the Symbol receiver AND the computed key inside Symbol[...].
// computed-symbol-key resolve walks both paren-SE layers and collects effects so the
// polyfill rewrite re-emits all preceding effects through a single SequenceExpression wrap
let outer = 0;
let inner = 0;
const it = (outer++, inner++, _getIterator([1, 2, 3]));
it.next();