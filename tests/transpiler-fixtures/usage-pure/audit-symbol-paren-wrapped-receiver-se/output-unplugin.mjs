import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// paren-wrapped outer property `recv[(fn(), Symbol)[(g(), 'iterator')]]` stacks SE in BOTH
// the wrapping paren-SE on the Symbol receiver AND the computed key inside Symbol[...].
// computed-symbol-key resolve walks both paren-SE layers and collects effects so the
// polyfill rewrite re-emits all preceding effects through a single SequenceExpression wrap
let outer = 0;
let inner = 0;
const it = [1, 2, 3][(outer++, inner++, _Symbol$iterator)]();
it.next();