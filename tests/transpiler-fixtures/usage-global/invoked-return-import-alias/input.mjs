// An invoker alias preserves the pure import's identity before and after module lowering.
import invoke from '@core-js/pure/actual/reflect/apply';
const alias = invoke;
function pick(value) { return { value }; }
alias(pick, null, [Array]).value.from = patched;
export const result = Array.from([1]);
