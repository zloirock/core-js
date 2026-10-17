import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the key EVALUATES at the destructure - a later same-scope flip cannot reach the captured
// binding, so the reaching value AT THE CAPTURE ('Symbol') drives the fold
let kb = 'Array';
kb = 'Symbol';
const BetweenSymbol = _Symbol;
kb = 'Array';
const viaBetween = _Symbol$iterator;
export const l = _getIteratorMethod([21, 22]);